import type { Metadata } from "next";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Software Auction CRM",
  description: "Личная CRM для рынка-аукциона дорогого B2B SaaS",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/software-auction-icon.svg", apple: "/software-auction-icon.svg" },
  appleWebApp: { capable: true, title: "Auction CRM", statusBarStyle: "black-translucent" },
};

export default function AuctionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PwaRegister />
      {children}
    </>
  );
}
