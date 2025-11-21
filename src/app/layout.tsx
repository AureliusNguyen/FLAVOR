import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MNISTProvider } from "@/context/mnist-context";
import { VisualizationProvider } from "@/context/visualization-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FLAVOR - Federated Learning Analytics, Visualization, Optimization & Reliability",
  description: "Interactive visualization of Federated Learning with Shamir Secret Sharing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MNISTProvider>
            <VisualizationProvider>
              {children}
            </VisualizationProvider>
          </MNISTProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
