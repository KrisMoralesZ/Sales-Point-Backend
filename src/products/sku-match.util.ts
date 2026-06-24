function extractDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizeDigits(value: string): string {
  const digits = extractDigits(value);
  if (!digits) return '';

  return digits.replace(/^0+/, '') || '0';
}

export function scoreSkuMatch(query: string, sku: string): number {
  const normalizedQuery = query.trim().toUpperCase();
  const normalizedSku = sku.trim().toUpperCase();

  if (!normalizedQuery) {
    return 0;
  }

  if (normalizedSku === normalizedQuery) {
    return 100;
  }

  if (normalizedSku.startsWith(normalizedQuery)) {
    return 80;
  }

  if (normalizedSku.includes(normalizedQuery)) {
    return 60;
  }

  const queryDigits = extractDigits(normalizedQuery);
  const skuDigits = extractDigits(normalizedSku);

  if (queryDigits && skuDigits) {
    if (skuDigits === queryDigits) {
      return 70;
    }

    if (normalizeDigits(skuDigits) === normalizeDigits(queryDigits)) {
      return 65;
    }

    if (skuDigits.includes(queryDigits)) {
      return 50;
    }
  }

  const queryAlnum = normalizedQuery.replace(/[^A-Z0-9]/g, '');
  const skuAlnum = normalizedSku.replace(/[^A-Z0-9]/g, '');

  if (queryAlnum && skuAlnum.includes(queryAlnum)) {
    return 40;
  }

  return 0;
}

export function rankProductsBySkuQuery<T extends { sku: string }>(
  query: string,
  products: T[],
): T[] {
  return products
    .map((product) => ({
      product,
      score: scoreSkuMatch(query, product.sku),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.product.sku.localeCompare(right.product.sku),
    )
    .map((entry) => entry.product);
}
