'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { StepContent } from '@/components/section-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBonawitz } from '@/context/bonawitz-context';
import { MathBlock, Math as MathTex } from '@/components/math';
import { EyeOff, Send, Server, UserX, UserCheck, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

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

  // U₂ = clients who will submit masked inputs (not early dropouts)
  const u2Clients = clients.filter(c => c.dropoutPhase !== 'after_share_keys');
  // Early dropouts from Round 1 (U₁ \ U₂)
  const earlyDropouts = clients.filter(c => c.dropoutPhase === 'after_share_keys');
  // Late dropouts - submitted but will disconnect (U_2 \ U_3)
  const lateDropouts = clients.filter(c => c.dropoutPhase === 'after_masked_input');
  // U₃ = clients still alive after Round 2
  const u3Clients = clients.filter(c => c.dropoutPhase === 'alive');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 text-foreground">
      {/* Step 0: Masking Formula */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <Badge className="mb-4 bg-purple-600">Round 2</Badge>
            <h2 className="text-3xl font-bold mb-2">Masked Input Collection</h2>
            <p className="text-muted-foreground">Clients compute and submit masked gradients</p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <EyeOff className="h-5 w-5 text-purple-400" />
                Masking Formula
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <MathBlock>
                  {"y_u = x_u + \\underbrace{\\sum_{v > u} p_{u,v} - \\sum_{v < u} p_{v,u}}_{\\text{pairwise masks}} + \\underbrace{b_u}_{\\text{self mask}} \\pmod{R}"}
                </MathBlock>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-blue-900/30 border-blue-500">
                  <CardContent className="pt-2">
                    <p className="font-semibold text-blue-300 mb-1"><MathTex>{"x_u"}</MathTex></p>
                    <p className="text-xs text-foreground/80">Client's quantized gradient vector</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-900/30 border-green-500">
                  <CardContent className="pt-2">
                    <p className="font-semibold text-green-300 mb-1"><MathTex>{"p_{uv}"}</MathTex></p>
                    <p className="text-xs text-foreground/80">PRG output from shared seed <MathTex>{"s_{uv}"}</MathTex></p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-900/30 border-purple-500">
                  <CardContent className="pt-2">
                    <p className="font-semibold text-purple-300 mb-1"><MathTex>{"b_u"}</MathTex></p>
                    <p className="text-xs text-foreground/80">Random self-mask (secret-shared for recovery)</p>
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
            <p className="text-muted-foreground">Each client in <MathTex>{"U_2"}</MathTex> applies their mask and sends to server</p>
          </div>

          {/* Show early dropouts from Round 1 */}
          {earlyDropouts.length > 0 && (
            <Alert className="bg-orange-900/30 border-orange-500">
              <WifiOff className="h-4 w-4 text-orange-400" />
              <AlertDescription className="text-orange-200">
                <strong>Early dropouts (U₁ \ U₂):</strong>{' '}
                {earlyDropouts.map(c => c.name).join(', ')}
                <br />
                These clients disconnected after Round 1 and will not submit masked inputs.
                Their pairwise keys must be reconstructed so others can remove the pairwise masks.
              </AlertDescription>
            </Alert>
          )}

          {/* Late Dropout Simulation Controls */}
          <Card className="bg-red-900/30 border-red-500">
            <CardHeader>
              <CardTitle className="text-red-300 flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Late Dropout Simulation (U₂ \ U₃)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/80">
                Select clients who will <strong>submit their masked input</strong> but then disconnect
                before Round 4 (unmasking). Their self-mask <MathTex>{"b_u"}</MathTex> will need to be reconstructed.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {u2Clients.map((client) => {
                  const isLateDropout = client.dropoutPhase === 'after_masked_input';
                  return (
                    <Card
                      key={client.id}
                      className={`border-2 ${isLateDropout ? "bg-red-500/10" : "bg-card/80"}`}
                      style={{
                        borderColor: isLateDropout ? "#ef4444" : client.color,
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-foreground text-xs font-bold ${isLateDropout ? "opacity-50" : ""}`}
                            style={{ backgroundColor: client.color }}
                          >
                            {client.id}
                          </div>
                          <span className={`text-sm font-medium ${isLateDropout ? "line-through text-muted-foreground" : ""}`}>
                            {client.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`late-dropout-${client.id}`}
                            checked={isLateDropout}
                            onCheckedChange={(checked: boolean) =>
                              toggleClientDropout(
                                client.id,
                                checked ? 'after_masked_input' : 'alive'
                              )
                            }
                          />
                          <label
                            htmlFor={`late-dropout-${client.id}`}
                            className="text-xs cursor-pointer text-foreground/80"
                          >
                            Disconnect after submit
                          </label>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Will stay alive <MathTex>{"(U_3)"}</MathTex>: {u3Clients.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">Late dropouts <MathTex>{"(U_2 \\setminus U_3)"}</MathTex>: {lateDropouts.length}</span>
                </div>
              </div>
              {u3Clients.length < config.T && (
                <Alert className="bg-red-900/50 border-red-400">
                  <AlertDescription className="text-red-200">
                    <strong>Warning:</strong> Too many dropouts! Need at least T={config.T} alive clients for reconstruction.
                    Currently only {u3Clients.length} will remain alive.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clients.map((client, idx) => {
              const masked = protocolData.round2?.maskedInputs?.get(client.id);
              const isEarlyDropout = client.dropoutPhase === 'after_share_keys';
              const isLateDropout = client.dropoutPhase === 'after_masked_input';
              const isInU2 = !isEarlyDropout;

              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isEarlyDropout ? 0.4 : (isLateDropout ? 0.7 : 1), x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card
                    className={`border-2 bg-card/80`}
                    style={{
                      borderColor: isEarlyDropout ? '#f97316' : (isLateDropout ? '#ef4444' : client.color),
                    }}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-foreground text-sm font-bold ${!isInU2 || isLateDropout ? 'opacity-50' : ''}`}
                            style={{ backgroundColor: client.color }}
                          >
                            {client.id}
                          </div>
                          <span className={`font-medium ${!isInU2 ? 'line-through text-muted-foreground' : ''}`}>
                            {client.name}
                          </span>
                        </div>
                        <Badge className={
                          isEarlyDropout ? "bg-orange-600" :
                          (isLateDropout ? "bg-red-600" : "bg-green-600")
                        }>
                          {isEarlyDropout ? 'Early dropout' : (isLateDropout ? 'Late dropout' : 'Alive')}
                        </Badge>
                      </div>

                      <div className="text-xs font-mono space-y-1 bg-muted p-2 rounded">
                        <div>
                          <span className="text-muted-foreground"><MathTex>{"x_u"}</MathTex> = </span>
                          <span className={isEarlyDropout ? "text-muted-foreground" : "text-blue-300"}>
                            {isEarlyDropout ? '[N/A - not in U₂]' : `[${client.quantizedVector.join(', ')}]`}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground"><MathTex>{"y_u"}</MathTex> = </span>
                          <span className={isEarlyDropout ? "text-muted-foreground" : "text-purple-300"}>
                            {isEarlyDropout ? '[Not submitted]' : `[${masked ? masked.join(', ') : '...'}]`}
                          </span>
                        </div>
                      </div>

                      {isEarlyDropout ? (
                        <div className="flex items-center gap-2 text-sm text-orange-400">
                          <WifiOff className="h-4 w-4" />
                          <span>Disconnected in Round 1 <MathTex>{"(U_1 \\setminus U_2)"}</MathTex></span>
                        </div>
                      ) : isLateDropout ? (
                        <div className="flex items-center gap-2 text-sm text-red-400">
                          <UserX className="h-4 w-4" />
                          <span>Will disconnect after submitting <MathTex>{"(U_2 \\setminus U_3)"}</MathTex></span>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.1 + 0.3 }}
                          className="flex items-center gap-2 text-sm text-green-400"
                        >
                          <Send className="h-4 w-4" />
                          <span>Sent to server in <MathTex>{"U_3"}</MathTex></span>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </StepContent>

      {/* Step 2: Server Aggregation */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Server Aggregation</h2>
            <p className="text-muted-foreground">Server computes the sum of masked inputs</p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Server className="h-5 w-5 text-cyan-400" />
                Server View
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-cyan-900/30 border-cyan-500">
                <AlertDescription className="text-cyan-200">
                  The server receives {u2Clients.length} masked inputs from <MathTex>{"U_2"}</MathTex> and computes their sum.
                  <strong> It cannot see individual gradients</strong> - only masked values!
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg space-y-3">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Full expansion of the sum:</strong>
                </p>
                <MathBlock>
                  {"\\sum_{u \\in U_2} y_u = \\sum_{u \\in U_2} x_u + \\underbrace{\\sum_{u \\in U_2} \\left(\\sum_{v>u} p_{uv} - \\sum_{v<u} p_{vu}\\right)}_{=0} + \\sum_{u \\in U_2} b_u \\pmod{R}"}
                </MathBlock>
                <p className="text-xs text-center text-muted-foreground">
                  <MathTex>{"U_2"}</MathTex> = set of clients who submitted in Round 2
                </p>
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Pairwise mask cancellation:</strong> For each pair <MathTex>{"(u,v)"}</MathTex> where <MathTex>{"u < v"}</MathTex>,
                    client <MathTex>{"u"}</MathTex> adds <MathTex>{"+p_{uv}"}</MathTex> and client <MathTex>{"v"}</MathTex> subtracts <MathTex>{"-p_{uv}"}</MathTex>.
                    These cancel in the sum, leaving only the self-masks <MathTex>{"b_u"}</MathTex>.
                  </p>
                </div>
              </div>

              {protocolData.round2?.serverAggregatedMasked && (
                <Card className="bg-cyan-900/30 border-cyan-500">
                  <CardContent className="pt-4">
                    <p className="font-semibold text-cyan-300 mb-2">Aggregated Masked Sum:</p>
                    <div className="font-mono text-lg text-center">
                      [{protocolData.round2.serverAggregatedMasked.join(', ')}]
                    </div>
                    <p className="text-xs text-center mt-2 text-muted-foreground">
                      This is still masked! Pairwise masks cancelled, but self-masks (<MathTex>{"b_u"}</MathTex>) remain.
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card className="bg-purple-900/30 border-purple-500">
            <CardContent className="flex items-center justify-center">
              <p className="text-center text-purple-200">
                <strong>Next:</strong> Server will broadcast which clients are still alive (<MathTex>{"U_3"}</MathTex>),
                so all participants know whose self-masks need to be reconstructed via Shamir Secret Sharing.
              </p>
            </CardContent>
          </Card>
        </div>
      </StepContent>
    </div>
  );
}
