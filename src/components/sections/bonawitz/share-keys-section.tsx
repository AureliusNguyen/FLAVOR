"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { StepContent } from "@/components/section-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useBonawitz } from "@/context/bonawitz-context";
import { MathBlock, Math as MathTex } from "@/components/math";
import { ArrowLeftRight, UserX, WifiOff } from "lucide-react";

interface Props {
  currentStep: number;
}

export function BonawitzShareKeysSection({ currentStep }: Props) {
  const {
    clients,
    config,
    protocolData,
    setCurrentProtocolRound,
    toggleClientDropout,
  } = useBonawitz();

  useEffect(() => {
    if (currentStep >= 0) {
      setCurrentProtocolRound(1);
    }
  }, [currentStep, setCurrentProtocolRound]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 text-foreground">
      {/* Step 0: Pairwise Key Exchange */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-6">
          <div className="text-center">
            <Badge className="mb-4 bg-purple-600">Round 1</Badge>
            <h2 className="text-3xl font-bold mb-2">Share Keys</h2>
            <p className="text-muted-foreground">
              Pairwise Diffie-Hellman key agreement
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-green-400" />
                Shared Secret Computation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80">
                Each pair of clients (<MathTex>{"u"}</MathTex>,{" "}
                <MathTex>{"v"}</MathTex>) computes a shared secret using
                Diffie-Hellman:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <MathBlock>
                  {
                    "s_{u,v} = A_v^{a_u} = A_u^{a_v} = g^{a_u \\cdot a_v} \\mod p"
                  }
                </MathBlock>
              </div>
              <Alert className="bg-green-900/30 border-green-500">
                <AlertDescription className="text-green-600 dark:text-green-200">
                  Each client can compute the shared secret using their private
                  key and the other's public key. The server cannot compute
                  these secrets without knowing private keys.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </StepContent>

      {/* Step 1: Shared Seeds Matrix */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Pairwise Shared Seeds</h2>
            <p className="text-muted-foreground">
              Seeds for generating pairwise PRG masks
            </p>
          </div>

          {protocolData.round1 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                  Shared Seeds Matrix{" "}
                  <span className="text-xs text-muted-foreground">
                    (
                    <MathTex>
                      {`\\binom{n}{2} = \\frac{n(n-1)}{2} = \\frac{${config.N}(${
                        config.N
                      }-1)}{2} = ${((config.N * (config.N - 1)) / 2).toString()}`}
                    </MathTex>{" "}
                    pairs )
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr>
                        <th className="p-2 border border-border bg-muted"></th>
                        {clients.map((c) => (
                          <th
                            key={c.id}
                            className="p-2 border border-border bg-muted"
                            style={{ color: c.color }}
                          >
                            C{c.id}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((u) => (
                        <tr key={u.id}>
                          <th
                            className="p-2 border border-border bg-muted"
                            style={{ color: u.color }}
                          >
                            C{u.id}
                          </th>
                          {clients.map((v) => {
                            if (u.id === v.id) {
                              return (
                                <td
                                  key={v.id}
                                  className="p-2 border border-border text-center bg-card"
                                >
                                  -
                                </td>
                              );
                            }
                            const minId = Math.min(u.id, v.id);
                            const maxId = Math.max(u.id, v.id);
                            const seed = protocolData.round1.sharedSeeds?.get(
                              `${minId},${maxId}`
                            );
                            return (
                              <td
                                key={v.id}
                                className="p-2 border border-border text-center text-green-400"
                              >
                                {seed || "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Each cell shows the PRG seed <MathTex>{"s_{uv}"}</MathTex>
                  {" = "}
                  <MathTex>
                    {
                      "\\mathrm{hash}\\big(\\mathrm{DH}(\\mathrm{shared\\_secret}_{uv})\\big)"
                    }
                  </MathTex>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </StepContent>

      {/* Step 2: Dropout Control */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              Early Dropout Simulation
            </h2>
            <p className="text-muted-foreground">
              Simulate clients disconnecting <strong>before</strong> submitting
              masked inputs
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <WifiOff className="h-5 w-5 text-orange-400" />
                Clients Dropping After Round 1
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-orange-900/30 border-orange-500">
                <AlertDescription className="text-orange-900 dark:text-orange-200">
                  <strong>Early dropout <MathTex>{"(U_1 \\setminus U_2)"}</MathTex>:</strong> These clients
                  completed key exchange but will disconnect before Round 2.
                  They will <strong>not</strong> submit a masked input, so their
                  gradient is not included in the aggregate. However, their <MathTex>{"s_{uv}"}</MathTex> <strong>pairwise keys</strong> must be reconstructed so other
                  clients can remove the pairwise masks.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {clients.map((client) => {
                  const isEarlyDropout =
                    client.dropoutPhase === "after_share_keys";
                  return (
                    <Card
                      key={client.id}
                      className={`border-2 ${
                        isEarlyDropout ? "bg-orange-500/10" : "bg-card/80"
                      }`}
                      style={{
                        borderColor: isEarlyDropout ? "#f97316" : client.color,
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-foreground text-xs font-bold ${
                                isEarlyDropout ? "opacity-50" : ""
                              }`}
                              style={{ backgroundColor: client.color }}
                            >
                              {client.id}
                            </div>
                            <span
                              className={`text-sm font-medium ${
                                isEarlyDropout
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {client.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`dropout-${client.id}`}
                            checked={isEarlyDropout}
                            onCheckedChange={(checked: boolean) =>
                              toggleClientDropout(
                                client.id,
                                checked ? "after_share_keys" : "alive"
                              )
                            }
                          />
                          <label
                            htmlFor={`dropout-${client.id}`}
                            className="text-sm cursor-pointer text-foreground/80"
                          >
                            Disconnect now
                          </label>
                        </div>
                        {isEarlyDropout && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-orange-400">
                            <UserX className="h-3 w-3" />
                            <span>
                              Won't submit <MathTex>{"y_u"}</MathTex>
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-green-900/30 border-green-500">
                  <CardContent className="pt-4">
                    <p className="font-semibold text-green-900 dark:text-green-200">
                      Continuing to Round 2
                    </p>
                    <p className="text-2xl font-bold">
                      {clients.filter((c) => c.dropoutPhase === "alive").length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Will submit masked inputs
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-900/30 border-orange-500">
                  <CardContent className="pt-4">
                    <p className="font-semibold text-orange-900 dark:text-orange-200">
                      Early Dropouts (<MathTex>{"U_1 \\setminus U_2"}</MathTex>)
                    </p>
                    <p className="text-2xl font-bold">
                      {
                        clients.filter(
                          (c) => c.dropoutPhase === "after_share_keys"
                        ).length
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pairwise keys will be reconstructed
                    </p>
                  </CardContent>
                </Card>
              </div>

              {clients.filter((c) => c.dropoutPhase === "alive").length <
                config.T && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Warning: Too many dropouts! Need at least T={config.T}{" "}
                    clients to continue. Currently only{" "}
                    {clients.filter((c) => c.dropoutPhase === "alive").length}{" "}
                    continuing.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="bg-purple-900/30 border-purple-500">
            <CardContent className="flex items-center justify-center">
              <p className="text-center text-purple-900 dark:text-purple-200">
                <strong>Next:</strong> Clients still online will compute and
                submit their masked inputs <MathTex>{"y_u"}</MathTex> in Round
                2.
              </p>
            </CardContent>
          </Card>
        </div>
      </StepContent>
    </div>
  );
}
