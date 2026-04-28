"use client";
// context/WalletContext.jsx
// this file holds the wallet state so every page can access it
// using the same ethers v5 pattern from class (Web3Provider -> getSigner)

import { createContext, useContext, useState } from "react";
import { ethers } from "ethers";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState("");

  async function connectWallet() {
    if (!window.ethereum) {
      alert("install metamask first");
      return;
    }

    try {
      // ask metamask to connect and get the user's address
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // set up provider (for reading) and signer (for writing/signing txs)
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      const _signer = _provider.getSigner();

      setProvider(_provider);
      setSigner(_signer);
      setAddress(accounts[0]);

      // reload if user switches wallet or network
      window.ethereum.on("accountsChanged", () => window.location.reload());
      window.ethereum.on("chainChanged", () => window.location.reload());

    } catch (err) {
      console.error("connection failed:", err.message);
    }
  }

  return (
    <WalletContext.Provider value={{ provider, signer, address, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

// custom hook so any component can just do: const { address } = useWallet()
export function useWallet() {
  return useContext(WalletContext);
}