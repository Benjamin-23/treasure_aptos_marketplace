"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AptosClient } from "aptos";
import { useEffect, useState } from "react";

export default function NFTList({ onSelectNFT }: any) {
  //   public entry fun list_nft_for_sale(account: &signer, nft_index: u64, starting_price: u64, auction_end_time: u64) acquires Marketplace {
  //     let seller_addr = signer::address_of(account);
  //     assert!(check_marketplace_initialized(seller_addr), error::not_found(E_MARKETPLACE_NOT_INITIALIZED));
  //     let marketplace = borrow_global_mut<Marketplace>(seller_addr);
  //     let listing = vector::borrow_mut(&mut marketplace.listings, nft_index);
  //     assert!(listing.owner == seller_addr, error::permission_denied(E_NOT_SELLER));
  //     listing.starting_price = starting_price;
  //     listing.current_bid = starting_price;
  //     listing.current_price = starting_price;
  //     listing.auction_end_time = auction_end_time;

  // }
  //   create function to list nfts for sale using  (list_nft_for_sale)
  const [nfts, setNfts] = useState([]);
  const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
  const marketplaceAddr =
    "0xc74780df02fd2743c427a14a8b2bdb627f0fb41847a4043bd7672474c356e710";

  const getNFTs = async () => {
    try {
      const resource = await client.getAccountResource(
        marketplaceAddr,
        `${marketplaceAddr}::NFTMarketplace::Marketplace`
      );
      if (resource && resource.data && (resource.data as any).listings) {
        setNfts((resource.data as any).listings);
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  useEffect(() => {
    getNFTs();
  }, []);

  const decodeHex = (hex: any) => {
    try {
      const clean = hex.replace("0x", "");
      const bytes = new Uint8Array(
        clean.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16))
      );
      return new TextDecoder().decode(bytes);
    } catch (e) {
      return "";
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: any) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  // Format address to shorter version
  const formatAddress = (address: any) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  return (
    <div className=" flex gap-4 justify-center items-center space-y-4">
      {nfts &&
        nfts.map((nft: any) => {
          return (
            <Card className="w-full max-w-2xl" key={nft.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {/* <img src={decodeHex(nft.url)} alt="loading" /> */}
                  <span>{decodeHex(nft.name)}</span>
                  <Badge variant={nft.is_sold ? "destructive" : "secondary"}>
                    {nft.is_sold ? "Sold" : "Active"}
                  </Badge>
                </CardTitle>
                {decodeHex(nft.name)}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p>{decodeHex(nft.description)}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span className="font-semibold">Current Price:</span>
                      <span>{nft.current_price * 10000000} APTS</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">Ends:</span>
                      <span>{formatDate(nft.auction_end_time)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-semibold">Owner:</span>
                      <span className="font-mono">
                        {formatAddress(nft.owner)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-semibold">Highest Bidder:</span>
                      <span className="font-mono">
                        {formatAddress(nft.highest_bidder)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-gray-500">
                    Starting Price: {nft.starting_price} ETH
                    {nft.url !== "0x" && ` • URL: ${decodeHex(nft.url)}`}
                  </p>
                </div>
              </CardContent>
              <Button onClick={() => onSelectNFT(nft)}>Place Bid</Button>
            </Card>
          );
        })}
    </div>
  );
}
