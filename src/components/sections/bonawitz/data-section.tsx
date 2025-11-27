"use client";

import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { StepContent } from "@/components/section-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBonawitz } from "@/context/bonawitz-context";
import { useMNIST } from "@/context/mnist-context";
import { useVisualization } from "@/context/visualization-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MathBlock, Math as MathTex } from "@/components/math";
import { MNISTImage } from "@/components/mnist-image";
import { Loader2 } from "lucide-react";

interface Props {
  currentStep: number;
}

export function BonawitzDataSection({ currentStep }: Props) {
  const { config, setConfig, clients } = useBonawitz();
  const { setBlocked } = useVisualization();
  const {
    isLoading,
    isLoaded,
    error,
    clientData: mnistClientData,
    clients: mnistClients,
    loadData,
    progress,
  } = useMNIST();

  // Load MNIST data when section becomes active
  useEffect(() => {
    if (currentStep >= 0 && !isLoaded && !isLoading) {
      loadData();
    }
  }, [currentStep, isLoaded, isLoading, loadData]);

  // Block navigation while loading
  useEffect(() => {
    if (isLoading) {
      setBlocked(true, "Loading MNIST data...");
    } else {
      setBlocked(false);
    }
  }, [isLoading, setBlocked]);

  // Calculate max count for heatmap normalization
  const maxCount = useMemo(() => {
    if (!mnistClientData.length) return 1;
    return Math.max(...mnistClientData.flatMap((c) => c.distribution));
  }, [mnistClientData]);

  // Loading state - show for any step while loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Card className="p-8 text-center bg-card border-border">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
          <h3 className="font-semibold mb-2 text-foreground">
            Loading Real MNIST Data
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Fetching 65,000 handwritten digit images...
          </p>
          <Progress value={progress} className="w-64" />
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Card className="p-8 text-center bg-card border-border">
          <h3 className="font-semibold mb-2 text-red-400">
            Error Loading MNIST
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadData} variant="outline">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 text-foreground">
      {/* Step 0: Configure Parameters & Non-IID Introduction */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Protocol Configuration</h2>
            <p className="text-muted-foreground">
              Set up the secure aggregation parameters
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Number of Clients (N):{" "}
                    <span className="text-blue-400">{config.N}</span>
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={10}
                    value={config.N}
                    onChange={(e) =>
                      setConfig({ ...config, N: parseInt(e.target.value) })
                    }
                    className="w-full accent-blue-500"
                  />
                  <p className="text-xs text-muted-foreground">
                    Total participating clients
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Threshold (T):{" "}
                    <span className="text-blue-400">{config.T}</span>
                  </label>
                  <input
                    type="range"
                    min={Math.ceil(config.N / 2) + 1}
                    max={config.N}
                    value={Math.min(config.T, config.N)}
                    onChange={(e) =>
                      setConfig({ ...config, T: parseInt(e.target.value) })
                    }
                    className="w-full accent-blue-500"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum clients needed for reconstruction (<MathTex>{"T > N/2"}</MathTex>)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Vector Dimension (k):{" "}
                    <span className="text-blue-400">{config.k}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={config.k}
                    onChange={(e) =>
                      setConfig({ ...config, k: parseInt(e.target.value) })
                    }
                    className="w-full accent-blue-500"
                  />
                  <p className="text-xs text-muted-foreground">
                    Size of gradient vectors
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Modulus (R):{" "}
                    <span className="text-blue-400">
                      {config.R.toLocaleString()}
                    </span>
                  </label>
                  <Select
                    value={config.R.toString()}
                    onValueChange={(value) =>
                      setConfig({ ...config, R: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-full bg-muted border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem
                        value="65536"
                        className="text-foreground hover:bg-accent focus:bg-accent"
                      >
                        <MathTex>{"2^{16}"}</MathTex> (65,536)
                      </SelectItem>
                      <SelectItem
                        value="16777216"
                        className="text-foreground hover:bg-accent focus:bg-accent"
                      >
                        <MathTex>{"2^{24}"}</MathTex> (16,777,216)
                      </SelectItem>
                      <SelectItem
                        value="4294967296"
                        className="text-foreground hover:bg-accent focus:bg-accent"
                      >
                        <MathTex>{"2^{32}"}</MathTex> (4,294,967,296)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Modular arithmetic ring
                  </p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-center">
                  Security Requirement
                </h4>
                <MathBlock>
                  {"T > \\frac{N}{2} \\quad \\text{(honest majority)}"}
                </MathBlock>
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  At least <MathTex>{`T = ${config.T}`}</MathTex> out of{" "}
                  <MathTex>{`N = ${config.N}`}</MathTex> clients must remain
                  honest and online
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Non-IID Introduction */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  Non-IID Data Distribution
                </h3>
                <p className="text-sm text-foreground/80">
                  In real federated learning, data is rarely identically
                  distributed. Each client has a unique data distribution based
                  on their local context (e.g., different patient demographics
                  at different hospitals). This makes training more challenging
                  but more realistic.
                </p>

                {/* Show sample real MNIST images */}
                {mnistClientData.length > 0 && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-center">
                      Sample MNIST Images
                    </h4>
                    <div className="grid grid-cols-10 gap-2 justify-items-center">
                      {mnistClientData.slice(0, 1).flatMap((client) =>
                        client.images.slice(0, 10).map((img, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <MNISTImage
                              pixels={img.pixels}
                              size={40}
                              className="rounded border border-border"
                            />
                            <span className="text-xs text-muted-foreground mt-1">
                              {img.label}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Actual MNIST images from the dataset (28x28 grayscale)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </StepContent>

      {/* Step 1: Federated Clients Overview */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              {config.N} Federated Clients
            </h2>
            <p className="text-muted-foreground">
              Each client holds {mnistClientData[0]?.images.length || 500} real
              MNIST samples with skewed distributions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {clients.slice(0, config.N).map((client, idx) => {
              const clientMnist = mnistClientData[idx];
              return (
                <motion.div
                  key={client.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className="p-4 text-center bg-card border-2"
                    style={{ borderColor: client.color }}
                  >
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: client.color }}
                    >
                      {client.id}
                    </div>
                    <p className="text-md font-medium truncate">
                      {client.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {clientMnist?.images.length || 0} samples
                    </p>

                    {/* Show 5 sample images from this client */}
                    {clientMnist && (
                      <div className="flex flex-col items-center gap-1 mt-2">
                        <div className="flex justify-center gap-1">
                          {clientMnist.images.slice(0, 5).map((img, imgIdx) => (
                            <MNISTImage
                              key={imgIdx}
                              pixels={img.pixels}
                              size={20}
                              className="rounded"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          x {Math.floor((clientMnist.images.length || 0) / 5)}
                        </span>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Card className="bg-purple-500/20 border-purple-500/30 dark:bg-purple-900/30 dark:border-purple-500">
            <CardContent className="flex items-center justify-center">
              <p className="text-sm text-center text-purple-900 dark:text-purple-200">
                <strong>Medical Scenario:</strong> Each hospital/clinic has
                patient data skewed toward certain conditions based on their
                specialty and demographics.
              </p>
            </CardContent>
          </Card>
        </div>
      </StepContent>

      {/* Step 2: Data Distribution Matrix */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              Data Distribution Matrix
            </h2>
            <p className="text-muted-foreground">
              Real digit frequency per client (darker = more samples)
            </p>
          </div>

          <Card className="bg-card border-border p-6 overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header row */}
              <div className="flex mb-2">
                <div className="w-24 text-xs font-medium text-muted-foreground">
                  Client
                </div>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <div
                    key={digit}
                    className="flex-1 text-center text-xs font-medium"
                  >
                    {digit}
                  </div>
                ))}
              </div>

              {/* Data rows */}
              {mnistClientData.slice(0, config.N).map((data, clientIdx) => {
                const client = clients[clientIdx];
                if (!client) return null;

                return (
                  <motion.div
                    key={data.clientId}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: clientIdx * 0.05 }}
                    className="flex items-center mb-1"
                  >
                    <div className="w-24 text-xs truncate flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: client.color }}
                      />
                      {client.name}
                    </div>
                    {data.distribution.map((count, digit) => {
                      const intensity = count / maxCount;
                      // Parse HSL color
                      const hslMatch = client.color.match(
                        /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/
                      );
                      let bgColor = `rgba(100, 100, 255, ${intensity})`;
                      if (hslMatch) {
                        const [, h, s, l] = hslMatch;
                        bgColor = `hsla(${h}, ${s}%, ${l}%, ${intensity})`;
                      } else if (client.color.startsWith("#")) {
                        // Convert hex to RGBA
                        const hex = client.color.replace("#", "");
                        const r = parseInt(hex.substring(0, 2), 16);
                        const g = parseInt(hex.substring(2, 4), 16);
                        const b = parseInt(hex.substring(4, 6), 16);
                        bgColor = `rgba(${r}, ${g}, ${b}, ${intensity})`;
                      }

                      return (
                        <div
                          key={digit}
                          className="flex-1 flex items-center justify-center"
                        >
                          <div
                            className="w-6 h-6 rounded text-xs flex items-center justify-center"
                            style={{
                              backgroundColor: bgColor,
                              color: intensity > 0.5 ? "white" : "inherit",
                            }}
                          >
                            {count > 0 ? count : ""}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                );
              })}
            </div>
          </Card>

          <Card className="bg-purple-500/20 border-purple-500/30 dark:bg-purple-900/30 dark:border-purple-500">
            <CardContent className="flex items-center justify-center">
              <p className="text-sm text-center text-purple-900 dark:text-purple-200">
                Notice how each client has different primary digits - this is
                non-IID distribution
              </p>
            </CardContent>
          </Card>
        </div>
      </StepContent>

      {/* Step 3: Client Data Samples with Gradient Vectors */}
      <StepContent isActive={currentStep === 3} stepIndex={3}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Client Data Samples</h2>
            <p className="text-muted-foreground">
              Actual MNIST images and resulting gradient vectors
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {mnistClientData.slice(0, config.N).map((data, clientIdx) => {
              const client = clients[clientIdx];
              if (!client) return null;

              return (
                <motion.div
                  key={data.clientId}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: clientIdx * 0.05 }}
                >
                  <Card
                    className="p-3 bg-card border-2"
                    style={{ borderColor: client.color }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: client.color }}
                      />
                      <span className="text-xs font-medium truncate">
                        {client.name}
                      </span>
                    </div>

                    {/* Show grid of actual images */}
                    <div className="grid grid-cols-4 gap-0.5 mb-2">
                      {data.images.slice(0, 8).map((img, idx) => (
                        <MNISTImage
                          key={idx}
                          pixels={img.pixels}
                          size={16}
                          className="rounded"
                        />
                      ))}
                    </div>

                    {/* Distribution bar chart */}
                    <div className="flex items-end gap-0.5 h-10">
                      {data.distribution.map((count, digit) => (
                        <div
                          key={digit}
                          className="flex-1 rounded-t transition-all"
                          style={{
                            height: `${(count / maxCount) * 100}%`,
                            backgroundColor: client.color,
                            minHeight: count > 0 ? "2px" : "0",
                          }}
                          title={`Digit ${digit}: ${count}`}
                        />
                      ))}
                    </div>
                    {/* Digit labels */}
                    <div className="flex gap-0.5 mt-0.5">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                        <div
                          key={d}
                          className="flex-1 text-center text-[8px] font-medium text-muted-foreground"
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Quantization for Secure Aggregation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <MathBlock>
                  {"\\tilde{x}_u = \\text{round}(x_u \\times Q) \\mod R"}
                </MathBlock>
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  Float gradients are quantized to integers for secure modular
                  arithmetic
                </p>
              </div>
              <p className="text-sm text-center text-foreground/80">
                After local training, each client's gradient{" "}
                <MathTex>{"x_u"}</MathTex> will be quantized and protected
                during aggregation using the Bonawitz secure protocol.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/30 border-purple-500">
            <CardContent className="pt-6">
              <p className="text-center text-blue-200">
                <strong>Goal:</strong> Compute{" "}
                <MathTex>{"\\sum_{u=1}^{N} x_u"}</MathTex> without revealing
                individual <MathTex>{"x_u"}</MathTex> gradients
              </p>
            </CardContent>
          </Card>
        </div>
      </StepContent>
    </div>
  );
}
