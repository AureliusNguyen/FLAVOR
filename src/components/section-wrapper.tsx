"use client"

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface SectionWrapperProps {
  children: ReactNode;
  isActive: boolean;
  sectionIndex: number;
}

export function SectionWrapper({ children, isActive, sectionIndex }: SectionWrapperProps) {
  return (
    <AnimatePresence mode="sync">
      {isActive && (
        <motion.section
          key={sectionIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
          className="min-h-screen pt-28 pb-32 px-4 absolute inset-0 overflow-y-auto"
        >
          <div className="max-w-6xl mx-auto h-full relative">
            {children}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

interface StepContentProps {
  children: ReactNode;
  isActive: boolean;
  stepIndex: number;
}

export function StepContent({ children, isActive, stepIndex }: StepContentProps) {
  return (
    <AnimatePresence mode="sync">
      {isActive && (
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.25,
            ease: "easeInOut"
          }}
          className="w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
