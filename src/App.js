import './App.css';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import 'sf-font';
import axios from 'axios';
import ABI from './ABI.json';
import VAULTABI from './VAULTABI.json';
import TOKENABI from './TOKENABI.json';
import { NFTCONTRACT, STAKINGCONTRACT, etherscanapi, moralisapi } from './config';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import Web3 from 'web3';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';


var account = null;
var contract = null;
var vaultcontract = null;
var web3 = null;

const Web3Alc = createAlchemyWeb3("https://eth-mainnet.g.alchemy.com/v2/LImfUcM87aQ4q0LLq3x798zzhuleAAvw")

const moralisapikey = "y8oGt2GEKCxEnMVKfpRVTlZjBPK0Cay9yxZxu0DScdd4In4jwdlJNH5cbU9pJFlE";
const etherscanapikey = "YXH8ERRHWCY82R5VZ59R39SZU81MUPSEHY";

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
      appName: "Rich Fox Club",
      infuraId: "833c6e1dc3e44274b704999df7a92bfe",
      rpc: "",
      chainId: 1,
      appLogoUrl: null,
      darkMode: true
    }
  },
};

const web3Modal = new Web3Modal({
	network: "ethereum",
	theme: "dark",
	cacheProvider: true,
	providerOptions 
  });

class Nft extends Component {
	constructor() {
		super();
		this.state = {
			nftdata: [],
			rawearn: [],
		};
	}
  
	handleModal(){  
		this.setState({show:!this.state.show})  
	} 

	handleNFT(nftamount) {
		this.setState({outvalue:nftamount.target.value});
  	}

