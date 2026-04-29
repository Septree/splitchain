// settlement  shows who owes what and lets users send ETH to settle up

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { useContract } from "@/lib/useContract";
import WalletConnect from "@/components/WalletConnect";
import { ethers } from "ethers";

export default function Settlement() {
    const { address } = useWallet();
    const { readContract, writeContract } = useContract();
    const searchParams = useSearchParams();
    const router = useRouter();

    const groupId = searchParams.get("id");

    const [members, setMembers] = useState([]);
    const [balances, setBalances] = useState({});
    const [groupName, setGroupName] = useState("");
    const [loading, setLoading] = useState(true);
    const [fetched, setFetched] = useState(false);
    const [txPending, setTxPending] = useState(false);
    const [settleAddress, setSettleAddress] = useState("");
    const [settleAmount, setSettleAmount] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!readContract || groupId === null || fetched) return;
        fetchBalances();
    }, [readContract, groupId]);

    async function fetchBalances() {
        try {
        setLoading(true);
        setFetched(true);

        // get group info
        const group = await readContract.groups(groupId);
        setGroupName(group.name);

        // get members
        const memberList = await readContract.getMembers(groupId);
        setMembers(memberList);

        // get balance for each member
        const balanceMap = {};
        for (let i = 0; i < memberList.length; i++) {
            const bal = await readContract.getBalance(groupId, memberList[i]);
            balanceMap[memberList[i].toLowerCase()] = bal;
        }

        setBalances(balanceMap);
        } catch (err) {
        console.error("failed to fetch balances:", err.message);
        } finally {
        setLoading(false);
        }
    }

    async function handleSettle() {
        if (!settleAddress || !settleAmount || !writeContract) return;
        setError("");

        try {
        setTxPending(true);

        // send ETH to the person you owe — payable function
        const tx = await writeContract.settleDebt(
            groupId,
            settleAddress,
            { value: ethers.utils.parseEther(settleAmount) }
        );
        await tx.wait();

        // refetch balances after settling
        setFetched(false);
        setSettleAddress("");
        setSettleAmount("");
        } catch (err) {
        console.error("failed to settle:", err.message);
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

    if (loading) {
        return (
        <main className="flex items-center justify-center min-h-screen">
            <p className="text-gray-500">loading balances...</p>
        </main>
        );
    }

    // my balance in this group
    const myBalance = address ? balances[address.toLowerCase()] : null;
    const myBalanceEth = myBalance
        ? ethers.utils.formatEther(myBalance.abs ? myBalance : myBalance.toString())
        : "0";

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

        <h1 className="text-3xl font-bold text-green-400 mb-2">settle up</h1>
        <p className="text-gray-500 mb-8">{groupName}</p>

        {/* balances for all members */}
        <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-3">balances</h2>
            <div className="flex flex-col gap-2">
            {members.map((member, i) => {
                const bal = balances[member.toLowerCase()];
                const isPositive = bal && bal.gte(0);
                const balEth = bal
                ? ethers.utils.formatEther(bal.gte(0) ? bal : bal.mul(-1))
                : "0";
                const isYou = member.toLowerCase() === address.toLowerCase();

                return (
                <div
                    key={i}
                    className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between"
                >
                    <p className="text-gray-300 text-sm font-mono">
                    {isYou
                        ? "you"
                        : `${member.slice(0, 6)}...${member.slice(-4)}`}
                    </p>
                    <p className={`font-semibold text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
                    {isPositive ? `+${balEth}` : `-${balEth}`} ETH
                    </p>
                </div>
                );
            })}
            </div>
        </div>

        {/* settle form */}
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-white">send payment</h2>

            <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">pay to (address)</label>
            <input
                type="text"
                placeholder="0x..."
                value={settleAddress}
                onChange={(e) => setSettleAddress(e.target.value)}
                className="bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
            />
            </div>

            <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">amount (in ETH)</label>
            <input
                type="number"
                placeholder="e.g. 0.001"
                step="0.001"
                min="0"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                className="bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
            />
            </div>

            {error && (
            <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
            onClick={handleSettle}
            disabled={txPending}
            className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold px-4 py-3 rounded-lg transition-colors"
            >
            {txPending ? "waiting for metamask..." : "settle debt"}
            </button>
        </div>

        </main>
    );
    }