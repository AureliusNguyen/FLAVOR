'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { StepContent } from '@/components/section-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBonawitz } from '@/context/bonawitz-context';
import { MathBlock, Math as MathTex } from '@/components/math';
import { EyeOff, Send, Server, UserX, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  currentStep: number;
}

export function BonawitzMaskedInputSection({ currentStep }: Props) {
  const { clients, config, protocolData, setCurrentProtocolRound, toggleClientDropout } = useBonawitz();

  useEffect(() => {
    if (currentStep >= 0) {
      setCurrentProtocolRound(2);
    }
  }, [currentStep, setCurrentProtocolRound]);

  const aliveClients = clients.filter(c => !c.isDropped);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 text-white">
      {/* Step 0: Masking Formula */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <Badge className="mb-4 bg-purple-600">Round 2</Badge>
            <h2 className="text-3xl font-bold mb-2">Masked Input Collection</h2>
            <p className="text-gray-400">Clients compute and submit masked gradients</p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <EyeOff className="h-5 w-5 text-purple-400" />
                Masking Formula
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <MathBlock>
                  {"y_u = x_u + \\underbrace{\\sum_{v > u} p_{u,v} - \\sum_{v < u} p_{v,u}}_{\\text{pairwise masks}} + \\underbrace{b_u}_{\\text{self mask}} \\pmod{R}"}
                </MathBlock>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-blue-900/30 border-blue-500">
                  <CardContent className="pt-4">
                    <p className="font-semibold text-blue-300 mb-1"><MathTex>{"x_u"}</MathTex></p>
                    <p className="text-xs text-gray-300">Client's quantized gradient vector</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-900/30 border-green-500">
                  <CardContent className="pt-4">
                    <p className="font-semibold text-green-300 mb-1"><MathTex>{"p_{uv}"}</MathTex></p>
                    <p className="text-xs text-gray-300">PRG output from shared seed <MathTex>{"s_{uv}"}</MathTex> (cancels when summed)</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-900/30 border-purple-500">
                  <CardContent className="pt-4">
                    <p className="font-semibold text-purple-300 mb-1"><MathTex>{"b_u"}</MathTex></p>
                    <p className="text-xs text-gray-300">Random self-mask (secret-shared for recovery)</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Alert className="bg-green-900/30 border-green-500">
            <AlertDescription className="text-green-200">
              <strong>Key Insight:</strong> Pairwise masks cancel perfectly when summed!
              Client u adds <MathTex>{"+p_{uv}"}</MathTex>, client v subtracts <MathTex>{"-p_{uv}"}</MathTex> → net contribution is 0.
            </AlertDescription>
          </Alert>
        </div>
      </StepContent>

      {/* Step 1: Masked Inputs with Dropout Simulation */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Computing Masked Inputs</h2>
            <p className="text-gray-400">Each client applies their mask and sends to server</p>
          </div>

          {/* Dropout Simulation Controls */}
          <Card className="bg-orange-900/30 border-orange-500">
            <CardHeader>
              <CardTitle className="text-orange-300 flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Simulate Client Dropouts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-300">
                Click on a client to toggle their dropout status. Dropped clients won't submit their masked input,
                and their masks will need to be reconstructed using Shamir Secret Sharing.
              </p>
              <div className="flex flex-wrap gap-2">
                {clients.map((client) => (
                  <Button
                    key={client.id}
                    variant={client.isDropped ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => toggleClientDropout(client.id, client.isDropped ? 'alive' : 'after_masked_input')}
                    className={`flex items-center gap-2 ${
                      client.isDropped
                        ? 'bg-red-600 hover:bg-red-700 border-red-600'
                        : 'border-gray-500 hover:border-green-400 hover:text-green-400'
                    }`}
                  >
                    {client.isDropped ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    {client.name}
                  </Button>
                ))}
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-400">Alive: {clients.filter(c => !c.isDropped).length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-400">Dropped: {clients.filter(c => c.isDropped).length}</span>
                </div>
              </div>
              {clients.filter(c => !c.isDropped).length < config.T && (
                <Alert className="bg-red-900/50 border-red-400">
                  <AlertDescription className="text-red-200">
                    <strong>Warning:</strong> Too many dropouts! Need at least T={config.T} alive clients for reconstruction.
                    Currently only {clients.filter(c => !c.isDropped).length} alive.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clients.map((client, idx) => {
              const masked = protocolData.round2?.maskedInputs?.get(client.id);
              const isDropped = client.isDropped;
              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isDropped ? 0.5 : 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card
                    className={`border-2 ${isDropped ? 'opacity-60' : ''}`}
                    style={{
                      borderColor: isDropped ? '#ef4444' : client.color,
                      backgroundColor: 'rgba(31, 41, 55, 0.8)'
                    }}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${isDropped ? 'opacity-50' : ''}`}
                            style={{ backgroundColor: client.color }}
                          >
                            {client.id}
                          </div>
                          <span className={`font-medium ${isDropped ? 'line-through text-gray-500' : ''}`}>
                            {client.name}
                          </span>
                        </div>
                        <Badge className={isDropped ? "bg-red-600" : "bg-green-600"}>
                          {isDropped ? 'Dropped' : 'Alive'}
                        </Badge>
                      </div>

                      <div className="text-xs font-mono space-y-1 bg-gray-900 p-2 rounded">
                        <div>
                          <span className="text-gray-400"><MathTex>{"x_u"}</MathTex> = </span>
                          <span className="text-blue-300">[{client.quantizedVector.join(', ')}]</span>
                        </div>
                        <div>
                          <span className="text-gray-400"><MathTex>{"y_u"}</MathTex> = </span>
                          <span className={isDropped ? "text-gray-500" : "text-purple-300"}>
                            {isDropped ? '[Not submitted]' : `[${masked ? masked.join(', ') : '...'}]`}
                          </span>
                        </div>
                      </div>

                      {isDropped ? (
                        <div className="flex items-center gap-2 text-sm text-red-400">
                          <UserX className="h-4 w-4" />
                          <span>Disconnected - mask must be reconstructed</span>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.1 + 0.3 }}
                          className="flex items-center gap-2 text-sm text-green-400"
                        >
                          <Send className="h-4 w-4" />
                          <span>Sent to server</span>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {clients.filter(c => c.isDropped).length > 0 && (
            <Alert className="bg-red-900/30 border-red-500">
              <AlertDescription className="text-red-200">
                <strong>Dropped Clients:</strong>{' '}
                {clients.filter(c => c.isDropped).map(c => c.name).join(', ')}
                <br />
                These clients did not submit masked inputs. Their self-masks (<MathTex>{"b_u"}</MathTex>) will be
                reconstructed using Shamir Secret Sharing from the shares held by alive clients.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </StepContent>

      {/* Step 2: Server Aggregation */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Server Aggregation</h2>
            <p className="text-gray-400">Server computes the sum of masked inputs</p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-cyan-400" />
                Server View
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-cyan-900/30 border-cyan-500">
                <AlertDescription className="text-cyan-200">
                  The server receives {aliveClients.length} masked inputs and computes their sum.
                  <strong> It cannot see individual gradients</strong> - only masked values!
                </AlertDescription>
              </Alert>

              <div className="bg-gray-900 p-4 rounded-lg">
                <MathBlock>
                  {"\\sum_{u \\in U_2} y_u = \\sum_{u \\in U_2} x_u + \\sum_{u \\in U_2} b_u \\pmod{R}"}
                </MathBlock>
                <p className="text-xs text-center mt-2 text-gray-400">
                  <MathTex>{"U_2"}</MathTex> = set of clients who submitted in Round 2
                </p>
              </div>

              {protocolData.round2?.serverAggregatedMasked && (
                <Card className="bg-cyan-900/30 border-cyan-500">
                  <CardContent className="pt-4">
                    <p className="font-semibold text-cyan-300 mb-2">Aggregated Masked Sum:</p>
                    <div className="font-mono text-lg text-center">
                      [{protocolData.round2.serverAggregatedMasked.join(', ')}]
                    </div>
                    <p className="text-xs text-center mt-2 text-gray-400">
                      This is still masked! Pairwise masks cancelled, but self-masks (<MathTex>{"b_u"}</MathTex>) remain.
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card className="bg-purple-900/30 border-purple-500">
            <CardContent className="pt-6">
              <p className="text-center text-purple-200">
                <strong>Next:</strong> Server will collect self-mask shares from alive clients and
                reconstruct dropped clients' masks to remove all masks and recover the true sum.
              </p>
            </CardContent>
          </Card>
        </div>
      </StepContent>
    </div>
  );
}
