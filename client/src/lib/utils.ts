import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price?: string | null, emptyFallback = 'Price on Application'): string {
  if (!price) return emptyFallback;
  const cleanPrice = price.replace(/,/g, '').replace(/\$/g, '').trim();
  if (!isNaN(Number(cleanPrice)) && cleanPrice !== '') {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(Number(cleanPrice));
  }
  const lower = price.toLowerCase();
  if (lower.includes('poa') || lower.includes('sold') || price.includes('$')) {
    return price;
  }
  return `$${price}`;
}
