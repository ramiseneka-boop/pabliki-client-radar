import "./globals.css";
import type { Metadata, Viewport } from "next";
import Sidebar from "@/components/Sidebar";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Pabliki Client Radar",
  description: "AI-система мониторинга рекламного спроса по Казахстану",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/software-auction-icon.svg", apple: "/software-auction-icon.svg" },
  appleWebApp: { capable: true, title: "Auction CRM", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <PwaRegister />
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
