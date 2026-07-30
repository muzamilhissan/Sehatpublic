import { SetMetadata } from '@nestjs/common';
import { AppRole } from '@prisma/client';
import { ROLES_KEY } from '../constants/roles.constant';

/**
 * Restricts a route (or controller) to users holding at least one of the given roles.
 * Read by `RolesGuard`.
 */
export const Roles = (...roles: AppRole[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles);
