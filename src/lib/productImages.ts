const FORM_IMAGES: Record<string, string> = {
  Syrup: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60',
  Tablets: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
  Capsules: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60',
  Cream: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=500&auto=format&fit=crop&q=60',
  Ointment: 'https://images.unsplash.com/photo-1615396899839-c99c121888b0?w=500&auto=format&fit=crop&q=60',
  Gel: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60',
  Drops: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60',
  Injection: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
  Spray: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=500&auto=format&fit=crop&q=60',
  Sachet: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60',
  Shampoo: 'https://images.unsplash.com/photo-1615396899839-c99c121888b0?w=500&auto=format&fit=crop&q=60',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60';

export function getProductImage(imageUrl: string | null | undefined, form?: string | null): string {
  if (imageUrl) return imageUrl;
  if (form && FORM_IMAGES[form]) return FORM_IMAGES[form];
  return DEFAULT_IMAGE;
}
