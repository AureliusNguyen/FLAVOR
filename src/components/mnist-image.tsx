"use client"

import { useRef, useEffect } from 'react';

interface MNISTImageProps {
  pixels: number[];
  size?: number;
  className?: string;
}

export function MNISTImage({ pixels, size = 28, className = '' }: MNISTImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pixels.length !== 784) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(28, 28);

    for (let i = 0; i < 784; i++) {
      const value = Math.floor(pixels[i] * 255);
      imageData.data[i * 4] = value;     // R
      imageData.data[i * 4 + 1] = value; // G
      imageData.data[i * 4 + 2] = value; // B
      imageData.data[i * 4 + 3] = 255;   // A
    }

    ctx.putImageData(imageData, 0, 0);
  }, [pixels]);

  return (
    <canvas
      ref={canvasRef}
      width={28}
      height={28}
      className={className}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated'
      }}
    />
  );
}

// Grid of MNIST images
interface MNISTGridProps {
  images: { pixels: number[]; label: number }[];
  imageSize?: number;
  cols?: number;
  showLabels?: boolean;
  className?: string;
}

export function MNISTGrid({
  images,
  imageSize = 28,
  cols = 5,
  showLabels = false,
  className = ''
}: MNISTGridProps) {
  return (
    <div
      className={`grid gap-1 ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {images.map((img, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <MNISTImage pixels={img.pixels} size={imageSize} className="rounded" />
          {showLabels && (
            <span className="text-xs text-muted-foreground mt-0.5">
              {img.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
