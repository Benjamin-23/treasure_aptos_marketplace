// create my collection page where after minting with a sell button so that if i click sell button its shows on my marketplace page
"use client";
import React, { useEffect, useState } from "react";
import { AptosClient } from "aptos";
import NFTList from "@/components/NFTList";

export default function MyCollection() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
  // Helper function to format addresses
  const formatAddress = (address: string): string => {
    return address.startsWith("0x")
      ? address.slice(2).padStart(64, "0")
      : address.padStart(64, "0");
  };
  const marketplaceAddr = formatAddress(
    "0xc74780df02fd2743c427a14a8b2bdb627f0fb41847a4043bd7672474c356e710"
  );
  const getMyNFTs = async () => {
    try {
      const { petra }: any = window;
      if (!petra) throw new Error("Petra wallet not found");
      const account = await petra.account();
      if (!account) throw new Error("No account connected");
      const resource = await client.getAccountResource(
        account.address,
        `${marketplaceAddr}::NFTMarketplace::Marketplace`
      );
      if (
        resource &&
        resource.data &&
        (resource.data as { listings: NFT[] }).listings
      ) {
        setNfts((resource.data as { listings: NFT[] }).listings);
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  useEffect(() => {
    getMyNFTs();
  }, []);

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

  // create a sell function that transfer the nft to  market place
  // nft_index: u64, receiver: address, price: u64
  const sellNFT = async (nftId: any) => {
    try {
      if (!nftId || !nftId.starting_price) {
        throw new Error("Invalid NFT data");
      }

      const { petra }: any = window;
      if (!petra) throw new Error("Petra wallet not found");

      const account = await petra.account();
      if (!account) throw new Error("No account connected");

      // Convert and format values
      const priceInApt = parseFloat(nftId.starting_price);
      const priceInOctas = Math.floor(priceInApt * 100000000).toString();

      const payload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplace::sell_nft_to_marketplace`,
        type_arguments: [],
        arguments: [
          nftId.owner, // receiver address
          nftId.id.toString(), // nft_index
          priceInOctas, // price in octas
        ],
      };

      console.log("Payload:", payload); // For debugging

      const pendingTransaction = await petra.signAndSubmitTransaction({
        payload,
      });

      await client.waitForTransaction(pendingTransaction.hash);
      console.log("NFT listed successfully:", pendingTransaction.hash);

      getMyNFTs();
    } catch (error) {
      console.error("Error selling NFT:", error);
      alert(error instanceof Error ? error.message : "Error selling NFT");
    }
  };

  return (
    <div>
      <h1 className=" text-center text-2xl font-bold mb-4">My Collection</h1>
      <NFTList nfts={nfts} onSelectNFT={sellNFT} />
    </div>
  );
}
