'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, MapPin, TrendingUp, Star, Shield, DollarSign, AlertTriangle, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PremiumIcon } from '@/components/ui/PremiumIcon';
import { abujaPropertyData, propertyTypes, lgas, tiers, bedroomOptions, mlModelConfig, mlModelFunctions } from '@/data/propertyData';
import { parsePriceRange, formatPriceRange } from '@/utils/priceParser';
import { UserPreferences, PropertyRecommendation } from '@/types/property';

export function Recommendations() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    budget: {
      min: 0,
      max: 100000000 // Default 100M
    },
    propertyType: 'rent',
    bedrooms: 3,
    preferredLGAs: [],
    priorities: {
      location: 40,
      price: 30,
      amenities: 20,
      investment: 10
    }
  });

  const [recommendations, setRecommendations] = useState<PropertyRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // ML-ENHANCED RECOMMENDATION ENGINE
  const generateRecommendations = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('🎯 ML-Enhanced Recommendation Engine Starting:', preferences);
    
    try {
      const results: PropertyRecommendation[] = [];
      
      // Process all properties with ML scoring
      for (const property of abujaPropertyData) {
        // LGA FILTER - Only process preferred LGAs if specified
        if (preferences.preferredLGAs.length > 0 && !preferences.preferredLGAs.includes(property.lga)) {
          console.log(`❌ Skipping ${property.location} - Not in preferred LGAs`);
          continue;
        }
        
        console.log(`✅ Processing ${property.location} for ML analysis`);
        
        // Process each property type with comprehensive scoring
        const propertyTypesToProcess = preferences.propertyType === 'all' 
          ? ['rent', 'house', 'land'] 
          : [preferences.propertyType];
        
        for (const propType of propertyTypesToProcess) {
          let bedroomOptions = [1, 2, 3, 4, 5]; // Focus on most popular bedroom counts
          
          if (propType === 'rent') {
            bedroomOptions = [0, 1, 2, 3, 4, 5]; // Include self-contain for rentals
          }
          
          for (const bedrooms of bedroomOptions) {
            let priceKey = '';
            let propertyLabel = '';
            
            if (propType === 'rent') {
              priceKey = bedrooms === 0 ? 'rent_selfcontain' : `rent_${bedrooms}bed`;
              propertyLabel = bedrooms === 0 ? 'Self Contain for Rent' : `${bedrooms} Bedroom for Rent`;
            } else if (propType === 'house') {
              priceKey = `house_${bedrooms}bed`;
              propertyLabel = `${bedrooms} Bedroom House for Sale`;
            } else if (propType === 'land') {
              priceKey = 'land_100x100';
              propertyLabel = '100x100 Land Plot for Sale';
            }
            
            const priceString = property[priceKey as keyof typeof property] as string;
            
            if (priceString) {
              const priceRange = parsePriceRange(priceString);
              const avgPrice = (priceRange.min + priceRange.max) / 2;
              
              // BUDGET MATCH TEST (30% weight)
              let budgetScore = 0;
              if (avgPrice >= preferences.budget.min && avgPrice <= preferences.budget.max) {
                budgetScore = 30;
              } else if (avgPrice <= preferences.budget.max) {
                budgetScore = 20; // Over budget but close
              } else if (avgPrice <= preferences.budget.max * 1.2) {
                budgetScore = 10; // Slightly over budget
              }
              
              // LOCATION PREFERENCE TEST (40% weight)
              let locationScore = 0;
              if (preferences.preferredLGAs.length === 0) {
                locationScore = 20; // No preference - neutral score
              } else if (preferences.preferredLGAs.includes(property.lga)) {
                locationScore = 40; // Preferred LGA
              }
              
              // PRICE PREFERENCE TEST (30% weight)
              let priceScore = 0;
              if (avgPrice <= 5000000) { // Under 5M
                priceScore = 30;
              } else if (avgPrice <= 10000000) { // Under 10M
                priceScore = 20;
              } else if (avgPrice <= 20000000) { // Under 20M
                priceScore = 10;
              }
              
              // AMENITIES/INFRASTRUCTURE TEST (20% weight)
              let amenitiesScore = 0;
              const infraScore = property.infrastructure_score || 50;
              if (infraScore > 80) {
                amenitiesScore = 20;
              } else if (infraScore > 60) {
                amenitiesScore = 15;
              } else if (infraScore > 40) {
                amenitiesScore = 10;
              }
              
              // INVESTMENT POTENTIAL TEST (10% weight)
              let investmentScore = 0;
              
              // Calculate yield for rentals
              if (propType === 'rent') {
                const annualRent = avgPrice * 12;
                const estimatedPropertyValue = avgPrice * 50;
                const rentalYield = (annualRent / estimatedPropertyValue) * 100;
                
                if (rentalYield > 6) {
                  investmentScore = 10; // Excellent yield
                } else if (rentalYield > 4.5) {
                  investmentScore = 7; // Good yield
                } else if (rentalYield > 3) {
                  investmentScore = 5; // Moderate yield
                }
              }
              
              // Appreciation potential
              const appreciationRate = getAppreciationRate(property.tier);
              if (appreciationRate > 0.25) {
                investmentScore += 5; // High appreciation
              } else if (appreciationRate > 0.15) {
                investmentScore += 3; // Moderate appreciation
              }
              
              // Title verification bonus
              if (property.title_verified === 'C_of_O') {
                investmentScore += 5; // Premium title
              }
              
              // Developer premium bonus
              const devMultiplier = mlModelConfig.investmentRiskFactors.developer_premium[
                property.developer as keyof typeof mlModelConfig.investmentRiskFactors.developer_premium
              ] || 1.0;
              if (devMultiplier > 1.05) {
                investmentScore += 3; // Premium developer
              }
              
              // Calculate final ML score
              const finalScore = budgetScore + locationScore + priceScore + amenitiesScore + investmentScore;
              
              // Generate ML-enhanced insights
              const insights = generateMLInsights(property, propType, bedrooms, avgPrice, finalScore);
              
              // Generate pros and cons
              const { pros, cons } = generateProsAndCons(property, propType, avgPrice, finalScore);
              
              results.push({
                location: property.location,
                lga: property.lga,
                tier: property.tier,
                propertyType: propType,
                bedrooms: propType === 'land' ? undefined : bedrooms,
                estimatedPrice: {
                  min: priceRange.min,
                  max: priceRange.max,
                  average: avgPrice,
                  formatted: formatPriceRange(priceRange)
                },
                recommendationScore: finalScore,
                insights: insights,
                pros,
                cons,
                marketFactors: {
                  demand: calculateDemandScore(property),
                  supply: calculateSupplyScore(property),
                  development: calculateDevelopmentScore(property),
                  infrastructure: property.infrastructure_score || 50
                }
              });
            }
          }
        }
      }
      
      // ML-ENHANCED SORTING: Sort by recommendation score, then by investment potential
      results.sort((a, b) => {
        // Primary sort: Recommendation score
        if (b.recommendationScore > a.recommendationScore) return 1;
        if (b.recommendationScore < a.recommendationScore) return -1;
        
        // Secondary sort: Investment potential (higher is better)
        const aInvestment = (a.marketFactors?.demand || 0) + (a.marketFactors?.development || 0);
        const bInvestment = (b.marketFactors?.demand || 0) + (b.marketFactors?.development || 0);
        return bInvestment - aInvestment;
      });
      
      console.log(`🎯 Generated ${results.length} ML-enhanced recommendations`);
      setRecommendations(results.slice(0, 12)); // Top 12 recommendations
      
    } catch (error) {
      console.error('❌ Recommendation generation error:', error);
      setRecommendations([]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function for appreciation rates
  const getAppreciationRate = (tier: string): number => {
    switch (tier) {
      case 'premium': return 0.35;
      case 'prime': return 0.25;
      case 'emerging': return 0.30;
      case 'mid': return 0.20;
      case 'outer': return 0.15;
      case 'rural': return 0.10;
      default: return 0.15;
    }
  };

  // ML-ENHANCED INSIGHTS GENERATOR
  const generateMLInsights = (property: any, propertyType: string, bedrooms: number, avgPrice: number, score: number): string[] => {
    const insights: string[] = [];
    const infraScore = property.infrastructure_score || 50;
    
    // Infrastructure insights
    if (infraScore > 85) {
      insights.push(`Excellent infrastructure (${infraScore}%) supports premium values`);
    } else if (infraScore > 70) {
      insights.push(`Good infrastructure with steady development progress`);
    } else if (infraScore > 50) {
      insights.push(`Moderate infrastructure with ongoing improvements`);
    } else {
      insights.push(`Limited infrastructure - growth potential depends on development`);
    }
    
    // Title verification insights
    if (property.title_verified === 'C_of_O') {
      insights.push(`C of O title provides 40-55% value premium and legal security`);
    } else if (property.title_verified === 'R_of_O') {
      insights.push(`R of O title offers moderate security with lower premium`);
    } else {
      insights.push(`Local government title - higher risk due to verification challenges`);
    }
    
    // Developer insights
    const devMultiplier = mlModelConfig.investmentRiskFactors.developer_premium[
      property.developer as keyof typeof mlModelConfig.investmentRiskFactors.developer_premium
    ] || 1.0;
    if (devMultiplier > 1.1) {
      insights.push(`${property.developer} premium brand commands ${((devMultiplier - 1) * 100).toFixed(0)}% market premium`);
    }
    
    // Market category insights
    if (property.market_category?.includes('Emerging')) {
      insights.push(`Emerging area with ${getAppreciationRate(property.tier) * 100}% annual appreciation potential`);
    } else if (property.market_category?.includes('Prime')) {
      insights.push(`Prime area with stable values and lower volatility`);
    }
    
    // Investment insights
    if (score > 80) {
      insights.push(`Exceptional investment opportunity with strong growth indicators`);
    } else if (score > 60) {
      insights.push(`Strong investment potential with favorable market conditions`);
    } else if (score > 40) {
      insights.push(`Moderate investment opportunity requiring due diligence`);
    } else {
      insights.push(`Speculative investment with higher risk factors`);
    }
    
    return insights;
  };

  // Generate pros and cons based on ML analysis
  const generateProsAndCons = (property: any, propertyType: string, avgPrice: number, score: number): { pros: string[], cons: string[] } => {
    const pros: string[] = [];
    const cons: string[] = [];
    const infraScore = property.infrastructure_score || 50;
    
    // Pros based on positive factors
    if (property.title_verified === 'C_of_O') {
      pros.push('Premium C of O title with legal protection');
    }
    
    if (infraScore > 80) {
      pros.push('Excellent infrastructure and utilities');
    }
    
    if (property.developer && property.developer !== 'Local Developer') {
      pros.push(`Reputable ${property.developer} development`);
    }
    
    if (property.market_category?.includes('Emerging')) {
      pros.push('High growth potential and appreciation');
    }
    
    if (avgPrice < 5000000 && propertyType === 'rent') {
      pros.push('Affordable entry point with good yield potential');
    }
    
    if (property.proximity_to_metro && property.proximity_to_metro <= 5) {
      pros.push('Good connectivity to city center');
    }
    
    // Cons based on risk factors
    if (property.title_verified === 'Local_Govt') {
      cons.push('Local government title with verification challenges');
    }
    
    if (infraScore < 50) {
      cons.push('Limited infrastructure and amenities');
    }
    
    if (property.tier === 'rural' || property.tier === 'outer') {
      cons.push('Longer development timeline and lower liquidity');
    }
    
    if (avgPrice > 50000000) {
      cons.push('High entry price requiring significant capital');
    }
    
    if (property.market_category?.includes('Emerging')) {
      cons.push('Development risks and timeline uncertainties');
    }
    
    return { pros, cons };
  };

  // Market factor calculations
  const calculateDemandScore = (property: any): number => {
    let score = 50; // Base score
    const infraScore = property.infrastructure_score || 50;
    
    if (property.tier === 'premium' || property.tier === 'prime') {
      score += 30; // High demand areas
    } else if (property.tier === 'emerging') {
      score += 25; // Growing demand
    } else if (property.tier === 'mid') {
      score += 15; // Stable demand
    }
    
    // Infrastructure impact on demand
    if (infraScore > 70) {
      score += 20;
    }
    
    // Developer impact on demand
    const devMultiplier = mlModelConfig.investmentRiskFactors.developer_premium[
      property.developer as keyof typeof mlModelConfig.investmentRiskFactors.developer_premium
    ] || 1.0;
    if (devMultiplier > 1.05) {
      score += 10;
    }
    
    return Math.min(score, 100);
  };

  const calculateSupplyScore = (property: any): number => {
    let score = 50; // Base score
    
    if (property.tier === 'rural' || property.tier === 'outer') {
      score += 30; // Lower supply in developing areas
    } else if (property.tier === 'emerging') {
      score += 20; // Increasing supply but still manageable
    } else if (property.tier === 'mid') {
      score += 10; // Moderate supply
    }
    
    // Title verification impact on supply
    if (property.title_verified === 'C_of_O') {
      score -= 10; // Lower supply due to title quality
    }
    
    return Math.min(score, 100);
  };

  const calculateDevelopmentScore = (property: any): number => {
    let score = 50; // Base score
    const infraScore = property.infrastructure_score || 50;
    
    // Infrastructure score impact
    if (infraScore > 80) {
      score += 30;
    } else if (infraScore > 60) {
      score += 20;
    } else if (infraScore > 40) {
      score += 10;
    }
    
    // Market category impact
    if (property.market_category?.includes('Emerging')) {
      score += 25; // High development activity
    } else if (property.market_category?.includes('Prime')) {
      score += 15; // Established development
    }
    
    // Developer impact
    const devMultiplier = mlModelConfig.investmentRiskFactors.developer_premium[
      property.developer as keyof typeof mlModelConfig.investmentRiskFactors.developer_premium
    ] || 1.0;
    if (devMultiplier > 1.05) {
      score += 20; // Premium developer activity
    }
    
    return Math.min(score, 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case 'rent': return <Home className="w-5 h-5" />;
      case 'house': return <MapPin className="w-5 h-5" />;
      case 'land': return <Target className="w-5 h-5" />;
      default: return <Home className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-deep-forest-green mb-4">
          <Star className="w-8 h-8 mr-3" />
          ML-Enhanced Recommendations
        </h2>
        <p className="text-warm-gray max-w-3xl mx-auto">
          AI-powered property recommendations based on your preferences and market analysis
        </p>
      </motion.div>

      {/* Preferences Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <h3 className="text-xl font-semibold text-deep-forest-green mb-6">
          Your Preferences
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-warm-gray mb-2">Property Type</label>
            <select
              value={preferences.propertyType}
              onChange={(e) => setPreferences({ ...preferences, propertyType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green"
            >
              {propertyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-2">Bedrooms</label>
            <select
              value={preferences.bedrooms}
              onChange={(e) => setPreferences({ ...preferences, bedrooms: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green"
            >
              {[1, 2, 3, 4, 5].map(bed => (
                <option key={bed} value={bed}>{bed} {bed === 1 ? 'Bedroom' : 'Bedrooms'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-2">Budget Range</label>
            <div className="space-y-2">
              <input
                type="number"
                value={preferences.budget.min}
                onChange={(e) => setPreferences({ ...preferences, budget: { ...preferences.budget, min: Number(e.target.value) } })}
                placeholder="Minimum budget"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green"
              />
              <input
                type="number"
                value={preferences.budget.max}
                onChange={(e) => setPreferences({ ...preferences, budget: { ...preferences.budget, max: Number(e.target.value) } })}
                placeholder="Maximum budget"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-2">Preferred LGAs</label>
            <select
              multiple
              value={preferences.preferredLGAs}
              onChange={(e) => setPreferences({ ...preferences, preferredLGAs: Array.from(e.target.selectedOptions, (option: any) => option.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green"
              size={4}
            >
              {lgas.map(lga => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-2">Priorities</label>
            <div className="space-y-3">
              <div>
                <label className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.priorities.location}
                    onChange={(e) => setPreferences({ ...preferences, priorities: { ...preferences.priorities, location: Number(e.target.value) } })}
                    className="mr-2"
                  />
                  <span className="text-sm">Location ({preferences.priorities.location}%)</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.priorities.price}
                    onChange={(e) => setPreferences({ ...preferences, priorities: { ...preferences.priorities, price: Number(e.target.value) } })}
                    className="mr-2"
                  />
                  <span className="text-sm">Price ({preferences.priorities.price}%)</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.priorities.amenities}
                    onChange={(e) => setPreferences({ ...preferences, priorities: { ...preferences.priorities, amenities: Number(e.target.value) } })}
                    className="mr-2"
                  />
                  <span className="text-sm">Amenities ({preferences.priorities.amenities}%)</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.priorities.investment}
                    onChange={(e) => setPreferences({ ...preferences, priorities: { ...preferences.priorities, investment: Number(e.target.value) } })}
                    className="mr-2"
                  />
                  <span className="text-sm">Investment ({preferences.priorities.investment}%)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={generateRecommendations}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-deep-forest-green/30 border-t-transparent animate-spin rounded-full mr-2"></div>
                Generating ML Recommendations...
              </>
            ) : (
              <>
                <Star className="w-4 h-4 mr-2" />
                Generate Recommendations
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Recommendations Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-deep-forest-green mb-4">
              Found {recommendations.length} ML-Enhanced Recommendations
            </h3>
          </div>
        )}

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    {getPropertyIcon(rec.propertyType)}
                    <span className="ml-2 font-semibold text-deep-forest-green capitalize">
                      {rec.propertyType}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {rec.recommendationScore > 80 && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-xs font-medium text-yellow-600">Top Match</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-warm-gray">Location</div>
                    <div className="font-semibold text-charcoal">{rec.location}, {rec.lga}</div>
                  </div>

                  {rec.bedrooms !== undefined && (
                    <div>
                      <div className="text-sm text-warm-gray">Bedrooms</div>
                      <div className="font-semibold text-charcoal">
                        {rec.bedrooms === 0 ? 'Self Contain' : `${rec.bedrooms} Bedrooms`}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm text-warm-gray">Price Range</div>
                    <div className="font-bold text-deep-forest-green text-lg">
                      {rec.estimatedPrice.formatted}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-warm-gray">ML Score</div>
                    <div className={`font-semibold ${getScoreColor(rec.recommendationScore)}`}>
                      {rec.recommendationScore}/100
                    </div>
                  </div>
                </div>

                {/* ML-Enhanced Insights */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">AI Insights</h4>
                    <div className="space-y-1">
                      {rec.insights.map((insight: string, idx: number) => (
                        <div key={idx} className="text-xs text-blue-700">• {insight}</div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">Market Factors</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-green-600">Demand:</span>
                        <span className="text-green-800 font-medium">{rec.marketFactors?.demand || 0}/100</span>
                      </div>
                      <div>
                        <span className="text-green-600">Supply:</span>
                        <span className="text-green-800 font-medium">{rec.marketFactors?.supply || 0}/100</span>
                      </div>
                      <div>
                        <span className="text-green-600">Development:</span>
                        <span className="text-green-800 font-medium">{rec.marketFactors?.development || 0}/100</span>
                      </div>
                      <div>
                        <span className="text-green-600">Infrastructure:</span>
                        <span className="text-green-800 font-medium">{rec.marketFactors?.infrastructure || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">Pros & Cons</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-semibold text-yellow-700 mb-1">Pros</h5>
                        <div className="space-y-1">
                          {rec.pros.map((pro: string, idx: number) => (
                            <div key={idx} className="text-xs text-green-700">• {pro}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-yellow-700 mb-1">Cons</h5>
                        <div className="space-y-1">
                          {rec.cons.map((con: string, idx: number) => (
                            <div key={idx} className="text-xs text-red-700">• {con}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : !isGenerating && (
          <div className="text-center py-12">
            <Star className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-lg">
              Set your preferences and click "Generate Recommendations" for ML-enhanced property suggestions
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
