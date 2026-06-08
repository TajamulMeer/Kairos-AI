import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME || 'AIRIX AI',
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  url: process.env.APP_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  encryptionKey: process.env.ENCRYPTION_KEY || 'change-this-32-char-key-in-prod!',
  bcryptSaltRounds: 12,
  ai: {
    defaultProvider: process.env.AI_DEFAULT_PROVIDER || 'openai',
    fallbackProvider: process.env.AI_FALLBACK_PROVIDER || 'anthropic',
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    googleAiApiKey: process.env.GOOGLE_AI_API_KEY,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-south-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'airix-ai-storage',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
}));
