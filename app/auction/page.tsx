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
      <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2 lg:bottom-6">
        <Link
          href="/auction/base"
          className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-xl"
        >
          💬 Моя база
        </Link>
        <Link
          href="/auction/playbook"
          className="rounded-full bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xl"
        >
          ▶ Playbook
        </Link>
      </div>
    </>
  );
}
