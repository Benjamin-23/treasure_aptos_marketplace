import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export default function NFTList({ nfts, onSelectNFT }: any) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Current Price</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Auction End Time</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nfts.data}
        {nfts.map((nft: any) => (
          <TableRow key={nft.id}>
            <TableCell>{nft.name}</TableCell>
            <TableCell>{nft.current_price} APT</TableCell>
            <TableCell>
              <img
                src={nft.url}
                alt={nft.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            </TableCell>
            <TableCell>{nft.description}</TableCell>
            <TableCell>
              {new Date(nft.auction_end_time).toLocaleString()}
            </TableCell>
            <TableCell>
              <Button onClick={() => onSelectNFT(nft)}>View Details</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
