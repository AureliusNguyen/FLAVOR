'use client';

import { motion } from 'framer-motion';
import { StepContent } from '@/components/section-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Key, Users, Lock, ArrowRight } from 'lucide-react';
import { useBonawitz } from '@/context/bonawitz-context';
import { MathBlock, Math as MathTex } from '@/components/math';

interface Props {
  currentStep: number;
}

export function BonawitzIntroSection({ currentStep }: Props) {
  const { config } = useBonawitz();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6 pb-26 text-white">
      {/* Step 0: Welcome */}
      <StepContent isActive={currentStep === 0} stepIndex={0}>
        <div className="space-y-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6"
            >
              <Shield className="h-10 w-10 text-purple-400" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-4">
              Bonawitz et al. Secure Aggregation
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Practical Secure Aggregation for Privacy-Preserving Machine Learning
            </p>
            <Badge className="bg-purple-900/50 text-purple-200 border-purple-700">
              arXiv:1611.04482 (2017)
            </Badge>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <p className="text-gray-300 text-center text-lg">
                This interactive demonstration walks you through the complete Bonawitz secure aggregation protocol,
                exactly as described in the original paper. You'll see how multiple clients can collaboratively
                compute an aggregate of their private data without revealing individual values.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6 text-center">
                <Lock className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Privacy Guaranteed</h3>
                <p className="text-sm text-gray-400">
                  Server learns only the aggregate sum, never individual inputs
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Dropout Resilient</h3>
                <p className="text-sm text-gray-400">
                  Protocol succeeds even if some clients disconnect
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6 text-center">
                <Key className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Cryptographically Secure</h3>
                <p className="text-sm text-gray-400">
                  Uses Diffie-Hellman key exchange and Shamir Secret Sharing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </StepContent>

      {/* Step 1: Protocol Overview */}
      <StepContent isActive={currentStep === 1} stepIndex={1}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Protocol Overview</h2>
            <p className="text-gray-400">The five rounds of secure aggregation</p>
          </div>

          <div className="space-y-4">
            {[
              { round: 0, title: 'Advertise Keys', desc: 'Clients generate and broadcast DH public keys + Shamir secret shares', icon: '🔑' },
              { round: 1, title: 'Share Keys', desc: 'Pairwise key agreement - each pair of clients establishes a shared secret', icon: '🤝' },
              { round: 2, title: 'MaskedInput Collection', desc: 'Clients submit masked inputs: x + pairwise masks + self mask', icon: '🎭' },
              { round: 3, title: 'Consistency Check', desc: 'Server broadcasts which clients are still alive ', icon: '✅' },
              { round: 4, title: 'Unmasking', desc: 'Reconstruct masks for dropped clients and recover true aggregate', icon: '🐱' },
            ].map((item, idx) => (
              <motion.div
                key={item.round}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{item.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-purple-300 border-purple-500">
                            Round {item.round}
                          </Badge>
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </StepContent>

      {/* Step 2: Core Masking Concept */}
      <StepContent isActive={currentStep === 2} stepIndex={2}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">The Core Idea: Pairwise Masking</h2>
            <p className="text-gray-400">How masks cancel out to reveal only the sum</p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Masking Formula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <MathBlock>
                  {"y_u = x_u + \\sum_{v > u} p_{u,v} - \\sum_{v < u} p_{v,u} + b_u \\pmod{R}"}
                </MathBlock>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-900/30 p-3 rounded">
                  <p className="font-semibold text-blue-300 mb-1">Pairwise Masks (<MathTex>{"p_{uv}"}</MathTex>)</p>
                  <p className="text-gray-300">
                    For each pair (<MathTex>{"u"}</MathTex>, <MathTex>{"v"}</MathTex>), client <MathTex>{"u"}</MathTex> adds <MathTex>{"+p_{uv}"}</MathTex> and client <MathTex>{"v"}</MathTex> subtracts <MathTex>{"-p_{uv}"}</MathTex>.
                    When summed, these cancel: <MathTex>{"(+p_{uv}) + (-p_{uv}) = 0"}</MathTex>
                  </p>
                </div>
                <div className="bg-purple-900/30 p-3 rounded">
                  <p className="font-semibold text-purple-300 mb-1">Self Masks (<MathTex>{"b_u"}</MathTex>)</p>
                  <p className="text-gray-300">
                    Each client adds a random self-mask <MathTex>{"b_u"}</MathTex> and secret-shares it.
                    If client drops, others can reconstruct <MathTex>{"b_u"}</MathTex> to remove it.
                  </p>
                </div>
              </div>

              <div className="bg-green-900/30 p-4 rounded-lg">
                <p className="font-semibold text-green-300 mb-2">Result: Perfect Cancellation</p>
                <MathBlock>
                  {"\\sum_u y_u = \\sum_u x_u + \\underbrace{\\sum \\text{(pairwise masks)}}_{=0} + \\sum_u b_u"}
                </MathBlock>
                <p className="text-sm text-gray-300 mt-2">
                  The pairwise masks cancel completely. Alive clients reveal their <MathTex>{"b_u"}</MathTex> values,
                  and dropped clients' <MathTex>{"b_u"}</MathTex> values are reconstructed via Shamir Secret Sharing.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </StepContent>
    </div>
  );
}
