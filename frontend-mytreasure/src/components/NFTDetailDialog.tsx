"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function NFTDetailDialog({ nft, onPlaceBid }: any) {
  const [bidAmount, setBidAmount] = useState("");

  const handleBidSubmit = (e: any) => {
    e.preventDefault();
    onPlaceBid(nft.id, bidAmount);
  };

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{nft.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <img
            src={nft.imageUrl}
            alt={nft.name}
            className="w-full h-64 object-cover rounded-lg"
          />
          <p>{nft.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Current Price</Label>
              <Input value={`${nft.currentPrice} APT`} readOnly />
            </div>
            <div>
              <Label>Auction Ends</Label>
              <Input
                value={new Date(nft.auctionEndTime).toLocaleString()}
                readOnly
              />
            </div>
          </div>
          <form onSubmit={handleBidSubmit} className="space-y-2">
            <Label>Place Bid</Label>
            <Input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              min={nft.currentPrice + 1}
            />
            <Button type="submit">Submit Bid</Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
