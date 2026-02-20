import { PropertyData, PropertyPrice, MLModelMetrics, RecommendationResult } from '@/types/property';
import { parsePriceRange } from '@/utils/priceParser';
import { SimpleLinearRegression, PolynomialRegression } from 'ml-regression';
import { Matrix } from 'ml-matrix';

export class PropertyMLModel {
  private regressionModel: SimpleLinearRegression | PolynomialRegression | null = null;
  private features: number[][] = [];
  private targets: number[] = [];
  private metrics: MLModelMetrics = {
    accuracy: 0,
    mse: 0,
    r2Score: 0,
    lastTrained: new Date()
  };

  constructor() {
    this.initializeModel();
  }

  private initializeModel(): void {
    // Initialize with empty model
    this.regressionModel = null;
  }

  public trainModel(propertyData: PropertyData[]): void {
    this.features = [];
    this.targets = [];

    // Extract features and targets from property data
    propertyData.forEach((property, index) => {
      // Feature engineering
      const tierScore = this.getTierScore(property.tier);
      const lgaScore = this.getLGAScore(property.lga);
      
      // Extract rent prices for training
      const rentPrices = [
        property.rent_selfcontain,
        property.rent_1bed,
        property.rent_2bed,
        property.rent_3bed,
        property.rent_4bed,
        property.rent_5bed
      ];

      rentPrices.forEach((priceStr, bedrooms) => {
        const priceRange = parsePriceRange(priceStr);
        if (priceRange.average > 0) {
          this.features.push([
            index, // location index
            tierScore,
            lgaScore,
            bedrooms === 0 ? 0.5 : bedrooms, // bedroom count
            1 // intercept
          ]);
          this.targets.push(priceRange.average);
        }
      });
    });

    if (this.features.length > 10) {
      // Use polynomial regression for better fit
      this.regressionModel = new PolynomialRegression(this.features, this.targets, 2);
      this.calculateMetrics();
    }
  }

  private getTierScore(tier: string): number {
    const tierScores: { [key: string]: number } = {
      'premium': 6,
      'prime': 5,
      'mid': 4,
      'emerging': 3,
      'outer': 2,
      'rural': 1
    };
    return tierScores[tier] || 1;
  }

  private getLGAScore(lga: string): number {
    const lgaScores: { [key: string]: number } = {
      'AMAC': 6,
      'Bwari': 5,
      'Gwagwalada': 4,
      'Kuje': 3,
      'Kwali': 2,
      'Abaji': 1
    };
    return lgaScores[lga] || 1;
  }

  private calculateMetrics(): void {
    if (!this.regressionModel || this.features.length === 0) return;

    const predictions = this.features.map(features => 
      this.regressionModel!.predict(features)
    );

    // Calculate Mean Squared Error
    const mse = predictions.reduce((acc, pred, i) => {
      const error = pred - this.targets[i];
      return acc + error * error;
    }, 0) / predictions.length;

    // Calculate R² score
    const targetMean = this.targets.reduce((a, b) => a + b, 0) / this.targets.length;
    const totalSumSquares = this.targets.reduce((acc, target) => {
      const error = target - targetMean;
      return acc + error * error;
    }, 0);

    const residualSumSquares = predictions.reduce((acc, pred, i) => {
      const error = this.targets[i] - pred;
      return acc + error * error;
    }, 0);

    const r2Score = 1 - (residualSumSquares / totalSumSquares);

    // Calculate accuracy (simplified)
    const accuracy = Math.max(0, Math.min(100, (1 - Math.sqrt(mse) / targetMean) * 100));

    this.metrics = {
      accuracy: Math.round(accuracy * 100) / 100,
      mse: Math.round(mse * 100) / 100,
      r2Score: Math.round(r2Score * 100) / 100,
      lastTrained: new Date()
    };
  }

