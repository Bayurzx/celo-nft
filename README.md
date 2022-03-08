# NFT Marketplace

## Created an Celo NFT marketplace built with etherjs and deployed with hardhat.
I wanted to test out if utilizing etherjs only to communicate with the celo network, was feasible without celo contractKit in building a NFT marketplace. I am glad it worked.

I also wrote code to help deploy the contract to the marketplace, and dynamically save the contract address. In `scripts\deploy.js` file

Fixed gas price issue users might face when creating market sale in `pages\mint-item.js` 

``` js
await contract.makeMarketItem(nftAddress, tokenId, price, { value: listingPrice, gasLimit: 500000})
``` 

## Check it out here 👇🏼👇🏼👇🏼
https://celo-nft.vercel.app/
