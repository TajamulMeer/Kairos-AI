import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  name: process.env.POSTGRES_DB || 'airix_db_dev',
  user: process.env.POSTGRES_USER || 'airix_user',
  password: process.env.POSTGRES_PASSWORD || 'airix_dev_password',
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
}));
