'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, TrendingUp, Home, MapPin, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { abujaPropertyData, lgas, lgaWithSubAreas, propertyTypes, bedroomOptions } from '@/data/propertyData';
import { parsePriceRange, formatPriceRange, calculateInvestmentROI, predictFuturePrice } from '@/utils/priceParser';

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

  const handleCalculate = async () => {
    setIsCalculating(true);
    
    // Simulate calculation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Find matching property data
    const property = abujaPropertyData.find(p => 
      p.location === calculatorData.location || p.lga === calculatorData.lga
    );

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
      } else {
        priceKey = 'land_100x100';
        propertyLabel = '100x100 Land for Sale';
      }

      const priceString = property[priceKey as keyof typeof property] as string;
      const priceRange = parsePriceRange(priceString);

      // Calculate investment metrics for houses and land
      let investmentAnalysis = null;
      if (calculatorData.propertyType !== 'rent') {
        const appreciationRate = calculatorData.propertyType === 'land' ? 0.12 : 0.08;
        const futureValue = predictFuturePrice(priceRange.average, appreciationRate, calculatorData.investmentYears);
        const roi = calculateInvestmentROI(priceRange.average, futureValue);
        
        investmentAnalysis = {
          currentValue: priceRange,
          futureValue: { min: futureValue, max: futureValue * 1.2, average: futureValue, formatted: formatPriceRange({ min: futureValue, max: futureValue * 1.2, average: futureValue, formatted: '' }) },
          roi,
          appreciationRate: appreciationRate * 100
        };
      }

      // Calculate affordability
      const affordability = calculatorData.budget > 0 ? {
        score: Math.min(100, Math.max(0, ((calculatorData.budget - priceRange.min) / (priceRange.max - priceRange.min)) * 100)),
        canAfford: calculatorData.budget >= priceRange.min,
        monthlyPayment: calculatorData.propertyType === 'rent' ? priceRange.average / 12 : null
      } : null;

      setResult({
        property: {
          location: property.location,
          lga: property.lga,
          tier: property.tier,
          type: propertyLabel,
          priceRange
        },
        affordability,
        investment: investmentAnalysis
      });
    }
    
    setIsCalculating(false);
  };

  const getAffordabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">AI Price Calculator</h2>
        <p className="text-white/80">Get instant property price estimates and investment analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="space-y-6">
          <div className="premium-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary-600" />
              Property Details
            </h3>

            <div className="space-y-4">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  value={calculatorData.propertyType}
                  onChange={(e) => setCalculatorData({ ...calculatorData, propertyType: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* LGA */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">LGA</label>
                <select
                  value={calculatorData.lga}
                  onChange={(e) => setCalculatorData({ ...calculatorData, lga: e.target.value, subArea: '', location: '' })}
                  className="bg-soft-cream border border-border-cream text-charcoal rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300"
                >
                  <option value="">Select LGA</option>
                  {lgas.map(lga => (
                    <option key={lga} value={lga}>{lgaWithSubAreas[lga as keyof typeof lgaWithSubAreas]?.name || lga}</option>
                  ))}
                </select>
              </div>

              {/* Sub-Area */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Sub-Area</label>
                <select
                  value={calculatorData.subArea}
                  onChange={(e) => setCalculatorData({ ...calculatorData, subArea: e.target.value, location: '' })}
                  className="bg-soft-cream border border-border-cream text-charcoal rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300"
                  disabled={!calculatorData.lga}
                >
                  <option value="">Select Sub-Area</option>
                  {calculatorData.lga && lgaWithSubAreas[calculatorData.lga as keyof typeof lgaWithSubAreas]?.subAreas.map(subArea => (
                    <option key={subArea} value={subArea}>{subArea}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Specific Location</label>
                <select
                  value={calculatorData.location}
                  onChange={(e) => setCalculatorData({ ...calculatorData, location: e.target.value })}
                  className="bg-soft-cream border border-border-cream text-charcoal rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300"
                  disabled={!calculatorData.lga}
                >
                  <option value="">Select Location</option>
                  {abujaPropertyData
                    .filter(p => p.lga === calculatorData.lga)
                    .map(property => (
                      <option key={property.location} value={property.location}>
                        {property.location}
                      </option>
                    ))}
                </select>
              </div>

              {/* Bedrooms (for rent and house) */}
              {calculatorData.propertyType !== 'land' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <select
                    value={calculatorData.bedrooms}
                    onChange={(e) => setCalculatorData({ ...calculatorData, bedrooms: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {bedroomOptions
                      .filter(b => calculatorData.propertyType === 'rent' || b.value !== 'selfcontain')
                      .map(bedroom => (
                        <option key={bedroom.value} value={bedroom.value}>
                          {bedroom.label}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Budget (₦)</label>
                <input
                  type="number"
                  value={calculatorData.budget || ''}
                  onChange={(e) => setCalculatorData({ ...calculatorData, budget: parseInt(e.target.value) || 0 })}
                  placeholder="Enter your budget"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Investment Years (for house and land) */}
              {calculatorData.propertyType !== 'rent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investment Horizon (Years)</label>
                  <input
                    type="number"
                    value={calculatorData.investmentYears}
                    onChange={(e) => setCalculatorData({ ...calculatorData, investmentYears: parseInt(e.target.value) || 5 })}
                    min="1"
                    max="30"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}

              <Button
                onClick={handleCalculate}
                loading={isCalculating}
                size="lg"
                className="w-full"
                icon={<Calculator className="w-5 h-5" />}
              >
                Calculate Price
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Property Information */}
              <div className="premium-card">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary-600" />
                  Property Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">{result.property.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">LGA</span>
                    <span className="font-medium">{result.property.lga}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type</span>
                    <span className="font-medium">{result.property.type}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price Range</span>
                      <span className="text-xl font-bold text-primary-600">
                        {formatPriceRange(result.property.priceRange)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Affordability Analysis */}
              {result.affordability && (
                <div className="premium-card">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Affordability Analysis
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Affordability Score</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAffordabilityColor(result.affordability.score)}`}>
                        {Math.round(result.affordability.score)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Can Afford</span>
                      <span className={`font-medium ${result.affordability.canAfford ? 'text-green-600' : 'text-red-600'}`}>
                        {result.affordability.canAfford ? 'Yes' : 'No'}
                      </span>
                    </div>

                    {result.affordability.monthlyPayment && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Payment</span>
                        <span className="font-medium">
                          ₦{Math.round(result.affordability.monthlyPayment).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                        <p className="text-sm text-blue-800">
                          {result.affordability.canAfford 
                            ? "Great! This property fits within your budget."
                            : "This property exceeds your budget. Consider increasing your budget or exploring other options."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Investment Analysis */}
              {result.investment && (
                <div className="premium-card">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Investment Analysis ({calculatorData.investmentYears} Years)
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Value</span>
                      <span className="font-medium">{formatPriceRange(result.investment.currentValue)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Projected Value</span>
                      <span className="font-medium text-green-600">{result.investment.futureValue.formatted}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected ROI</span>
                      <span className="font-medium text-green-600">{result.investment.roi.roi}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Appreciation</span>
                      <span className="font-medium">{result.investment.appreciationRate}%</span>
                    </div>

                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                        <p className="text-sm text-green-800">
                          Based on current market trends, this property shows strong investment potential with an expected appreciation rate of {result.investment.appreciationRate}% annually.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {!result && (
            <div className="premium-card text-center py-12">
              <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Calculate</h3>
              <p className="text-gray-600">
                Fill in the property details to get instant price estimates and investment analysis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
