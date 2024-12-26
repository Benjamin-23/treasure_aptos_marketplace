"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AptosClient } from "aptos";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NFTList({ onSelectNFT }: any) {
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
  // handle place a bid
  //  bidder: &signer,
  // seller_addr: address,
  // nft_index: u64,
  // bid_amount: u64

  const placeBid = async (nft: any) => {
    try {
      const { petra }: any = window;
      if (!petra) throw new Error("Petra wallet not found");

      const account = await petra.account();
      if (!account) throw new Error("No account connected");

      const bidAmount = 0.00000005; // Replace with the actual bid amount
      // const bidAmountInOctas = Math.floor(
      //   Number(nft.starting_price) * 100000000
      // );

      const payload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplace::place_bid`,
        type_arguments: [],
        arguments: [
          account.address,
          nft.owner,
          nft.id,
          nft.starting_price / 10000000,
        ],
      };

      const pendingTransaction = await petra.signAndSubmitTransaction({
        payload,
      });

      await client.waitForTransaction(pendingTransaction.hash);
      console.log("Bid placed successfully!");
      getNFTs(); // Refresh NFT list after placing a bid
    } catch (error) {
      console.error("Error placing bid:", error);
    }
  };

  return (
    <div className=" flex flex-wrap gap-4 justify-center items-center space-y-4">
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
                      <span>{nft.current_price / 10000000} APTS</span>
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
                    Starting Price: {nft.starting_price / 10000000} ETH
                    {nft.url !== "0x" && ` • URL: ${decodeHex(nft.url)}`}
                  </p>
                </div>
              </CardContent>
              {/* Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Place a bid</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're
                      done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        defaultValue="Pedro Duarte"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="username" className="text-right">
                        Username
                      </Label>
                      <Input
                        id="username"
                        defaultValue="@peduarte"
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={() => placeBid(nft)}>
                      Save changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* end */}
            </Card>
          );
        })}
    </div>
  );
}
