"use client";

import { motion } from "framer-motion";
import { StepContent } from "@/components/section-wrapper";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMNIST } from "@/context/mnist-context";
import { MNISTImage, MNISTGrid } from "@/components/mnist-image";
import { useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface DataDistributionSectionProps {
  currentStep: number;
}

export function DataDistributionSection({
  currentStep,
}: DataDistributionSectionProps) {
  const {
    isLoading,
    isLoaded,
    error,
    clientData,
    clients,
    loadData,
    progress,
  } = useMNIST();

  // Load data when section becomes active
  useEffect(() => {
    if (currentStep >= 0 && !isLoaded && !isLoading) {
      loadData();
    }
  }, [currentStep, isLoaded, isLoading, loadData]);

  const maxCount = useMemo(() => {
    if (!clientData.length) return 1;
    return Math.max(...clientData.flatMap((c) => c.distribution));
  }, [clientData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Loading Real MNIST Data</h3>
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
        <Card className="p-8 text-center">
          <h3 className="font-semibold mb-2 text-destructive">
            Error Loading MNIST
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadData}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      {/* Step 0: Introduction to data distribution */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Data Distribution</h2>
            <p className="text-muted-foreground text-lg">
              Real MNIST handwritten digits distributed across 10 clients
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Non-IID Data</h3>
              <p className="text-sm text-muted-foreground">
                In real federated learning, data is rarely identically
                distributed. Each client has a unique data distribution based on
                their local context. This makes training more challenging but
                more realistic.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {clients.map((client) => (
                  <Badge
                    key={client.id}
                    variant="outline"
                    style={{ borderColor: client.color, color: client.color }}
                  >
                    {client.name}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Show sample real MNIST images */}
          {clientData.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Sample MNIST Images</h3>
              <div className="grid grid-cols-10 gap-2">
                {clientData.slice(0, 1).flatMap((client) =>
                  client.images.slice(0, 10).map((img, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <MNISTImage
                        pixels={img.pixels}
                        size={40}
                        className="rounded border"
                      />
                      <span className="text-xs text-muted-foreground mt-1">
                        {img.label}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Actual MNIST images from the dataset (28×28 grayscale)
              </p>
            </Card>
          )}
        </div>
      </StepContent>

      {/* Step 1: Show all clients overview */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">10 Federated Clients</h2>
            <p className="text-muted-foreground">
              Each client holds {clientData[0]?.images.length || 500} real MNIST
              samples with skewed distributions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {clients.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: client.color }}
                  >
                    {client.id + 1}
                  </div>
                  <p className="text-xs font-medium truncate">{client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {clientData[i]?.images.length || 0} samples
                  </p>
                  {/* Show 5 sample images from this client */}
                  {clientData[i] && (
                    <div className="flex flex-col items-center gap-1 mt-2">
                      <div className="flex justify-center gap-1">
                        {clientData[i].images.slice(0, 5).map((img, idx) => (
                          <MNISTImage
                            key={idx}
                            pixels={img.pixels}
                            size={20}
                            className="rounded"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        x 100
                      </span>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </StepContent>

      {/* Step 2: Show distribution heatmap */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              Data Distribution Matrix
            </h2>
            <p className="text-muted-foreground">
              Real digit frequency per client (darker = more samples)
            </p>
          </div>

          <Card className="p-6 overflow-x-auto">
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
              {clientData.map((data, clientIdx) => (
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
                      style={{ backgroundColor: clients[clientIdx]?.color }}
                    />
                    {clients[clientIdx]?.name}
                  </div>
                  {data.distribution.map((count, digit) => {
                    const intensity = count / maxCount;
                    const clientColor = clients[clientIdx]?.color || "#000";
                    // Convert hex to RGB for opacity
                    const hex = clientColor.replace("#", "");
                    const r = parseInt(hex.substring(0, 2), 16);
                    const g = parseInt(hex.substring(2, 4), 16);
                    const b = parseInt(hex.substring(4, 6), 16);
                    return (
                      <div
                        key={digit}
                        className="flex-1 flex items-center justify-center"
                      >
                        <div
                          className="w-6 h-6 rounded text-xs flex items-center justify-center"
                          style={{
                            backgroundColor: `rgba(${r}, ${g}, ${b}, ${intensity})`,
                            color: intensity > 0.5 ? "white" : "inherit",
                          }}
                        >
                          {count > 0 ? count : ""}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ))}
            </div>
          </Card>

          <p className="text-xs text-center text-muted-foreground">
            Notice how each client has different primary digits - this is
            non-IID distribution
          </p>
        </div>
      </StepContent>

      {/* Step 3: Individual client detail with real images */}
      <StepContent isActive={currentStep === 3} stepIndex={3}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Client Data Samples</h2>
            <p className="text-muted-foreground">
              Actual MNIST images held by each client
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {clientData.slice(0, 10).map((data, clientIdx) => (
              <motion.div
                key={data.clientId}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: clientIdx * 0.05 }}
              >
                <Card className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: clients[clientIdx]?.color }}
                    />
                    <span className="text-xs font-medium truncate">
                      {clients[clientIdx]?.name}
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
                          backgroundColor: clients[clientIdx]?.color,
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
                        className="flex-1 text-center text-[10px] font-medium text-muted-foreground"
                      >
                        {d}
                      </div>
                    ))}
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
