import type { RowDataPacket } from "mysql2";
import { database } from "./database";
import type { Product, ProductQuery } from "./types";

interface ProductRow extends RowDataPacket {
  id: number;
  slug: string;
  name: string;
  description: string;
  currency: string;
  price: number;
  imageUrl: string | null;
}

function productFromRow(row: ProductRow): Product {
  return {
    ...row,
    price: Number(row.price)
  };
}

export async function listProducts(query: ProductQuery): Promise<Product[]> {
  const offset = (query.page - 1) * query.limit;
  const search = query.search ? `%${query.search}%` : null;
  const [rows] = await database.execute<ProductRow[]>(
    `SELECT p.id, p.slug,
            COALESCE(requested.name, fallback.name) AS name,
            COALESCE(requested.description, fallback.description) AS description,
            COALESCE(selected_price.currency, fallback_price.currency) AS currency,
            COALESCE(selected_price.amount, fallback_price.amount) AS price,
            p.image_url AS imageUrl
       FROM products p
       LEFT JOIN product_translations requested
         ON requested.product_id = p.id AND requested.locale = ?
       LEFT JOIN product_translations fallback
         ON fallback.product_id = p.id AND fallback.locale = 'en'
       LEFT JOIN product_prices selected_price
         ON selected_price.product_id = p.id AND selected_price.currency = ?
       LEFT JOIN product_prices fallback_price
         ON fallback_price.product_id = p.id AND fallback_price.currency = 'USD'
      WHERE COALESCE(requested.name, fallback.name) IS NOT NULL
        AND COALESCE(selected_price.amount, fallback_price.amount) IS NOT NULL
        AND (? IS NULL OR COALESCE(requested.name, fallback.name) LIKE ?)
      ORDER BY p.id
      LIMIT ? OFFSET ?`,
    [query.locale, query.currency, search, search, query.limit, offset]
  );

  return rows.map(productFromRow);
}

export async function getProduct(
  slug: string,
  locale: string,
  currency: string
): Promise<Product | null> {
  const [rows] = await database.execute<ProductRow[]>(
    `SELECT p.id, p.slug,
            COALESCE(requested.name, fallback.name) AS name,
            COALESCE(requested.description, fallback.description) AS description,
            COALESCE(selected_price.currency, fallback_price.currency) AS currency,
            COALESCE(selected_price.amount, fallback_price.amount) AS price,
            p.image_url AS imageUrl
       FROM products p
       LEFT JOIN product_translations requested
         ON requested.product_id = p.id AND requested.locale = ?
       LEFT JOIN product_translations fallback
         ON fallback.product_id = p.id AND fallback.locale = 'en'
       LEFT JOIN product_prices selected_price
         ON selected_price.product_id = p.id AND selected_price.currency = ?
       LEFT JOIN product_prices fallback_price
         ON fallback_price.product_id = p.id AND fallback_price.currency = 'USD'
      WHERE p.slug = ?
        AND COALESCE(requested.name, fallback.name) IS NOT NULL
        AND COALESCE(selected_price.amount, fallback_price.amount) IS NOT NULL
      LIMIT 1`,
    [locale, currency, slug]
  );

  return rows.length ? productFromRow(rows[0]) : null;
}
