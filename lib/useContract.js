// lib/useContract.js
// reusable hook that returns a contract instance
// uses the signer for writes, provider for reads — same as class pattern

import { ethers } from "ethers";
import { useWallet } from "@/context/WalletContext";
import { CONTRACT_ADDRESS } from "./contract";
import { ABI } from "./splitchain-abi";

export function useContract() {
  const { signer, provider } = useWallet();

  // contract with signer — for write functions (createGroup, addExpense, settleDebt)
  const writeContract = signer
    ? new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
    : null;

  // contract with provider — for read functions (getMembers, getBalance, etc)
  const readContract = provider
    ? new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
    : null;

  return { writeContract, readContract };
}