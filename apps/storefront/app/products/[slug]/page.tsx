import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProduct } from "../../../lib/catalog";

interface SearchParams {
  locale?: string;
  currency?: string;
}

export default async function ProductPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const locale = ["en", "fr", "de"].includes(query.locale ?? "") ? query.locale! : "en";
  const currency = ["USD", "EUR", "GBP"].includes(query.currency ?? "")
    ? query.currency!
    : "USD";
  const product = await fetchProduct(slug, locale, currency);
  if (!product) notFound();

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link href="/" className="wordmark">NORTHSTAR<span>SUPPLY</span></Link>
        <Link href={`/?locale=${locale}&currency=${currency}`} className="back-link">← THE COLLECTION</Link>
      </header>
      <section className="detail">
        <div className="detail-visual visual-2"><span className="visual-shape" aria-hidden="true" /></div>
        <div className="detail-copy">
          <p className="eyebrow">NORTHSTAR OBJECT / {String(product.id).padStart(3, "0")}</p>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>
          <p className="detail-price">{product.currency} {product.price.toFixed(2)}</p>
          <button className="add-button" type="button">ADD TO BAG <span>↗</span></button>
          <p className="detail-note">Thoughtfully made. Ready for the long run.</p>
        </div>
      </section>
    </main>
  );
}
