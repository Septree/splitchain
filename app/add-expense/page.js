// add expense — form to log a new expense to the group, writes to the contract

"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { useContract } from "@/lib/useContract";
import WalletConnect from "@/components/WalletConnect";
import { ethers } from "ethers";

function AddExpenseInner() {
  const { address } = useWallet();
  const { writeContract } = useContract();
  const searchParams = useSearchParams();
  const router = useRouter();

  const groupId = searchParams.get("id");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [txPending, setTxPending] = useState(false);
  const [error, setError] = useState("");

  async function handleAddExpense() {
    if (!description || !amount || !writeContract) return;
    setError("");

    try {
      setTxPending(true);
      const amountInWei = ethers.utils.parseEther(amount);
      const tx = await writeContract.addExpense(groupId, description, amountInWei);
      await tx.wait();
      router.push(`/group?id=${groupId}`);
    } catch (err) {
      console.error("failed to add expense:", err.message);
      setError("transaction failed or was rejected");
    } finally {
      setTxPending(false);
    }
  }

  if (!address) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-400">connect your wallet to continue</p>
        <WalletConnect />
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.push(`/group?id=${groupId}`)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← back
        </button>
        <WalletConnect />
      </div>

      <h1 className="text-3xl font-bold text-green-400 mb-2">add expense</h1>
      <p className="text-gray-500 text-sm mb-8">this just records the expense — no ETH is transferred</p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-sm">description</label>
          <input
            type="text"
            placeholder="e.g. dinner at nobu"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-sm">amount (in ETH)</label>
          <input
            type="number"
            placeholder="e.g. 0.01"
            step="0.001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleAddExpense}
          disabled={txPending}
          className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold px-4 py-3 rounded-lg transition-colors mt-2"
        >
          {txPending ? "waiting for metamask..." : "add expense"}
        </button>
      </div>
    </main>
  );
}

export default function AddExpense() {
  return (
    <Suspense fallback={<p className="text-gray-500 p-10">loading...</p>}>
      <AddExpenseInner />
    </Suspense>
  );
}