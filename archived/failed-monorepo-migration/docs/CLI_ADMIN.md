# CLI Admin

## Tool
- Binary: `services/cli-admin-service/bin/cliadm`
- Gateway: `POST /api/cli/commands`

## Required Commands
- `cliadm user create`
- `cliadm user suspend`
- `cliadm course create`
- `cliadm course publish`
- `cliadm enrollment add`
- `cliadm live create`
- `cliadm lab assign`
- `cliadm rag ingest`
- `cliadm analytics summary`
- `cliadm audit search`
- `cliadm system health`

## Security
- Requires `CLIADM_API_URL`.
- Requires `CLIADM_ADMIN_TOKEN`.
- Mutating/destructive commands support `--dry-run`.
- CLI commands are audit logged through the API gateway.

