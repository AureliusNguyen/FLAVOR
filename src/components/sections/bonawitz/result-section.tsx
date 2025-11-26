'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { StepContent } from '@/components/section-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useBonawitz } from '@/context/bonawitz-context';
import { CheckCircle, Shield, Users, Lock, RotateCcw, ExternalLink } from 'lucide-react';
import { Math as MathTex } from '@/components/math';
import Link from 'next/link';

interface Props {
  currentStep: number;
}

export function BonawitzResultSection({ currentStep }: Props) {
  const { clients, config, protocolData, resetProtocol } = useBonawitz();

  const aliveClients = clients.filter(c => !c.isDropped);
  const droppedClients = clients.filter(c => c.isDropped);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 text-white">
      {/* Step 0: Final Result */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-6 pb-26">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="h-10 w-10 text-green-400" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">Secure Aggregation Complete!</h2>
            <p className="text-gray-400">The protocol successfully computed the aggregate</p>
          </div>

          {/* Result Card */}
          <Card className="bg-green-900/30 border-green-500">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Final Aggregated Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {protocolData.round4?.dequantizedAverage ? (
                <>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Average Gradient Vector:</p>
                    <div className="font-mono text-xl text-center text-green-300">
                      [{protocolData.round4.dequantizedAverage.map((v: number) => v.toFixed(6)).join(', ')}]
                    </div>
                  </div>

                  {protocolData.verification && (
                    <Alert variant={protocolData.verification.passed ? 'default' : 'destructive'}>
                      <AlertDescription>
                        <strong>{protocolData.verification.passed ? '✓ Verification Passed' : '✗ Verification Failed'}</strong>
                        <p className="text-sm mt-1">{protocolData.verification.message}</p>
                        {protocolData.verification.passed && (
                          <div className="mt-2 text-xs font-mono">
                            <div>Expected: [{protocolData.verification.expected?.map((v: number) => v.toFixed(6)).join(', ')}]</div>
                            <div>Actual: [{protocolData.verification.actual?.map((v: number) => v.toFixed(6)).join(', ')}]</div>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Rounding Error Explanation */}
                  <div className="bg-gray-900 p-4 rounded-lg border border-blue-500/30 mt-4">
                    <p className="font-semibold text-blue-300 mb-3">Why Small Differences Are Expected</p>
                    <div className="text-sm text-gray-300 space-y-3">
                      <div>
                        <p className="text-gray-400 mb-1">The protocol uses quantization to convert floats to integers:</p>
                        <div className="bg-gray-800 p-2 rounded font-mono text-xs">
                          <div className="text-yellow-300">x̃ = round(x × Q) mod R</div>
                          <div className="text-gray-500 mt-1">where Q = {config.Q.toLocaleString()} (quantization factor)</div>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-400 mb-1">Rounding introduces small errors at each step:</p>
                        <ol className="list-decimal list-inside text-xs space-y-1 ml-2">
                          <li><span className="text-gray-400">Client quantizes:</span> <span className="text-blue-300">0.1234 × {config.Q} = {(0.1234 * config.Q).toFixed(1)} → round to {Math.round(0.1234 * config.Q)}</span></li>
                          <li><span className="text-gray-400">After aggregation & dequantization:</span> <span className="text-green-300">{Math.round(0.1234 * config.Q)} ÷ {config.Q} = {(Math.round(0.1234 * config.Q) / config.Q).toFixed(6)}</span></li>
                          <li><span className="text-gray-400">Max error per value:</span> <span className="text-yellow-300">±{(0.5 / config.Q).toFixed(6)}</span> (half a quantization step)</li>
                        </ol>
                      </div>

                      <div className="border-t border-gray-700 pt-3">
                        <p className="text-gray-400 mb-1">Acceptable Threshold:</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-600 text-xs">ε = 0.01</Badge>
                          <span className="text-xs text-gray-400">
                            Differences &lt; 1% are considered correct (typical ML gradient precision)
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          With Q = {config.Q.toLocaleString()}, max error ≈ {(0.5 / config.Q * 100).toFixed(4)}% per element — well within tolerance.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  Result computation in progress...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{config.N}</p>
                <p className="text-sm text-gray-400">Total Clients</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{aliveClients.length}</p>
                <p className="text-sm text-gray-400">Completed Protocol</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6 text-center">
                <Lock className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{droppedClients.length}</p>
                <p className="text-sm text-gray-400">Dropouts Handled</p>
              </CardContent>
            </Card>
          </div>

          {/* Security Summary */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security Guarantees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-300">Input Privacy</p>
                      <p className="text-xs text-gray-400">Server never saw individual gradients <MathTex>{"x_u"}</MathTex></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-300">Pairwise Mask Cancellation</p>
                      <p className="text-xs text-gray-400">All <MathTex>{"p_{uv}"}</MathTex> masks cancelled perfectly</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-300">Dropout Resilience</p>
                      <p className="text-xs text-gray-400">Handled {droppedClients.length} dropouts via Shamir reconstruction</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-300">Honest Majority</p>
                      <p className="text-xs text-gray-400"><MathTex>{"T = "}</MathTex> {config.T} <MathTex>{"\\leq"}</MathTex> {aliveClients.length} threshold satisfied</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </StepContent>

      {/* Step 1: What's Next */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Thank You for Exploring!</h2>
            <p className="text-gray-400">You've completed the Bonawitz Secure Aggregation demonstration</p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">What You Learned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { text: 'Pairwise masking using Diffie-Hellman key agreement', hasMath: false },
                  { text: 'Self-mask secret sharing for dropout resilience', hasMath: false },
                  { text: 'How masks cancel out to reveal only the aggregate', hasMath: false },
                  { text: "Shamir Secret Sharing for reconstructing dropped clients' masks", hasMath: false },
                  { text: 'The importance of the honest majority threshold', hasMath: true, mathPart: '(T > N/2)' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <Badge className="bg-purple-600 text-xs">{idx + 1}</Badge>
                    <span className="text-gray-300">
                      {item.text}
                      {item.hasMath && item.mathPart && (
                        <> <MathTex>{item.mathPart}</MathTex></>
                      )}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={resetProtocol}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Different Configs
            </Button>
            <Link href="/">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Back to Home
              </Button>
            </Link>
          </div>

          <Card className="bg-purple-900/30 border-purple-500">
            <CardContent className="pt-6">
              <p className="text-center text-purple-200 mb-3">
                <strong>Read the Original Paper:</strong>
              </p>
              <div className="flex justify-center">
                <a
                  href="https://arxiv.org/abs/1611.04482"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-purple-300 hover:text-purple-100 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Practical Secure Aggregation for Privacy-Preserving Machine Learning
                  <Badge className="bg-purple-700">arXiv:1611.04482</Badge>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </StepContent>
    </div>
  );
}
