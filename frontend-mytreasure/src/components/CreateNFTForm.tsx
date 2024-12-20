"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function CreateNFTForm({ onMint }: any) {
  // name: vector<u8>, description: vector<u8>, _is_sold
  // : bool, starting_price: u64, current_price: u64, url: vector<u8>, _owner: address, highest_bidder: address, auction_end_time: u64
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startingPrice: "",
    imageUrl: "",
    current_price: "",
    _is_sold: false,
    _owner: "",
    highest_bidder: "",
    auction_end_time: "",
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onMint(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>NFT Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Description</Label>
        <Input
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>
      <div>
        <Label>Starting Price (APT)</Label>
        <Input
          type="number"
          value={formData.startingPrice}
          onChange={(e) =>
            setFormData({ ...formData, startingPrice: e.target.value })
          }
          required
        />
      </div>
      <div>
        <Label>Image URL</Label>
        <Input
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
          required
        />
      </div>

      <Button type="submit">Mint NFT</Button>
    </form>
  );
}
