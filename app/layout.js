// app/layout.js
// root layout — wraps every page with the wallet provider
// so wallet state is available everywhere in the app

import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";

export const metadata = {
  title: "SplitChain",
  description: "split expenses on-chain with friends",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}