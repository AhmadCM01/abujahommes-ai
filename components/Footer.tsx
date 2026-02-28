'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, Github, Crown, Building, Home, TrendingUp } from 'lucide-react';
import { PremiumIcon } from './ui/PremiumIcon';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Property Search', href: '#property-tools' },
    { name: 'Price Calculator', href: '#property-tools' },
    { name: 'AI Recommendations', href: '#property-tools' },
    { name: 'Market Insights', href: '#property-tools' },
  ];

  const services = [
    { icon: Building, name: 'Property Analysis', description: 'AI-powered property valuation' },
    { icon: TrendingUp, name: 'Market Intelligence', description: 'Real-time market trends' },
    { icon: Home, name: 'Investment Insights', description: 'ROI calculations and forecasts' },
    { icon: Crown, name: 'Premium Reports', description: 'Detailed property analysis' },
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com/AhmadCM01/abujahommes-ai', label: 'GitHub' },
  ];

  return (
    <footer id="contact" className="bg-gradient-to-br from-deep-forest-green via-dark-green to-charcoal text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="bg-warm-gold rounded-lg p-2">
                <PremiumIcon icon="mansion" size={20} className="text-deep-forest-green" />
              </div>
              <span className="text-xl font-bold">
                Abuja<span className="text-warm-gold">Hommes</span> AI
              </span>
            </div>
            <p className="text-warm-gray/80 leading-relaxed">
              Premium AI-powered real estate intelligence platform for Abuja's property market. 
              Making property decisions data-driven and transparent.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-2 hover:bg-warm-gold/20 transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-warm-gold" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-warm-gold">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-warm-gray/80 hover:text-warm-gold transition-colors duration-200 flex items-center gap-2"
                  >
                    <div className="w-1 h-1 bg-warm-gold rounded-full"></div>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-warm-gold">Our Services</h3>
            <div className="space-y-3">
              {services.map((service, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-warm-gold/20 rounded-lg p-2 mt-0.5">
                    <service.icon className="w-4 h-4 text-warm-gold" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{service.name}</h4>
                    <p className="text-sm text-warm-gray/70">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-warm-gold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-warm-gold/20 rounded-lg p-2">
                  <Mail className="w-4 h-4 text-warm-gold" />
                </div>
                <div>
                  <p className="text-sm text-warm-gray/70">Email</p>
                  <a href="mailto:ahmaduniultra@gmail.com" className="text-white hover:text-warm-gold transition-colors duration-200">
                    ahmaduniultra@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-warm-gold/20 rounded-lg p-2">
                  <Phone className="w-4 h-4 text-warm-gold" />
                </div>
                <div>
                  <p className="text-sm text-warm-gray/70">Phone</p>
                  <a href="tel:+2348065851654" className="text-white hover:text-warm-gold transition-colors duration-200">
                    +234 806 585 1654
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-warm-gold/20 rounded-lg p-2">
                  <MapPin className="w-4 h-4 text-warm-gold" />
                </div>
                <div>
                  <p className="text-sm text-warm-gray/70">Service Area</p>
                  <p className="text-white">Abuja, Nigeria (All 6 LGAs)</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-warm-gray/70 text-sm"
            >
              © {currentYear} AbujaHommes AI. All rights reserved. Making Abuja real estate transparent and data-driven.
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex gap-6 text-sm"
            >
              <a href="#" className="text-warm-gray/70 hover:text-warm-gold transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-warm-gray/70 hover:text-warm-gold transition-colors duration-200">
                Terms of Service
              </a>
              <a href="https://github.com/AhmadCM01/abujahommes-ai" className="text-warm-gray/70 hover:text-warm-gold transition-colors duration-200 flex items-center gap-1">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
