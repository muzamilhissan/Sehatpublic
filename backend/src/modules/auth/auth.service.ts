import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppRole } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { compareOtpCode, generateOtpCode, hashOtpCode } from '../../common/utils/otp.util';
import { normalizePakistaniPhone } from '../../common/utils/phone.util';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtPayload } from './types/jwt-payload.type';

const MAX_OTP_ATTEMPTS = 5;
const DURATION_MULTIPLIERS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async requestOtp(
    dto: RequestOtpDto,
  ): Promise<{ phone: string; expiresInMinutes: number; devCode?: string }> {
    const phone = normalizePakistaniPhone(dto.phone);
    const expiresMinutes = this.configService.get<number>('app.otp.expiresMinutes') ?? 10;
    const devMode = this.configService.get<boolean>('app.otp.devMode') ?? false;
    const devCode = this.configService.get<string>('app.otp.devCode') ?? '123456';

    const existingUser = await this.prisma.user.findUnique({ where: { phone } });

    const code = devMode ? devCode : generateOtpCode();
    const codeHash = await hashOtpCode(code);
    const expiresAt = new Date(Date.now() + expiresMinutes * 60_000);

    await this.prisma.otpChallenge.create({
      data: {
        userId: existingUser?.id,
        phone,
        codeHash,
        expiresAt,
      },
    });

    // NOTE: SMS provider integration is out of scope for v1; in devMode the
    // code is echoed back in the response so the client can auto-fill it.
    return {
      phone,
      expiresInMinutes: expiresMinutes,
      ...(devMode ? { devCode: code } : {}),
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<
    AuthTokens & { user: { id: string; phone: string; fullName: string; roles: AppRole[] } }
  > {
    const phone = normalizePakistaniPhone(dto.phone);

    const challenge = await this.prisma.otpChallenge.findFirst({
      where: { phone, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw new BadRequestException('No active OTP request found for this phone number');
    }

    if (challenge.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired, please request a new one');
    }

    if (challenge.attemptCount >= MAX_OTP_ATTEMPTS) {
      throw new ForbiddenException('Too many incorrect attempts, please request a new OTP');
    }

    const isValid = await compareOtpCode(dto.code, challenge.codeHash);

    if (!isValid) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attemptCount: { increment: 1 } },
      });
      throw new BadRequestException('Invalid OTP code');
    }

    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });

    const user = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { phone },
        include: { roles: true, patient: true },
      });

      if (!existing) {
        const created = await tx.user.create({
          data: {
            phone,
            fullName: dto.fullName?.trim() || 'Sehatdoc User',
            lastLoginAt: new Date(),
            roles: { create: { role: AppRole.PATIENT } },
            patient: { create: {} },
          },
          include: { roles: { where: { revokedAt: null } } },
        });
        return created;
      }

      if (!existing.patient) {
        await tx.patient.create({ data: { userId: existing.id } });
      }

      const hasActivePatientRole = existing.roles.some(
        (r) => r.role === AppRole.PATIENT && !r.revokedAt,
      );
      if (!hasActivePatientRole) {
        await tx.userRole.upsert({
          where: { userId_role: { userId: existing.id, role: AppRole.PATIENT } },
          update: { revokedAt: null },
          create: { userId: existing.id, role: AppRole.PATIENT },
        });
      }

      if (dto.fullName?.trim() && existing.fullName === 'Sehatdoc User') {
        await tx.user.update({
          where: { id: existing.id },
          data: { fullName: dto.fullName.trim() },
        });
      }

      await tx.user.update({ where: { id: existing.id }, data: { lastLoginAt: new Date() } });

      return tx.user.findUniqueOrThrow({
        where: { id: existing.id },
        include: { roles: { where: { revokedAt: null } } },
      });
    });

    const roles = user.roles.map((r) => r.role);
    const tokens = await this.issueTokens(user.id, user.phone, roles);

    return { ...tokens, user: { id: user.id, phone: user.phone, fullName: user.fullName, roles } };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const refreshSecret = this.configService.get<string>('app.jwt.refreshSecret');

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenHash = this.hashToken(refreshToken);

    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, tokenHash, revokedAt: null },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token not recognized');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: { where: { revokedAt: null } } },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return this.issueTokens(
      user.id,
      user.phone,
      user.roles.map((r) => r.role),
    );
  }

  async logout(userId: string, refreshToken?: string): Promise<{ loggedOut: true }> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { userId, tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return { loggedOut: true };
    }

    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { loggedOut: true };
  }

  private async issueTokens(userId: string, phone: string, roles: AppRole[]): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, phone, roles };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('app.jwt.accessSecret'),
      expiresIn: this.configService.get<string>('app.jwt.accessExpiresIn') as unknown as number,
    });

    const refreshExpiresIn = this.configService.get<string>('app.jwt.refreshExpiresIn') ?? '7d';
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('app.jwt.refreshSecret'),
      expiresIn: refreshExpiresIn as unknown as number,
    });

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + this.parseDurationMs(refreshExpiresIn)),
      },
    });

    return { accessToken, refreshToken };
  }

  /** Deterministic hash so refresh tokens can be looked up (bcrypt salts differ per call). */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseDurationMs(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration.trim());
    if (!match) {
      return 7 * DURATION_MULTIPLIERS.d;
    }
    const value = Number(match[1]);
    const unit = match[2];
    return value * (DURATION_MULTIPLIERS[unit] ?? DURATION_MULTIPLIERS.d);
  }
}
