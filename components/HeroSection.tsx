'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumIcon } from '@/components/ui/PremiumIcon';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');

  const features = [
    { icon: 'ai', label: 'AI-Powered', color: 'text-deep-forest-green' },
    { icon: 'diamond', label: 'Premium', color: 'text-warm-gold' },
    { icon: 'trending', label: 'Real-Time', color: 'text-deep-forest-green' },
    { icon: 'crown', label: 'Luxury', color: 'text-warm-gold' },
  ];

  const stats = [
    { icon: 'mansion', value: '12+', label: 'Premium Locations', color: 'text-warm-gold' },
    { icon: 'building', value: '500+', label: 'Properties Analyzed', color: 'text-deep-forest-green' },
    { icon: 'ai', value: '95%', label: 'Accuracy Rate', color: 'text-deep-forest-green' },
    { icon: 'investment', value: '24/7', label: 'Market Insights', color: 'text-warm-gold' },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-soft-cream via-light-cream to-border-cream">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        {/* Decorative element: Large translucent green circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-deep-forest-green opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-border-cream rounded-full px-4 py-2 mb-6"
          >
            <PremiumIcon icon="crown" size={16} className="text-warm-gold" />
            <span className="text-sm font-medium text-charcoal">Premium Real Estate Intelligence</span>
          </motion.div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-deep-forest-green">Abuja</span>
            <span className="text-charcoal">Hommes</span>
            <span className="text-warm-gold"> AI</span>
            <br />
            <span className="text-charcoal text-3xl md:text-4xl lg:text-5xl">Premium Real Estate Intelligence</span>
          </h1>
          <p className="text-xl md:text-2xl text-warm-gray mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience the future of Abuja real estate with AI-powered property analysis, 
            accurate pricing, and personalized recommendations tailored to your needs.
          </p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="bg-white shadow-lg border border-border-cream rounded-xl flex items-center gap-3 px-4 sm:px-6 py-4">
              <PremiumIcon icon="search" size={20} className="text-placeholder-gray flex-shrink-0" />
              <input
                type="text"
                placeholder="Search for properties, locations, or get AI recommendations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-charcoal placeholder:text-placeholder-gray min-w-0"
              />
              <Button variant="primary" className="bg-deep-forest-green hover:bg-dark-green text-white px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex-shrink-0">
                <span className="hidden sm:inline">Get AI Insights</span>
                <span className="sm:hidden">Search</span>
              </Button>
            </div>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-border-cream rounded-full px-4 py-2 hover:border-deep-forest-green transition-all duration-300"
              >
                <PremiumIcon icon={feature.icon} size={16} className={feature.color} />
                <span className="text-sm font-medium text-charcoal">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
              className="bg-soft-cream border border-border-cream rounded-xl shadow-lg p-6 text-center hover:scale-105 hover:border-warm-gold transition-all duration-300"
            >
              <div className="mb-3 flex justify-center">
                <div className="bg-deep-forest-green rounded-full p-3">
                  <PremiumIcon icon={stat.icon} size={24} className="text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-charcoal mb-1">{stat.value}</div>
              <div className="text-sm text-warm-gray">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
