"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AptosClient } from "aptos";
import NFTList from "@/components/NFTList";
import CreateNFTForm from "@/components/CreateNFTForm";
import NFTDetailDialog from "@/components/NFTDetailDialog";

// Main NFT Marketplace Component
export default function NFTMarketplace() {
  // State management
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [bidAmount, setBidAmount] = useState("");

  // Aptos client configuration
  const client = new AptosClient("https://fullnode.devnet.aptoslabs.com/v1");

  const marketplaceAddr =
    "0xc74780df02fd2743c427a14a8b2bdb627f0fb41847a4043bd7672474c356e710";
  // NFT Interaction Functions
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

  const placeBid = async (values: { nftId: string; bidAmount: string }) => {
    try {
      const nftId = Array.from(new TextEncoder().encode(values.nftId));
      const bidAmount = Array.from(new TextEncoder().encode(values.bidAmount));
      // Implementation of bid placement
      const transaction = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplaceV2::place_bid}`,
        arguments: [nftId, bidAmount],
        type_arguments: [],
      };
      const signedTxn = await (window as any).aptos.signTransaction(
        transaction
      );
      const res = await client.submitTransaction(signedTxn);
      console.log("Transaction submitted:", res);

      // This would call the contract's place_bid function
    } catch (error) {
      console.error("Bid placement failed", error);
    }
  };

  // name: vector<u8>, description: vector<u8>, _is_sold
  // : bool, starting_price: u64, current_price: u64, url: vector<u8>, _owner: address, highest_bidder: address, auction_end_time: u64

  const mintNFT = async (nftData: {
    name: string;
    description: string;
    url: string;
    startingPrice: string;
  }) => {
    try {
      const { petra }: any = window;
      if (!petra) throw new Error("Petra wallet not found");

      // Get the connected account
      const account = await petra.account();
      if (!account) throw new Error("No account connected");

      // Convert price to number (Aptos uses octas - 8 decimal places)
      const startingPrice = Math.floor(
        Number(nftData.startingPrice) * 100000000
      );

      // Convert strings to byte arrays
      const nameBytes = Array.from(new TextEncoder().encode(nftData.name));
      const descriptionBytes = Array.from(
        new TextEncoder().encode(nftData.description)
      );
      const urlBytes = Array.from(new TextEncoder().encode(nftData.url));

      // Calculate auction end time (24 hours from now)
      const auctionEndTime = Math.floor(Date.now() / 1000) + 86400;

      const payload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplace::mint_ntf`,
        type_arguments: [],
        arguments: [
          nameBytes,
          descriptionBytes,
          false,
          startingPrice,
          startingPrice,
          urlBytes,
          account.address,
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          auctionEndTime,
        ],
      };

      // Submit transaction
      const pendingTransaction = await petra.signAndSubmitTransaction({
        payload,
      });

      // Wait for transaction confirmation
      const client = new AptosClient("https://fullnode.devnet.aptoslabs.com");
      const txn = await client.waitForTransaction(pendingTransaction.hash);

      const nftIndex = await getNFTIndex(account.address);
      return {
        txn,
        nftIndex,
      };
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    }
  };

  type NFT = {
    id: number;
    owner: string;
    name: string;
    description: string;
    url: string;
    is_sold: boolean;
    starting_price: number;
    current_price: number;
    highest_bidder: string;
    auction_end_time: number;
  };

  // List NFT Function
  useEffect(() => {
    listNFT(0, 0.00000001);
  }, []);
  const listNFT = async (nftIndex: any, startingPrice: number) => {
    try {
      const { petra }: any = window;
      if (!petra) throw new Error("Petra wallet not found");

      const account = await petra.account();
      if (!account) throw new Error("No account connected");

      const auctionEndTime = Math.floor(Date.now() / 1000) + 86400;

      const listPayload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplace::list_nft_for_sale`,
        type_arguments: [],
        arguments: [nftIndex, startingPrice, auctionEndTime],
      };

      const listTxn = await petra.signAndSubmitTransaction(listPayload);
      const client = new AptosClient("https://fullnode.devnet.aptoslabs.com");
      return await client.waitForTransaction(listTxn.hash);
    } catch (error) {
      console.error("Error listing NFT:", error);
      throw error;
    }
  };

  // Helper function to get NFT index
  const getNFTIndex = async (address: string) => {
    try {
      const client = new AptosClient("https://fullnode.devnet.aptoslabs.com");
      const resource = await client.getAccountResource(
        address,
        `${marketplaceAddr}::NFTMarketplace::Marketplace`
      );
      if (!resource || !resource.data || !resource.data.listings) {
        return -1;
      }
      const listings = resource.data.listings;
      console.log(listings, "listings");
      // Update nfts state with fetched listings
      setNfts(listings);
      console.log(nfts, "nfts after update");
      return resource.data.listings.length - 1;
    } catch (error) {
      console.error("Error getting NFT index:", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">NFT Marketplace</CardTitle>
        </CardHeader>
        <CardContent>
          {!walletAddress ? (
            <Button onClick={connectWallet}>Connect Wallet</Button>
          ) : (
            <Tabs defaultValue="marketplace">
              <Button onClick={logout}>Logout</Button>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                <TabsTrigger value="create">Create NFT</TabsTrigger>
              </TabsList>

              <TabsContent value="marketplace">
                <NFTList nfts={nfts} onSelectNFT={setSelectedNFT} />
              </TabsContent>

              <TabsContent value="create">
                <CreateNFTForm onMint={mintNFT} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {selectedNFT && (
        <NFTDetailDialog nft={selectedNFT} onPlaceBid={placeBid} />
      )}
    </div>
  );
}