  public predictPrice(
    locationIndex: number,
    tier: string,
    lga: string,
    bedrooms: number
  ): number {
    if (!this.regressionModel) {
      return 0;
    }

    const features = [
      locationIndex,
      this.getTierScore(tier),
      this.getLGAScore(lga),
      bedrooms === 0 ? 0.5 : bedrooms,
      1
    ];

    const prediction = this.regressionModel.predict(features);
    return Math.max(0, prediction);
  }

  public getMetrics(): MLModelMetrics {
    return this.metrics;
  }

  public generateRecommendations(
    userBudget: number,
    propertyType: 'rent' | 'house' | 'land',
    preferences: {
      preferredLGAs?: string[];
      minBedrooms?: number;
      maxBedrooms?: number;
    } = {}
  ): RecommendationResult[] {
    // This is a simplified recommendation system
    // In a real implementation, you'd use more sophisticated algorithms
    const recommendations: RecommendationResult[] = [];

    // Generate mock recommendations based on budget and preferences
    const mockProperties = this.generateMockProperties(propertyType);
    
    mockProperties.forEach(property => {
      const score = this.calculateRecommendationScore(property, userBudget, preferences);
      if (score > 30) { // Only include relevant recommendations
        recommendations.push({
          property,
          score,
          reasons: this.generateReasons(property, userBudget, score),
          marketInsights: {
            trend: this.getMarketTrend(property.location),
            appreciation: this.getAppreciationRate(property.tier),
            demand: this.getDemandLevel(property.tier)
          }
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  private generateMockProperties(propertyType: 'rent' | 'house' | 'land'): PropertyPrice[] {
    // This would normally query the database
    // For now, return mock data
    return [];
  }

  private calculateRecommendationScore(
    property: PropertyPrice,
    budget: number,
    preferences: any
  ): number {
    let score = 50; // Base score

    // Budget alignment
    if (budget >= property.priceRange.min && budget <= property.priceRange.max) {
      score += 30;
    } else if (budget >= property.priceRange.average) {
      score += 15;
    }

    // Location preferences
    if (preferences.preferredLGAs?.includes(property.lga)) {
      score += 20;
    }

    // Tier preference (higher tiers get bonus if budget allows)
    if (property.tier === 'premium' && budget > 50000000) score += 10;
    if (property.tier === 'prime' && budget > 20000000) score += 8;

    return Math.min(100, score);
  }

  private generateReasons(property: PropertyPrice, budget: number, score: number): string[] {
    const reasons: string[] = [];

    if (budget >= property.priceRange.min && budget <= property.priceRange.max) {
      reasons.push("Perfect match for your budget");
    } else if (budget > property.priceRange.max) {
      reasons.push("Under budget - great value");
    }

    if (property.tier === 'premium' || property.tier === 'prime') {
      reasons.push("Premium location with high growth potential");
    }

    if (score > 80) {
      reasons.push("Highly recommended based on market analysis");
    }

    return reasons;
  }

  private getMarketTrend(location: string): 'rising' | 'stable' | 'declining' {
    // Simplified trend analysis
    const premiumLocations = ['Maitama', 'Asokoro', 'Wuse1/Wuse2'];
    const emergingLocations = ['Lokogoma', 'Jabi'];
    
    if (premiumLocations.includes(location)) return 'rising';
    if (emergingLocations.includes(location)) return 'rising';
    return 'stable';
  }

  private getAppreciationRate(tier: string): number {
    const rates: { [key: string]: number } = {
      'premium': 12,
      'prime': 10,
      'mid': 8,
      'emerging': 15,
      'outer': 6,
      'rural': 4
    };
    return rates[tier] || 5;
  }

  private getDemandLevel(tier: string): 'high' | 'medium' | 'low' {
    if (tier === 'premium' || tier === 'prime') return 'high';
    if (tier === 'mid' || tier === 'emerging') return 'medium';
    return 'low';
  }
}

// Singleton instance
export const propertyMLModel = new PropertyMLModel();
