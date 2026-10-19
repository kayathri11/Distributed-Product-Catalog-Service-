CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(160) NOT NULL,
  image_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS product_translations (
  product_id BIGINT UNSIGNED NOT NULL,
  locale VARCHAR(10) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  PRIMARY KEY (product_id, locale),
  KEY idx_translation_locale_name (locale, name),
  CONSTRAINT fk_translation_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS product_prices (
  product_id BIGINT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (product_id, currency),
  KEY idx_price_currency_product (currency, product_id),
  CONSTRAINT fk_price_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT chk_price_nonnegative CHECK (amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO products (id, slug) VALUES
  (1, 'field-bottle'),
  (2, 'weekender-tote'),
  (3, 'studio-candle'),
  (4, 'everyday-cap')
ON DUPLICATE KEY UPDATE slug = VALUES(slug);

INSERT INTO product_translations (product_id, locale, name, description) VALUES
  (1, 'en', 'Field Bottle', 'Insulated stainless steel, made for long days outside.'),
  (1, 'fr', 'Gourde de terrain', 'Acier inoxydable isotherme, conçue pour les longues journées dehors.'),
  (1, 'de', 'Feldflasche', 'Isolierter Edelstahl, gemacht für lange Tage im Freien.'),
  (2, 'en', 'Weekender Tote', 'A roomy canvas carryall for the things you take along.'),
  (2, 'fr', 'Sac week-end', 'Un grand sac en toile pour tout ce qui vous accompagne.'),
  (2, 'de', 'Weekender-Tasche', 'Eine geräumige Canvas-Tasche für alles, was mitkommt.'),
  (3, 'en', 'Studio Candle', 'A quiet cedar and fig scent poured into reusable glass.'),
  (3, 'fr', 'Bougie studio', 'Un parfum doux de cèdre et de figue dans un verre réutilisable.'),
  (3, 'de', 'Studio-Kerze', 'Ein sanfter Duft aus Zeder und Feige in wiederverwendbarem Glas.'),
  (4, 'en', 'Everyday Cap', 'Soft organic cotton with an easy, unstructured fit.'),
  (4, 'fr', 'Casquette quotidienne', 'Coton biologique doux avec une coupe souple et décontractée.'),
  (4, 'de', 'Alltagskappe', 'Weiche Bio-Baumwolle mit bequemer, unstrukturierter Passform.')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

INSERT INTO product_prices (product_id, currency, amount) VALUES
  (1, 'USD', 38.00), (1, 'EUR', 35.00), (1, 'GBP', 30.00),
  (2, 'USD', 64.00), (2, 'EUR', 59.00), (2, 'GBP', 52.00),
  (3, 'USD', 32.00), (3, 'EUR', 29.00), (3, 'GBP', 26.00),
  (4, 'USD', 28.00), (4, 'EUR', 25.00), (4, 'GBP', 22.00)
ON DUPLICATE KEY UPDATE amount = VALUES(amount);
