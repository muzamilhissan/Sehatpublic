export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  otp: {
    devMode: boolean;
    devCode: string;
    expiresMinutes: number;
  };
  paymentHoldMinutes: number;
  corsOrigin: string;
  sehatdoc: {
    apiUrl: string;
    outboxEnabled: boolean;
    outboxIntervalMs: number;
  };
}

export default (): { app: AppConfig } => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3001', 10),
    databaseUrl: process.env.DATABASE_URL ?? '',
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
      refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    },
    otp: {
      devMode: (process.env.OTP_DEV_MODE ?? 'false').toLowerCase() === 'true',
      devCode: process.env.OTP_DEV_CODE ?? '123456',
      expiresMinutes: parseInt(process.env.OTP_EXPIRES_MINUTES ?? '10', 10),
    },
    paymentHoldMinutes: parseInt(process.env.PAYMENT_HOLD_MINUTES ?? '30', 10),
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
    sehatdoc: {
      // Optional — only needed when at least one doctor enables Desk sync
      apiUrl: process.env.SEHATDOC_API_URL ?? '',
      outboxEnabled: (process.env.SEHATDOC_OUTBOX_ENABLED ?? 'true').toLowerCase() !== 'false',
      outboxIntervalMs: parseInt(process.env.SEHATDOC_OUTBOX_INTERVAL_MS ?? '10000', 10),
    },
  },
});
