"use client";
import React from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";

export function WalletConnectButton() {
  const { connect, disconnect, wallet, connected } = useWallet();

  return (
    <Button
      onClick={() => {
        connected ? disconnect : connect;
      }}
      variant={connected ? "destructive" : "default"}
    >
      {connected ? `Disconnect (${wallet?.name})` : "Connect Wallet"}
    </Button>
  );
}
