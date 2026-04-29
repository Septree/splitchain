"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { useContract } from "@/lib/useContract";
import WalletConnect from "@/components/WalletConnect";
import { ethers } from "ethers";

export default function AddExpense() {
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

        // convert eth amount to wei — same as class pattern
        const amountInWei = ethers.utils.parseEther(amount);

        // send transaction — metamask will pop up
        const tx = await writeContract.addExpense(groupId, description, amountInWei);
        await tx.wait();

        // go back to group page after success
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

        {/* header */}
        <div className="flex items-center justify-between mb-8">
            <button
            onClick={() => router.push(`/group?id=${groupId}`)}
            className="text-gray-400 hover:text-white transition-colors"
            >
            ← back
            </button>
            <WalletConnect />
        </div>

        <h1 className="text-3xl font-bold text-green-400 mb-8">add expense</h1>

        {/* form */}
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

            {/* error message */}
            {error && (
            <p className="text-red-400 text-sm">{error}</p>
            )}

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