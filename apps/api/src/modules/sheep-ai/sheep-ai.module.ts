import { Module } from '@nestjs/common';
import { SheepAiController } from './sheep-ai.controller';
import { SheepAiService } from './sheep-ai.service';
import { BREED_PROVIDER } from './interfaces/breed-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { LocalProvider } from './providers/local.provider';

@Module({
  controllers: [SheepAiController],
  providers: [
    SheepAiService,
    GeminiProvider,
    LocalProvider,
    {
      provide: BREED_PROVIDER,
      useFactory: (geminiProvider: GeminiProvider, localProvider: LocalProvider) => {
        return process.env.AI_PROVIDER === 'local' ? localProvider : geminiProvider;
      },
      inject: [GeminiProvider, LocalProvider],
    },
  ],
  exports: [SheepAiService],
})
export class SheepAiModule {}
