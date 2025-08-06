import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { UpdatePrompt } from "@/components/pwa/UpdatePrompt";
import { Footer } from "@/components/layout/Footer";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Estudiantes - Plataforma de Estudio Colaborativa",
  description: "Plataforma web para estudiantes universitarios, terciarios y autodidactas. Organiza tus estudios, comparte apuntes y potencia tu aprendizaje.",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "E-Estudiantes",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.className} antialiased bg-gray-50 min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <InstallPrompt />
          <UpdatePrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
