import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Tag, User } from "lucide-react";
import { Button } from "./ui/button";

export default function NFTList({ nfts, onSelectNFT }: any) {
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
    // if (wallet.address) window.location.href = "/mint";
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  // Format address to shorter version
  const formatAddress = (address: any) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  return (
    <div className="flex gap-6 flex-wrap justify-center">
      {nfts &&
        nfts.map((nft: any) => {
          return (
            <Card className="w-full max-w-2xl" key={nft.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {/* <img src={decodeHex(nft.url)} alt={decodeHex(nft.name)} /> */}
                  <span>{decodeHex(nft.name)}</span>
                  <Badge variant={nft.is_sold ? "destructive" : "secondary"}>
                    {nft.is_sold ? "Sold" : "Active"}
                  </Badge>
                </CardTitle>
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
                      <span>{nft.starting_price / 100000000} APT</span>
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
                  </div>
                </div>

                <div className=" flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Starting Price: {nft.starting_price / 100000000} APT
                    {nft.url !== "0x" && ` • URL: ${decodeHex(nft.url)}`}
                  </p>
                  <Button onClick={() => onSelectNFT(nft)}>Sell</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
