'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Shield, Star } from 'lucide-react';
import Link from 'next/link';

const features = [
  '24/7 Customer Support',
  'Multi-platform Integration',
  'Customizable Responses',
  'Analytics Dashboard',
  'Basic AI Training',
];

const pricingTiers = [
  {
    name: 'Free Trial',
    price: '$0',
    description: 'Perfect for trying out our AI chatbot',
    duration: '/month',
    features: [
      '1 chatbot',
      '1 month free trial',
      'Basic features',
      'Email support',
    ],
    cta: 'Start Free Trial',
    href: '/auth/signup',
    popular: false,
  },
  {
    name: 'Monthly',
    price: '$100',
    description: 'Flexible monthly subscription',
    duration: '/month',
    features: [
      '1 chatbot',
      'All basic features',
      'Priority support',
      'Advanced analytics',
    ],
    cta: 'Get Started',
    href: '/auth/signup',
    popular: false,
  },
  {
    name: 'Lifetime',
    price: '$1000',
    description: 'One-time payment, lifetime access',
    duration: '/lifetime',
    features: [
      '1 chatbot',
      'All premium features',
      'Lifetime updates',
      'Priority support',
    ],
    cta: 'Get Lifetime Access',
    href: '/auth/signup',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large-scale deployments',
    duration: '',
    features: [
      'Unlimited chatbots',
      'Custom AI training',
      'Dedicated support',
      'API access',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
  },
];

export default function PricingPage() {
  const [isHovered, setIsHovered] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl mb-4"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Choose the perfect plan for your business. All plans include our core features.
          </motion.p>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Shield className="w-5 h-5 text-green-500" />
            <span>Secure & Reliable</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>4.9/5 Customer Rating</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Zap className="w-5 h-5 text-blue-500" />
            <span>99.9% Uptime</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col justify-between rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 ${
                tier.popular ? 'ring-2 ring-blue-500' : ''
              }`}
              onMouseEnter={() => setIsHovered(index)}
              onMouseLeave={() => setIsHovered(null)}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-center justify-center gap-1 mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {tier.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {tier.duration}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 h-12 flex items-center justify-center">
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="flex-1">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors ${
                  tier.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I switch plans later?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Is there a setup fee?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                No, there are no setup fees for any of our plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 