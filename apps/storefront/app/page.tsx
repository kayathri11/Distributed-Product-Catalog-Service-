import Link from "next/link";
import { fetchProducts } from "../lib/catalog";

interface SearchParams {
  locale?: string;
  currency?: string;
  q?: string;
}

const currencies = ["USD", "EUR", "GBP"];
const locales = ["en", "fr", "de"];
const currencySymbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };

export default async function Home({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const locale = locales.includes(params.locale ?? "") ? params.locale! : "en";
  const currency = currencies.includes(params.currency ?? "")
    ? params.currency!
    : "USD";
  const search = (params.q ?? "").slice(0, 100);
  const products = await fetchProducts(locale, currency, search);

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link href="/" className="wordmark">NORTHSTAR<span>SUPPLY</span></Link>
        <span className="top-note">GOODS FOR THE EVERYDAY</span>
      </header>
      <section className="hero">
        <p className="eyebrow">THE ESSENTIALS COLLECTION</p>
        <h1>Made for the<br /><em>in-between.</em></h1>
        <p className="hero-copy">
          Considered objects for wherever the day takes you. Built to last, made to be used.
        </p>
      </section>
      <section className="catalog" aria-labelledby="catalog-title">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">A SMALLER, BETTER EDIT</p>
            <h2 id="catalog-title">Everyday essentials <span>({products.length})</span></h2>
          </div>
          <form className="filters" action="/" method="get">
            <input name="q" defaultValue={search} placeholder="Search the collection" aria-label="Search products" />
            <select name="locale" defaultValue={locale} aria-label="Language">
              {locales.map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}
            </select>
            <select name="currency" defaultValue={currency} aria-label="Currency">
              {currencies.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button type="submit">APPLY</button>
          </form>
        </div>
        {products.length ? (
          <div className="product-grid">
            {products.map((product, index) => (
              <Link className="product-card" href={`/products/${product.slug}?locale=${locale}&currency=${currency}`} key={product.id}>
                <div className={`product-visual visual-${(index % 4) + 1}`}>
                  <span className="product-number">NO. {String(index + 1).padStart(2, "0")}</span>
                  <span className="visual-shape" aria-hidden="true" />
                  <span className="view-product">VIEW OBJECT ↗</span>
                </div>
                <div className="product-info">
                  <div><h3>{product.name}</h3><p>{product.description}</p></div>
                  <span className="price">{currencySymbols[product.currency] ?? ""}{product.price.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="empty-state">No objects found. Try another search.</p>
        )}
      </section>
      <footer><span>NORTHSTAR SUPPLY</span><span>DESIGNED TO BE KEPT.</span></footer>
    </main>
  );
}
