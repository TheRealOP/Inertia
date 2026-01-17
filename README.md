## Architecture
- Flowchart: docs/architecture/flowchart.md

## Prisma + Neon
- Prisma 7 reads the database URL from `prisma.config.ts`, not `schema.prisma`.
- Use `DATABASE_URL` in `.env.local` (Neon connection string).
- Run `npm run prisma:migrate` for migrations and `npm run prisma:generate` to regenerate the client.
