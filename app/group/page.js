"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { useContract } from "@/lib/useContract";
import WalletConnect from "@/components/WalletConnect";
import Link from "next/link";
import { ethers } from "ethers";

export default function GroupPage() {
    const { address } = useWallet();
    const { readContract } = useContract();
    const searchParams = useSearchParams();
    const router = useRouter();

    const groupId = searchParams.get("id");

    const [groupName, setGroupName] = useState("");
    const [members, setMembers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        if (!readContract || groupId === null || fetched) return;
        fetchGroupData();
    }, [readContract, groupId]);

    async function fetchGroupData() {
        try {
        setLoading(true);
        setFetched(true);

        // get group name
        const group = await readContract.groups(groupId);
        setGroupName(group.name);

        // get members
        const memberList = await readContract.getMembers(groupId);
        setMembers(memberList);

        // get all expenses
        const count = await readContract.getExpenseCount(groupId);
        const total = count.toNumber();

        const expenseList = [];
        for (let i = 0; i < total; i++) {
            const expense = await readContract.getExpense(groupId, i);
            expenseList.push({
            paidBy: expense[0],
            description: expense[1],
            amount: expense[2],
            timestamp: expense[3],
            });
        }

        setExpenses(expenseList);
        } catch (err) {
        console.error("failed to fetch group data:", err.message);
        } finally {
        setLoading(false);
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

    if (loading) {
        return (
        <main className="flex items-center justify-center min-h-screen">
            <p className="text-gray-500">loading group...</p>
        </main>
        );
    }

    return (
        <main className="max-w-2xl mx-auto px-4 py-10">

        {/* header */}
        <div className="flex items-center justify-between mb-8">
            <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-white transition-colors"
            >
            ← back
            </button>
            <WalletConnect />
        </div>

        {/* group name */}
        <h1 className="text-3xl font-bold text-green-400 mb-8">{groupName}</h1>

        {/* members */}
        <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-3">members</h2>
            <div className="flex flex-col gap-2">
            {members.map((member, i) => (
                <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 font-mono"
                >
                {member.toLowerCase() === address.toLowerCase()
                    ? `${member} (you)`
                    : member}
                </div>
            ))}
            </div>
        </div>

        {/* expenses header + add button */}
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">expenses</h2>
            <Link
            href={`/add-expense?id=${groupId}`}
            className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
            + add expense
            </Link>
        </div>

        {/* expenses list */}
        {expenses.length === 0 ? (
            <p className="text-gray-500">no expenses yet — add one above</p>
        ) : (
            <div className="flex flex-col gap-3">
            {expenses.map((expense, i) => (
                <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5"
                >
                <div className="flex items-center justify-between">
                    <p className="text-white font-semibold">{expense.description}</p>
                    <p className="text-green-400 font-semibold">
                    {ethers.utils.formatEther(expense.amount)} ETH
                    </p>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                    paid by {expense.paidBy.toLowerCase() === address.toLowerCase()
                    ? "you"
                    : `${expense.paidBy.slice(0, 6)}...${expense.paidBy.slice(-4)}`}
                </p>
                </div>
            ))}
            </div>
        )}

        </main>
    );
}