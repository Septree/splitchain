// components/WalletConnect.jsx
// button that connects the wallet and shows the address when connected

import { useWallet } from "@/context/WalletContext";

export default function WalletConnect() {
  const { address, connectWallet } = useWallet();

  return (
    <button
      onClick={connectWallet}
      className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
    >
      {address
        ? `✓ ${address.slice(0, 6)}...${address.slice(-4)}`
        : "Connect Wallet"}
    </button>
  );
}