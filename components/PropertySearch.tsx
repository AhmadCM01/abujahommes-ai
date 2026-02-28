'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, MapPin, Search, TrendingUp, AlertTriangle, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PremiumIcon } from '@/components/ui/PremiumIcon';
import { abujaPropertyData, propertyTypes, lgas, tiers, bedroomOptions, mlModelConfig, mlModelFunctions } from '@/data/propertyData';
import { parsePriceRange, formatPriceRange } from '@/utils/priceParser';
import { SearchFilters, PropertyPrice } from '@/types/property';

export function PropertySearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    propertyType: 'all',
    lga: '',
    tier: '',
    bedrooms: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    location: ''
  });

  const [searchResults, setSearchResults] = useState<PropertyPrice[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const results: PropertyPrice[] = [];
      
      console.log('🔍 Starting ML-Enhanced Search with filters:', filters);
      
      // ML-ENHANCED SEARCH: Process each property with comprehensive analysis
      for (const property of abujaPropertyData) {
        // LGA FILTER - Most expensive check, do first
        if (filters.lga && property.lga !== filters.lga) {
          console.log(`❌ Skipping ${property.location} - LGA mismatch (${property.lga} != ${filters.lga})`);
          continue;
        }
        
        // TIER FILTER
        if (filters.tier && property.tier !== filters.tier) {
          console.log(`❌ Skipping ${property.location} - Tier mismatch (${property.tier} != ${filters.tier})`);
          continue;
        }
        
        // LOCATION FILTER - Partial case-insensitive match
        if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
          console.log(`❌ Skipping ${property.location} - Location mismatch`);
          continue;
        }
        
        console.log(`✅ Processing ${property.location} - All filters passed`);
        
        // ML-ENHANCED PROPERTY PROCESSING
        const propertyTypesToProcess = filters.propertyType === 'all' 
          ? ['rent', 'house', 'land'] 
          : [filters.propertyType];
        
        for (const propType of propertyTypesToProcess) {
          let priceKey = '';
          let bedrooms = 0;
          
          if (propType === 'rent') {
            // Process all bedroom types for rentals
            const bedroomOptions = ['selfcontain', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            
            for (const beds of bedroomOptions) {
              if (filters.bedrooms && filters.bedrooms !== Number(beds)) continue;
              
              priceKey = beds === 0 ? 'rent_selfcontain' : `rent_${beds}bed`;
              const priceString = property[priceKey as keyof typeof property] as string;
              
              if (priceString) {
                const priceRange = parsePriceRange(priceString);
                
                // PRICE FILTER
                if (filters.minPrice && priceRange.max < filters.minPrice) continue;
                if (filters.maxPrice && priceRange.min > filters.maxPrice) continue;
                
                // ML-ENHANCED ANALYSIS
                const mlAnalysis = generateMLAnalysis(property, propType, Number(beds), priceRange);
                
                results.push({
                  location: property.location,
                  lga: property.lga,
                  tier: property.tier,
                  propertyType: propType as 'rent',
                  bedrooms: Number(beds),
                  priceRange,
                  lastUpdated: new Date(),
                  aiAnalysis: mlAnalysis.insight,
                  mlScore: mlAnalysis.score,
                  riskLevel: mlAnalysis.riskLevel,
                  investmentPotential: mlAnalysis.investmentPotential,
                  titleStatus: property.title_verified || 'Local_Govt',
                  infrastructureScore: property.infrastructure_score || 50
                });
              }
            }
          } else if (propType === 'house') {
            // Process house sales
            const bedroomOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            
            for (const beds of bedroomOptions) {
              if (filters.bedrooms && filters.bedrooms !== Number(beds)) continue;
              
              priceKey = `house_${beds}bed`;
              const priceString = property[priceKey as keyof typeof property] as string;
              
              if (priceString) {
                const priceRange = parsePriceRange(priceString);
                
                if (filters.minPrice && priceRange.max < filters.minPrice) continue;
                if (filters.maxPrice && priceRange.min > filters.maxPrice) continue;
                
                const mlAnalysis = generateMLAnalysis(property, propType, beds, priceRange);
                
                results.push({
                  location: property.location,
                  lga: property.lga,
                  tier: property.tier,
                  propertyType: propType as 'house',
                  bedrooms: beds,
                  priceRange,
                  lastUpdated: new Date(),
                  aiAnalysis: mlAnalysis.insight,
                  mlScore: mlAnalysis.score,
                  riskLevel: mlAnalysis.riskLevel,
                  investmentPotential: mlAnalysis.investmentPotential,
                  titleStatus: property.title_verified || 'Local_Govt',
                  infrastructureScore: property.infrastructure_score || 50
                });
              }
            }
          } else if (propType === 'land') {
            // Process land sales
            priceKey = 'land_100x100';
            const priceString = property[priceKey as keyof typeof property] as string;
            
            if (priceString) {
              const priceRange = parsePriceRange(priceString);
              
              if (filters.minPrice && priceRange.max < filters.minPrice) continue;
              if (filters.maxPrice && priceRange.min > filters.maxPrice) continue;
              
              const mlAnalysis = generateMLAnalysis(property, propType, 0, priceRange);
              
              results.push({
                location: property.location,
                lga: property.lga,
                tier: property.tier,
                propertyType: propType as 'land',
                priceRange,
                lastUpdated: new Date(),
                aiAnalysis: mlAnalysis.insight,
                mlScore: mlAnalysis.score,
                riskLevel: mlAnalysis.riskLevel,
                  investmentPotential: mlAnalysis.investmentPotential,
                  titleStatus: property.title_verified || 'Local_Govt',
                  infrastructureScore: property.infrastructure_score || 50
                });
            }
          }
        }
      }
      
      // ML-ENHANCED SORTING: Sort by ML score, then by price
      results.sort((a, b) => {
        // Primary sort: ML Score (higher is better)
        if ((b.mlScore || 0) > (a.mlScore || 0)) return 1;
        if ((b.mlScore || 0) < (a.mlScore || 0)) return -1;
        
        // Secondary sort: Average price (lower is better for search)
        const avgA = (a.priceRange.min + a.priceRange.max) / 2;
        const avgB = (b.priceRange.min + b.priceRange.max) / 2;
        return avgA - avgB;
      });
      
      console.log(`🎯 Found ${results.length} ML-enhanced results`);
      setSearchResults(results.slice(0, 50)); // Limit to top 50 results
      
    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // ML-ENHANCED ANALYSIS GENERATOR
  const generateMLAnalysis = (property: any, propertyType: string, bedrooms: number, priceRange: any) => {
    const avgPrice = (priceRange.min + priceRange.max) / 2;
    
    // RISK ASSESSMENT
    const riskScore = mlModelFunctions.assessRisk(property);
    const riskLevel = riskScore < 30 ? 'Low' : riskScore < 60 ? 'Medium' : 'High';
    
    // INVESTMENT POTENTIAL
    let investmentPotential = 'Moderate';
    let score = 50; // Base score
    
    // Title Verification Impact
    if (property.title_verified === 'C_of_O') {
      score += 15;
      investmentPotential = 'High';
    } else if (property.title_verified === 'R_of_O') {
      score += 8;
    }
    
    // Developer Premium Impact
    const devMultiplier = mlModelConfig.investmentRiskFactors.developer_premium[
      property.developer as keyof typeof mlModelConfig.investmentRiskFactors.developer_premium
    ] || 1.0;
    if (devMultiplier > 1.05) {
      score += 10;
    }
    
    // Infrastructure Score Impact
    const infraScore = property.infrastructure_score || 50;
    if (infraScore > 80) {
      score += 15;
      investmentPotential = 'Very High';
    } else if (infraScore > 60) {
      score += 8;
    }
    
    // Market Category Analysis
    if (property.market_category?.includes('Prime') || property.tier === 'premium') {
      score += 12;
    } else if (property.market_category?.includes('Emerging') || property.tier === 'emerging') {
      score += 18; // Emerging areas get higher potential score
      investmentPotential = 'High Growth';
    }
    
    // Yield Analysis for Rentals
    if (propertyType === 'rent' && bedrooms > 0) {
      const annualRent = avgPrice * 12;
      const estimatedPropertyValue = avgPrice * 50; // Rough estimate
      const rentalYield = (annualRent / estimatedPropertyValue) * 100;
      
      if (rentalYield > 6) {
        score += 15;
        investmentPotential = 'Excellent Yield';
      } else if (rentalYield > 4) {
        score += 8;
      }
    }
    
    // Proximity to Metro Impact
    if (property.proximity_to_metro && property.proximity_to_metro <= 3) {
      score += 10;
    }
    
    // Generate Insight
    let insight = '';
    
    if (property.title_verified === 'C_of_O' && property.infrastructure_score > 85) {
      insight = `Premium ${property.tier} area with verified title and excellent infrastructure. ${property.developer} development with strong investment potential.`;
    } else if (property.market_category?.includes('Emerging')) {
      insight = `Hot emerging area with ${property.infrastructure_score}% infrastructure score. High growth potential, especially with ${property.title_verified} title.`;
    } else if (propertyType === 'rent' && avgPrice < 2000000) {
      insight = `Affordable rental option in ${property.tier} area. Good yield potential with ${property.title_verified} title security.`;
    } else {
      insight = `${property.tier} area property with ${riskLevel.toLowerCase()} risk. Infrastructure score: ${property.infrastructure_score}%.`;
    }
    
    return {
      score: Math.min(score, 100),
      insight,
      riskLevel,
      investmentPotential
    };
  };

  const getAffordabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case 'rent': return <Home className="w-5 h-5" />;
      case 'house': return <Home className="w-5 h-5" />;
      case 'land': return <MapPin className="w-5 h-5" />;
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
          <Search className="w-8 h-8 mr-3" />
          ML-Enhanced Property Search
        </h2>
        <p className="text-warm-gray max-w-2xl mx-auto">
          Smart search with AI-powered insights, risk assessment, and investment analysis
        </p>
      </motion.div>

      {/* Search Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <h3 className="text-xl font-semibold text-deep-forest-green mb-6">
          Smart Search Filters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-warm-gray mb-2">Property Type</label>
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent"
            >
              <option value="all">All Types</option>
              {propertyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-2">LGA</label>
            <select
              value={filters.lga}
              onChange={(e) => setFilters({ ...filters, lga: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent"
            >
              <option value="">All LGAs</option>
              {lgas.map(lga => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-2">Market Tier</label>
            <select
              value={filters.tier}
              onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent"
            >
              <option value="">All Tiers</option>
              {tiers.map(tier => (
                <option key={tier.value} value={tier.value}>{tier.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-2">Location</label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="Search area name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-2">Bedrooms</label>
            <select
              value={filters.bedrooms || ''}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent"
            >
              <option value="">Any</option>
              {bedroomOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-2">Min Price (₦)</label>
            <input
              type="number"
              value={filters.minPrice || ''}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="No minimum"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-2">Max Price (₦)</label>
            <input
              type="number"
              value={filters.maxPrice || ''}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="No maximum"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-deep-forest-green/30 border-t-transparent animate-spin rounded-full mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Properties
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Search Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {searchResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-deep-forest-green mb-4">
              Found {searchResults.length} Properties (ML-Sorted)
            </h3>
          </div>
        )}

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    {getPropertyIcon(result.propertyType)}
                    <span className="ml-2 font-semibold text-deep-forest-green capitalize">
                      {result.propertyType}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result.mlScore && result.mlScore > 70 && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-xs font-medium text-yellow-600">Top Pick</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-warm-gray">Location</div>
                    <div className="font-semibold text-charcoal">{result.location}, {result.lga}</div>
                  </div>

                  {result.bedrooms !== undefined && (
                    <div>
                      <div className="text-sm text-warm-gray">Bedrooms</div>
                      <div className="font-semibold text-charcoal">
                        {result.bedrooms === 0 ? 'Self Contain' : `${result.bedrooms} Bedrooms`}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm text-warm-gray">Price Range</div>
                    <div className="font-bold text-deep-forest-green text-lg">
                      {formatPriceRange(result.priceRange)}
                    </div>
                  </div>

                  {/* ML-Enhanced Insights */}
                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-warm-gray">ML Score:</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getAffordabilityColor(result.mlScore || 0)}`}>
                        {result.mlScore || 0}/100
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-warm-gray">Risk Level:</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getRiskColor(result.riskLevel || 'Medium')}`}>
                        {result.riskLevel || 'Medium'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-warm-gray">Investment:</span>
                      <span className="text-xs font-medium text-purple-600">
                        {result.investmentPotential || 'Moderate'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-warm-gray">Title:</span>
                      <span className="text-xs font-medium text-green-600">
                        {result.titleStatus === 'C_of_O' ? 'C of O' : result.titleStatus}
                      </span>
                    </div>
                  </div>

                  {result.aiAnalysis && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start">
                        <TrendingUp className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                        <p className="text-xs text-blue-800 leading-relaxed">
                          {result.aiAnalysis}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : !isSearching && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-lg">
              {filters.location || filters.lga || filters.tier 
                ? 'No properties found matching your criteria. Try adjusting filters.'
                : 'Enter search criteria to find properties with ML-enhanced insights.'
              }
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