	async componentDidMount() {
		
		await axios.get((etherscanapi + `?module=stats&action=tokensupply&contractaddress=${NFTCONTRACT}&apikey=${etherscanapikey}`))
		.then(outputa => {
            this.setState({
                balance:outputa.data
            })
            console.log(outputa.data)
        })
		let config = {'X-API-Key': moralisapikey, 'accept': 'application/json'};
		await axios.get((moralisapi + `/nft/${NFTCONTRACT}/owners?chain=etherum&format=decimal`), {headers: config})
		.then(outputb => {
			const { result } = outputb.data
            this.setState({
                nftdata:result
            })
            console.log(outputb.data)
        })
	}


render() {
	const {balance} = this.state;
	const {outvalue} = this.state;
  

  const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  const expectedBlockTime = 10000;

  async function connectwallet() {
    var provider = await web3Modal.connect();
    web3 = new Web3(provider);
    await provider.send('eth_requestAccounts');
    var accounts = await web3.eth.getAccounts();
    account = accounts[0];
    document.getElementById('wallet-address').textContent = account;
    contract = new web3.eth.Contract(ABI, NFTCONTRACT);
    vaultcontract = new web3.eth.Contract(VAULTABI, STAKINGCONTRACT);
    var getstakednfts = await vaultcontract.methods.tokensOfOwner(account).call();
    document.getElementById('yournfts').textContent = getstakednfts;
    var getbalance = Number(await vaultcontract.methods.balanceOf(account).call());
    document.getElementById('stakedbalance').textContent = getbalance;
    const arraynft = Array.from(getstakednfts.map(Number));
		const tokenid = arraynft.filter(Number);
		var rwdArray = [];
    tokenid.forEach(async (id) => {
      var rawearn = await vaultcontract.methods.earningInfo(account, [id]).call();
      var array = Array.from(rawearn.map(Number));
      console.log(array);
      array.forEach(async (item) => {
        var earned = String(item).split(",")[0];
        var earnedrwd = Web3.utils.fromWei(earned);
        var rewardx = Number(earnedrwd).toFixed(2);
        var numrwd = Number(rewardx);
        console.log(numrwd);
        rwdArray.push(numrwd);
      });
    });
    function delay() {
      return new Promise(resolve => setTimeout(resolve, 300));
    }
    async function delayedLog(item) {
      await delay();
      var sum = item.reduce((a, b) => a + b, 0);
      var formatsum = Number(sum).toFixed(2);
      document.getElementById('earned').textContent = formatsum;
    }
    async function processArray(rwdArray) {
      for (const item of rwdArray) {
        await delayedLog(item);
      }
    }
    return processArray([rwdArray]);
  }

  async function verify() {
    var getstakednfts = await vaultcontract.methods.tokensOfOwner(account).call();
    document.getElementById('yournfts').textContent = getstakednfts;
    var getbalance = Number(await vaultcontract.methods.balanceOf(account).call());
    document.getElementById('stakedbalance').textContent = getbalance;
  }

  async function enable() {
    contract.methods.setApprovalForAll(STAKINGCONTRACT, true).send({ from: account });
  }
  async function rewardinfo() {
    var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
    const arraynft = Array.from(rawnfts.map(Number));
    const tokenid = arraynft.filter(Number);
    var rwdArray = [];
    tokenid.forEach(async (id) => {
      var rawearn = await vaultcontract.methods.earningInfo(account, [id]).call();
      var array = Array.from(rawearn.map(Number));
      array.forEach(async (item) => {
        var earned = String(item).split(",")[0];
        var earnedrwd = Web3.utils.fromWei(earned);
        var rewardx = Number(earnedrwd).toFixed(2);
        var numrwd = Number(rewardx);
        rwdArray.push(numrwd)
      });
    });
    function delay() {
      return new Promise(resolve => setTimeout(resolve, 300));
    }
    async function delayedLog(item) {
      await delay();
      var sum = item.reduce((a, b) => a + b, 0);
      var formatsum = Number(sum).toFixed(2);
      document.getElementById('earned').textContent = formatsum;
    }
    async function processArray(rwdArray) {
      for (const item of rwdArray) {
        await delayedLog(item);
      }
    }
    return processArray([rwdArray]);
  }
  async function claimit() {
    var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
    const arraynft = Array.from(rawnfts.map(Number));
    const tokenid = arraynft.filter(Number);
    await Web3Alc.eth.getMaxPriorityFeePerGas().then((tip) => {
      Web3Alc.eth.getBlock('pending').then((block) => {
        var baseFee = Number(block.baseFeePerGas);
        var maxPriority = Number(tip);
        var maxFee = maxPriority + baseFee;
        tokenid.forEach(async (id) => {
          await vaultcontract.methods.claim([id])
            .send({
              from: account,
              maxFeePerGas: maxFee,
              maxPriorityFeePerGas: maxPriority
            })
        })
      });
    })
  }  
  async function unstakeall() {
    var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
    const arraynft = Array.from(rawnfts.map(Number));
    const tokenid = arraynft.filter(Number);
    await Web3Alc.eth.getMaxPriorityFeePerGas().then((tip) => {
      Web3Alc.eth.getBlock('pending').then((block) => {
        var baseFee = Number(block.baseFeePerGas);
        var maxPriority = Number(tip);
        var maxFee = maxPriority + baseFee;
        tokenid.forEach(async (id) => {
          await vaultcontract.methods.unstake([id])
            .send({
              from: account,
              maxFeePerGas: maxFee,
              maxPriorityFeePerGas: maxPriority
            })
        })
      });
    })
    }
    async function mintnative() {
      var _mintAmount = Number(outvalue);
      var mintRate = Number(await contract.methods.cost().call());
      var totalAmount = mintRate * _mintAmount;
      await Web3Alc.eth.getMaxPriorityFeePerGas().then((tip) => {
        Web3Alc.eth.getBlock('pending').then((block) => {
          var baseFee = Number(block.baseFeePerGas);
          var maxPriority = Number(tip);
          var maxFee = baseFee + maxPriority
          contract.methods.mint(account, _mintAmount)
            .send({ from: account,
              value: String(totalAmount),
              maxFeePerGas: maxFee,
              maxPriorityFeePerGas: maxPriority
            });
        });
      });
    }

    async function mint0() {
      var _pid = "0";
      var erc20address = await contract.methods.getCryptotoken(_pid).call();
      var currency = new web3.eth.Contract(TOKENABI, erc20address);
      var mintRate = await contract.methods.getNFTCost(_pid).call();
      var _mintAmount = Number(outvalue);
      var totalAmount = mintRate * _mintAmount;
      await Web3Alc.eth.getMaxPriorityFeePerGas().then((tip) => {
        Web3Alc.eth.getBlock('pending').then((block) => {
          var baseFee = Number(block.baseFeePerGas);
          var maxPriority = Number(tip);
          var maxFee = maxPriority + baseFee;
          currency.methods.approve(NFTCONTRACT, String(totalAmount))
					  .send({
					    from: account
            })
            .then(currency.methods.transfer(NFTCONTRACT, String(totalAmount))
					    .send({
  						  from: account,
	  					  maxFeePerGas: maxFee,
		  				  maxPriorityFeePerGas: maxPriority
			  		  },
                async function (error, transactionHash) {
                  console.log("Transfer Submitted, Hash: ", transactionHash)
                let transactionReceipt = null
                  while (transactionReceipt == null) {
                    transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
                    await sleep(expectedBlockTime)
                  }
                  window.console = {
                    log: function (str) {
                      var out = document.createElement("div");
                      out.appendChild(document.createTextNode(str));
                      document.getElementById("txout").appendChild(out);
                    }
                  }
                  console.log("Transfer Complete", transactionReceipt);
                  contract.methods.mintpid(account, _mintAmount, _pid)
                  .send({
                    from: account,
                    maxFeePerGas: maxFee,
                    maxPriorityFeePerGas: maxPriority
                  });
              }));
        });
      });
    }
    const refreshPage = ()=>{
      window.location.reload();  
    }

    return (
      <div className="App nftapp">
        <nav class="navbar navbarfont navbarglow navbar-expand-md navbar-dark bg-dark mb-4">
          <div class="container-fluid" style={{ fontFamily: "SF Pro Display" }}>
            <a class="navbar-brand px-5" style={{ fontWeight: "800", fontSize: '25px' }} href="#"></a><img src="rfc.x.png" alt="RFC" width="7%" />
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarCollapse">
              <ul class="navbar-nav me-auto mb-2 px-3 mb-md-0" style={{ fontSize: "25px" }}>
                <li class="nav-item">
                  <a class="nav-link active" aria-current="page" href="#"> Dashboard</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">RFC Merch</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link">NFT Trading Tool</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="px-5">
            <input id="connectbtn" type="button" className="connectbutton" onClick={connectwallet} style={{ fontFamily: "SF Pro Display" }}value="Connect Your Wallet" />
          </div>
        </nav>
        <div className="container container-style">
          <div className="col">
            <body className="nftstaker border-0">
              <form style={{ fontFamily: "SF Pro Display" }}>
                <h2 style={{borderRadius: "14px",fontWeight: "300",fontSize: "25px"}}>Rich Fox Club Staking Vault</h2>
                <h6 style={{ fontWeight: "300" }}>First time staking?</h6>
                <Button onClick={enable} style={{backgroundColor: "#ffffff10",boxShadow: "1px 1px 5px #000000"}}>Authorize Your Wallet</Button>
                <div className="row px-3">
                  <div className="col">
                    <form class="stakingrewards"style={{borderRadius: "25px",boxShadow: "1px 1px 15px #ffffff"}}>
                      <h5 style={{ color: "#FFFFFF", fontWeight: "300" }}>Your Vault Activity</h5>
                      <h6 style={{ color: "#FFFFFF" }}>Verify Staked Amount</h6>
                      <Button onClick={verify} style={{backgroundColor: "#ffffff10",boxShadow: "1px 1px 5px #000000"}}>Verify</Button>
                      <table className="table mt-3 mb-5 px-3 table-dark">
                        <tr>
                          <td style={{ fontSize: "19px" }}>Your Staked NFTs:
                            <span style={{ backgroundColor: "#ffffff00",fontSize: "21px",color: "#39FF14",fontWeight: "500",textShadow: "1px 1px 2px #000000"}}id="yournfts" ></span>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontSize: "19px" }}>Total Staked NFTs:
                            <span style={{ backgroundColor: "#ffffff00",fontSize: "21px",color: "#39FF14",fontWeight: "500",textShadow: "1px 1px 2px #000000"}}id="stakedbalance"></span>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontSize: "19px" }}>Unstake All Staked NFTs
                            <Button onClick={unstakeall} className="mb-3"style={{backgroundColor: "#ffffff10",boxShadow: "1px 1px 5px #000000"}}>Unstake All</Button>
                          </td>
                        </tr>
                      </table>
                    </form>
                  </div>
                  <img className="col-lg-4" src="art.png" alt="Rich Fox Club" />
                  <div className="col">
                    <form className="stakingrewards"style={{borderRadius: "25px", boxShadow: "1px 1px 15px #ffffff",fontFamily: "SF Pro Display"}}>
                      <h5 style={{ color: "#FFFFFF", fontWeight: "300" }}>Staking Rewards</h5>
                      <Button onClick={rewardinfo} style={{backgroundColor: "#ffffff10",boxShadow: "1px 1px 5px #000000"}}>Earned RFC.X Tokens</Button>
                      <div id="earned"style={{color: "#39FF14",marginTop: "5px",fontSize: "25px",fontWeight: "500",textShadow: "1px 1px 2px #000000"}}>RFC.X Earned</div>
                      <div className="col-12 mt-2">
                          <div style={{ color: "white" }}>Claim Rewards</div>
                          <Button onClick={claimit} style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} className="mb-2">Claim</Button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="row px-4 pt-2">
                  <div class="header">
                    <div style={{ fontSize: "25px", borderRadius: "14px", color: "#ffffff", fontWeight: "300" }}>The Fox Hole Trait Rewards Board</div>
                    <table className="table px-3 table-bordered table-dark">
                      <thead className="thead-light">
                        <tr>
                          <th scope="col">Trait</th>
                          <th scope="col">Rewards Per Day</th>
                          <th scope="col">Exchangeable Items</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Cigar</td>
                          <td class="amount" data-test-id="rewards-summary-ads">
                            <span class="amount">TBD</span>&nbsp;
                            <span class="currency">RFC.X or RFC NFT</span>
                          </td>
                          <td class="exchange">
                            <span class="amount">2</span>&nbsp;
                            <span class="currency">NFTs/M</span>
                          </td>
                        </tr>
                        <tr>
                          <td>Backpack</td>
                          <td class="amount" data-test-id="rewards-summary-ac">
                            <span class="amount">TBD</span>&nbsp;
                            <span class="currency">RFC.X or RFC NFT</span>
                          </td>
                          <td class="exchange">
                            <span class="amount">10</span>&nbsp;
                            <span class="currency">NFTs/M</span>
                          </td>
                        </tr>
                        <tr className="stakegoldeffect">
                          <td>Party Hat</td>
                          <td
                            class="amount"
                            data-test-id="rewards-summary-one-time"
                          >
                          <span class="amount">TBD</span>&nbsp;
                          <span class="currency">RFC.X or RFC NFT</span>
                          </td>
                          <td class="exchange">
                            <span class="amount">25 NFTs/M or </span>
                            <span class="currency">100 N2DR/M</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div class="header">
                      <div style={{ fontSize: "25px", borderRadius: "14px", fontWeight: "300" }} >RFC.x Stake Farms</div>
                      <table className="table table-bordered table-dark" style={{ borderRadius: "14px" }} >
                        <thead className="thead-light">
                          <tr>
                            <th scope="col">Farm Pools</th>
                            <th scope="col">Harvest Daily Earnings</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Stake RFC.X to Earn Even More!</td>
                            <td class="amount" data-test-id="rewards-summary-ads">
                              <span class="amount">0.01</span>&nbsp; <span class="currency">Per RFC.X Token</span>
                            </td>
                          </tr>
                          <tr>
                            <td>Stake RFC.X to Earn RFC.X+</td>
                            <td class="amount" data-test-id="rewards-summary-ac">
                              <span class="amount">0.005</span>&nbsp; <span class="currency">Per RFC.X Token</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </form>
            </body>
          </div>
        </div>
        <div className='row nftportal mt-3'>
          <div className='col mt-4 ml-3'>
            <img src="rfc.x.png" alt="Rich Fox Club" width={'60%'}></img>
          </div>
        <div className='col'>
          <h1 className='n2dtitlestyle mt-3'>Your NFT Portal</h1>
          <Button onClick={refreshPage} style={{ backgroundColor: "#000000", boxShadow: "1px 1px 5px #000000" }}>Refresh NFT Portal</Button>
        </div>
        <div className='col mt-3 mr-5'>
          <img src="ethereum.png" alt="eth" width={'60%'}></img>
        </div>
      </div>
    </div>
    )
  }
}
export default Nft

