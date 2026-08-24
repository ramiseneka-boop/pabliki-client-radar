import Link from "next/link";
import AuctionApp from "@/components/auction/AuctionApp";

export const metadata = {
  title: "Software Auction CRM",
  description: "Личная CRM для рынка-аукциона дорогого B2B SaaS",
};

export default function SoftwareAuctionPage() {
  return (
    <>
      <AuctionApp />
      <Link
        href="/auction/playbook"
        className="fixed bottom-20 right-4 z-40 rounded-full bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xl lg:bottom-6"
      >
        ▶ Playbook
      </Link>
    </>
  );
}
