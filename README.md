# Portfolio Backend

Independent Node.js + Express API.

## Folders (why they exist)

| Folder | Responsibility |
|--------|----------------|
| `src/controllers/` | Read request, call service, send response |
| `src/routes/` | URL → controller mapping |
| `src/services/` | Business logic (no Express req/res) |
| `src/middlewares/` | Shared request helpers (errors, validation) |
| `src/validators/` | Check request body/params before controllers |
| `src/config/` | Env, DB client, mailer setup |
| `src/utils/` | Small shared helpers |
| `prisma/` | Schema + migrations (PostgreSQL via Prisma) |
| `swagger/` | OpenAPI docs pieces |

## Scripts

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Health: `GET http://localhost:5000/api/health`

Next mentoring step: Prisma schema + first table (`Hero` or `Skill`).
