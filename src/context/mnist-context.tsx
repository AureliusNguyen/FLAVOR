"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ClientMNISTData, loadMNISTForVisualization, mnistData } from '@/lib/data/mnist-loader';
import { Client } from '@/types';

// Client colors for visualization
const CLIENT_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
];

const CLIENT_NAMES = [
  'Hospital A', 'Hospital B', 'Clinic C', 'Lab D', 'Center E',
  'Facility F', 'Institute G', 'Practice H', 'Unit I', 'Site J'
];

interface MNISTContextType {
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  clientData: ClientMNISTData[];
  clients: Client[];
  loadData: () => Promise<void>;
  progress: number;
}

const MNISTContext = createContext<MNISTContextType | null>(null);

export function MNISTProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientData, setClientData] = useState<ClientMNISTData[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [progress, setProgress] = useState(0);

  const loadData = useCallback(async () => {
    if (isLoaded || isLoading) return;

    setIsLoading(true);
    setError(null);
    setProgress(10);

    try {
      // Load MNIST data
      setProgress(30);
      const data = await loadMNISTForVisualization(10, 500);
      setProgress(80);

      setClientData(data);

      // Generate client metadata
      const clientsMeta: Client[] = data.map((d, i) => ({
        id: i,
        name: CLIENT_NAMES[i] || `Client ${i + 1}`,
        dataSize: d.images.length,
        digits: [i % 10, (i + 1) % 10],
        color: CLIENT_COLORS[i % CLIENT_COLORS.length]
      }));

      setClients(clientsMeta);
      setProgress(100);
      setIsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load MNIST data');
      console.error('MNIST loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading]);

  return (
    <MNISTContext.Provider
      value={{
        isLoading,
        isLoaded,
        error,
        clientData,
        clients,
        loadData,
        progress
      }}
    >
      {children}
    </MNISTContext.Provider>
  );
}

export function useMNIST() {
  const context = useContext(MNISTContext);
  if (!context) {
    throw new Error('useMNIST must be used within MNISTProvider');
  }
  return context;
}
