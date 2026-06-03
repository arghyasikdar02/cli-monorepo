# AWS Migration

## Future Target
- CloudFront + WAF.
- ECS or Lambda for service APIs.
- RDS PostgreSQL.
- S3 private buckets plus CloudFront signed delivery.
- EventBridge/SQS for events.
- Secrets Manager for service secrets.
- EKS/ECS isolated lab runtime later.

## Migration Rule
Split one service at a time only after it has:
- Dedicated health endpoint.
- Clear environment variables.
- Owned tables/repositories.
- Tests.
- Audit events.
- Rollback plan.

## Mapping
- Supabase PostgreSQL -> RDS PostgreSQL.
- Supabase Auth -> Cognito or dedicated auth-service.
- Supabase Storage -> S3 private buckets.
- Vercel route handlers -> ECS/Lambda services.
- Mock AI -> provider-backed RAG service.
- Manual labs -> isolated lab runtime.

