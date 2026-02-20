'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, MapPin, Home, DollarSign, Star, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { abujaPropertyData, lgas, propertyTypes, bedroomOptions } from '@/data/propertyData';
import { parsePriceRange, formatPriceRange } from '@/utils/priceParser';

export function Recommendations() {
  const [preferences, setPreferences] = useState({
    budget: 0,
    propertyType: 'rent' as 'rent' | 'house' | 'land' | 'all',
    bedrooms: 1,
    preferredLGAs: [] as string[],
    priorities: {
      location: 50,
      price: 50,
      amenities: 50,
      investment: 50
    }
  });

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results: any[] = [];
    
    abujaPropertyData.forEach(property => {
      // Skip if not in preferred LGAs (if any are selected)
      if (preferences.preferredLGAs.length > 0 && !preferences.preferredLGAs.includes(property.lga)) {
        return;
      }
      
      // Generate recommendations based on property type
      if (preferences.propertyType === 'rent' || preferences.propertyType === 'all') {
        bedroomOptions.forEach(bedroom => {
          if (preferences.bedrooms && bedroom.value !== preferences.bedrooms) return;
          
          const priceKey = bedroom.value === 'selfcontain' ? 'rent_selfcontain' : `rent_${bedroom.value}bed`;
          const priceString = property[priceKey as keyof typeof property] as string;
          
          if (priceString) {
            const priceRange = parsePriceRange(priceString);
            const score = calculateRecommendationScore(property, priceRange, 'rent', bedroom.value);
            
            if (score > 40) {
              results.push({
                property: {
                  location: property.location,
                  lga: property.lga,
                  tier: property.tier,
                  propertyType: 'rent',
                  bedrooms: bedroom.value === 'selfcontain' ? 0 : bedroom.value as number,
                  priceRange
                },
                score,
                reasons: generateReasons(property, priceRange, 'rent', score),
                insights: generateInsights(property, 'rent')
              });
            }
          }
        });
      }
      
      if (preferences.propertyType === 'house' || preferences.propertyType === 'all') {
        bedroomOptions.slice(1).forEach(bedroom => {
          if (preferences.bedrooms && bedroom.value !== preferences.bedrooms) return;
          
          const priceKey = `house_${bedroom.value}bed`;
          const priceString = property[priceKey as keyof typeof property] as string;
          
          if (priceString) {
            const priceRange = parsePriceRange(priceString);
            const score = calculateRecommendationScore(property, priceRange, 'house', bedroom.value);
            
            if (score > 40) {
              results.push({
                property: {
                  location: property.location,
                  lga: property.lga,
                  tier: property.tier,
                  propertyType: 'house',
                  bedrooms: bedroom.value as number,
                  priceRange
                },
                score,
                reasons: generateReasons(property, priceRange, 'house', score),
                insights: generateInsights(property, 'house')
              });
            }
          }
        });
      }
    });
    
    // Sort by score and take top recommendations
    results.sort((a, b) => b.score - a.score);
    setRecommendations(results.slice(0, 6));
    setIsGenerating(false);
  };

  const calculateRecommendationScore = (property: any, priceRange: any, type: string, bedrooms: any): number => {
    let score = 50;
    
    // Budget alignment
    if (preferences.budget > 0) {
      if (preferences.budget >= priceRange.min && preferences.budget <= priceRange.max) {
        score += 30;
      } else if (preferences.budget >= priceRange.average) {
        score += 15;
      } else if (preferences.budget < priceRange.min) {
        score -= 20;
      }
    }
    
    // Tier preference
    if (property.tier === 'premium') score += 15;
    else if (property.tier === 'prime') score += 10;
    else if (property.tier === 'emerging') score += 5;
    
    // LGA preference
    if (preferences.preferredLGAs.includes(property.lga)) {
      score += 20;
    }
    
    // Investment potential
    if (type !== 'rent') {
      if (property.tier === 'emerging') score += 10;
      if (property.tier === 'premium') score += 8;
    }
    
    return Math.min(100, Math.max(0, score));
  };

  const generateReasons = (property: any, priceRange: any, type: string, score: number): string[] => {
    const reasons: string[] = [];
    
    if (preferences.budget >= priceRange.min && preferences.budget <= priceRange.max) {
      reasons.push("Perfect match for your budget");
    } else if (preferences.budget > priceRange.max) {
      reasons.push("Under budget - excellent value");
    }
    
    if (property.tier === 'premium') {
      reasons.push("Premium location with high appreciation potential");
    } else if (property.tier === 'emerging') {
      reasons.push("Emerging area with growth opportunities");
    }
    
    if (type !== 'rent') {
      reasons.push("Strong investment potential");
    }
    
    if (score > 80) {
      reasons.push("Highly recommended based on your preferences");
    }
    
    return reasons;
  };

  const generateInsights = (property: any, type: string): string[] => {
    const insights: string[] = [];
    
    if (property.tier === 'premium') {
      insights.push("High demand area with limited supply");
      insights.push("Expected annual appreciation: 8-12%");
    } else if (property.tier === 'emerging') {
      insights.push("Rapid development in progress");
      insights.push("Expected annual appreciation: 12-15%");
    } else if (property.tier === 'mid') {
      insights.push("Stable market with steady growth");
      insights.push("Expected annual appreciation: 5-8%");
    }
    
    if (type === 'rent') {
      insights.push("Strong rental demand in this area");
    }
    
    return insights;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getTierColor = (tier: string) => {
    const colors: { [key: string]: string } = {
      'premium': 'bg-purple-100 text-purple-800',
      'prime': 'bg-blue-100 text-blue-800',
      'mid': 'bg-green-100 text-green-800',
      'emerging': 'bg-yellow-100 text-yellow-800',
      'outer': 'bg-orange-100 text-orange-800',
      'rural': 'bg-gray-100 text-gray-800'
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Recommendations</h2>
        <p className="text-gray-600">Get personalized property recommendations based on your preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preferences Form */}
        <div className="lg:col-span-1">
          <div className="premium-card sticky top-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              Your Preferences
            </h3>

            <div className="space-y-4">
              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₦)</label>
                <input
                  type="number"
                  value={preferences.budget || ''}
                  onChange={(e) => setPreferences({ ...preferences, budget: parseInt(e.target.value) || 0 })}
                  placeholder="Enter your budget"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  value={preferences.propertyType}
                  onChange={(e) => setPreferences({ ...preferences, propertyType: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                <select
                  value={preferences.bedrooms}
                  onChange={(e) => setPreferences({ ...preferences, bedrooms: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  {bedroomOptions.map(bedroom => (
                    <option key={bedroom.value} value={bedroom.value}>{bedroom.label}</option>
                  ))}
                </select>
              </div>

              {/* Preferred LGAs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred LGAs</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {lgas.map(lga => (
                    <label key={lga} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={preferences.preferredLGAs.includes(lga)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPreferences({
                              ...preferences,
                              preferredLGAs: [...preferences.preferredLGAs, lga]
                            });
                          } else {
                            setPreferences({
                              ...preferences,
                              preferredLGAs: preferences.preferredLGAs.filter(l => l !== lga)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm">{lga}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                onClick={generateRecommendations}
                loading={isGenerating}
                size="lg"
                className="w-full"
                icon={<Sparkles className="w-5 h-5" />}
              >
                Generate Recommendations
              </Button>
            </div>
          </div>
        </div>

        {/* Recommendations Results */}
        <div className="lg:col-span-2">
          {recommendations.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Top {recommendations.length} Recommendations
                </h3>
                <div className="text-sm text-gray-600">
                  Powered by AI
                </div>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="premium-card hover-lift"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(rec.score)}`}>
                          {Math.round(rec.score)}% Match
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(rec.property.tier)}`}>
                          {rec.property.tier}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(rec.score / 20) ? 'fill-current' : ''}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {rec.property.location}
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {rec.property.lga}
                          </div>
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            {rec.property.propertyType === 'rent' ? 'For Rent' : 'For Sale'}
                            {rec.property.bedrooms !== undefined && (
                              <> - {rec.property.bedrooms === 0 ? 'Self Contain' : `${rec.property.bedrooms} Bedrooms`}</>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Price Range</div>
                        <div className="text-xl font-bold text-primary-600">
                          {formatPriceRange(rec.property.priceRange)}
                        </div>
                        {preferences.budget > 0 && (
                          <div className="text-sm text-gray-500 mt-1">
                            {preferences.budget >= rec.property.priceRange.min ? 'Within Budget' : 'Over Budget'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reasons */}
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Why this property?</h5>
                      <div className="flex flex-wrap gap-2">
                        {rec.reasons.map((reason: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Insights */}
                    <div className="border-t pt-4">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Market Insights
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {rec.insights.map((insight: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary-500 mt-1">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-4 border-t flex justify-end">
                      <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                        View Details
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="premium-card text-center py-16">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Recommendations Ready</h3>
              <p className="text-gray-600 mb-6">
                Set your preferences and let our AI find the perfect properties for you
              </p>
              <div className="max-w-md mx-auto">
                <div className="bg-blue-50 rounded-lg p-4 text-left">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">How it works:</p>
                      <ul className="space-y-1">
                        <li>• Set your budget and preferences</li>
                        <li>• AI analyzes all available properties</li>
                        <li>• Get personalized recommendations with match scores</li>
                        <li>• Includes market insights and investment analysis</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
