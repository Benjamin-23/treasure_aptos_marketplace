// Define Module and Marketplace Address
address 0xc74780df02fd2743c427a14a8b2bdb627f0fb41847a4043bd7672474c356e710 {
    module NFTMarketplace {
     use std::error;
    use std::signer;
    use std::vector;
    #[test_only]
    use std::debug;

    // Constant error codes
    const E_MARKETPLACE_NOT_INITIALIZED: u64 = 1;
    const E_INVALID_BID: u64 = 2;
    const E_AUCTION_ENDED: u64 = 3;
    const E_NOT_SELLER: u64 = 4;

    // NFT Listing Structure
    struct NFTListing  has store, key, copy, drop {
        id: u64,
        url: vector<u8>,
        name: vector<u8>,
        description: vector<u8>,
        starting_price: u64,
        current_bid: u64,
        current_price:u64,
        highest_bidder: address,
        auction_end_time: u64,
        is_sold: bool,
        owner: address
    }

      // Marketplace Resource
  
   struct Marketplace has key {
        listings: vector<NFTListing>,
    }
    // NFTCreatedEvent 

    struct NFTCreatedEvent has copy, drop, store {
        nft_id: u64,
        name: vector<u8>,
        url: vector<u8>,
        description: vector<u8>,
        starting_price: u64,
        current_price: u64,
        owner: address,
    }

     // Initialize marketplace
       public entry fun initialize_marketplace(account: &signer) {
        let marketplace = Marketplace {
            listings: vector::empty<NFTListing>(),
        };
        move_to(account, marketplace);
    }

    //  Check Marketplace Initialization
    
    public fun check_marketplace_initialized(account: address): bool {
        exists<Marketplace>(account)
    }

     // Mint New NFT Function
     public entry fun mint_ntf(account: &signer, name: vector<u8>, description: vector<u8>, _is_sold
     : bool, starting_price: u64, current_price: u64, url: vector<u8>, _owner: address, highest_bidder: address, auction_end_time: u64) acquires Marketplace {
        let marketplace = borrow_global_mut<Marketplace>(signer::address_of(account));
        let nft_id = vector:: length(&marketplace.listings);
        let new_listing = NFTListing{
            id: nft_id,
            name:name,
            url:url,
            description: description,
            is_sold: false,
            starting_price: starting_price,
            owner: signer::address_of(account),
            current_price:0 ,
            current_bid: 0,
            highest_bidder: signer::address_of(account),
            auction_end_time: auction_end_time
        };
        vector::push_back(&mut marketplace.listings, new_listing);
     }
     
    // Place Bid
     public entry fun place_bid(
        bidder: &signer, 
        seller_addr: address, 
        nft_index: u64, 
        bid_amount: u64
    ) acquires Marketplace {
        // Ensure marketplace is initialized
        let bidder_addr = signer::address_of(bidder);
        assert!(check_marketplace_initialized(seller_addr), error::not_found(E_MARKETPLACE_NOT_INITIALIZED));

        // Borrow the marketplace resource
        let marketplace = borrow_global_mut<Marketplace>(seller_addr);
        
        // Get the specific listing
        let listing = vector::borrow_mut(&mut marketplace.listings, nft_index);

        // Check auction hasn't ended
        assert!(listing.auction_end_time > aptos_framework::timestamp::now_seconds(), 
            error::invalid_argument(E_AUCTION_ENDED));

        // Validate bid amount
        assert!(bid_amount > listing.current_bid, error::invalid_argument(E_INVALID_BID));

        // Update listing with new bid
        listing.current_bid = bid_amount;
        listing.highest_bidder = bidder_addr;
    }

    // View NFT Details
    public fun view_nft_details(nft_index: u64, account: address): (vector<u8>, vector<u8>, vector<u8>, u64, u64, u64, address, u64, bool, address) acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(account);
        let listing = vector::borrow(&marketplace.listings, nft_index);
        (listing.name, listing.url, listing.description, listing.starting_price, listing.current_bid, listing.current_price, listing.highest_bidder, listing.auction_end_time, listing.is_sold, listing.owner)
    }

    // List NFT for Sale

    public entry fun list_nft_for_sale(account: &signer, nft_index: u64, starting_price: u64, auction_end_time: u64) acquires Marketplace {
        let seller_addr = signer::address_of(account);
        assert!(check_marketplace_initialized(seller_addr), error::not_found(E_MARKETPLACE_NOT_INITIALIZED));
        let marketplace = borrow_global_mut<Marketplace>(seller_addr);
        let listing = vector::borrow_mut(&mut marketplace.listings, nft_index);
        assert!(listing.owner == seller_addr, error::permission_denied(E_NOT_SELLER));
        listing.starting_price = starting_price;
        listing.current_bid = starting_price;
        listing.current_price = starting_price;
        listing.auction_end_time = auction_end_time;

    }

    // Update NFT Price
    public entry fun update_nft_price(account: &signer, nft_index: u64, new_price: u64) acquires Marketplace {
        let seller_addr = signer::address_of(account);
        assert!(check_marketplace_initialized(seller_addr), error::not_found(E_MARKETPLACE_NOT_INITIALIZED));
        let marketplace = borrow_global_mut<Marketplace>(seller_addr);
        let listing = vector::borrow_mut(&mut marketplace.listings, nft_index);
        assert!(listing.owner == seller_addr, error::permission_denied(E_NOT_SELLER));
        listing.current_price = new_price;
    }

    // Purchase NFT
    public fun purchase_nft(buyer: &signer, seller_addr: address, nft_index: u64) acquires Marketplace {
        let buyer_addr = signer::address_of(buyer);
        assert!(check_marketplace_initialized(seller_addr), error::not_found(E_MARKETPLACE_NOT_INITIALIZED));
        let marketplace = borrow_global_mut<Marketplace>(seller_addr);
        let listing = vector::borrow_mut(&mut marketplace.listings, nft_index);
        assert!(listing.auction_end_time < aptos_framework::timestamp::now_seconds(), error::invalid_argument(E_AUCTION_ENDED));
        assert!(listing.owner != buyer_addr, error::invalid_argument(E_NOT_SELLER));
        listing.is_sold = true;
        listing.owner = buyer_addr;

    }

   // Transfer Ownership
    public entry fun transfer_ownership(account: &signer, nft_index: u64, new_owner: address) acquires Marketplace {
        let seller_addr = signer::address_of(account);
        assert!(check_marketplace_initialized(seller_addr), error::not_found(E_MARKETPLACE_NOT_INITIALIZED));
        let marketplace = borrow_global_mut<Marketplace>(seller_addr);
        let listing = vector::borrow_mut(&mut marketplace.listings, nft_index);
        assert!(listing.owner == seller_addr, error::permission_denied(E_NOT_SELLER));
        listing.owner = new_owner;
    }
    // Retrieve NFT Owner
    #[view]
    public fun retrieve_nft_owner(nft_index: u64, account: address): address acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(account);
        let listing = vector::borrow(&marketplace.listings, nft_index);
        listing.owner
    }


    // End Auction
    public entry fun end_auction(account: &signer, nft_index: u64) acquires Marketplace {
        let seller_addr = signer::address_of(account);
        assert!(check_marketplace_initialized(seller_addr), error::not_found(E_MARKETPLACE_NOT_INITIALIZED));
        let marketplace = borrow_global_mut<Marketplace>(seller_addr);
        let listing = vector::borrow_mut(&mut marketplace.listings, nft_index);
        assert!(listing.owner == seller_addr, error::permission_denied(E_NOT_SELLER));
        listing.is_sold = true;

    }

    //  Check if NFT is for Sale
    #[view]
    public fun check_nft_for_sale(nft_index: u64, account: address): bool acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(account);
        let listing = vector::borrow(&marketplace.listings, nft_index);
        !listing.is_sold
    }

//  Get NFT Price
    public fun get_nft_price(nft_index: u64, account: address): u64 acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(account);
        let listing = vector::borrow(&marketplace.listings, nft_index);
        listing.current_price
    }

 // transfer NFT to marketplace contract
 
    public entry fun transfer_nft_to_marketplace(account: &signer, nft_index: u64, receiver: address) acquires Marketplace {
        let sender = signer::address_of(account);
        let marketplace = borrow_global_mut<Marketplace>(receiver);
        let listing = vector::borrow_mut(&mut marketplace.listings, nft_index);
        listing.owner = sender;

    }
// sell NFT to marketplace contract

    public entry fun sell_nft_to_marketplace(account: &signer, nft_index: u64, receiver: address, price: u64) acquires Marketplace {
        let sender = signer::address_of(account);
        assert!(price <= 10000000000000000, error::invalid_argument(E_INVALID_PRICE));
        let marketplace = borrow_global_mut<Marketplace>(receiver);
        let listing = vector::borrow_mut(&mut marketplace.listings, nft_index);
        listing.owner = sender;
        listing.current_price = price;
    }
   
}
}