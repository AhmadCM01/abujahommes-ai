'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, MapPin, Home, DollarSign, Sparkles, Calculator, BarChart3, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PropertySearch } from '@/components/PropertySearch';
import { PriceCalculator } from '@/components/PriceCalculator';
import { Recommendations } from '@/components/Recommendations';
import { MarketInsights } from '@/components/MarketInsights';
import { HeroSection } from '@/components/HeroSection';
import { FeatureCard } from '@/components/FeatureCard';

type TabType = 'search' | 'calculator' | 'recommendations' | 'insights';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const tabs = [
    { id: 'search', label: 'Property Search', icon: Search },
    { id: 'calculator', label: 'Price Calculator', icon: Calculator },
    { id: 'recommendations', label: 'AI Recommendations', icon: Sparkles },
    { id: 'insights', label: 'Market Insights', icon: BarChart3 },
  ] as const;

  const features = [
    {
      icon: TrendingUp,
      title: 'AI-Powered Pricing',
      description: 'Get accurate property price predictions using advanced machine learning algorithms',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: MapPin,
      title: 'Location Intelligence',
      description: 'Discover the best neighborhoods based on your preferences and budget',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: Home,
      title: 'Comprehensive Coverage',
      description: 'Complete data for all Abuja LGAs - from premium areas to emerging neighborhoods',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: DollarSign,
      title: 'Investment Analysis',
      description: 'Calculate ROI and predict future property values with confidence',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: Star,
      title: 'Personalized Recommendations',
      description: 'Get tailored property suggestions based on your unique requirements',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Calculator,
      title: 'Instant Calculations',
      description: 'Real-time price estimates and affordability calculations at your fingertips',
      color: 'from-indigo-500 to-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Why Choose <span className="text-gradient">AbujaHommes AI</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of real estate decision-making with our cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Application Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Start Your Property Journey
            </h2>
            <p className="text-lg text-gray-600">
              Use our AI-powered tools to find your perfect property in Abuja
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center mb-8 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {activeTab === 'search' && <PropertySearch />}
            {activeTab === 'calculator' && <PriceCalculator />}
            {activeTab === 'recommendations' && <Recommendations />}
            {activeTab === 'insights' && <MarketInsights />}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '12+', label: 'Locations Covered' },
              { number: '1000+', label: 'Property Listings' },
              { number: '95%', label: 'Prediction Accuracy' },
              { number: '24/7', label: 'AI Assistance' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-white"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
