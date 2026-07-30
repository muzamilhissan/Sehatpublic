import { AppRole } from '@prisma/client';

/** Shape of the signed JWT (access & refresh tokens). */
export interface JwtPayload {
  sub: string;
  phone: string;
  roles: AppRole[];
}

/** Shape attached to `req.user` by `JwtStrategy.validate`. */
export interface AuthenticatedUser {
  id: string;
  phone: string;
  roles: AppRole[];
}
