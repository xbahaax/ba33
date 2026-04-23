import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/common/database/schema/index.ts',
  out: '../../infra/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
