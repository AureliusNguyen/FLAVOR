"use client";

import { motion } from "framer-motion";
import { StepContent } from "@/components/section-wrapper";
import { Card } from "@/components/ui/card";
import { Network, Shield, Brain } from "lucide-react";

interface HeroSectionProps {
  currentStep: number;
}

export function HeroSection({ currentStep }: HeroSectionProps) {
  return (
    <div className="flex flex-col items-center py-4 pb-24">
      {/* Step 0: About This Simplified Workflow */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">
              A Simplified Educational Model
            </h2>
            <p className="text-muted-foreground text-lg">
              This workflow demonstrates the core concepts of secure aggregation
              in a simplified form for educational purposes.
            </p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Card className="p-6 border-yellow-500/50 bg-yellow-500/5">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold text-lg">Important Disclaimer</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  This simplified workflow is <strong>not implemented in real-world systems</strong>.
                  Production federated learning systems use more sophisticated protocols like the{" "}
                  <strong>Bonawitz et al. protocol</strong> which handles client dropouts,
                  uses pairwise masking, and provides stronger security guarantees.
                </p>
              </div>
            </Card>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 h-full">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">This Simplified Version</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Basic Shamir Secret Sharing</li>
                      <li>• Direct share submission to server</li>
                      <li>• No dropout handling</li>
                      <li>• Educational demonstration</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 h-full border-primary">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Network className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Real-World Protocols</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Pairwise masking (Diffie-Hellman)</li>
                      <li>• Double masking for dropout resilience</li>
                      <li>• Multiple communication rounds</li>
                      <li>• Cryptographic key exchange</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </StepContent>

      {/* Step 1: Why Start Simple */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Why Start Simple?</h2>
            <p className="text-muted-foreground text-lg">
              Understanding the fundamentals before diving into complex protocols
            </p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Core Concept: Shamir Secret Sharing</h3>
                <p className="text-sm text-muted-foreground">
                  The fundamental building block of secure aggregation. A secret is split into
                  shares such that any T shares can reconstruct it, but fewer than T shares
                  reveal nothing about the secret.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                    Polynomial interpolation at its core
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                    Information-theoretic security
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                    Threshold-based reconstruction
                  </li>
                </ul>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 border-primary">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">
                    Ready for More?
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  After completing this simplified workflow, explore the{" "}
                  <strong>Bonawitz Protocol</strong> visualization to see how
                  real-world secure aggregation handles the complexities of
                  production federated learning systems.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </StepContent>

      {/* Step 2: Overview of what we'll visualize */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">What You'll Learn</h2>
            <p className="text-muted-foreground text-lg">
              A step-by-step walkthrough of simplified secure aggregation
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                num: 1,
                title: "Shamir Secret Sharing",
                desc: "How secrets are split into polynomial shares",
              },
              {
                num: 2,
                title: "Share Distribution",
                desc: "Each client creates shares of their gradient",
              },
              {
                num: 3,
                title: "Server Collection",
                desc: "Server collects shares (cannot see individual values)",
              },
              {
                num: 4,
                title: "Aggregation",
                desc: "Shares are summed to get aggregate gradient",
              },
              {
                num: 5,
                title: "Reconstruction",
                desc: "Only the sum is reconstructed, not individual inputs",
              },
            ].map((item, i) => (
              <motion.div
                key={item.num}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {item.num}
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-4 bg-muted/50">
              <p className="text-sm text-center text-muted-foreground">
                This simplified model helps build intuition. For production systems,
                see the <strong>Bonawitz Protocol</strong> which adds pairwise masking,
                dropout handling, and cryptographic key exchange.
              </p>
            </Card>
          </motion.div>
        </div>
      </StepContent>
    </div>
  );
}
