import { Global, Module } from '@nestjs/common';
import { db, Database } from './client';

export const DATABASE_TOKEN = Symbol('DATABASE_TOKEN');

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useValue: db,
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
