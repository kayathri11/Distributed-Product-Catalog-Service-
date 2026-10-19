export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  currency: string;
  price: number;
  imageUrl: string | null;
}

const apiUrl = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

export async function fetchProducts(
  locale: string,
  currency: string,
  search = ""
): Promise<Product[]> {
  const params = new URLSearchParams({ locale, currency });
  if (search) params.set("q", search);
  const response = await fetch(`${apiUrl}/api/products?${params}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Catalog API returned ${response.status}`);
  return response.json() as Promise<Product[]>;
}

export async function fetchProduct(
  slug: string,
  locale: string,
  currency: string
): Promise<Product | null> {
  const params = new URLSearchParams({ locale, currency });
  const response = await fetch(
    `${apiUrl}/api/products/${encodeURIComponent(slug)}?${params}`,
    { cache: "no-store" }
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Catalog API returned ${response.status}`);
  return response.json() as Promise<Product>;
}
