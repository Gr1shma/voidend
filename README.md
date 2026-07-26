# voidend

Local-first, offline mock API tool for frontend developers. Define schema-driven endpoints, get realistic fake data instantly — no backend, no internet.

## Table of Contents

- [Quick Start](#quick-start)
- [Build & Run](#build--run)
- [Features](#features)
- [Writing Schemas](#writing-schemas)
- [Data Directory](#data-directory)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Contributing](#contributing)

## Quick Start

```
git clone https://github.com/Gr1shma/voidend/
cd voidend
pnpm install
pnpm db:push
pnpm dev
```

## Build & Run

```
pnpm build
pnpm start
```

Or use `pnpm preview` to build and start in one step.

## Features

- Schema-driven mock endpoints with `$faker.*` powered fake data
- Nested objects and repeated arrays via `$array` / `$count`
- Network simulation — delays, failure rates
- Mock JWT authentication (`/login`, `requiresAuth`)
- Export/import projects as JSON
- Everything runs locally in SQLite — no external services

## Writing Schemas

`responseSchema` is a JSON object. Strings starting with `$faker.` resolve to fake values via [faker.js](https://fakerjs.dev/).

```json
{
    "id": "$faker.string.uuid",
    "name": "$faker.person.fullName",
    "tags": {
        "$array": "$faker.lorem.word",
        "$count": 3
    }
}
```

- Static values (`"admin"`, `42`, `true`) pass through unchanged.
- `$array` repeats its template `$count` times (default 3).
- Use `responseCount` on the endpoint for top-level list responses — don't combine with a top-level `$array`.
- Invalid faker paths silently resolve to `null`.

Data is resolved once and cached to disk; editing the schema or count regenerates it.

## Data Directory

| platform | path                                     |
| -------- | ---------------------------------------- |
| linux    | `~/.local/share/voidend/`                |
| macOS    | `~/Library/Application Support/voidend/` |
| windows  | `%APPDATA%\voidend\`                     |

## Project Structure

```
src/
├── app/        next.js routes and pages
├── components/ shared ui components
├── hooks/      react query hooks
├── lib/        data store and schema utilities
├── modules/    feature modules (projects, workspace)
├── server/     trpc routers and db
├── trpc/       client and server trpc setup
└── styles/     global css
```

## Scripts

| command          | does                            |
| ---------------- | ------------------------------- |
| `pnpm dev`       | start dev server with turbopack |
| `pnpm build`     | build for production            |
| `pnpm start`     | start production server         |
| `pnpm preview`   | build and start in one step     |
| `pnpm check`     | lint and format                 |
| `pnpm check:fix` | lint + autofix + format         |
| `pnpm db:push`   | push schema changes to db       |
| `pnpm db:studio` | open drizzle studio             |
| `pnpm typecheck` | run typescript checks           |
| `pnpm test`      | run tests                       |
