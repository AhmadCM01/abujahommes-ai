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
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <div className="bg-soft-cream border border-border-cream rounded-xl shadow-lg p-6 h-full hover:shadow-xl hover:border-warm-gold transition-all duration-300">
        {/* Icon Container */}
        <div className="mb-6">
          <div className="bg-deep-forest-green rounded-full p-3 inline-flex group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-charcoal mb-3 group-hover:text-deep-forest-green transition-colors duration-300">
          {title}
        </h3>
        <p className="text-warm-gray leading-relaxed">
          {description}
        </p>
        
        {/* Hover Effect */}
        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-warm-gold transition-all duration-300" />
      </div>
    </motion.div>
  );
}
