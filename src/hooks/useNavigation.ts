"use client"

import { useState, useCallback, useEffect } from 'react';
import { NavigationState } from '@/types';

interface UseNavigationProps {
  totalSections: number;
  stepsPerSection: number[];
  onSectionChange?: (section: number) => void;
  onStepChange?: (section: number, step: number) => void;
}

export function useNavigation({
  totalSections,
  stepsPerSection,
  onSectionChange,
  onStepChange
}: UseNavigationProps) {
  const [state, setState] = useState<NavigationState>({
    currentSection: 0,
    currentStep: 0,
    totalSections,
    isAnimating: false
  });

  const getTotalSteps = useCallback(() => {
    return stepsPerSection.reduce((sum, steps) => sum + steps, 0);
  }, [stepsPerSection]);

  const getCurrentGlobalStep = useCallback(() => {
    let globalStep = 0;
    for (let i = 0; i < state.currentSection; i++) {
      globalStep += stepsPerSection[i];
    }
    return globalStep + state.currentStep;
  }, [state.currentSection, state.currentStep, stepsPerSection]);

  const canGoNext = useCallback(() => {
    if (state.isAnimating) return false;

    const isLastStep = state.currentStep >= stepsPerSection[state.currentSection] - 1;
    const isLastSection = state.currentSection >= totalSections - 1;

    return !(isLastSection && isLastStep);
  }, [state, stepsPerSection, totalSections]);

  const canGoPrev = useCallback(() => {
    if (state.isAnimating) return false;
    return state.currentSection > 0 || state.currentStep > 0;
  }, [state]);

  const goNext = useCallback(() => {
    if (!canGoNext()) return;

    setState(prev => {
      const isLastStep = prev.currentStep >= stepsPerSection[prev.currentSection] - 1;

      if (isLastStep && prev.currentSection < totalSections - 1) {
        // Move to next section
        const newSection = prev.currentSection + 1;
        onSectionChange?.(newSection);
        onStepChange?.(newSection, 0);
        return {
          ...prev,
          currentSection: newSection,
          currentStep: 0
        };
      } else if (!isLastStep) {
        // Move to next step in current section
        const newStep = prev.currentStep + 1;
        onStepChange?.(prev.currentSection, newStep);
        return {
          ...prev,
          currentStep: newStep
        };
      }

      return prev;
    });
  }, [canGoNext, stepsPerSection, totalSections, onSectionChange, onStepChange]);

  const goPrev = useCallback(() => {
    if (!canGoPrev()) return;

    setState(prev => {
      if (prev.currentStep > 0) {
        // Move to previous step in current section
        const newStep = prev.currentStep - 1;
        onStepChange?.(prev.currentSection, newStep);
        return {
          ...prev,
          currentStep: newStep
        };
      } else if (prev.currentSection > 0) {
        // Move to last step of previous section
        const newSection = prev.currentSection - 1;
        const newStep = stepsPerSection[newSection] - 1;
        onSectionChange?.(newSection);
        onStepChange?.(newSection, newStep);
        return {
          ...prev,
          currentSection: newSection,
          currentStep: newStep
        };
      }

      return prev;
    });
  }, [canGoPrev, stepsPerSection, onSectionChange, onStepChange]);

  const goToSection = useCallback((section: number) => {
    if (section < 0 || section >= totalSections || state.isAnimating) return;

    setState(prev => {
      onSectionChange?.(section);
      onStepChange?.(section, 0);
      return {
        ...prev,
        currentSection: section,
        currentStep: 0
      };
    });
  }, [totalSections, state.isAnimating, onSectionChange, onStepChange]);

  const setAnimating = useCallback((isAnimating: boolean) => {
    setState(prev => ({ ...prev, isAnimating }));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  return {
    ...state,
    goNext,
    goPrev,
    goToSection,
    canGoNext,
    canGoPrev,
    setAnimating,
    getTotalSteps,
    getCurrentGlobalStep,
    currentStepsInSection: stepsPerSection[state.currentSection] || 0
  };
}
