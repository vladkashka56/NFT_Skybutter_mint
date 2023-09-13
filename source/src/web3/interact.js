
import Onboard from "bnc-onboard";
// import Web3 from "web3";
import { ethers } from 'ethers'
import { chainId, nftTokenAddress, foodTokenAddress } from '../constants/address'

const wallets = [
    { walletName: "metamask", preferred: true }
];

let walletProvider;

const onboard = Onboard({

    networkId: chainId,     // dappId: "877e8915-22d9-450e-a9b8-799bfd51798e", // [String] The API key created by step one above// [Integer] The Ethereum network ID your Dapp uses.
    hideBranding: true,
    walletSelect: {
        wallets: wallets
    },
    subscriptions: {
        wallet: (wallet) => {
            walletProvider = wallet.provider;
            console.log(`${wallet.name} is now connected`);
        }
    }
});

export const connectWallet =  async () => {
    const currentState = onboard.getState();
    if(currentState["address"] != null) {
        return {
            address: currentState["address"],
            status: "",
        }
    }
    const walletSelected = await onboard.walletSelect('MetaMask');
    if (walletSelected !== false) {
        const walletCheck = await onboard.walletCheck();
        if (walletCheck === true) {
            const currentState = onboard.getState();
            return {
                address: currentState["address"],
                status: "",
            }
        } else {
            return {
                address: "",
                status: "Connect your wallet account to the site.",
            }
        }
    }

}

export const disConnectWallet = () => {
    // onboard.walletReset()
    return {
        address: "",
        status: "Connect your wallet account to the site.",
    }
}

export const getCurrentWalletConnected = async () => {
    const currentState = onboard.getState();

    if(currentState["address"] != null) {
        return {
            address: currentState["address"],
            status: "",
        }
    } else {
        return {
            address: "",
            status: "",
        }
    }

}

export const getNFTContract = (walletAddress) => {
    const contractABI = require("../constants/nftcontract.json")
    let contract
  
    try {
        if(walletAddress === null || walletAddress === '' || walletAddress === undefined) {
            if(parseInt(chainId) == 4) 
                contract = new ethers.Contract(nftTokenAddress, contractABI, ethers.getDefaultProvider('rinkeby'))
            if(parseInt(chainId) == 1) 
                contract = new ethers.Contract(nftTokenAddress, contractABI, ethers.getDefaultProvider('mainnet'))
        } else {
            // const provider = new ethers.providers.Web3Provider(window.ethereum);
            const provider = new ethers.providers.Web3Provider(walletProvider);
            const signer = provider.getSigner();
            contract = new ethers.Contract(nftTokenAddress, contractABI, signer)
        }
    } catch (error) {
        contract = null
    }
    return contract
}

export const getTokenContract = (walletAddress) => {
    const contractABI = require("../constants/tokencontract.json")
    let contract
  
    try {
        if(walletAddress === null || walletAddress === '' || walletAddress === undefined) {
            if(parseInt(chainId) == 4) 
                contract = new ethers.Contract(foodTokenAddress, contractABI, ethers.getDefaultProvider('rinkeby'))
            if(parseInt(chainId) == 1) 
                contract = new ethers.Contract(foodTokenAddress, contractABI, ethers.getDefaultProvider('mainnet'))
        } else {
            const provider = new ethers.providers.Web3Provider(walletProvider);
            const signer = provider.getSigner();
            contract = new ethers.Contract(foodTokenAddress, contractABI, signer)
        }
    } catch (error) {
        contract = null
    }
    return contract
}


