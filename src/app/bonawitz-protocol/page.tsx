"use client"

import { useEffect } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { NavigationControls } from '@/components/navigation-controls';
import { SectionWrapper } from '@/components/section-wrapper';
import { useVisualization } from '@/context/visualization-context';
import { BonawitzProvider } from '@/context/bonawitz-context';
import { MNISTProvider } from '@/context/mnist-context';

// Bonawitz sections - following the paper's actual protocol flow
import { BonawitzIntroSection } from '@/components/sections/bonawitz/intro-section';
import { BonawitzDataSection } from '@/components/sections/bonawitz/data-section';
import { BonawitzTrainingSection } from '@/components/sections/bonawitz/training-section';
import { BonawitzAdvertiseKeysSection } from '@/components/sections/bonawitz/advertise-keys-section';
import { BonawitzShareKeysSection } from '@/components/sections/bonawitz/share-keys-section';
import { BonawitzMaskedInputSection } from '@/components/sections/bonawitz/masked-input-section';
import { BonawitzUnmaskingSection } from '@/components/sections/bonawitz/unmasking-section';
import { BonawitzResultSection } from '@/components/sections/bonawitz/result-section';

// Section configuration following Bonawitz et al. paper structure
const sections = [
  { id: 'intro', title: 'Intro', steps: 3, component: BonawitzIntroSection },
  { id: 'data', title: 'Data', steps: 4, component: BonawitzDataSection },
  { id: 'training', title: 'Training', steps: 3, component: BonawitzTrainingSection },
  { id: 'advertise', title: 'Round 0', steps: 4, component: BonawitzAdvertiseKeysSection },
  { id: 'share-keys', title: 'Round 1', steps: 3, component: BonawitzShareKeysSection },
  { id: 'masked-input', title: 'Round 2', steps: 3, component: BonawitzMaskedInputSection },
  { id: 'unmasking', title: 'Round 4', steps: 3, component: BonawitzUnmaskingSection },
  { id: 'result', title: 'Result', steps: 2, component: BonawitzResultSection },
];

const sectionTitles = sections.map(s => s.title);
const stepsPerSection = sections.map(s => s.steps);

function BonawitzProtocolContent() {
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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
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

      <div className="relative min-h-screen pb-32">
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

export default function BonawitzProtocolPage() {
  return (
    <MNISTProvider>
      <BonawitzProvider>
        <BonawitzProtocolContent />
      </BonawitzProvider>
    </MNISTProvider>
  );
}
