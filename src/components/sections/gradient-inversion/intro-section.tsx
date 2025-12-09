"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { StepContent } from "@/components/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye, EyeOff, Shield, ShieldOff, Loader2, ArrowRight, ArrowDown, Pencil } from "lucide-react";
import { MathBlock, Math as MathTex } from "@/components/math";
import { MNISTImage } from "@/components/mnist-image";
import { useMNIST } from "@/context/mnist-context";

interface Props {
  currentStep: number;
}

export function GradientInversionIntroSection({ currentStep }: Props) {
  const { isLoading, isLoaded, clientData, loadData } = useMNIST();

  // Load MNIST data when component mounts
  useEffect(() => {
    if (!isLoaded && !isLoading) {
      loadData();
    }
  }, [isLoaded, isLoading, loadData]);

  // Get a random MNIST image from loaded data
  const randomMNISTImage = useMemo(() => {
    if (!clientData.length || !clientData[0]?.images?.length) return null;
    // Pick a random image from the first client's data
    const images = clientData[0].images;
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  }, [clientData]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 pb-26 text-foreground">
      {/* Step 0: Title and hook */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="h-10 w-10 text-orange-400" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-4">
              Deep Leakage from Gradients
            </h1>
            <p className="text-xl text-foreground/80 mb-2">
              How Shared Gradients Can Reveal Your Private Training Data
            </p>
            <a
              href="https://arxiv.org/abs/1906.08935"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Badge className="bg-red-900/20 text-red-600 dark:text-orange-300 border-red-500/30 hover:bg-red-500/30 cursor-pointer transition-colors">
                arXiv:1906.08935
              </Badge>
            </a>
          </div>

          <Card className="bg-red-900/20 border-red-500/30">
            <CardContent className="flex items-center justify-center">
              <p className="text-foreground/90 text-center text-lg font-medium">
                For a long time, people believed that gradients are safe to share...
                <br />
                <span className="text-red-600 dark:text-red-400">However, this paper shows that this is NOT true.</span>
              </p>
            </CardContent>
          </Card>

          {/* Before/After Teaser */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
            {/* Left Card - Gradients */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-xs"
            >
              <Card className="bg-card border-border">
                <CardContent className="pt-6 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-black to-orange-600 rounded-lg flex items-center justify-center">
                    <div className="text-4xl font-mono text-white">
                      <MathTex>{"\\nabla W"}</MathTex>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Shared Gradients</h3>
                  <p className="text-sm text-muted-foreground">
                    Seemingly random numbers representing model updates
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Arrow in circle */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
                className="text-sm font-bold text-red-400"
              >
                DLG Attack
              </motion.span>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                <ArrowRight className="w-7 h-7 text-white hidden md:block" />
                <ArrowDown className="w-7 h-7 text-white md:hidden" />
              </div>
            </motion.div>

            {/* Right Card - Recovered Image */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-xs"
            >
              <Card className="bg-card border-red-500/50 border-2">
                <CardContent className="pt-6 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-black rounded-lg flex items-center justify-center overflow-hidden p-2">
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    ) : randomMNISTImage ? (
                      <MNISTImage pixels={randomMNISTImage.pixels} size={112} className="rounded" />
                    ) : (
                      <div className="text-gray-500 text-xs">Loading...</div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2 text-red-400">
                    Recovered Training Data
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Pixel-wise accurate reconstruction of private images!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </StepContent>

      {/* Step 1: The Privacy Assumption */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">The Privacy Assumption</h2>
            <p className="text-muted-foreground text-lg">
              Why everyone thought gradient sharing was safe
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Traditional View */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-400" />
                    </div>
                    <h3 className="font-semibold text-lg">Traditional View</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-foreground/80">
                      <span className="font-medium text-green-400 mr-2">✓</span>Data never leaves the local device
                    </p>
                    <p className="text-sm text-foreground/80">
                      <span className="font-medium text-green-400 mr-2">✓</span>Only gradients are communicated
                    </p>
                    <p className="text-sm text-foreground/80">
                      <span className="font-medium text-green-400 mr-2">✓</span>Gradients are "just numbers"
                    </p>
                    <p className="text-sm text-foreground/80">
                      <span className="font-medium text-green-400 mr-2">✓</span>Privacy is preserved by design
                    </p>
                  </div>
                </div>

                {/* Reality */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <ShieldOff className="h-6 w-6 text-red-400" />
                    </div>
                    <h3 className="font-semibold text-lg">The Reality</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-foreground/80">
                      <span className="font-medium text-red-400 mr-2">✗</span>Gradients encode input information
                    </p>
                    <p className="text-sm text-foreground/80">
                      <span className="font-medium text-red-400 mr-2">✗</span>Mathematical relationship exists
                    </p>
                    <p className="text-sm text-foreground/80">
                      <span className="font-medium text-red-400 mr-2">✗</span>Optimization can reverse the process
                    </p>
                    <p className="text-sm text-foreground/80">
                      <span className="font-medium text-red-400 mr-2">✗</span>Training data can be reconstructed!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/20 border-purple-500/30">
            <CardContent className="flex items-center justify-center">
              <p className="text-center text-foreground/80 dark:text-foreground">
                <strong>The Federated Learning Promise:</strong> Train models collaboratively across multiple devices without ever centralizing sensitive data.
                <br />
                <span className="text-red-600 dark:text-red-400 text-md mt-2 block">
                  But what if the gradients themselves reveal the training data?
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </StepContent>

      {/* Step 2: The Shocking Discovery */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">The Deep Leakage Discovery</h2>
            <p className="text-muted-foreground text-lg">
              Gradients reveal much more than expected
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card border-border h-full">
                <CardContent className="pt-6 text-center">
                  <Eye className="h-10 w-10 text-yellow-400 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Pixel-wise Accuracy</h3>
                  <p className="text-sm text-muted-foreground">
                    Images reconstructed with near-perfect fidelity, not just
                    "similar looking" alternatives
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card border-border h-full">
                <CardContent className="pt-6 text-center">
                  <Pencil className="h-10 w-10 text-green-400 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Token-wise Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    Text data recovered word-by-word from language model gradients
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card border-border h-full">
                <CardContent className="pt-6 text-center">
                  <EyeOff className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Prior Knowledge</h3>
                  <p className="text-sm text-muted-foreground">
                    Attack requires only the gradients - no extra information
                    about the training data needed
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 text-center">
                What Makes DLG Different from Previous Attacks
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-4">Approach</th>
                      <th className="text-left py-2 px-4">Requirements</th>
                      <th className="text-left py-2 px-4">Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4 text-muted-foreground">Property Inference</td>
                      <td className="py-2 px-4 text-muted-foreground">Trained classifier</td>
                      <td className="py-2 px-4 text-muted-foreground">Binary properties only</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4 text-muted-foreground">GAN-based</td>
                      <td className="py-2 px-4 text-muted-foreground">Class labels + GAN</td>
                      <td className="py-2 px-4 text-muted-foreground">Similar-looking synthetic images</td>
                    </tr>
                    <tr className="bg-blue-500/10">
                      <td className="py-2 px-4 font-medium text-blue-400">DLG (This Attack)</td>
                      <td className="py-2 px-4 font-medium text-blue-400">Only gradients</td>
                      <td className="py-2 px-4 font-medium text-blue-400">Exact original data!</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-900/20 border-red-500/30">
            <CardContent className="flex items-center justify-center">
              <p className="text-center text-red-600 dark:text-red-400">
                <strong>This deep leakage from gradients puts a severe challenge to the
                multi-node machine learning system.</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      </StepContent>
    </div>
  );
}
