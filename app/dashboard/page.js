"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { useContract } from "@/lib/useContract";
import WalletConnect from "@/components/WalletConnect";
import Link from "next/link";

export default function Dashboard() {
  const { address } = useWallet();
  const { readContract, writeContract } = useContract();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [txPending, setTxPending] = useState(false);
  const [fetched, setFetched] = useState(false);

  // only fetch once when contract and address are both ready
  useEffect(() => {
    if (!readContract || !address || fetched) return;
    fetchGroups();
  }, [readContract, address]);

  async function fetchGroups() {
    try {
      setLoading(true);
      setFetched(true);

      const count = await readContract.groupCount();
      const total = count.toNumber();

      const myGroups = [];

      for (let i = 0; i < total; i++) {
        const members = await readContract.getMembers(i);
        const isMember = members
          .map((m) => m.toLowerCase())
          .includes(address.toLowerCase());

        if (isMember) {
          const group = await readContract.groups(i);
          myGroups.push({ id: i, name: group.name, members });
        }
      }

      setGroups(myGroups);
    } catch (err) {
      console.error("failed to fetch groups:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup() {
    if (!groupName || !writeContract) return;

    const memberList = memberInput
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    try {
      setTxPending(true);
      const tx = await writeContract.createGroup(groupName, memberList);
      await tx.wait();

      setGroupName("");
      setMemberInput("");
      setShowForm(false);
      setFetched(false); // allow refetch after creating
    } catch (err) {
      console.error("failed to create group:", err.message);
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
    <main className="max-w-2xl mx-auto px-4 py-10">

      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-green-400">SplitChain</h1>
        <WalletConnect />
      </div>

      {/* create group button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">your groups</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + new group
        </button>
      </div>

      {/* create group form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 flex flex-col gap-3">
          <input
            type="text"
            placeholder="group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="member addresses (comma separated)"
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleCreateGroup}
            disabled={txPending}
            className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {txPending ? "waiting for metamask..." : "create group"}
          </button>
        </div>
      )}

      {/* groups list */}
      {loading ? (
        <p className="text-gray-500">loading groups...</p>
      ) : groups.length === 0 ? (
        <p className="text-gray-500">no groups yet — create one above</p>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/group?id=${group.id}`}
              className="bg-gray-900 border border-gray-800 hover:border-green-500 rounded-xl p-5 transition-colors"
            >
              <p className="text-white font-semibold text-lg">{group.name}</p>
              <p className="text-gray-500 text-sm mt-1">
                {group.members.length} members
              </p>
            </Link>
          ))}
        </div>
      )}

    </main>
  );
}