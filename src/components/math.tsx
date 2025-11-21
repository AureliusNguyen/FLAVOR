"use client"

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathProps {
  children: string;
  display?: boolean;
  className?: string;
}

export function Math({ children, display = false, className = '' }: MathProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      katex.render(children, containerRef.current, {
        displayMode: display,
        throwOnError: false,
        trust: true,
      });
    }
  }, [children, display]);

  return (
    <span
      ref={containerRef}
      className={`${display ? 'block my-4 text-center' : 'inline'} ${className}`}
    />
  );
}

// Block-level math display
export function MathBlock({ children, className = '' }: Omit<MathProps, 'display'>) {
  return <Math display={true} className={className}>{children}</Math>;
}
