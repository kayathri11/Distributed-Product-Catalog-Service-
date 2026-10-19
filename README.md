# Distributed Product Catalog

A localized product catalog with a TypeScript/Express API, MySQL persistence, Redis response caching, and a Next.js server-rendered storefront.

## Run with Docker

1. Copy `.env.example` to `.env` and adjust credentials if needed.
2. Start the full stack with `docker compose up --build`.
3. Visit <http://localhost:3000>. The API health endpoint is at <http://localhost:4000/health>.

The first MySQL startup loads sample products in English, French, and German, with prices in USD, EUR, and GBP. MySQL initialization scripts only run when the data volume is first created.

## CI and image publishing

GitHub Actions runs type checks and production builds on pull requests and pushes to `main`. Successful pushes to `main` also publish the API and storefront images to GitHub Container Registry as `ghcr.io/<owner>/<repository>-api` and `ghcr.io/<owner>/<repository>-storefront`. The Compose file can be used as the deployment unit; connect the published images and environment variables to your hosting provider to automate the final runtime rollout.

## Run locally

Start MySQL and Redis, load `database/init.sql` into MySQL, and configure `DATABASE_URL` and `REDIS_URL`. Then run:

```bash
npm ci
npm run dev:api
npm run dev:storefront
```

The storefront defaults to `http://localhost:4000` for API requests. Set `API_INTERNAL_URL` if the API runs elsewhere.

## API

- `GET /health` — API and database readiness
- `GET /api/products?locale=en&currency=USD&q=field&page=1&limit=24` — localized, priced catalog
- `GET /api/products/:slug?locale=en&currency=USD` — product detail

Product translations are selected by locale and fall back to English. Prices fall back to USD when a requested currency is unavailable. Responses are cached in Redis for 60 seconds; catalog responses include an `X-Cache` header.

## Data model

- `products` stores language-neutral identity and slug.
- `product_translations` stores one row per product and locale.
- `product_prices` stores one row per product and currency.

Composite primary keys and supporting indexes cover translation and price lookups. Catalog values are parameterized in SQL, and result pages are capped at 100 items.
