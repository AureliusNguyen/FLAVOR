// Real MNIST Data Loader using TensorFlow.js
// Fetches actual MNIST dataset from the web

import * as tf from '@tensorflow/tfjs';

const MNIST_IMAGES_SPRITE_PATH = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png';
const MNIST_LABELS_PATH = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8';

const IMAGE_SIZE = 784; // 28x28
const NUM_CLASSES = 10;
const NUM_DATASET_ELEMENTS = 65000;
const NUM_TRAIN_ELEMENTS = 55000;
const NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS;

export interface MNISTImage {
  pixels: number[];
  label: number;
}

export interface ClientMNISTData {
  clientId: number;
  images: MNISTImage[];
  distribution: number[]; // count per digit 0-9
}

class MNISTData {
  private datasetImages: Float32Array | null = null;
  private datasetLabels: Uint8Array | null = null;
  private trainIndices: Uint32Array | null = null;
  private testIndices: Uint32Array | null = null;
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;

    // Load images
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const imgRequest = new Promise<void>((resolve, reject) => {
      img.crossOrigin = '';
      img.onload = () => {
        img.width = img.naturalWidth;
        img.height = img.naturalHeight;

        const datasetBytesBuffer = new ArrayBuffer(NUM_DATASET_ELEMENTS * IMAGE_SIZE * 4);
        const chunkSize = 5000;
        canvas.width = img.width;
        canvas.height = chunkSize;

        for (let i = 0; i < NUM_DATASET_ELEMENTS / chunkSize; i++) {
          const datasetBytesView = new Float32Array(
            datasetBytesBuffer,
            i * IMAGE_SIZE * chunkSize * 4,
            IMAGE_SIZE * chunkSize
          );
          ctx.drawImage(
            img,
            0,
            i * chunkSize,
            img.width,
            chunkSize,
            0,
            0,
            img.width,
            chunkSize
          );

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          for (let j = 0; j < imageData.data.length / 4; j++) {
            // All channels hold the same value since it's grayscale
            datasetBytesView[j] = imageData.data[j * 4] / 255;
          }
        }
        this.datasetImages = new Float32Array(datasetBytesBuffer);
        resolve();
      };
      img.onerror = reject;
      img.src = MNIST_IMAGES_SPRITE_PATH;
    });

    // Load labels (one-hot encoded: 10 bytes per label)
    const labelsRequest = fetch(MNIST_LABELS_PATH)
      .then(response => response.arrayBuffer())
      .then(buffer => {
        const labelsOneHot = new Uint8Array(buffer);
        // Convert one-hot to single digit labels
        this.datasetLabels = new Uint8Array(NUM_DATASET_ELEMENTS);
        for (let i = 0; i < NUM_DATASET_ELEMENTS; i++) {
          for (let j = 0; j < 10; j++) {
            if (labelsOneHot[i * 10 + j] === 1) {
              this.datasetLabels[i] = j;
              break;
            }
          }
        }
      });

    await Promise.all([imgRequest, labelsRequest]);

    // Create shuffled indices
    this.trainIndices = tf.util.createShuffledIndices(NUM_TRAIN_ELEMENTS);
    this.testIndices = tf.util.createShuffledIndices(NUM_TEST_ELEMENTS);

    this.loaded = true;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  getTrainData(numExamples?: number): { images: MNISTImage[] } {
    if (!this.datasetImages || !this.datasetLabels || !this.trainIndices) {
      throw new Error('MNIST data not loaded. Call load() first.');
    }

    const num = numExamples || NUM_TRAIN_ELEMENTS;
    const images: MNISTImage[] = [];

    for (let i = 0; i < num; i++) {
      const idx = this.trainIndices[i];
      const pixels: number[] = [];

      for (let j = 0; j < IMAGE_SIZE; j++) {
        pixels.push(this.datasetImages[idx * IMAGE_SIZE + j]);
      }

      images.push({
        pixels,
        label: this.datasetLabels[idx]
      });
    }

    return { images };
  }

