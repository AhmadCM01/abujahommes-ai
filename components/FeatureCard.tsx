'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  delay: number;
}

export function FeatureCard({ icon: Icon, title, description, color, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5 }}
      className="group relative"
    >
      <div className="premium-card hover-lift h-full">
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 rounded-2xl transition-all duration-300`} />
        
        {/* Icon */}
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
        
        {/* Hover Effect */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-200 transition-all duration-300" />
      </div>
    </motion.div>
  );
}
