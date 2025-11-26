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
import { ArrowLeftRight } from "lucide-react";

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
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 text-white">
      {/* Step 0: Pairwise Key Exchange */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-6">
          <div className="text-center">
            <Badge className="mb-4 bg-purple-600">Round 1</Badge>
            <h2 className="text-3xl font-bold mb-2">Share Keys</h2>
            <p className="text-gray-400">
              Pairwise Diffie-Hellman key agreement
            </p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-green-400" />
                Shared Secret Computation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Each pair of clients (<MathTex>{"u"}</MathTex>,{" "}
                <MathTex>{"v"}</MathTex>) computes a shared secret using
                Diffie-Hellman:
              </p>
              <div className="bg-gray-900 p-4 rounded-lg">
                <MathBlock>
                  {
                    "s_{u,v} = A_v^{a_u} = A_u^{a_v} = g^{a_u \\cdot a_v} \\mod p"
                  }
                </MathBlock>
              </div>
              <Alert className="bg-green-900/30 border-green-500">
                <AlertDescription className="text-green-200">
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
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Pairwise Shared Seeds</h2>
            <p className="text-gray-400">
              Seeds for generating pairwise PRG masks
            </p>
          </div>

          {protocolData.round1 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Shared Seeds Matrix (
                  {protocolData.round1.sharedSeeds?.size || 0} pairs)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr>
                        <th className="p-2 border border-gray-600 bg-gray-900"></th>
                        {clients.map((c) => (
                          <th
                            key={c.id}
                            className="p-2 border border-gray-600 bg-gray-900"
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
                            className="p-2 border border-gray-600 bg-gray-900"
                            style={{ color: u.color }}
                          >
                            C{u.id}
                          </th>
                          {clients.map((v) => {
                            if (u.id === v.id) {
                              return (
                                <td
                                  key={v.id}
                                  className="p-2 border border-gray-600 text-center bg-gray-800"
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
                                className="p-2 border border-gray-600 text-center text-green-300"
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
                <p className="text-xs text-gray-400 mt-2 text-center">
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
            <h2 className="text-3xl font-bold mb-2">Dropout Simulation</h2>
            <p className="text-gray-400">
              Select clients to simulate dropping out after key exchange
            </p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Client Status Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-yellow-900/30 border-yellow-500">
                <AlertDescription className="text-yellow-200">
                  In real deployments, clients may drop out due to network
                  issues, device shutdown, etc. The protocol can recover as long
                  as at least T={config.T} clients remain.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {clients.map((client) => (
                  <Card
                    key={client.id}
                    className="border-2"
                    style={{
                      borderColor: client.isDropped ? "#ef4444" : client.color,
                      backgroundColor: client.isDropped
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(31, 41, 55, 0.8)",
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: client.color }}
                          >
                            {client.id}
                          </div>
                          <span className="text-sm font-medium">
                            {client.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`dropout-${client.id}`}
                          checked={client.dropoutPhase === "after_share_keys"}
                          onCheckedChange={(checked: boolean) =>
                            toggleClientDropout(
                              client.id,
                              checked ? "after_share_keys" : "alive"
                            )
                          }
                        />
                        <label
                          htmlFor={`dropout-${client.id}`}
                          className="text-sm cursor-pointer text-gray-300"
                        >
                          Drop out
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-green-900/30 border-green-500">
                  <CardContent className="pt-4">
                    <p className="font-semibold text-green-300">
                      Alive Clients
                    </p>
                    <p className="text-2xl font-bold">
                      {clients.filter((c) => !c.isDropped).length}
                    </p>
                    <p className="text-xs text-gray-400">
                      Must be <MathTex>{"\\geq T = "}</MathTex> {config.T}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-900/30 border-red-500">
                  <CardContent className="pt-4">
                    <p className="font-semibold text-red-300">
                      Dropped Clients
                    </p>
                    <p className="text-2xl font-bold">
                      {clients.filter((c) => c.isDropped).length}
                    </p>
                    <p className="text-xs text-gray-400">
                      Masks will be reconstructed
                    </p>
                  </CardContent>
                </Card>
              </div>

              {clients.filter((c) => !c.isDropped).length < config.T && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Warning: Too many dropouts! Need at least T={config.T} alive
                    clients. Currently only{" "}
                    {clients.filter((c) => !c.isDropped).length} alive.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </StepContent>
    </div>
  );
}
