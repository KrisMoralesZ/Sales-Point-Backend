export interface SampleProductSeed {
  name: string;
  description: string;
  price: number;
  quantity: number;
  sku: string;
}

const catalog: Omit<SampleProductSeed, 'sku' | 'quantity'>[] = [
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with USB receiver',
    price: 29.99,
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with blue switches',
    price: 89.99,
  },
  {
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI and SD card reader',
    price: 45.5,
  },
  {
    name: 'Laptop Stand',
    description: 'Adjustable aluminum laptop stand',
    price: 39.99,
  },
  {
    name: '27-inch Monitor',
    description: 'Full HD IPS display with slim bezels',
    price: 219.99,
  },
  {
    name: 'Webcam HD',
    description: '1080p webcam with built-in microphone',
    price: 59.99,
  },
  {
    name: 'Noise Cancelling Headphones',
    description: 'Over-ear headphones with ANC',
    price: 149.99,
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable waterproof speaker',
    price: 79.99,
  },
  {
    name: 'External SSD 1TB',
    description: 'USB 3.2 portable solid state drive',
    price: 119.99,
  },
  {
    name: 'MicroSD Card 128GB',
    description: 'High-speed memory card for cameras',
    price: 24.99,
  },
  {
    name: 'Phone Charger 65W',
    description: 'GaN fast charger with dual ports',
    price: 34.99,
  },
  {
    name: 'USB-C Cable 2m',
    description: 'Braided charging and data cable',
    price: 14.99,
  },
  {
    name: 'Wireless Earbuds',
    description: 'True wireless earbuds with charging case',
    price: 69.99,
  },
  {
    name: 'Tablet Stand',
    description: 'Foldable stand for tablets and e-readers',
    price: 19.99,
  },
  {
    name: 'Graphic Drawing Tablet',
    description: 'Pen tablet for digital artists',
    price: 199.99,
  },
  {
    name: 'Desk Lamp LED',
    description: 'Adjustable lamp with warm and cool light',
    price: 42.99,
  },
  {
    name: 'Office Chair Cushion',
    description: 'Memory foam seat cushion',
    price: 32.5,
  },
  {
    name: 'Ergonomic Wrist Rest',
    description: 'Gel wrist support for keyboards',
    price: 18.99,
  },
  {
    name: 'Cable Management Kit',
    description: 'Clips and sleeves for desk cables',
    price: 16.99,
  },
  {
    name: 'Notebook A5 Pack',
    description: 'Pack of 3 ruled notebooks',
    price: 12.99,
  },
  {
    name: 'Ballpoint Pen Set',
    description: 'Set of 10 smooth-writing pens',
    price: 8.99,
  },
  {
    name: 'Whiteboard Markers',
    description: 'Assorted dry-erase marker pack',
    price: 11.49,
  },
  {
    name: 'Sticky Notes Bundle',
    description: 'Multicolor sticky notes assortment',
    price: 9.99,
  },
  {
    name: 'Document Tray',
    description: '3-tier mesh desktop organizer',
    price: 22.99,
  },
  {
    name: 'Paper Shredder',
    description: 'Cross-cut shredder for home office',
    price: 89.5,
  },
  {
    name: 'Label Maker',
    description: 'Portable label printer with tape',
    price: 54.99,
  },
  {
    name: 'Calculator Desktop',
    description: '12-digit business calculator',
    price: 19.99,
  },
  {
    name: 'Ring Binder A4',
    description: 'Durable binder with clear cover',
    price: 7.99,
  },
  {
    name: 'Sheet Protectors Pack',
    description: '100-pack clear document sleeves',
    price: 13.99,
  },
  {
    name: 'Stapler Heavy Duty',
    description: 'Metal stapler for up to 50 sheets',
    price: 17.99,
  },
  {
    name: 'Hole Punch 2-Hole',
    description: 'Manual paper punch for binders',
    price: 15.49,
  },
  {
    name: 'Scissors Office',
    description: 'Stainless steel office scissors',
    price: 6.99,
  },
  {
    name: 'Tape Dispenser',
    description: 'Weighted desktop tape dispenser',
    price: 10.99,
  },
  {
    name: 'Packaging Tape Roll',
    description: 'Strong shipping tape 6-pack',
    price: 14.49,
  },
  {
    name: 'Bubble Mailers 25pk',
    description: 'Padded envelopes for shipping',
    price: 18.99,
  },
  {
    name: 'Shipping Boxes Medium',
    description: '10 corrugated boxes for parcels',
    price: 21.99,
  },
  {
    name: 'Thermal Receipt Paper',
    description: 'Rolls for POS receipt printers',
    price: 26.99,
  },
  {
    name: 'Barcode Scanner USB',
    description: 'Handheld 1D barcode scanner',
    price: 64.99,
  },
  {
    name: 'Cash Drawer',
    description: 'Manual cash drawer for POS setups',
    price: 99.99,
  },
  {
    name: 'Receipt Printer',
    description: 'Thermal printer for point of sale',
    price: 179.99,
  },
  {
    name: 'POS Tablet Mount',
    description: 'Swivel stand for checkout tablets',
    price: 49.99,
  },
  {
    name: 'Hand Sanitizer 500ml',
    description: 'Pump bottle for checkout counters',
    price: 5.99,
  },
  {
    name: 'Disinfectant Wipes',
    description: 'Canister of surface cleaning wipes',
    price: 8.49,
  },
  {
    name: 'Reusable Shopping Bag',
    description: 'Foldable eco-friendly tote bag',
    price: 3.99,
  },
  {
    name: 'Gift Wrap Roll',
    description: 'Premium wrapping paper roll',
    price: 6.49,
  },
  {
    name: 'Gift Bag Set',
    description: 'Assorted sizes with tissue paper',
    price: 9.99,
  },
  {
    name: 'Price Tag Gun',
    description: 'Label tagging tool with fasteners',
    price: 29.99,
  },
  {
    name: 'Security Tag Detacher',
    description: 'Magnetic remover for retail tags',
    price: 39.99,
  },
  {
    name: 'Inventory Clipboard',
    description: 'Aluminum clipboard with storage',
    price: 14.99,
  },
  {
    name: 'Store Sign Holder',
    description: 'Acrylic countertop sign display',
    price: 11.99,
  },
];

export const sampleProducts: SampleProductSeed[] = catalog.map(
  (product, index) => ({
    ...product,
    sku: `SP-${String(index + 1).padStart(3, '0')}`,
    quantity: 15 + ((index * 7) % 86),
  }),
);
