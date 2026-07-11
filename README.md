<samp>

# voidend

## setup

copy env and fill in your db credentials

```
cp .env.example .env
```

start postgres

```
sudo ./start-database.sh
```

push schema to db

```
pnpm db:push
```

## dev

```
pnpm dev
```

## structure

```
src/
├── app/        next.js routes and pages
├── server/     trpc routers and db
├── trpc/       client and server trpc setup
└── styles/     global css
```

## scripts

| command          | does                            |
| ---------------- | ------------------------------- |
| `pnpm dev`       | start dev server with turbopack |
| `pnpm check`     | lint and format                 |
| `pnpm check:fix` | lint + autofix + format         |
| `pnpm db:push`   | push schema changes to db       |
| `pnpm db:studio` | open drizzle studio             |

contributing? read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

</samp>
