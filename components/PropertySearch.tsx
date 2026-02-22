'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PremiumIcon } from '@/components/ui/PremiumIcon';
import { abujaPropertyData, propertyTypes, lgas, tiers, bedroomOptions } from '@/data/propertyData';
import { parsePriceRange, formatPriceRange, getAffordabilityScore } from '@/utils/priceParser';
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
    
    // Simulate API call with delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const results: PropertyPrice[] = [];
      
      console.log('🔍 Starting search with filters:', filters);
      
      // EFFICIENT SEARCH: Direct iteration with early returns for performance
      for (const property of abujaPropertyData) {
        // LGA FILTER - Most expensive check, do first
        if (filters.lga && property.lga !== filters.lga) {
          console.log(`❌ Skipping ${property.location} - LGA mismatch (${property.lga} != ${filters.lga})`);
          continue; // Skip this property immediately
        }
        
        console.log(`✅ Including ${property.location} - LGA match (${property.lga})`);
        
        // TIER FILTER
        if (filters.tier && property.tier !== filters.tier) {
          continue;
        }
        
        // LOCATION FILTER - Case-insensitive partial match (only if location is specified)
        if (filters.location && filters.location.trim() !== '') {
          const searchLower = filters.location.toLowerCase().trim();
          const locationMatch = property.location.toLowerCase().includes(searchLower);
          if (!locationMatch) {
            continue;
          }
        }
        
        // PROCESS RENTAL PROPERTIES
        if (filters.propertyType === 'all' || filters.propertyType === 'rent') {
          for (const bedroom of bedroomOptions) {
            // Skip if bedroom filter is set and doesn't match
            if (filters.bedrooms && bedroom.value !== filters.bedrooms) {
              continue;
            }
            
            const priceKey = bedroom.value === 'selfcontain' ? 'rent_selfcontain' : `rent_${bedroom.value}bed`;
            const priceString = property[priceKey as keyof typeof property] as string;
            
            if (priceString) {
              const priceRange = parsePriceRange(priceString);
              
              // PRICE FILTER - Apply at individual property level
              if (filters.maxPrice && priceRange.min > filters.maxPrice) {
                continue;
              }
              
              results.push({
                location: property.location,
                lga: property.lga,
                tier: property.tier,
                propertyType: 'rent',
                bedrooms: bedroom.value === 'selfcontain' ? 0 : bedroom.value as number,
                priceRange,
                lastUpdated: new Date(),
                aiAnalysis: generateAIAnalysis(property, 'rent', property.tier)
              });
            }
          }
        }
        
        // PROCESS HOUSES FOR SALE
        if (filters.propertyType === 'all' || filters.propertyType === 'house') {
          for (const bedroom of bedroomOptions.slice(1)) { // Skip selfcontain for houses
            // Skip if bedroom filter is set and doesn't match
            if (filters.bedrooms && bedroom.value !== filters.bedrooms) {
              continue;
            }
            
            const priceKey = `house_${bedroom.value}bed`;
            const priceString = property[priceKey as keyof typeof property] as string;
            
            if (priceString) {
              const priceRange = parsePriceRange(priceString);
              
              // PRICE FILTER
              if (filters.maxPrice && priceRange.min > filters.maxPrice) {
                continue;
              }
              
              results.push({
                location: property.location,
                lga: property.lga,
                tier: property.tier,
                propertyType: 'house',
                bedrooms: bedroom.value as number,
                priceRange,
                lastUpdated: new Date(),
                aiAnalysis: generateAIAnalysis(property, 'house', property.tier)
              });
            }
          }
        }
        
        // PROCESS LAND
        if (filters.propertyType === 'all' || filters.propertyType === 'land') {
          const landPriceString = property.land_100x100;
          if (landPriceString) {
            const priceRange = parsePriceRange(landPriceString);
            
            // PRICE FILTER
            if (filters.maxPrice && priceRange.min > filters.maxPrice) {
              continue;
            }
            
            results.push({
              location: property.location,
              lga: property.lga,
              tier: property.tier,
              propertyType: 'land',
              priceRange,
              lastUpdated: new Date(),
              aiAnalysis: generateAIAnalysis(property, 'land', property.tier)
            });
          }
        }
      }
      
      console.log(`✅ Search completed: ${results.length} properties found`);
      setSearchResults(results);
      
    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // AI Analysis Generator
  const generateAIAnalysis = (property: any, propertyType: string, tier: string) => {
    const analyses = {
      'emerging': {
        'land': `${property.location} is an emerging area with high growth potential. Buying land now could bring you approximately 3x ROI in 3 years as development accelerates.`,
        'house': `${property.location} shows strong residential growth. House purchases here typically appreciate 40-60% over 3 years due to infrastructure development.`,
        'rent': `${property.location} has increasing rental demand. Rental yields are projected to grow 15-20% annually as the area develops.`
      },
      'prime': {
        'land': `${property.location} is a prime location with established infrastructure. Land values here appreciate steadily at 15-20% annually with lower risk.`,
        'house': `${property.location} offers premium living with stable appreciation. Houses here typically appreciate 25-35% over 3 years with high rental demand.`,
        'rent': `${property.location} commands premium rental rates. Properties here maintain 95%+ occupancy with annual rental growth of 8-12%.`
      },
      'premium': {
        'land': `${property.location} is a premium investment hotspot. Land values here appreciate 25-30% annually with exceptional long-term returns.`,
        'house': `${property.location} represents luxury real estate. Properties here appreciate 35-50% over 3 years with elite tenant profiles.`,
        'rent': `${property.location} offers luxury rental opportunities. Premium properties here achieve 10-15% annual rental growth with high-net-worth tenants.`
      },
      'mid': {
        'land': `${property.location} offers balanced growth potential. Land investments here typically return 2x in 3 years with moderate risk.`,
        'house': `${property.location} provides good value appreciation. Houses here appreciate 20-30% over 3 years with steady rental demand.`,
        'rent': `${property.location} has stable rental market. Properties here achieve 8-10% annual rental growth with good occupancy rates.`
      },
      'outer': {
        'land': `${property.location} is an outer developing area. Land purchases now could yield 4x returns in 4-5 years as urban expansion reaches this zone.`,
        'house': `${property.location} offers affordable entry with future growth. Houses here appreciate 15-25% over 3 years as infrastructure improves.`,
        'rent': `${property.location} provides affordable rental options. Rental demand is growing at 12-15% annually as more people seek affordable housing.`
      },
      'rural': {
        'land': `${property.location} is rural with agricultural potential. Land investments here offer steady 10-15% annual returns with development potential.`,
        'house': `${property.location} provides rural living benefits. Houses here appreciate 10-15% over 3 years with lower entry costs.`,
        'rent': `${property.location} offers affordable rural rentals. Rental demand is stable with 5-8% annual growth.`
      }
    };
    
    return analyses[tier as keyof typeof analyses]?.[propertyType as keyof typeof analyses['emerging']] || 
           `${property.location} shows good investment potential based on current market trends and development patterns.`;
  };

  const getAffordabilityColor = (score: number) => {
    if (score >= 80) return 'text-emerald bg-emerald-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case 'rent': return <PremiumIcon icon="building" size={20} className="text-deep-forest-green" />;
      case 'house': return <PremiumIcon icon="mansion" size={20} className="text-warm-gold" />;
      case 'land': return <PremiumIcon icon="map" size={20} className="text-deep-forest-green" />;
      default: return <PremiumIcon icon="building" size={20} className="text-warm-gray" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'bg-warm-gold/20 text-warm-gold';
      case 'prime': return 'bg-deep-forest-green/20 text-deep-forest-green';
      case 'mid': return 'bg-deep-forest-green/20 text-deep-forest-green';
      case 'emerging': return 'bg-warm-gold/20 text-warm-gold';
      case 'outer': return 'bg-warm-gold/20 text-warm-gold';
      case 'rural': return 'bg-warm-gray/20 text-warm-gray';
      default: return 'bg-border-cream/20 text-warm-gray';
    }
  };

  const renderAffordabilityStars = (score: number) => {
    const stars = Math.round(score / 20);
    return Array.from({ length: 5 }, (_, i) => (
      <PremiumIcon
        key={i}
        icon={i < stars ? 'diamond' : 'crown'}
        size={12} 
        className={i < stars ? 'text-warm-gold' : 'text-warm-gray'} 
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Property Search</h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          Find your perfect property with our advanced search filters. Explore all available options across Abuja's premium locations.
        </p>
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Property Type</label>
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value as 'rent' | 'house' | 'land' | 'all' })}
              className="bg-soft-cream border border-border-cream text-charcoal rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300"
            >
              <option value="all">All Types</option>
              {propertyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">LGA</label>
            <select
              value={filters.lga}
              onChange={(e) => setFilters({ ...filters, lga: e.target.value })}
              className="bg-soft-cream border border-border-cream text-charcoal rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300"
            >
              <option value="">All LGAs</option>
              {lgas.map(lga => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Area Tier</label>
            <select
              value={filters.tier}
              onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
              className="bg-soft-cream border border-border-cream text-charcoal rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300"
            >
              <option value="">All Tiers</option>
              {tiers.map(tier => (
                <option key={tier.value} value={tier.value}>{tier.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Bedrooms</label>
            <select
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value ? parseInt(e.target.value) : undefined })}
              className="bg-soft-cream border border-border-cream text-charcoal rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300"
            >
              <option value="">Any</option>
              {bedroomOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Max Price</label>
            <select
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full bg-soft-cream border border-border-cream text-charcoal rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300"
            >
              <option value="">No Limit</option>
              <option value="500000">₦500,000</option>
              <option value="1000000">₦1,000,000</option>
              <option value="2000000">₦2,000,000</option>
              <option value="5000000">₦5,000,000</option>
              <option value="10000000">₦10,000,000</option>
              <option value="50000000">₦50,000,000</option>
              <option value="100000000">₦100,000,000</option>
              <option value="500000000">₦500,000,000</option>
              <option value="1000000000">₦1,000,000,000</option>
              <option value="5000000000">₦5,000,000,000 (5 Billion)</option>
            </select>
          </div>
        </div>

        {/* Location Search */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Location Search</label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            placeholder="Search by location name..."
            className="bg-soft-cream border border-border-cream text-charcoal placeholder:text-placeholder-gray rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-deep-forest-green focus:border-transparent transition-all duration-300 w-full"
          />
        </div>

        <div className="flex justify-center mt-6">
          <Button 
            variant="primary" 
            onClick={handleSearch}
            className="bg-warm-gold hover:bg-darker-gold text-charcoal px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search Properties'}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Search Results ({searchResults.length})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getPropertyIcon(result.propertyType)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(result.tier)}`}>
                      {result.tier}
                    </span>
                  </div>
                  <span className="text-warm-gray">{result.bedrooms || 'Any'}</span>
                </div>
                
                <h4 className="font-semibold text-charcoal mb-2">{result.location}</h4>
                <p className="text-warm-gray text-sm mb-4">{result.lga}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-warm-gray text-sm">Price Range:</span>
                    <span className="text-charcoal font-medium">{formatPriceRange(result.priceRange)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-warm-gray text-sm">Affordability:</span>
                    <div className="flex items-center gap-1">
                      {renderAffordabilityStars(getAffordabilityScore(1000000, result.priceRange))}
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {result.aiAnalysis && (
                    <div className="mt-3 p-3 bg-soft-cream rounded-lg border border-border-cream">
                      <div className="flex items-start gap-2">
                        <PremiumIcon icon="sparkles" size={16} className="text-warm-gold flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-charcoal leading-relaxed">{result.aiAnalysis}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {searchResults.length === 0 && !isSearching && (
        <div className="text-center py-12">
          <div className="text-placeholder-gray mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Properties Found</h3>
          <p className="text-white/80">Try adjusting your search filters to find more properties</p>
        </div>
      )}
    </div>
  );
}
