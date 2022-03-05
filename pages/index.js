import { ethers } from 'ethers'
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal'
import { kbMarketAddress, nftAddress } from '../config';

import kbMarket from '../artifacts/contracts/kbMarket.sol/kbMarket.json';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNfts();
  }, [])

  const loadNfts = async () => {
    // ***provider, tokenContract, marketContract, data for our marketItems***

    const provider = new ethers.providers.JsonRpcProvider("https://alfajores-forno.celo-testnet.org");
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(kbMarketAddress, kbMarket.abi, provider);
    const data = await marketContract.fetchMarketTokens()

    const items = await Promise.all(data.map(async (i) => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      // we want to get the token metadata
      const meta = await axios.get(tokenUri);
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')

      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,

      }

      return item;

    }))

    setNfts(items);
    setLoading(false);

  }

  // function to buy NFTs for the market

  const buyNFT = async (nft) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(kbMarketAddress, kbMarket.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    try {
      const transaction = await contract.createMarketSale(nftAddress, nft.tokenId, {
        value: price
      })
      await transaction.wait()

    } catch (error) {
      console.error('errored', error);
    }

    loadNfts() // to reload our nfts after there has been a buy

  }
  if (!loading && !nfts.length) {
    return (
      <h1 className="px-20 py-7 text-4x1">No NFTs in marketplace</h1>
    )
  }



  return (
    <>
      <div className="justify-center">
        <h1 className="py-2" style={{ fontSize: '26px', backgroundColor: 'white', padding: '20px', fontWeight: 'bold', color: "purple" }}>Marketplace</h1>
        <div className="px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-x1 overflow-hidden bg-purple-200 px-5">
                  <img src={nft.image} alt="" />
                  <div className="p-4">
                    <p style={{ height: '64px' }} className="text-3x1 font-semibold">
                      {nft.name}
                    </p>
                    <div style={{ height: '72px', overflow: 'hidden' }}>
                      <p className="text-gray-400">{nft.description} </p>
                    </div>
                  </div>
                  <div className="p-4 bg-black">
                    <p className="text-3x-1 mb-4 font-bold text-white">{nft.price} Celo</p>
                    <button
                      className="w-full bg-purple-500 text-white font-bold py-3 px-12 rounded"
                      onClick={() => buyNFT(nft)}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  )
}
