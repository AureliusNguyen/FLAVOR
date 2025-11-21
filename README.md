# FLAVOR

**Federated Learning Analytics, Visualization, Optimization & Reliability**

An interactive visualization of privacy-preserving federated learning with Shamir Secret Sharing.

## Features

- **9 Interactive Sections** with 38 total steps
- **Shamir Secret Sharing Scheme** implementation (7-of-10 threshold)
- **FedAvg Algorithm** visualization
- **MNIST Dataset** simulation with non-IID distribution
- **Dark/Light Theme** toggle
- **Keyboard Navigation** (Arrow keys, Space)

## Sections

1. **Intro** - What is Federated Learning?
2. **Data Distribution** - MNIST across 10 clients
3. **Local Training** - Client-side model training
4. **Shamir Secret Sharing** - Deep dive into the cryptography
5. **Secure Aggregation** - Combining shares privately
6. **FedAvg** - Weighted averaging algorithm
7. **Global Model** - Model update process
8. **Convergence** - Multi-round training progress
9. **Summary** - Results and next steps

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Framer Motion** (animations)
- **D3.js** (visualizations ready)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
