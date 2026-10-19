import cors from "cors";
import express, { type Request, type Response, type NextFunction } from "express";
import { createClient } from "redis";
import { database } from "./database";
import { getProduct, listProducts } from "./catalog";
import type { ProductQuery } from "./types";

const app = express();
const port = Number(process.env.API_PORT ?? 4000);
const redis = createClient({ url: process.env.REDIS_URL ?? "redis://localhost:6379" });

redis.on("error", (error) => console.error("Redis client error:", error));

app.use(cors());
app.use(express.json());

app.get("/health", async (_request, response) => {
  try {
    await database.query("SELECT 1");
    response.json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed:", error);
    response.status(503).json({ status: "unavailable" });
  }
});

app.get("/api/products", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number.parseInt(String(request.query.page ?? "1"), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(String(request.query.limit ?? "24"), 10) || 24)
    );
    const query: ProductQuery = {
      locale: String(request.query.locale ?? "en"),
      currency: String(request.query.currency ?? "USD").toUpperCase(),
      search: String(request.query.q ?? "").trim().slice(0, 100),
      page,
      limit
    };
    const cacheKey = `catalog:${JSON.stringify(query)}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      response.setHeader("X-Cache", "HIT");
      response.json(JSON.parse(cached));
      return;
    }

    const products = await listProducts(query);
    await redis.setEx(cacheKey, 60, JSON.stringify(products));
    response.setHeader("X-Cache", "MISS");
    response.json(products);
  } catch (error) {
    next(error);
  }
});

app.get(
  "/api/products/:slug",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const locale = String(request.query.locale ?? "en");
      const currency = String(request.query.currency ?? "USD").toUpperCase();
      const slug = String(request.params.slug);
      const cacheKey = `product:${slug}:${locale}:${currency}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        response.setHeader("X-Cache", "HIT");
        response.json(JSON.parse(cached));
        return;
      }

      const product = await getProduct(slug, locale, currency);
      if (!product) {
        response.status(404).json({ error: "Product not found" });
        return;
      }
      await redis.setEx(cacheKey, 60, JSON.stringify(product));
      response.setHeader("X-Cache", "MISS");
      response.json(product);
    } catch (error) {
      next(error);
    }
  }
);

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  console.error("Request failed:", error);
  response.status(500).json({ error: "Internal server error" });
});

async function start(): Promise<void> {
  await redis.connect();
  app.listen(port, () => console.log(`Catalog API listening on port ${port}`));
}

start().catch((error: unknown) => {
  console.error("Could not start catalog API:", error);
  process.exitCode = 1;
});
