import { rankProductsBySkuQuery, scoreSkuMatch } from './sku-match.util';

describe('scoreSkuMatch', () => {
  it('scores exact matches highest', () => {
    expect(scoreSkuMatch('SP-050', 'SP-050')).toBe(100);
    expect(scoreSkuMatch('sp-050', 'SP-050')).toBe(100);
  });

  it('matches partial sku references such as 50 to SP-050', () => {
    expect(scoreSkuMatch('50', 'SP-050')).toBeGreaterThan(0);
    expect(scoreSkuMatch('50', 'SP-0500')).toBeGreaterThan(0);
  });

  it('matches prefix and substring sku queries', () => {
    expect(scoreSkuMatch('SP-05', 'SP-050')).toBe(80);
    expect(scoreSkuMatch('050', 'SP-050')).toBeGreaterThan(0);
  });

  it('returns zero when there is no meaningful match', () => {
    expect(scoreSkuMatch('999', 'SP-001')).toBe(0);
    expect(scoreSkuMatch('', 'SP-001')).toBe(0);
  });
});

describe('rankProductsBySkuQuery', () => {
  const products = [
    { id: '1', sku: 'SP-050' },
    { id: '2', sku: 'SP-0500' },
    { id: '3', sku: 'SP-001' },
  ];

  it('returns matching products ordered by relevance', () => {
    const matches = rankProductsBySkuQuery('50', products);

    expect(matches.map((product) => product.sku)).toEqual([
      'SP-050',
      'SP-0500',
    ]);
  });
});
