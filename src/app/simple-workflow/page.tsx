"use client"

import { useEffect } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { NavigationControls } from '@/components/navigation-controls';
import { SectionWrapper } from '@/components/section-wrapper';
import { useVisualization } from '@/context/visualization-context';

// Sections
import { HeroSection } from '@/components/sections/simplified-workflow/hero-section';
import { DataDistributionSection } from '@/components/sections/simplified-workflow/data-distribution-section';
import { LocalTrainingSection } from '@/components/sections/simplified-workflow/local-training-section';
import { ShamirSection } from '@/components/sections/simplified-workflow/shamir-section';
import { SecureAggregationSection } from '@/components/sections/simplified-workflow/secure-aggregation-section';
import { FedAvgSection } from '@/components/sections/simplified-workflow/fedavg-section';
import { GlobalModelSection } from '@/components/sections/simplified-workflow/global-model-section';
import { ConvergenceSection } from '@/components/sections/simplified-workflow/convergence-section';
import { SummarySection } from '@/components/sections/simplified-workflow/summary-section';

// Section configuration
const sections = [
  { id: 'hero', title: 'Intro', steps: 3, component: HeroSection },
  { id: 'data', title: 'Data', steps: 4, component: DataDistributionSection },
  { id: 'training', title: 'Training', steps: 4, component: LocalTrainingSection },
  { id: 'shamir', title: 'Shamir SSS', steps: 7, component: ShamirSection },
  { id: 'aggregation', title: 'Aggregation', steps: 4, component: SecureAggregationSection },
  { id: 'fedavg', title: 'FedAvg', steps: 4, component: FedAvgSection },
  { id: 'global', title: 'Global Model', steps: 3, component: GlobalModelSection },
  { id: 'convergence', title: 'Convergence', steps: 4, component: ConvergenceSection },
  { id: 'summary', title: 'Summary', steps: 4, component: SummarySection },
];

const sectionTitles = sections.map(s => s.title);
const stepsPerSection = sections.map(s => s.steps);

export default function Home() {
  const { setCurrentSection, setGoToSection } = useVisualization();

  const navigation = useNavigation({
    totalSections: sections.length,
    stepsPerSection,
  });

  // Sync current section with visualization context
  useEffect(() => {
    setCurrentSection(navigation.currentSection);
  }, [navigation.currentSection, setCurrentSection]);

  // Register goToSection function in context
  useEffect(() => {
    setGoToSection(navigation.goToSection);
  }, [navigation.goToSection, setGoToSection]);

  const globalProgress = (navigation.getCurrentGlobalStep() / (navigation.getTotalSteps() - 1)) * 100;

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <NavigationControls
        currentSection={navigation.currentSection}
        currentStep={navigation.currentStep}
        totalSections={navigation.totalSections}
        currentStepsInSection={navigation.currentStepsInSection}
        globalProgress={globalProgress}
        sectionTitles={sectionTitles}
        onNext={navigation.goNext}
        onPrev={navigation.goPrev}
        canGoNext={navigation.canGoNext()}
        canGoPrev={navigation.canGoPrev()}
        onSectionClick={navigation.goToSection}
      />

      <div className="relative min-h-screen">
        {sections.map((section, index) => (
          <SectionWrapper
            key={section.id}
            isActive={navigation.currentSection === index}
            sectionIndex={index}
          >
            <section.component currentStep={navigation.currentStep} />
          </SectionWrapper>
        ))}
      </div>
    </main>
  );
}
