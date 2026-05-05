# Pizza Auth Service

REST API for authentication, users, tenants, and refresh-token flows for the MERN Pizza stack. Built with **Express 5**, **TypeORM**, **PostgreSQL**, and **JWT (RS256 via JWKS)**.

## Prerequisites

- **Node.js** 20+ (Dockerfile targets Node 22)
- **PostgreSQL** 13+
- npm

## Tech stack

| Area       | Choices                                   |
| ---------- | ----------------------------------------- |
| Runtime    | Node.js, ESM (`"type": "module"`)         |
| HTTP       | Express 5                                 |
| ORM / DB   | TypeORM 0.3, PostgreSQL                   |
| Auth       | `express-jwt`, `jwks-rsa`, `jsonwebtoken` |
| Passwords  | bcrypt                                    |
| Logging    | Winston                                   |
| Tests      | Vitest, Supertest, coverage (v8)          |
| Dev server | `tsx`                                     |

## Quick start

```bash
git clone git@github.com:ankitsharma21598/mern-pizza-auth-service.git
cd mern-pizza-auth-service
npm ci
```

### Environment variables

Config is loaded from **`.env.<NODE_ENV>`** at the repo root (see [`src/config/index.ts`](src/config/index.ts)).

| Variable               | Purpose                                               |
| ---------------------- | ----------------------------------------------------- |
| `PORT`                 | HTTP port (default in samples: `5501`)                |
| `NODE_ENV`             | Selects which env file loads (`dev`, `test`, `prod`)  |
| `DB_HOST`              | Postgres host                                         |
| `DB_PORT`              | Postgres port                                         |
| `DB_USERNAME`          | Database user                                         |
| `DB_PASSWORD`          | Database password                                     |
| `DB_NAME`              | Database name                                         |
| `REFRESH_TOKEN_SECRET` | Secret used in refresh-token handling                 |
| `JWKS_URI`             | JWKS URL for validating access tokens (`express-jwt`) |
| `PRIVATE_KEY`          | PEM for signing JWTs (required where issuing tokens)  |

Create `.env.dev`, `.env.test`, or `.env.prod` at the repo root with the variables below (matching your local or CI Postgres and secrets).

Ensure **PostgreSQL has a database** matching `DB_NAME`.

### Database migrations

Migrations live under [`src/migration/`](src/migration/). Run them against the DB for your environment:

```bash
npm run migration:run
```

(Uses `NODE_ENV`; ensure `.env.<env>` exists.)

Create or generate migrations as needed:

```bash
npm run migration:create src/migration/YourMigrationName
npm run migration:generate src/migration/YourMigrationName
```

### Run the API locally

Development (with reload):

```bash
npm run dev
```

Runs with `NODE_ENV=dev`, loads `.env.dev`, listens on `Config.PORT`.

Production-style process (reload still via `tsx watch` in scripts):

```bash
npm run prod
```

Compile to `dist/`:

```bash
npm run build
```

## API overview

Base paths are mounted in [`src/app.ts`](src/app.ts).

### `GET /`

Health-style welcome response.

### Auth — `/auth`

| Method | Path        | Notes                                      |
| ------ | ----------- | ------------------------------------------ |
| `POST` | `/register` | Create user                                |
| `POST` | `/login`    | Login                                      |
| `GET`  | `/self`     | Current user (authenticated)               |
| `POST` | `/refresh`  | Rotate access token                        |
| `POST` | `/logout`   | Invalidate refresh session (authenticated) |

### Users — `/users` (ADMIN)

Protected with `authenticate` + role check.

| Method   | Path   | Notes          |
| -------- | ------ | -------------- |
| `POST`   | `/`    | Create user    |
| `GET`    | `/`    | List users     |
| `GET`    | `/:id` | Get user by id |
| `PATCH`  | `/:id` | Update user    |
| `DELETE` | `/:id` | Delete user    |

### Tenants — `/tenants` (ADMIN)

| Method | Path | Notes         |
| ------ | ---- | ------------- |
| `POST` | `/`  | Create tenant |

Errors are returned as JSON (`errors[]`) from the global error handler in [`src/app.ts`](src/app.ts).

## Testing

Integration tests hit the real Express app and database; Vitest runs files **serially** (`fileParallelism: false`) to reduce DB flakes.

```bash
# Loads .env.test when NODE_ENV=test (set explicitly if needed)
cross-env NODE_ENV=test npm run test
```

Uses [`tests/`](tests/) and writes coverage under `coverage/` (see [`vitest.config.ts`](vitest.config.ts)).

```bash
npm run test:watch
npm run test:verbose
```

## Lint & format

```bash
npm run lint:check
npm run lint:fix
npm run format:check
npm run format:fix
```

Husky + lint-staged run lint/format on staged TypeScript via `npm run prepare`.

## Docker

Production image is built from [`docker/prod/Dockerfile`](docker/prod/Dockerfile) (`npm ci`, `npm run build`, slim runtime).

## Repository

- Issues: https://github.com/ankitsharma21598/mern-pizza-auth-service/issues

## License

ISC
