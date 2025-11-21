"use client";

import { ChevronLeft, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { useVisualization } from "@/context/visualization-context";

interface NavigationControlsProps {
  currentSection: number;
  currentStep: number;
  totalSections: number;
  currentStepsInSection: number;
  globalProgress: number;
  sectionTitles: string[];
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  onSectionClick: (section: number) => void;
}

export function NavigationControls({
  currentSection,
  currentStep,
  totalSections,
  currentStepsInSection,
  globalProgress,
  sectionTitles,
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  onSectionClick,
}: NavigationControlsProps) {
  const { isBlocked, blockReason, hasSkippedSections } = useVisualization();

  return (
    <>
      {/* Top navigation bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              Made by{" "}
              <a
                href="https://www.linkedin.com/in/aurelius-nguyen/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-1 py-0.5 rounded-md transition-colors hover:bg-foreground hover:text-background"
              >
                Aurelius Nguyen
              </a>{" "}
              with ❤️
            </div>
            <ThemeToggle />
          </div>

          {/* Section indicators */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
            {sectionTitles.map((title, index) => {
              const canClick = index <= currentSection;
              return (
                <button
                  key={index}
                  onClick={() => canClick && onSectionClick(index)}
                  disabled={!canClick}
                  className={`
                    px-3 py-1 text-xs rounded-full whitespace-nowrap transition-all
                    ${
                      index === currentSection
                        ? "bg-foreground text-background font-medium"
                        : index < currentSection
                        ? "bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer"
                        : "text-muted-foreground/50 cursor-not-allowed"
                    }
                  `}
                >
                  {title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Global progress bar */}
        <Progress value={globalProgress} className="h-0.5 rounded-none" />
      </motion.header>

      {/* Skip warning banner */}
      {hasSkippedSections && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-[88px] left-0 right-0 z-40 bg-amber-500/10 border-b border-amber-500/20"
        >
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            <span>You've jumped ahead. Results shown are from pre-computed data.</span>
          </div>
        </motion.div>
      )}

      {/* Bottom navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              onClick={onPrev}
              disabled={!canGoPrev || isBlocked}
              className="gap-2"
            >
              {isBlocked ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              Previous
            </Button>

            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium">
                {isBlocked ? blockReason : sectionTitles[currentSection]}
              </span>
              <span className="text-xs text-muted-foreground">
                {isBlocked
                  ? "Please wait..."
                  : `Step ${currentStep + 1} of ${currentStepsInSection}`}
              </span>
            </div>

            <Button
              variant="default"
              size="lg"
              onClick={onNext}
              disabled={!canGoNext || isBlocked}
              className="gap-2"
            >
              Next
              {isBlocked ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
