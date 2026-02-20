'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Home, DollarSign, BedDouble, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { abujaPropertyData, lgas, tiers, propertyTypes, bedroomOptions } from '@/data/propertyData';
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const results: PropertyPrice[] = [];
    
    abujaPropertyData.forEach(property => {
      // Check if property matches filters
      if (filters.lga && property.lga !== filters.lga) return;
      if (filters.tier && property.tier !== filters.tier) return;
      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) return;
      
      // Add properties based on type
      if (filters.propertyType === 'all' || filters.propertyType === 'rent') {
        // Add rental properties
        bedroomOptions.forEach(bedroom => {
          if (filters.bedrooms && bedroom.value !== filters.bedrooms) return;
          
          const priceKey = bedroom.value === 'selfcontain' ? 'rent_selfcontain' : `rent_${bedroom.value}bed`;
          const priceString = property[priceKey as keyof typeof property] as string;
          
          if (priceString) {
            const priceRange = parsePriceRange(priceString);
            if (filters.minPrice && priceRange.max < filters.minPrice) return;
            if (filters.maxPrice && priceRange.min > filters.maxPrice) return;
            
            results.push({
              location: property.location,
              lga: property.lga,
              tier: property.tier,
              propertyType: 'rent',
              bedrooms: bedroom.value === 'selfcontain' ? 0 : bedroom.value as number,
              priceRange,
              lastUpdated: new Date()
            });
          }
        });
      }
      
      if (filters.propertyType === 'all' || filters.propertyType === 'house') {
        // Add houses for sale
        bedroomOptions.slice(1).forEach(bedroom => { // Skip selfcontain for houses
          if (filters.bedrooms && bedroom.value !== filters.bedrooms) return;
          
          const priceKey = `house_${bedroom.value}bed`;
          const priceString = property[priceKey as keyof typeof property] as string;
          
          if (priceString) {
            const priceRange = parsePriceRange(priceString);
            if (filters.minPrice && priceRange.max < filters.minPrice) return;
            if (filters.maxPrice && priceRange.min > filters.maxPrice) return;
            
            results.push({
              location: property.location,
              lga: property.lga,
              tier: property.tier,
              propertyType: 'house',
              bedrooms: bedroom.value as number,
              priceRange,
              lastUpdated: new Date()
            });
          }
        });
      }
      
      if (filters.propertyType === 'all' || filters.propertyType === 'land') {
        // Add land
        const landPriceString = property.land_100x100;
        if (landPriceString) {
          const priceRange = parsePriceRange(landPriceString);
          if (filters.minPrice && priceRange.max < filters.minPrice) return;
          if (filters.maxPrice && priceRange.min > filters.maxPrice) return;
          
          results.push({
            location: property.location,
            lga: property.lga,
            tier: property.tier,
            propertyType: 'land',
            priceRange,
            lastUpdated: new Date()
          });
        }
      }
    });
    
    setSearchResults(results);
    setIsSearching(false);
  };

  const getAffordabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Property Search</h2>
        <p className="text-gray-600">Find your perfect property in Abuja with our advanced search filters</p>
      </div>

      {/* Search Filters */}
      <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {propertyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* LGA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LGA</label>
            <select
              value={filters.lga}
              onChange={(e) => setFilters({ ...filters, lga: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All LGAs</option>
              {lgas.map(lga => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>

          {/* Tier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Area Tier</label>
            <select
              value={filters.tier}
              onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Tiers</option>
              {tiers.map(tier => (
                <option key={tier.value} value={tier.value}>{tier.label}</option>
              ))}
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
            <select
              value={filters.bedrooms || ''}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Any</option>
              {bedroomOptions.map(bedroom => (
                <option key={bedroom.value} value={bedroom.value}>{bedroom.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₦)</label>
            <input
              type="number"
              value={filters.minPrice || ''}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="e.g., 1000000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₦)</label>
            <input
              type="number"
              value={filters.maxPrice || ''}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="e.g., 50000000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Location Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location Search</label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            placeholder="Search by location name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSearch}
            loading={isSearching}
            size="lg"
            icon={<Search className="w-5 h-5" />}
          >
            Search Properties
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
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Found {searchResults.length} Properties
            </h3>
            <div className="text-sm text-gray-600">
              Sorted by relevance
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((property, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="premium-card hover-lift"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getPropertyIcon(property.propertyType)}
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {property.propertyType}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tiers.find(t => t.value === property.tier)?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {property.tier}
                  </span>
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {property.location}
                </h4>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {property.lga}
                  </div>
                  {property.bedrooms !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BedDouble className="w-4 h-4" />
                      {property.bedrooms === 0 ? 'Self Contain' : `${property.bedrooms} Bedrooms`}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Price Range</span>
                    <span className="text-lg font-bold text-primary-600">
                      {formatPriceRange(property.priceRange)}
                    </span>
                  </div>
                  
                  {filters.maxPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Affordability</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAffordabilityColor(
                        getAffordabilityScore(filters.maxPrice, property.priceRange)
                      )}`}>
                        {getAffordabilityScore(filters.maxPrice, property.priceRange)}%
                      </span>
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
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
          <p className="text-gray-600">Try adjusting your search filters to find more properties</p>
        </div>
      )}
    </div>
  );
}
