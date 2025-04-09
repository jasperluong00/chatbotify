'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Head from 'next/head';

interface ScheduleDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    Calendly: any;
  }
}

export default function ScheduleDemoModal({ isOpen, onClose }: ScheduleDemoModalProps) {
  useEffect(() => {
    // Load Calendly CSS
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isOpen && window.Calendly) {
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/luong-jasper-alumni/30min',
        parentElement: document.getElementById('calendly-container'),
        prefill: {},
        utm: {}
      });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl"
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Schedule a Demo</h2>
                <p className="mt-2 text-gray-600">
                  Book a time to see our AI-powered chatbot platform in action
                </p>
              </div>

              <div id="calendly-container" className="min-h-[630px] w-full" />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
} 