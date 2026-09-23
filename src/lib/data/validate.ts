export interface PriceValidationResult {
  isOutlier: boolean
  standardDeviations: number
  marketAverage: number
  marketMin: number
  marketMax: number
  confidenceScore: number
}

export function validatePriceAnomaly(
  askingPrice: number,
  marketEstimate: number
): PriceValidationResult {
  const deviation = (askingPrice - marketEstimate) / marketEstimate
  const isTooLow = deviation < -0.4 // >40% below market average
  const isTooHigh = deviation > 1.8 // >180% above market average

  const isOutlier = isTooLow || isTooHigh
  const confidenceScore = isOutlier ? 0.35 : 0.9

  return {
    isOutlier,
    standardDeviations: Math.abs(deviation * 2),
    marketAverage: marketEstimate,
    marketMin: Math.round(marketEstimate * 0.85),
    marketMax: Math.round(marketEstimate * 1.15),
    confidenceScore,
  }
}
