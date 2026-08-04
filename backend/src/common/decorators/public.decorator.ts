import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants/roles.constant';

/**
 * Marks a route (or controller) as not requiring JWT authentication.
 * Read by `JwtAuthGuard`.
 */
export const Public = (): ReturnType<typeof SetMetadata> => SetMetadata(IS_PUBLIC_KEY, true);