  getTestData(numExamples?: number): { images: MNISTImage[] } {
    if (!this.datasetImages || !this.datasetLabels || !this.testIndices) {
      throw new Error('MNIST data not loaded. Call load() first.');
    }

    const num = numExamples || NUM_TEST_ELEMENTS;
    const images: MNISTImage[] = [];

    for (let i = 0; i < num; i++) {
      const idx = this.testIndices[i] + NUM_TRAIN_ELEMENTS;
      const pixels: number[] = [];

      for (let j = 0; j < IMAGE_SIZE; j++) {
        pixels.push(this.datasetImages[idx * IMAGE_SIZE + j]);
      }

      images.push({
        pixels,
        label: this.datasetLabels[idx]
      });
    }

    return { images };
  }

  // Distribute data to clients with non-IID distribution
  distributeToClients(numClients: number = 10, samplesPerClient: number = 500): ClientMNISTData[] {
    if (!this.datasetImages || !this.datasetLabels || !this.trainIndices) {
      throw new Error('MNIST data not loaded. Call load() first.');
    }

    const clientData: ClientMNISTData[] = [];

    // Group images by label
    const imagesByLabel: MNISTImage[][] = Array.from({ length: 10 }, () => []);

    for (let i = 0; i < NUM_TRAIN_ELEMENTS; i++) {
      const idx = this.trainIndices[i];
      const pixels: number[] = [];

      for (let j = 0; j < IMAGE_SIZE; j++) {
        pixels.push(this.datasetImages[idx * IMAGE_SIZE + j]);
      }

      const label = this.datasetLabels[idx];
      imagesByLabel[label].push({ pixels, label });
    }

    // Distribute to clients with non-IID pattern
    // Each client gets primarily 2-3 digits
    for (let clientId = 0; clientId < numClients; clientId++) {
      const images: MNISTImage[] = [];
      const distribution = new Array(10).fill(0);

      // Primary digits for this client (non-IID)
      const primaryDigit1 = clientId % 10;
      const primaryDigit2 = (clientId + 1) % 10;
      const secondaryDigit = (clientId + 5) % 10;

      for (let i = 0; i < samplesPerClient; i++) {
        let digit: number;
        const rand = Math.random();

        // Non-IID distribution: favor primary digits
        if (rand < 0.35 && imagesByLabel[primaryDigit1].length > 0) {
          digit = primaryDigit1;
        } else if (rand < 0.65 && imagesByLabel[primaryDigit2].length > 0) {
          digit = primaryDigit2;
        } else if (rand < 0.80 && imagesByLabel[secondaryDigit].length > 0) {
          digit = secondaryDigit;
        } else {
          // Random digit from remaining
          const availableDigits = imagesByLabel
            .map((arr, idx) => ({ idx, len: arr.length }))
            .filter(d => d.len > 0);

          if (availableDigits.length === 0) break;
          digit = availableDigits[Math.floor(Math.random() * availableDigits.length)].idx;
        }

        const digitImages = imagesByLabel[digit];
        if (digitImages.length > 0) {
          const image = digitImages.pop()!;
          images.push(image);
          distribution[digit]++;
        }
      }

      clientData.push({
        clientId,
        images,
        distribution
      });
    }

    return clientData;
  }
}

// Singleton instance
export const mnistData = new MNISTData();

// Helper function to get a subset of images for visualization
export async function loadMNISTForVisualization(
  numClients: number = 10,
  samplesPerClient: number = 100
): Promise<ClientMNISTData[]> {
  await mnistData.load();
  return mnistData.distributeToClients(numClients, samplesPerClient);
}

// Get sample images for each digit (for visualization)
export async function getSampleImages(numPerDigit: number = 5): Promise<MNISTImage[][]> {
  await mnistData.load();
  const { images } = mnistData.getTrainData(10000);

  const samplesByDigit: MNISTImage[][] = Array.from({ length: 10 }, () => []);

  for (const image of images) {
    if (samplesByDigit[image.label].length < numPerDigit) {
      samplesByDigit[image.label].push(image);
    }

    // Check if we have enough samples
    if (samplesByDigit.every(arr => arr.length >= numPerDigit)) {
      break;
    }
  }

  return samplesByDigit;
}
