// navbar with MarketPlace, Collection an a connect div having a drop down [ account balance, logout button and wallet address]
"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AptosClient } from "aptos";

export default function TopNav() {
  const [walletAddress, setWalletAddress] = useState("");
  const [bidAmount, setBidAmount] = useState("");

  // Aptos client configuration
  const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");

  const marketplaceAddr =
    "0xc74780df02fd2743c427a14a8b2bdb627f0fb41847a4043bd7672474c356e710";
  // NFT Interaction Functions
  // if connected let it connect even in different page
  const getAccountBalance = async () => {
    if (!walletAddress) return;
    try {
      const balance = await client.getAccountResources(walletAddress);
      console.log(balance);
    } catch (error) {
      console.error("Failed to get account balance:", error);
    }
  };

  useEffect(() => {
    getAccountBalance();
  }, [walletAddress]);

  const connectWallet = async () => {
    if ((window as any).aptos) {
      try {
        const wallet = await (window as any).aptos.connect();
        console.log(wallet.address);
        setWalletAddress(wallet.address);
      } catch (error) {
        console.error("Wallet connection failed", error);
      }
    }
  };
  // logout  function  and disconnect
  const logout = async () => {
    if ((window as any).aptos) {
      try {
        await (window as any).aptos.disconnect();
        setWalletAddress("");
      } catch (error) {
        console.error("Wallet disconnection failed", error);
      }
    }
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <div>
            <a href="/marketPlace" className="text-white hover:underline">
              Marketplace
            </a>
          </div>
          <div>
            <a href="/myCollection" className="text-white hover:underline">
              My Collection
            </a>
          </div>
          {/* mint */}
          <div>
            <a href="/mint" className="text-white hover:underline">
              Mint
            </a>
          </div>
        </div>
        <div>
          <ul className="flex space-x-4">
            {walletAddress ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="primary">
                    {walletAddress.slice(0, 6)}...
                    {walletAddress.slice(-4)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={logout}>
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => {
                  connectWallet();
                }}
              >
                Connect Wallet
              </Button>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
