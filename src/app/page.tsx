"use client"

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Zap, Shield, Users } from 'lucide-react';

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
    duration: '10-15 minutes',
  },
  {
    id: 'bonawitz',
    title: 'Bonawitz Protocol (2017)',
    subtitle: 'Interactive Secure Aggregation',
    description: 'Full implementation of the Bonawitz et al. secure aggregation protocol with interactive client simulation and dropout recovery.',
    path: '/bonawitz-protocol',
    icon: Shield,
    reference: 'arXiv:1611.04482',
    referenceUrl: 'https://arxiv.org/abs/1611.04482',
    features: [
      'Interactive protocol simulation',
      'Pairwise Diffie-Hellman key exchange',
      'Dropout-resistant aggregation',
      'Shamir Secret Sharing for recovery',
      'Real-time mask generation & cancellation',
    ],
    color: 'from-purple-500 to-pink-500',
    complexity: 'Advanced',
    duration: '15-20 minutes',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            FLAVOR
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-2">
          Federated Learning Analytics, Visualization, Optimization &
          Reliability
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
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
          <h2 className="text-3xl font-bold text-center text-white mb-3">
            Choose Your Experience
          </h2>
          <p className="text-center text-gray-400 mb-8">
            Select a learning path based on your expertise and goals
          </p>
        </motion.div>

        {/* Workflow Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {workflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.2, duration: 0.6 }}
            >
              <Card className="h-full bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors duration-300 flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-br ${workflow.color}`}
                    >
                      <workflow.icon className="w-8 h-8 text-white" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-gray-300 border-gray-600"
                    >
                      {workflow.complexity}
                    </Badge>
                  </div>

                  <CardTitle className="text-2xl text-white mb-2">
                    {workflow.title}
                  </CardTitle>
                  <p className="text-sm text-gray-400 mb-3">
                    {workflow.subtitle}
                  </p>

                  {workflow.reference && workflow.referenceUrl && (
                    <div className="mb-3">
                      <a href={workflow.referenceUrl} target="_blank" rel="noopener noreferrer">
                        <Badge className="bg-purple-900/50 text-purple-200 border-purple-700 hover:bg-purple-800/50 cursor-pointer transition-colors">
                          📄 {workflow.reference}
                        </Badge>
                      </a>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex flex-col flex-1">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {workflow.description}
                  </p>

                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Features:
                    </p>
                    <ul className="space-y-1.5">
                      {workflow.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-400 flex items-start"
                        >
                          <span className="text-green-400 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700 mt-auto">
                    <div className="flex items-center text-sm text-gray-400">
                      <Users className="w-4 h-4 mr-1" />
                      {workflow.duration}
                    </div>
                    <Link href={workflow.path}>
                      <Button
                        variant="outline"
                        className="text-white font-semibold border-gray-500 hover:border-purple-400 hover:text-purple-400 bg-transparent hover:bg-transparent cursor-pointer group"
                      >
                        Start Learning
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
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
          <Card className="bg-gray-800/50 border-gray-700 border-dashed max-w-2xl mx-auto">
            <CardContent className="py-8">
              <div className="flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-yellow-400 mr-2" />
                <h3 className="text-xl font-bold text-white">
                  More Protocols Coming Soon
                </h3>
              </div>
              <p className="text-gray-400 mb-4">
                Future implementations will include:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  SecAgg+ (2020)
                </Badge>
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  LightSecAgg (2022)
                </Badge>
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  FastSecAgg (2023)
                </Badge>
                <Badge variant="outline" className="text-gray-400 border-gray-600">
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
          className="mt-16 text-center text-gray-500 text-sm space-y-2"
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
              className="text-gray-400 hover:text-white transition-colors"
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
