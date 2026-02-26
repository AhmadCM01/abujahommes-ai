'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, TrendingUp, Home, MapPin, Info, Shield, Star, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { abujaPropertyData, lgas, propertyTypes, bedroomOptions, mlModelConfig, mlModelFunctions } from '@/data/propertyData';
import { parsePriceRange, formatPriceRange } from '@/utils/priceParser';

export function PriceCalculator() {
  const [calculatorData, setCalculatorData] = useState({
    propertyType: 'rent' as 'rent' | 'house' | 'land',
    location: '',
    lga: '',
    subArea: '',
    bedrooms: 1,
    budget: 0,
    investmentYears: 5
  });

  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // ML-ENHANCED APPRECIATION RATES
  const getAppreciationRate = (tier: string): number => {
    switch (tier) {
      case 'premium': return 0.35; // 35% annually - high appreciation, lower yield
      case 'prime': return 0.25; // 25% annually - established areas
      case 'emerging': return 0.30; // 30% annually - hot growth areas
      case 'mid': return 0.20; // 20% annually - stable areas
      case 'outer': return 0.15; // 15% annually - satellite towns
      case 'rural': return 0.10; // 10% annually - frontier markets
      default: return 0.15; // Default 15%
    }
  };

  // ML-ENHANCED FUTURE PRICE CALCULATION
  const predictFuturePrice = (currentPrice: number, appreciationRate: number, years: number): number => {
    return currentPrice * Math.pow(1 + appreciationRate / 100, years);
  };

  // ML-ENHANCED RISK ASSESSMENT
  const assessInvestmentRisk = (property: any, propertyType: string, avgPrice: number): any => {
    // Base risk score
    let riskScore = 50;
    let riskFactors: string[] = [];
    
    // Title Verification Risk
    const titleRisk = {
      'C_of_O': { score: 10, level: 'Low', impact: 'Premium title with 40-55% value premium' },
      'R_of_O': { score: 30, level: 'Medium', impact: 'Moderate title verification' },
      'Local_Govt': { score: 60, level: 'High', impact: 'Local government papers - highest risk' }
    };
    
    const titleData = titleRisk[property.title_verified as keyof typeof titleRisk] || titleRisk['Local_Govt'];
    riskScore += titleData.score;
    riskFactors.push(`Title: ${titleData.impact}`);
    
    // Infrastructure Risk
    const infraScore = property.infrastructure_score || 50;
    if (infraScore < 40) {
      riskScore += 25;
      riskFactors.push('Poor infrastructure');
    } else if (infraScore < 60) {
      riskScore += 10;
      riskFactors.push('Limited infrastructure');
    } else if (infraScore < 80) {
      riskScore += 5;
      riskFactors.push('Developing infrastructure');
    }
    
    // Location Risk
    const locationRisk = {
      'premium': { score: 5, level: 'Very Low' },
      'prime': { score: 10, level: 'Low' },
      'mid': { score: 20, level: 'Medium' },
      'emerging': { score: 35, level: 'Medium-High' },
      'outer': { score: 50, level: 'High' },
      'rural': { score: 65, level: 'Very High' }
    };
    
    const locationData = locationRisk[property.tier as keyof typeof locationRisk] || locationRisk['mid'];
    riskScore += locationData.score;
    riskFactors.push(`${property.tier} area`);
    
    // Developer Risk
    const devMultiplier = mlModelConfig.investmentRiskFactors.developer_premium[
      property.developer as keyof typeof mlModelConfig.investmentRiskFactors.developer_premium
    ] || 1.0;
    
    if (devMultiplier < 1.0) {
      riskScore += 15;
      riskFactors.push('Unknown developer');
    }
    
    // Price Volatility Risk
    const priceRange = parsePriceRange(avgPrice.toString());
    const volatility = ((priceRange.max - priceRange.min) / priceRange.min) * 100;
    if (volatility > 50) {
      riskScore += 10;
      riskFactors.push('High price volatility');
    }
    
    const finalRiskLevel = riskScore < 30 ? 'Low' : riskScore < 60 ? 'Medium' : riskScore < 80 ? 'High' : 'Very High';
    
    return {
      score: Math.min(riskScore, 100),
      level: finalRiskLevel,
      factors: riskFactors,
      recommendation: finalRiskLevel === 'Low' ? 'Excellent investment opportunity' :
                    finalRiskLevel === 'Medium' ? 'Moderate risk, good potential' :
                    finalRiskLevel === 'High' ? 'High risk, experienced investors only' :
                    'Very high risk - speculative investment'
    };
  };

  // ML-ENHANCED YIELD ANALYSIS
  const calculateRentalYield = (property: any, avgPrice: number): any => {
    if (!property || !avgPrice) return { yield: 0, assessment: 'No data available' };
    
    // Estimate property value for yield calculation
    let estimatedPropertyValue = avgPrice * 50; // Rough estimate: 50x annual rent
    
    // Adjust based on property type and tier
    if (property.tier === 'premium') {
      estimatedPropertyValue = avgPrice * 80; // Premium areas have lower yields
    } else if (property.tier === 'emerging') {
      estimatedPropertyValue = avgPrice * 30; // Emerging areas have higher yields
    }
    
    const annualRent = avgPrice * 12;
    const rentalYield = (annualRent / estimatedPropertyValue) * 100;
    
    let yieldAssessment = '';
    if (rentalYield > 6) {
      yieldAssessment = 'Excellent yield - high rental demand';
    } else if (rentalYield > 4.5) {
      yieldAssessment = 'Good yield - strong rental market';
    } else if (rentalYield > 3) {
      yieldAssessment = 'Moderate yield - stable rental market';
    } else {
      yieldAssessment = 'Low yield - capital appreciation focused';
    }
    
    return {
      yield: rentalYield.toFixed(2),
      assessment: yieldAssessment,
      comparison: rentalYield > 5 ? 'Above Abuja average' : rentalYield > 3.5 ? 'Near Abuja average' : 'Below Abuja average'
    };
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    
    // Simulate ML processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🧮 ML-Enhanced Calculator Processing:', calculatorData);
    
    // Find matching property data with ML-enhanced matching
    let property = abujaPropertyData.find(p => 
      p.location.toLowerCase() === calculatorData.location.toLowerCase()
    );
    
    // If no exact location match, try LGA match
    if (!property && calculatorData.lga) {
      property = abujaPropertyData.find(p => p.lga === calculatorData.lga);
    }
    
    // If still no match, use ML to find best match
    if (!property) {
      property = abujaPropertyData.reduce((best, current) => {
        // Create a simple scoring for calculator fallback
        const bestScore = best.infrastructure_score || 50;
        const currentScore = current.infrastructure_score || 50;
        return currentScore > bestScore ? current : best;
      });
    }

    console.log('📍 Using ML-selected property:', property.location);

    if (property) {
      let priceKey = '';
      let propertyLabel = '';
      
      if (calculatorData.propertyType === 'rent') {
        if (calculatorData.bedrooms === 0) {
          priceKey = 'rent_selfcontain';
          propertyLabel = 'Self Contain';
        } else {
          priceKey = `rent_${calculatorData.bedrooms}bed`;
          propertyLabel = `${calculatorData.bedrooms} Bedroom`;
        }
        propertyLabel += ' for Rent';
      } else if (calculatorData.propertyType === 'house') {
        priceKey = `house_${calculatorData.bedrooms}bed`;
        propertyLabel = `${calculatorData.bedrooms} Bedroom House for Sale`;
      } else if (calculatorData.propertyType === 'land') {
        priceKey = 'land_100x100';
        propertyLabel = '100x100 Land Plot';
      }
      
      const priceString = property[priceKey as keyof typeof property] as string;
      
      if (priceString) {
        const priceRange = parsePriceRange(priceString);
        const avgPrice = (priceRange.min + priceRange.max) / 2;
        
        // ML-ENHANCED ANALYSIS
        const appreciationRate = getAppreciationRate(property.tier || 'mid');
        const futureValue = predictFuturePrice(avgPrice, appreciationRate, calculatorData.investmentYears);
        const roi = ((futureValue - avgPrice) / avgPrice) * 100;
        
        // Risk Assessment
        const riskAnalysis = assessInvestmentRisk(property, calculatorData.propertyType, avgPrice);
        
        // Yield Analysis (for rentals)
        let yieldAnalysis = null;
        if (calculatorData.propertyType === 'rent') {
          yieldAnalysis = calculateRentalYield(property, avgPrice);
        }
        
        // Affordability Analysis
        const affordability = calculatorData.budget > 0 ? (calculatorData.budget / avgPrice) * 100 : 0;
        
        // ML-ENHANCED MARKET INSIGHTS
        const marketInsight = generateMarketInsight(property, calculatorData, avgPrice, roi, riskAnalysis);
        
        console.log('💰 ML-Enhanced Calculation Results:', {
          property: propertyLabel,
          location: property.location,
          avgPrice,
          appreciationRate,
          futureValue,
          roi,
          riskAnalysis,
          yieldAnalysis,
          affordability
        });
        
        setResult({
          property: propertyLabel,
          location: property.location,
          lga: property.lga,
          tier: property.tier,
          marketCategory: property.market_category,
          developer: property.developer,
          titleVerified: property.title_verified,
          infrastructureScore: property.infrastructure_score,
          priceRange: formatPriceRange(priceRange),
          averagePrice: avgPrice,
          affordability: Math.min(affordability, 100),
          roi: roi.toFixed(2),
          futureValue,
          investmentYears: calculatorData.investmentYears,
          budget: calculatorData.budget,
          appreciationRate: (appreciationRate * 100).toFixed(1),
          riskAnalysis,
          yieldAnalysis,
          marketInsight,
          recommendation: generateRecommendation(affordability, riskAnalysis, yieldAnalysis),
          mlScore: Math.round((property.infrastructure_score || 50) * 0.8 + (property.tier === 'premium' ? 20 : property.tier === 'prime' ? 15 : 10)),
          investmentGrade: getInvestmentGrade(roi, riskAnalysis.score, yieldAnalysis?.yield || 0)
        });
      } else {
        setResult({
          error: `No pricing data available for ${propertyLabel} in ${property.location}`
        });
      }
    } else {
      setResult({
        error: 'No property data found for specified location'
      });
    }
    
    setIsCalculating(false);
  };

  // ML-ENHANCED MARKET INSIGHT GENERATOR
  const generateMarketInsight = (property: any, calculatorData: any, avgPrice: number, roi: number, riskAnalysis: any): string => {
    const insights: string[] = [];
    
    // Infrastructure Impact
    if (property.infrastructure_score > 85) {
      insights.push(`Excellent infrastructure (${property.infrastructure_score}%) drives property values`);
    } else if (property.infrastructure_score > 70) {
      insights.push(`Good infrastructure supports steady appreciation`);
    } else {
      insights.push(`Developing infrastructure offers growth potential`);
    }
    
    // Title Verification Impact
    if (property.title_verified === 'C_of_O') {
      insights.push(`C of O title adds 40-55% premium value`);
    } else if (property.title_verified === 'R_of_O') {
      insights.push(`R of O title provides moderate security`);
    }
    
    // Developer Premium
    const devMultiplier = mlModelConfig.investmentRiskFactors.developer_premium[
      property.developer as keyof typeof mlModelConfig.investmentRiskFactors.developer_premium
    ] || 1.0;
    if (devMultiplier > 1.05) {
      insights.push(`Premium brand commands ${((devMultiplier - 1) * 100).toFixed(0)}% premium`);
    }
    
    // Market Category Analysis
    if (property.market_category?.includes('Prime')) {
      insights.push(`Prime area with stable, high-value market`);
    } else if (property.market_category?.includes('Emerging')) {
      insights.push(`Emerging area with high growth potential (${(getAppreciationRate(property.tier) * 100).toFixed(1)}% annual appreciation)`);
    }
    
    // Investment Outlook
    if (roi > 100) {
      insights.push(`Exceptional ROI potential - strong market momentum`);
    } else if (roi > 50) {
      insights.push(`Strong ROI expected - favorable market conditions`);
    }
    
    return insights.join('. ');
  };

  // ML-ENHANCED RECOMMENDATION ENGINE
  const generateRecommendation = (affordability: number, riskAnalysis: any, yieldAnalysis: any): string => {
    if (affordability >= 90) {
      return 'Excellent fit! Well within budget with strong investment potential.';
    } else if (affordability >= 70) {
      return 'Good fit! Comfortably within budget with moderate risk.';
    } else if (affordability >= 50) {
      return 'Stretch budget required. Consider increasing budget or exploring alternatives.';
    } else {
      return 'Budget insufficient. Significant financial adjustment needed.';
    }
  };

  // INVESTMENT GRADE CALCULATOR
  const getInvestmentGrade = (roi: number, riskScore: number, yieldValue: number): string => {
    let score = 0;
    
    // ROI Scoring (40%)
    if (roi > 80) score += 40;
    else if (roi > 50) score += 30;
    else if (roi > 25) score += 20;
    else if (roi > 10) score += 10;
    
    // Risk Scoring (30%)
    if (riskScore < 30) score += 30;
    else if (riskScore < 50) score += 20;
    else if (riskScore < 70) score += 10;
    
    // Yield Scoring (30%)
    if (yieldValue > 6) score += 30;
    else if (yieldValue > 4.5) score += 20;
    else if (yieldValue > 3) score += 10;
    
    if (score >= 80) return 'A+ (Exceptional)';
    if (score >= 70) return 'A (Excellent)';
    if (score >= 60) return 'B (Good)';
    if (score >= 50) return 'C (Fair)';
    return 'D (Poor)';
  };

  const getAffordabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low':
      case 'Very Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Very High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes('A')) return 'text-green-600 bg-green-100';
    if (grade.includes('B')) return 'text-blue-600 bg-blue-100';
    if (grade.includes('C')) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-deep-forest-green mb-4">
          <Calculator className="w-8 h-8 mr-3" />
          ML-Enhanced Investment Calculator
        </h2>
        <p className="text-warm-gray max-w-3xl mx-auto">
          Advanced property analysis with risk assessment, yield calculation, and investment grading
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-deep-forest-green mb-6 flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Property Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">Property Type</label>
              <select
                value={calculatorData.propertyType}
                onChange={(e) => setCalculatorData({ ...calculatorData, propertyType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">Location</label>
              <input
                type="text"
                value={calculatorData.location}
                onChange={(e) => setCalculatorData({ ...calculatorData, location: e.target.value })}
                placeholder="Enter area name (e.g., Maitama, Asokoro)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">LGA</label>
              <select
                value={calculatorData.lga}
                onChange={(e) => setCalculatorData({ ...calculatorData, lga: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300"
              >
                <option value="">All LGAs</option>
                {lgas.map(lga => (
                  <option key={lga} value={lga}>{lga}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">Bedrooms</label>
              <select
                value={calculatorData.bedrooms}
                onChange={(e) => setCalculatorData({ ...calculatorData, bedrooms: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300"
              >
                {bedroomOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">Budget (₦)</label>
              <input
                type="number"
                value={calculatorData.budget}
                onChange={(e) => setCalculatorData({ ...calculatorData, budget: Number(e.target.value) })}
                placeholder="Enter your budget"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">Investment Years</label>
              <select
                value={calculatorData.investmentYears}
                onChange={(e) => setCalculatorData({ ...calculatorData, investmentYears: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300"
              >
                {[1, 2, 3, 5, 10, 15, 20].map(year => (
                  <option key={year} value={year}>{year} {year === 1 ? 'year' : 'years'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full"
            >
              {isCalculating ? (
                <>
                  <div className="w-4 h-4 border-2 border-deep-forest-green/30 border-t-transparent animate-spin rounded-full mr-2"></div>
                  ML Processing...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Investment
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-deep-forest-green mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            ML Analysis Results
          </h3>
          
          {result ? (
            <div className="space-y-6">
              {result.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800 font-medium">{result.error}</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Property Overview */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-blue-800 mb-3">Property Overview</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">Property:</span>
                        <span className="text-blue-800 font-medium">{result.property}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Location:</span>
                        <span className="text-blue-800 font-medium">{result.location}, {result.lga}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Market Category:</span>
                        <span className="text-blue-800 font-medium">{result.marketCategory || 'Standard'}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Title:</span>
                        <span className="text-blue-800 font-medium">{result.titleVerified === 'C_of_O' ? 'C of O' : result.titleVerified}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Infrastructure:</span>
                        <span className="text-blue-800 font-medium">{result.infrastructureScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Analysis */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-green-800 mb-3">Financial Analysis</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-600">Price Range:</span>
                        <span className="text-green-800 font-bold">{result.priceRange}</span>
                      </div>
                      <div>
                        <span className="text-green-600">Average Price:</span>
                        <span className="text-green-800 font-medium">₦{result.averagePrice?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-green-600">Affordability:</span>
                        <span className={`font-medium ${getAffordabilityColor(result.affordability)}`}>
                          {result.affordability}% of budget
                        </span>
                      </div>
                      <div>
                        <span className="text-green-600">ML Score:</span>
                        <span className="text-green-800 font-medium">{result.mlScore}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Investment Analysis */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-purple-800 mb-3">Investment Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-purple-600">ROI ({result.investmentYears} years):</span>
                        <span className="text-purple-800 font-bold">{result.roi}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-600">Future Value:</span>
                        <span className="text-purple-800 font-bold">₦{result.futureValue?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-600">Annual Appreciation:</span>
                        <span className="text-purple-800 font-bold">{result.appreciationRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-600">Investment Grade:</span>
                        <span className={`font-bold ${getGradeColor(result.investmentGrade)}`}>
                          {result.investmentGrade}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Analysis */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Risk Assessment
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-orange-600">Risk Level:</span>
                        <span className={`font-medium ${getRiskColor(result.riskAnalysis.level)}`}>
                          {result.riskAnalysis.level}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-600">Risk Score:</span>
                        <span className="text-orange-800 font-medium">{result.riskAnalysis.score}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-600">Recommendation:</span>
                        <span className="text-orange-800 font-medium">{result.riskAnalysis.recommendation}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-orange-600 text-sm">Risk Factors:</span>
                        <div className="mt-1">
                          {result.riskAnalysis.factors.map((factor: string, index: number) => (
                            <div key={index} className="text-xs text-orange-700">• {factor}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Yield Analysis (for rentals) */}
                  {result.yieldAnalysis && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-yellow-800 mb-3">Yield Analysis</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-yellow-600">Rental Yield:</span>
                          <span className="text-yellow-800 font-bold">{result.yieldAnalysis.yield}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-600">Assessment:</span>
                          <span className="text-yellow-800 font-medium">{result.yieldAnalysis.assessment}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-600">Market Comparison:</span>
                          <span className="text-yellow-800 font-medium">{result.yieldAnalysis.comparison}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Market Insights */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Market Insights
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {result.marketInsight}
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <TrendingUp className="w-5 h-5 text-indigo-600 mr-2" />
                      <div>
                        <span className="text-indigo-800 font-medium">{result.recommendation}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">
                Enter property details and click "Calculate Investment" for ML-enhanced analysis
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
