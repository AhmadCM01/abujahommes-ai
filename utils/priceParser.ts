import { PriceRange } from '@/types/property';

export function parsePriceRange(priceString: string): PriceRange {
  if (!priceString || priceString === 'N/A') {
    return {
      min: 0,
      max: 0,
      average: 0,
      formatted: 'N/A'
    };
  }

  // Remove whitespace and convert to uppercase
  const cleanPrice = priceString.replace(/\s/g, '').toUpperCase();
  
  // Handle different formats
  if (cleanPrice.includes('-')) {
    // Range format: "2.5M-4M" or "500K-1M"
    const [minStr, maxStr] = cleanPrice.split('-');
    const min = parseSinglePrice(minStr);
    const max = parseSinglePrice(maxStr);
    
    return {
      min,
      max,
      average: (min + max) / 2,
      formatted: priceString
    };
  } else {
    // Single price format
    const price = parseSinglePrice(cleanPrice);
    return {
      min: price,
      max: price,
      average: price,
      formatted: priceString
    };
  }
}

function parseSinglePrice(priceStr: string): number {
  if (!priceStr || priceStr === 'N/A') return 0;
  
  // Remove any non-numeric characters except K, M, B
  const cleanStr = priceStr.replace(/[^0-9KMB.]/g, '').toUpperCase();
  
  // Extract number and unit
  const match = cleanStr.match(/^([\d.]+)([KMB]?)$/);
  if (!match) return 0;
  
  const [, numberStr, unit] = match;
  const number = parseFloat(numberStr);
  
  if (isNaN(number)) return 0;
  
  switch (unit) {
    case 'K':
      return number * 1000;
    case 'M':
      return number * 1000000;
    case 'B':
      return number * 1000000000;
    default:
      return number;
  }
}

export function formatPrice(price: number): string {
  if (price === 0) return 'N/A';
  
  if (price >= 1000000000) {
    return `₦${(price / 1000000000).toFixed(1)}B`;
  } else if (price >= 1000000) {
    return `₦${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `₦${(price / 1000).toFixed(1)}K`;
  } else {
    return `₦${price.toLocaleString()}`;
  }
}

export function formatPriceRange(priceRange: PriceRange): string {
  if (priceRange.min === 0 && priceRange.max === 0) return 'N/A';
  
  if (priceRange.min === priceRange.max) {
    return formatPrice(priceRange.min);
  }
  
  return `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`;
}

export function getAffordabilityScore(budget: number, priceRange: PriceRange): number {
  if (budget >= priceRange.max) return 100;
  if (budget <= priceRange.min) return 0;
  
  // Linear interpolation between min and max
  const range = priceRange.max - priceRange.min;
  const position = budget - priceRange.min;
  return Math.round((position / range) * 100);
}

export function calculateInvestmentROI(
  purchasePrice: number,
  currentMarketValue: number,
  annualRentalIncome: number = 0
): {
  roi: number;
  appreciation: number;
  rentalYield: number;
  totalReturn: number;
} {
  if (purchasePrice === 0) {
    return {
      roi: 0,
      appreciation: 0,
      rentalYield: 0,
      totalReturn: 0
    };
  }
  
  const appreciation = ((currentMarketValue - purchasePrice) / purchasePrice) * 100;
  const rentalYield = purchasePrice > 0 ? (annualRentalIncome / purchasePrice) * 100 : 0;
  const totalReturn = appreciation + rentalYield;
  const roi = totalReturn;
  
  return {
    roi: Math.round(roi * 100) / 100,
    appreciation: Math.round(appreciation * 100) / 100,
    rentalYield: Math.round(rentalYield * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100
  };
}

export function predictFuturePrice(
  currentPrice: number,
  appreciationRate: number,
  years: number
): number {
  return currentPrice * Math.pow(1 + appreciationRate / 100, years);
}

export function getMarketTrend(
  historicalPrices: number[]
): {
  trend: 'rising' | 'stable' | 'declining';
  changeRate: number;
  confidence: number;
} {
  if (historicalPrices.length < 2) {
    return {
      trend: 'stable',
      changeRate: 0,
      confidence: 0
    };
  }
  
  // Simple linear regression to determine trend
  const n = historicalPrices.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = historicalPrices;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const changeRate = (slope / y[0]) * 100;
  
  let trend: 'rising' | 'stable' | 'declining';
  if (changeRate > 2) {
    trend = 'rising';
  } else if (changeRate < -2) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }
  
  // Calculate confidence based on variance
  const mean = sumY / n;
  const variance = y.reduce((acc, yi) => acc + Math.pow(yi - mean, 2), 0) / n;
  const confidence = Math.max(0, Math.min(100, 100 - (variance / mean) * 100));
  
  return {
    trend,
    changeRate: Math.round(changeRate * 100) / 100,
    confidence: Math.round(confidence)
  };
}
