'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Minus, MapPin, Home, DollarSign, Activity, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { abujaPropertyData, lgas, tiers } from '@/data/propertyData';
import { parsePriceRange, formatPriceRange, getMarketTrend } from '@/utils/priceParser';

export function MarketInsights() {
  const [selectedLGA, setSelectedLGA] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [insightType, setInsightType] = useState<'overview' | 'trends' | 'comparison'>('overview');

  const generateMarketData = () => {
    const data: any[] = [];
    
    abujaPropertyData.forEach(property => {
      if (selectedLGA && property.lga !== selectedLGA) return;
      if (selectedTier && property.tier !== selectedTier) return;
      
      // Calculate average prices for different property types
      const rentPrices = [];
      const housePrices = [];
      const landPrices = [];
      
      // Rent prices (1-3 bedrooms)
      for (let i = 1; i <= 3; i++) {
        const priceKey = `rent_${i}bed`;
        const priceString = property[priceKey as keyof typeof property] as string;
        if (priceString) {
          const priceRange = parsePriceRange(priceString);
          rentPrices.push(priceRange.average);
        }
      }
      
      // House prices (2-4 bedrooms)
      for (let i = 2; i <= 4; i++) {
        const priceKey = `house_${i}bed`;
        const priceString = property[priceKey as keyof typeof property] as string;
        if (priceString) {
          const priceRange = parsePriceRange(priceString);
          housePrices.push(priceRange.average);
        }
      }
      
      // Land price
      const landPriceString = property.land_100x100;
      if (landPriceString) {
        const landPriceRange = parsePriceRange(landPriceString);
        landPrices.push(landPriceRange.average);
      }
      
      // Calculate trends (mock data for demonstration)
      const rentTrend = getMarketTrend(rentPrices);
      const houseTrend = getMarketTrend(housePrices);
      const landTrend = getMarketTrend(landPrices);
      
      data.push({
        location: property.location,
        lga: property.lga,
        tier: property.tier,
        avgRent: rentPrices.length > 0 ? rentPrices.reduce((a, b) => a + b, 0) / rentPrices.length : 0,
        avgHouse: housePrices.length > 0 ? housePrices.reduce((a, b) => a + b, 0) / housePrices.length : 0,
        avgLand: landPrices.length > 0 ? landPrices[0] : 0,
        rentTrend,
        houseTrend,
        landTrend,
        demand: property.tier === 'premium' ? 'high' : property.tier === 'emerging' ? 'medium' : 'low',
        supply: property.tier === 'premium' ? 'low' : property.tier === 'emerging' ? 'medium' : 'high'
      });
    });
    
    return data;
  };

  const marketData = generateMarketData();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  const getSupplyColor = (supply: string) => {
    switch (supply) {
      case 'low': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const formatTrend = (trend: any) => {
    return `${trend.changeRate > 0 ? '+' : ''}${trend.changeRate}%`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Market Insights</h2>
        <p className="text-gray-600">Comprehensive analysis of Abuja's real estate market trends</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LGA</label>
            <select
              value={selectedLGA}
              onChange={(e) => setSelectedLGA(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All LGAs</option>
              {lgas.map(lga => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Area Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Tiers</option>
              {tiers.map(tier => (
                <option key={tier.value} value={tier.value}>{tier.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Insight Type</label>
            <div className="flex gap-2">
              <Button
                variant={insightType === 'overview' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setInsightType('overview')}
              >
                Overview
              </Button>
              <Button
                variant={insightType === 'trends' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setInsightType('trends')}
              >
                Trends
              </Button>
              <Button
                variant={insightType === 'comparison' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setInsightType('comparison')}
              >
                Comparison
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      {insightType === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="premium-card text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {marketData.length}
              </div>
              <div className="text-sm text-gray-600">Locations Analyzed</div>
            </div>
            
            <div className="premium-card text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round(marketData.filter(d => d.rentTrend.trend === 'rising').length / marketData.length * 100)}%
              </div>
              <div className="text-sm text-gray-600">Rising Markets</div>
            </div>
            
            <div className="premium-card text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ₦{Math.round(marketData.reduce((acc, d) => acc + d.avgRent, 0) / marketData.length / 1000000)}M
              </div>
              <div className="text-sm text-gray-600">Avg Rent (3BR)</div>
            </div>
            
            <div className="premium-card text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                ₦{Math.round(marketData.reduce((acc, d) => acc + d.avgLand, 0) / marketData.length / 1000000)}M
              </div>
              <div className="text-sm text-gray-600">Avg Land (100x100)</div>
            </div>
          </div>

          {/* Market by Tier */}
          <div className="premium-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Market Analysis by Tier
            </h3>
            
            <div className="space-y-4">
              {tiers.map(tier => {
                const tierData = marketData.filter(d => d.tier === tier.value);
                if (tierData.length === 0) return null;
                
                const avgRent = tierData.reduce((acc, d) => acc + d.avgRent, 0) / tierData.length;
                const avgHouse = tierData.reduce((acc, d) => acc + d.avgHouse, 0) / tierData.length;
                const avgLand = tierData.reduce((acc, d) => acc + d.avgLand, 0) / tierData.length;
                
                return (
                  <div key={tier.value} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tier.color}`}>
                          {tier.label}
                        </span>
                        <span className="text-sm text-gray-600">{tierData.length} locations</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 mb-1">Avg Rent (3BR)</div>
                        <div className="font-semibold">{formatPriceRange({ min: avgRent, max: avgRent, average: avgRent, formatted: '' })}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">Avg House (3BR)</div>
                        <div className="font-semibold">{formatPriceRange({ min: avgHouse, max: avgHouse, average: avgHouse, formatted: '' })}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">Avg Land (100x100)</div>
                        <div className="font-semibold">{formatPriceRange({ min: avgLand, max: avgLand, average: avgLand, formatted: '' })}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Market Trends */}
      {insightType === 'trends' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="premium-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600" />
              Price Trends by Location
            </h3>
            
            <div className="space-y-4">
              {marketData.map((data, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{data.location}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {data.lga}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tiers.find(t => t.value === data.tier)?.color}`}>
                          {data.tier}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Rent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(data.rentTrend.trend)}
                        <span className="text-sm font-medium">{formatTrend(data.rentTrend)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">House</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(data.houseTrend.trend)}
                        <span className="text-sm font-medium">{formatTrend(data.houseTrend)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-600">Land</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(data.landTrend.trend)}
                        <span className="text-sm font-medium">{formatTrend(data.landTrend)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Market Comparison */}
      {insightType === 'comparison' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="premium-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Supply & Demand Analysis
            </h3>
            
            <div className="space-y-4">
              {marketData.map((data, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{data.location}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {data.lga}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandColor(data.demand)}`}>
                        Demand: {data.demand}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSupplyColor(data.supply)}`}>
                        Supply: {data.supply}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        {data.demand === 'high' && data.supply === 'low' && 
                          "High demand with limited supply indicates strong seller's market. Prices likely to increase."}
                        {data.demand === 'high' && data.supply === 'medium' && 
                          "High demand with moderate supply. Competitive market with steady price growth."}
                        {data.demand === 'medium' && data.supply === 'medium' && 
                          "Balanced market with stable prices and good opportunities for both buyers and sellers."}
                        {data.demand === 'low' && data.supply === 'high' && 
                          "Buyer's market with ample inventory. Good opportunities for negotiation."}
                        {((data.demand === 'medium' && data.supply === 'high') || 
                          (data.demand === 'low' && data.supply === 'medium')) && 
                          "Market favors buyers with more options available."}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
