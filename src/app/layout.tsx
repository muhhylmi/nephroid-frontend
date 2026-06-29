import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "NephroAid - Asisten Virtual Pasien Gagal Ginjal Kronis",
  description:
    "Asisten virtual berbasis AI (RAG) untuk membantu pasien Gagal Ginjal Kronis (GGK) mendapatkan informasi harian, diet, cairan, dan hemodialisis dari diskusi komunitas tepercaya.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased selection:bg-primary/20 selection:text-primary`}
    >
      <body className="h-full overflow-hidden flex flex-col bg-background text-foreground transition-colors duration-300">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

