export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  currency: string;
  price: number;
  imageUrl: string | null;
}

export interface ProductQuery {
  locale: string;
  currency: string;
  search: string;
  page: number;
  limit: number;
}
