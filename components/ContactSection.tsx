'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Building, Clock, TrendingUp, Map } from 'lucide-react';
import { Button } from './ui/Button';
import { PremiumIcon } from './ui/PremiumIcon';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here you would normally send the data to your backend
    console.log('Form submitted:', formData);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    setIsSubmitting(false);
    
    // Show success message (you could use a toast notification here)
    alert('Thank you for your message! We will get back to you soon.');
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: ['ahmaduniultra@gmail.com', 'support@abujahommes.ai'],
      action: 'mailto:ahmaduniultra@gmail.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+234 806 585 1654', 'Mon-Fri: 9AM-6PM'],
      action: 'tel:+2348065851654'
    },
    {
      icon: MapPin,
      title: 'Service Area',
      details: ['Abuja, Nigeria', 'All 6 LGAs covered'],
      action: '#'
    }
  ];

  const stats = [
    { icon: Building, value: '500+', label: 'Properties Analyzed' },
    { icon: TrendingUp, value: '95%', label: 'Data Accuracy' },
    { icon: Clock, value: '24/7', label: 'AI Insights Available' },
    { icon: Map, value: '6', label: 'LGAs Covered' },
  ];

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-soft-cream to-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-charcoal mb-6">
            Get In <span className="text-deep-forest-green">Touch</span>
          </h2>
          <p className="text-xl text-warm-gray max-w-3xl mx-auto">
            Have questions about Abuja real estate? Need property insights? 
            Our AI experts are here to help you make informed decisions.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-border-cream p-6 text-center hover:scale-105 hover:border-warm-gold transition-all duration-300"
            >
              <div className="mb-3 flex justify-center">
                <div className="bg-deep-forest-green rounded-full p-3">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-deep-forest-green mb-1">{stat.value}</div>
              <div className="text-sm text-warm-gray">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl border border-border-cream p-8"
          >
            <h3 className="text-2xl font-bold text-charcoal mb-6">Send us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-border-cream rounded-lg focus:ring-2 focus:ring-deep-forest-green focus:border-transparent outline-none transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-border-cream rounded-lg focus:ring-2 focus:ring-deep-forest-green focus:border-transparent outline-none transition-all duration-200"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border-cream rounded-lg focus:ring-2 focus:ring-deep-forest-green focus:border-transparent outline-none transition-all duration-200"
                    placeholder="+234 8XX XXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-border-cream rounded-lg focus:ring-2 focus:ring-deep-forest-green focus:border-transparent outline-none transition-all duration-200"
                  >
                    <option value="">Select a subject</option>
                    <option value="property-search">Property Search</option>
                    <option value="price-estimation">Price Estimation</option>
                    <option value="investment-advice">Investment Advice</option>
                    <option value="market-insights">Market Insights</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-border-cream rounded-lg focus:ring-2 focus:ring-deep-forest-green focus:border-transparent outline-none transition-all duration-200 resize-none"
                  placeholder="Tell us about your property needs or questions..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-deep-forest-green hover:bg-dark-green text-white py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-charcoal mb-6">Contact Information</h3>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.a
                    key={index}
                    href={info.action}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="block bg-white rounded-xl shadow-lg border border-border-cream p-6 hover:border-warm-gold transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-deep-forest-green rounded-lg p-3 mt-1">
                        <info.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-charcoal mb-2">{info.title}</h4>
                        {info.details.map((detail, detailIndex) => (
                          <p key={detailIndex} className="text-warm-gray">{detail}</p>
                        ))}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Why Contact Us */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-deep-forest-green to-dark-green rounded-2xl p-8 text-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <PremiumIcon icon="crown" size={24} className="text-warm-gold" />
                <h3 className="text-2xl font-bold">Why Choose AbujaHommes AI?</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-warm-gold rounded-full mt-2"></div>
                  <span>AI-powered property analysis with comprehensive data coverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-warm-gold rounded-full mt-2"></div>
                  <span>Complete coverage of all Abuja LGAs with market insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-warm-gold rounded-full mt-2"></div>
                  <span>Data-driven market trends and property analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-warm-gold rounded-full mt-2"></div>
                  <span>Comprehensive property search and pricing tools</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
