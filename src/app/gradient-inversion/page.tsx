"use client";

import { useEffect } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { NavigationControls } from "@/components/navigation-controls";
import { SectionWrapper } from "@/components/section-wrapper";
import { useVisualization } from "@/context/visualization-context";
import { GradientInversionProvider } from "@/context/gradient-inversion-context";
import { MNISTProvider } from "@/context/mnist-context";

// Gradient Inversion sections
import { GradientInversionIntroSection } from "@/components/sections/gradient-inversion/intro-section";
// import { ThreatModelSection } from "@/components/sections/gradient-inversion/threat-model-section";
// import { AlgorithmSection } from "@/components/sections/gradient-inversion/algorithm-section";
// import { ModelSetupSection } from "@/components/sections/gradient-inversion/model-setup-section";
// import { AttackDemoSection } from "@/components/sections/gradient-inversion/attack-demo-section";
// import { BatchAttackSection } from "@/components/sections/gradient-inversion/batch-attack-section";
// import { DefenseSection } from "@/components/sections/gradient-inversion/defense-section";
// import { BonawitzDefenseSection } from "@/components/sections/gradient-inversion/bonawitz-defense-section";
// import { ConclusionSection } from "@/components/sections/gradient-inversion/conclusion-section";

// Section configuration following paper structure
const sections = [
  { id: "intro", title: "Intro", steps: 3, component: GradientInversionIntroSection },
  { id: "threat-model", title: "Threat Model", steps: 4, component: ThreatModelSection },
  { id: "algorithm", title: "Algorithm", steps: 4, component: AlgorithmSection },
  { id: "model-setup", title: "Model Setup", steps: 3, component: ModelSetupSection },
  { id: "attack-demo", title: "Attack Demo", steps: 4, component: AttackDemoSection },
  { id: "batch-attack", title: "Batch Attack", steps: 3, component: BatchAttackSection },
  { id: "defenses", title: "Defenses", steps: 5, component: DefenseSection },
  { id: "crypto-defense", title: "Crypto Defense", steps: 5, component: BonawitzDefenseSection },
  { id: "conclusion", title: "Conclusion", steps: 4, component: ConclusionSection },
];

const sectionTitles = sections.map((s) => s.title);
const stepsPerSection = sections.map((s) => s.steps);

function GradientInversionContent() {
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

  const globalProgress =
    (navigation.getCurrentGlobalStep() / (navigation.getTotalSteps() - 1)) * 100;

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

export default function GradientInversionPage() {
  return (
    <MNISTProvider>
      <GradientInversionProvider>
        <GradientInversionContent />
      </GradientInversionProvider>
    </MNISTProvider>
  );
}
