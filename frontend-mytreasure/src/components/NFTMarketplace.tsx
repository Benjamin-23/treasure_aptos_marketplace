"use client";
import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletConnectButton } from "./WalletConnectButton";
import CreateNFTForm from "./CreateNFTForm";
import NFTList from "./NFTList";
import NFTDetailDialog from "./NFTDetailDialog";

export default function NFTMarketplace() {
  const { connected, account } = useWallet();
  const [selectedNFT, setSelectedNFT] = useState(null);

  // Placeholder functions - will need actual implementation
  const mintNFT = async (nftData: any) => {
    if (!connected || !account) {
      alert("Please connect wallet first");
      return;
    }

    // Implement NFT minting logic using Aptos SDK
    console.log("Minting NFT:", nftData);
  };

  const placeBid = async (nftId: any, bidAmount: any) => {
    if (!connected || !account) {
      alert("Please connect wallet first");
      return;
    }

    // Implement bid placement logic
    console.log("Placing bid:", { nftId, bidAmount });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-2xl">NFT Marketplace</CardTitle>
        <WalletConnectButton />
      </CardHeader>

      <CardContent>
        {connected ? (
          <Tabs defaultValue="marketplace">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="create">Create NFT</TabsTrigger>
            </TabsList>

            <TabsContent value="marketplace">
              <NFTList onSelectNFT={setSelectedNFT} />
            </TabsContent>

            <TabsContent value="create">
              <CreateNFTForm onMint={mintNFT} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p>Please connect your wallet to interact with the marketplace</p>
          </div>
        )}
      </CardContent>

      {selectedNFT && (
        <NFTDetailDialog nft={selectedNFT} onPlaceBid={placeBid} />
      )}
    </Card>
  );
}
