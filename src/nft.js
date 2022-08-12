import './App.css';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import 'sf-font';
import axios from 'axios';
import VAULTABI from './VAULTABI.json';
import { NFTCONTRACT, STAKINGCONTRACT, moralisapi, nftpng } from './config';
import web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import Web3 from 'web3';
import React from 'react';


var web3 = null;
var account = null;
var vaultcontract = null;

const moralisapikey = "y8oGt2GEKCxEnMVKfpRVTlZjBPK0Cay9yxZxu0DScdd4In4jwdlJNH5cbU9pJFlE";
const providerOptions = {
    binancechainwallet: {
        package: true
      },
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "833c6e1dc3e44274b704999df7a92bfe"
        }
      },
      walletlink: {
        package: WalletLink,
        options: {
          appName: "Rich Fox Club Minter",
          infuraId: "833c6e1dc3e44274b704999df7a92bfe",
          rpc: "",
          chainId: 1,
          appLogoUrl: null,
          darkMode: true
        }
      },
};

function Nft() {
  const [apicall, getNfts] = useState([])
  const [nftstk, getStk] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    callApi()
  }, [])

  async function callApi() {
    var provider = await web3Modal.connect();
    web3 = new Web3(provider);
    await provider.send('eth_requestAccounts');
    var accounts = await web3.eth.getAccounts();
    account = accounts[0];
    vaultcontract = new web3.eth.Contract(VAULTABI, STAKINGCONTRACT);
                let config = {'X-API-KEY': moralisapikey, 'accept': 'application/json'};
                const nfts = await axios.get((moralisapi + `/nfts/${NFTCONTRACT}/owners?chain=mainnet$format=decimal`), {headers: config})
    .then(output => {
        const { result } = output.data;
        return result;
      })
    const apicall = await Promise.all(nfts.map(async i => {
      let item = {
        tokenId: i.tokenId,
        holder: i.owner,
        wallet: account,
      }
      return item
    }))
    const stakednfts = await vaultcontract.methods.tokenOfOwner(account).call()
    .then(id => {
      return id;
    })
    const nftstk = await Promise.all(stakednfts.map(async i => {
      let stkid = {
        tokenId: i,
      }
      return stkid
    }))
    getNfts(apicall)
    getStk(nftstk)
    console.log(apicall);
    setLoadingState('loaded')
  }
  if (loadingState === 'loaded' && !apicall.length
  )
  return (
    <h1 className="text-3x1">Wallet Not Connected</h1>
  )
  return (
      <div className='nftportal mb-4'>
          <div className="container col-lg-11">
            <div className="row items px-3 pt-3" >
              <div className="ml-3 mr-3" style={{ display: "inline-grid", gridTemplateColumns: "repeat(4, 5fr)", columnGap: "20px" }}>
                {apicall.map((nft, i) => {
                  var owner = nft.wallet.toLowerCase();
                    if (owner.indexOf(nft.holder) !== -1) {
                  async function stakeit() {
                    vaultcontract.methods.stake([nft.tokenId]).send({ from: account });
                  }
                  return (
                    <div className="card nft-card mt-3" key={i}>
                      <div className="image-over">
                        <img className="card-img-top" src={nftpng + nft.tokenId + '.png'} alt="" />
                      </div>
                      <div className="card-caption col-12 p-0">
                        <div className="card-body">
                          <h5 className="mb-0">Rich Fox Club #{nft.tokenId}</h5>
                          <h5 className="mb-0 mt-2">Status<p style={{ color: "#39FF14", fontWeight: "bold", textShadow: "1px 1px 2px #000000" }}>Currently Staked</p></h5>
                          <div className="card-bottom d-flex justify-content-between">
                            <input key={i} type="hidden" id='stakeid' value={nft.tokenId} />
                            <Button style={{ marginLeft: '2px', backgroundColor: "#ffffff10" }} onClick={stakeit}>stake it</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}})}
                  {nftstk.map((nft, i) => {
                    async function unstakeit() {
                      vaultcontract.methods.unstake([nft.tokenId]).send({ from: account });
                    }
                    return (
                      <div>

                      <div className="card nft-card mt-3" key={i}>
                        <div className="image-over">
                          <img className="card-img-top" src={nftpng + nft.tokenId + '.png'} alt="" />
                        </div>
                        <div className="card-caption col-12 p-0">
                          <div className="card-body">
                            <h5 className="mb-0">Rich Fox Club #{nft.token_id}</h5>
                            <h5 className="mb-0 mt-2">Status<p style={{ color: "#39FF14", fontWeight: "bold", textShadow: "1px 1px 2px #000000" }}>Currently Staked</p></h5>
                            <div className="card-bottom d-flex justify-content-between">
                              <input key={i} type="hidden" id='stakeid' value={nft.tokenId} />
                              <Button style={{ marginLeft: '2px', backgroundColor: "#ffffff10" }} onClick={unstakeit}>unstake it</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>
                    )})}
              </div>
            </div>
          </div>
      </div>
  )
}
export default Nft 