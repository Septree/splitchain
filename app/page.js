// app/page.js
// landing page  user connects their wallet here
// once connected, they get redirected to the dashboard

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import WalletConnect from "@/components/WalletConnect";
import { useWallet } from "@/context/WalletContext";

export default function Home() {
    const { address } = useWallet();
    const router = useRouter();

    // redirect to dashboard once wallet is connected
    useEffect(() => {
      if (address) {
        router.push("/dashboard");
      }
    }, [address]);

    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <h1 className="text-5xl font-bold text-green-400">SplitChain</h1>
        <p className="text-gray-400 text-lg text-center max-w-md">
          split expenses with friends. settle debts on-chain. no banks. no trust issues.
        </p>
        <WalletConnect />
      </main>
    );
  }