"use client";

import { motion } from "framer-motion";
import { StepContent } from "@/components/section-wrapper";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Shield, Brain, Database } from "lucide-react";

interface HeroSectionProps {
  currentStep: number;
}

export function HeroSection({ currentStep }: HeroSectionProps) {
  return (
    <div className="flex flex-col items-center py-4 pb-24">
      {/* Step 0: Title and Introduction */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="text-center space-y-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
              FLAVOR
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              Federated Learning Analytics, Visualization, Optimization &
              Reliability (FLAVOR) is a tool for visualizing and understanding
              the privacy-preserving properties and optimization techniques used
              in federated learning.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2"
          >
            <Badge variant="secondary" className="px-3 py-1">
              <Network className="h-3 w-3 mr-1" />
              Distributed Systems
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              Privacy Preserving
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Brain className="h-3 w-3 mr-1" />
              Collaborative Learning
            </Badge>
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground"
          >
            Click <strong>Next</strong> or press{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">→</kbd> to
            begin
          </motion.p>
        </div>
      </StepContent>

      {/* Step 1: What is Federated Learning */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">
              What is Federated Learning?
            </h2>
            <p className="text-muted-foreground text-lg">
              A machine learning approach where multiple parties collaboratively
              train a model while keeping their data decentralized and private.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 h-full">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Traditional ML</h3>
                    <p className="text-sm text-muted-foreground">
                      All data is centralized in one location. Privacy concerns
                      and data transfer costs are high.
                    </p>
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
                    <h3 className="font-semibold mb-2">Federated Learning</h3>
                    <p className="text-sm text-muted-foreground">
                      Data stays on device. Only model updates are shared.
                      Privacy is preserved by design.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </StepContent>

      {/* Step 2: The Problem */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">The Privacy Challenge</h2>
            <p className="text-muted-foreground text-lg">
              Even in federated learning, model updates can leak information
              about private data.
            </p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Attack Vectors</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-destructive rounded-full" />
                    Gradient inversion attacks can reconstruct training data
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-destructive rounded-full" />
                    Membership inference can determine if data was used
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-destructive rounded-full" />
                    Model updates reveal statistical properties
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
                    The Solution: Secure Aggregation
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Using <strong>Shamir Secret Sharing</strong>, clients can
                  split their model updates into cryptographic shares. The
                  server can only see the aggregated result, never individual
                  updates.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </StepContent>

      {/* Step 3: Overview of what we'll visualize */}
      <StepContent isActive={currentStep === 3} stepIndex={3}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">What You'll See</h2>
            <p className="text-muted-foreground text-lg">
              An end-to-end visualization of privacy-preserving federated
              learning
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                num: 1,
                title: "Data Distribution",
                desc: "MNIST data split across 10 clients (non-IID)",
              },
              {
                num: 2,
                title: "Local Training",
                desc: "Each client trains on their local data",
              },
              {
                num: 3,
                title: "Secret Sharing",
                desc: "Model updates split using Shamir's scheme",
              },
              {
                num: 4,
                title: "Secure Aggregation",
                desc: "Shares combined without revealing individual updates",
              },
              {
                num: 5,
                title: "FedAvg",
                desc: "Global model updated with averaged weights",
              },
              {
                num: 6,
                title: "Convergence",
                desc: "Multiple rounds until model converges",
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
        </div>
      </StepContent>
    </div>
  );
}
