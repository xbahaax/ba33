# Sheep AI Module

Standalone NestJS module for ram breed detection from uploaded images.

## Goal

Prepare the backend contract and provider architecture for AI-assisted breed detection without integrating it into the existing BA33 flows yet.

## Current shape

- Endpoint: `POST /api/v1/sheep-ai/detect-breed`
- Input: multipart upload with `file` and optional `provider`
- Default provider: `gemini`
- Future provider: `local`
- Response: normalized JSON with `predictedBreed`, `confidence`, and extracted traits

## Design rules

- Controllers never call Gemini directly.
- All AI providers implement the same `BreedProvider` interface.
- Provider selection stays inside the service layer.
- Gemini responses must be strict JSON only.
- Low-confidence results are downgraded to `predictedBreed: null`.

## Environment variables

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=xxxxx
GEMINI_MODEL=gemini-1.5-flash
```

## Integration note

The module is scaffolded but not wired into `AppModule` yet. Import `SheepAiModule` in `src/app.module.ts` only after validation is complete.
