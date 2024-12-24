"use client";
import React, { useState } from "react";
import CreateNFTForm from "@/components/CreateNFTForm";
import { AptosClient } from "aptos";

export default function MintPage() {
  // NFT Interaction Functions
  // State management
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [bidAmount, setBidAmount] = useState("");

  // Aptos client configuration
  const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");

  const marketplaceAddr =
    "0xc74780df02fd2743c427a14a8b2bdb627f0fb41847a4043bd7672474c356e710";
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
      // reset inputs
      nftData.name = "";
      nftData.description = "";
      nftData.url = "";
      nftData.startingPrice = "";
      //   redirect to myCollection page
      window.location.href = "/myCollection";
      return {
        txn,
        nftIndex,
      };
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    }
  };

  // Helper function to get NFT index
  const getNFTIndex = async (address: string) => {
    try {
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
  return (
    <div className="container mx-auto p-4">
      <CreateNFTForm onSelectNFT={setSelectedNFT} onMint={mintNFT} />
    </div>
  );
}
