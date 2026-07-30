import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsIn(['development', 'production', 'test'])
  NODE_ENV?: string;

  @IsOptional()
  @IsNumberString()
  PORT?: string;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_ACCESS_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  JWT_REFRESH_EXPIRES_IN?: string;

  @IsOptional()
  @IsBooleanString()
  OTP_DEV_MODE?: string;

  @IsOptional()
  @IsString()
  OTP_DEV_CODE?: string;

  @IsOptional()
  @IsNumberString()
  OTP_EXPIRES_MINUTES?: string;

  @IsOptional()
  @IsNumberString()
  PAYMENT_HOLD_MINUTES?: string;

  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;

  /** Base URL of SehtDesk/SehatDoc API, e.g. http://localhost:5001 — optional */
  @IsOptional()
  @IsString()
  SEHATDOC_API_URL?: string;

  @IsOptional()
  @IsBooleanString()
  SEHATDOC_OUTBOX_ENABLED?: string;

  @IsOptional()
  @IsNumberString()
  SEHATDOC_OUTBOX_INTERVAL_MS?: string;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `Config validation failed: ${errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .join('; ')}`,
    );
  }

  return validatedConfig;
}
