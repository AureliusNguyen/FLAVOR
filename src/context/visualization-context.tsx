"use client"

import React, { createContext, useContext, useState, useCallback } from 'react';

interface VisualizationContextType {
  isBlocked: boolean;
  blockReason: string;
  setBlocked: (blocked: boolean, reason?: string) => void;
  highestVisitedSection: number;
  currentSection: number;
  setCurrentSection: (section: number) => void;
  hasSkippedSections: boolean;
  goToSection: (section: number) => void;
  setGoToSection: (fn: (section: number) => void) => void;
}

const VisualizationContext = createContext<VisualizationContextType | null>(null);

export function VisualizationProvider({ children }: { children: React.ReactNode }) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [highestVisitedSection, setHighestVisitedSection] = useState(0);
  const [currentSection, setCurrentSectionState] = useState(0);
  const [goToSectionFn, setGoToSectionFn] = useState<(section: number) => void>(() => () => {});

  const setBlocked = useCallback((blocked: boolean, reason: string = '') => {
    setIsBlocked(blocked);
    setBlockReason(reason);
  }, []);

  const setCurrentSection = useCallback((section: number) => {
    setCurrentSectionState(section);
    setHighestVisitedSection(prev => Math.max(prev, section));
  }, []);

  const setGoToSection = useCallback((fn: (section: number) => void) => {
    setGoToSectionFn(() => fn);
  }, []);

  const goToSection = useCallback((section: number) => {
    goToSectionFn(section);
  }, [goToSectionFn]);

  // User has skipped if they're viewing a section beyond what they've sequentially reached
  const hasSkippedSections = currentSection > highestVisitedSection;

  return (
    <VisualizationContext.Provider value={{
      isBlocked,
      blockReason,
      setBlocked,
      highestVisitedSection,
      currentSection,
      setCurrentSection,
      hasSkippedSections,
      goToSection,
      setGoToSection
    }}>
      {children}
    </VisualizationContext.Provider>
  );
}

export function useVisualization() {
  const context = useContext(VisualizationContext);
  if (!context) {
    throw new Error('useVisualization must be used within VisualizationProvider');
  }
  return context;
}
