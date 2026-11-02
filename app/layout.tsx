import type { Metadata } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'ZYRVAE Intelligence | Dashboard',
  description: 'Detector de oportunidades comerciales y CRM para prospección B2B.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={cn("dark font-sans", geist.variable)}>
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-blue-600/30">
        {children}
      </body>
    </html>
  );
}
