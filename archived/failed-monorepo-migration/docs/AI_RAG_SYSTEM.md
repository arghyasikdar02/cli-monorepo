# AI/RAG System

## Current Status
- Course-specific AI chat session API exists.
- Chat history is scoped by user and course.
- Mock/course-grounded provider is used for MVP.
- Retrieval queries filter by `course_id`.
- Usage limit starter is implemented through API rate limiting and `/api/ai/usage`.

## Provider Abstraction
MVP supports mock/local behavior. Future providers can include:
- OpenAI
- Claude
- Gemini

## Guardrails
- Refuse outside-course material.
- Do not reveal lab flags.
- Do not reveal quiz answers before allowed release.
- Keep citations tied to course-specific chunks.

