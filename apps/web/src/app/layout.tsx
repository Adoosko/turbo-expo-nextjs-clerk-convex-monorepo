import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Nunito } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["800"],
});

export const metadata: Metadata = {
  title: "Finik Farma",
  description: "Osobná aplikácia na sledovanie hospodárstva a záhrady pre rodinu Finik.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk">
      <body
        className={cn(
          inter.variable,
          nunito.variable,
          "bg-bg-base text-text-primary font-inter antialiased min-h-screen"
        )}
      >
        <ClerkProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

