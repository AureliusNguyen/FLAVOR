"use client"

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Zap, Shield, AlertTriangle, Clock } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const workflows = [
  {
    id: 'simple',
    title: 'Simple Workflow',
    subtitle: 'Educational Demonstration',
    description: 'A guided, pedagogical walkthrough of federated learning concepts with static visualizations. Perfect for learning the fundamentals.',
    path: '/simple-workflow',
    icon: BookOpen,
    features: [
      'Step-by-step educational flow',
      'Visual explanations of FL concepts',
      'Shamir Secret Sharing demo',
      'FedAvg aggregation basics',
    ],
    color: 'from-blue-500 to-cyan-500',
    complexity: 'Beginner Friendly',
    duration: '5-7 minutes',
  },
  {
    id: 'bonawitz',
    title: 'Bonawitz Protocol (2017)',
    subtitle: 'Interactive Secure Aggregation',
    description: 'Full implementation of the Bonawitz et al. secure aggregation protocol with interactive client simulation and dropout recovery.',
    path: '/bonawitz-protocol',
    icon: Shield,
    reference: 'Bonawitz et al., ACM CCS 2017 (arXiv:1611.04482)',
    referenceUrl: 'https://arxiv.org/abs/1611.04482',
    features: [
      'Interactive protocol simulation',
      'Pairwise Diffie-Hellman key exchange',
      'Dropout-resistant aggregation',
      'Shamir Secret Sharing for recovery',
      'Real-time mask generation & cancellation',
    ],
    color: 'from-purple-500 to-pink-500',
    badgeColor: 'bg-purple-900/20 text-purple-600 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/30',
    complexity: 'Advanced',
    duration: '7-10 minutes',
  },
  {
    id: 'gradient-inversion',
    title: 'Gradient Inversion Attack (2019)',
    subtitle: 'How Shared Gradients Can Reveal Private Training Data',
    description: 'Interactive demonstration of the Gradient Inversion (DLG) attack (Zhu et al., NeurIPS 2019) showing how shared gradients can leak private training data.',
    path: '/gradient-inversion',
    icon: AlertTriangle,
    reference: 'Zhu et al., NeurIPS 2019 (arXiv:1906.08935)',
    referenceUrl: 'https://arxiv.org/abs/1906.08935',
    features: [
      'Live gradient inversion attack demo',
      'Multiple CNN architectures (Simple/LeNet/ResNet)',
      'Batch size experiments (1, 2, 4, 8)',
      'Interactive defense mechanisms',
      'Secure aggregation as defense',
    ],
    color: 'from-red-500 to-orange-500',
    badgeColor: 'bg-red-900/20 text-red-600 dark:text-orange-300 border-red-500/30 hover:bg-red-500/30',
    complexity: 'Intermediate',
    duration: '7-10 minutes',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            FLAVOR
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-2">
          Federated Learning Analytics, Visualization, Optimization &
          Reliability
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
          FLAVOR is a tool for visualizing and understanding the privacy-preserving properties and optimization techniques used in federated learning.
          </p>
        </motion.div>

        {/* Choose Your Experience */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-center text-foreground mb-3">
            Choose Your Experience
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Select a learning path based on your expertise and goals
          </p>
        </motion.div>

        {/* Workflow Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {workflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.2, duration: 0.6 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors duration-300 flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-br ${workflow.color}`}
                    >
                      <workflow.icon className="w-8 h-8 text-white" />
                    </div>
                    <Badge variant="outline">
                      {workflow.complexity}
                    </Badge>
                  </div>

                  <CardTitle className="text-2xl mb-2">
                    {workflow.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mb-3">
                    {workflow.subtitle}
                  </p>

                  {/* always reserve space for the reference row */}
                  <div className="mb-3 h-8 flex items-center">
                    {workflow.reference && workflow.referenceUrl && workflow.badgeColor && (
                      <a
                        href={workflow.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Badge className={`${workflow.badgeColor} cursor-pointer transition-colors`}>
                          {workflow.reference}
                        </Badge>
                      </a>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col flex-1">
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    {workflow.description}
                  </p>

                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Features:
                    </p>
                    <ul className="space-y-1.5">
                      {workflow.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-muted-foreground flex items-start"
                        >
                          <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {workflow.duration}
                    </div>
                    <Link href={workflow.path}>
                      <button className="relative group border-none bg-transparent p-0 outline-none cursor-pointer font-medium text-sm">
                        {/* Shadow layer */}
                        <span className="absolute top-0 left-0 w-full h-full bg-black/25 rounded-lg transform translate-y-0.5 transition duration-[600ms] ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-[250ms] group-active:translate-y-px" />

                        {/* Background layer */}
                        <span className="absolute top-0 left-0 w-full h-full rounded-lg bg-gradient-to-l from-[hsl(217,33%,16%)] via-[hsl(217,33%,32%)] to-[hsl(217,33%,16%)]" />

                        {/* Foreground layer with workflow color */}
                        <div className={`relative flex items-center justify-between py-2.5 px-4 text-white rounded-lg transform -translate-y-1 bg-gradient-to-r ${workflow.color} gap-2 transition duration-[600ms] ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-[250ms] group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110`}>
                          <span className="select-none">Start Learning</span>
                          <ArrowRight className="w-4 h-4 transition duration-250 group-hover:translate-x-1" />
                        </div>
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <Card className="bg-muted/50 border-dashed max-w-2xl mx-auto">
            <CardContent className="py-8">
              <div className="flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-yellow-500 mr-2" />
                <h3 className="text-xl font-bold text-foreground">
                  More Protocols Coming Soon
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Future implementations will include:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline">
                  SecAgg+ (2020)
                </Badge>
                <Badge variant="outline">
                  LightSecAgg (2022)
                </Badge>
                <Badge variant="outline">
                  FastSecAgg (2023)
                </Badge>
                <Badge variant="outline">
                  Custom Protocols
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-16 text-center text-muted-foreground text-sm space-y-2"
        >
          <p>
            Built for education and research • Interactive FL protocol demonstrations
          </p>
          <p>
            Made by{" "}
            <a
              href="https://www.linkedin.com/in/aurelius-nguyen/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Aurelius Nguyen
            </a>{" "}
            with ❤️
          </p>
        </motion.div>
      </div>
    </main>
  );
}
