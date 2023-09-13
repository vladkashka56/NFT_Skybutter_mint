import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Redirect  } from 'react-router-dom';
import { ethers, BigNumber } from 'ethers'
import { ToastContainer, toast } from 'react-toastify';

// External Link
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';
import NavBar from './components/nabBar';
import { IMAGES } from './utils/images';
import Mint from './views/mint';
import Feed from './views/feed';
import 'react-toastify/dist/ReactToastify.css';
import { connectWallet, getCurrentWalletConnected, getNFTContract } from './web3/interact';


function App() {

  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState(null);
  const [mintLoading, setMintLoading] = useState(false)
  const [tokenPrice, setTokenPrice] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  const [totalSupply, setTotalSupply] = useState(null);

  const notify = () => toast.info(status, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
  });


  useEffect(() => {
      ( async () => {
          const { address, status } = await getCurrentWalletConnected()
          setWalletAddress(address)
          setStatus(status)
      })();
  }, [])

  useEffect(() => {
      ( async () => {
      if ( !mintLoading ) {
          let contract = getNFTContract()
          let ts = await contract.totalSupply()
          let ep = await contract.ETH_PRICE()
          let tp = await contract.FOOD_PRICE()

          setTotalSupply( parseInt(BigNumber.from(ts).toString()) )
          setTokenPrice( (BigNumber.from(tp).toString() ) )  // original value * 1e5
          setEthPrice( (BigNumber.from(ep).div(BigNumber.from(1e9).mul(BigNumber.from(1e4))).toString() ) )  // original value * 1e5
      }
      })();
  }, [mintLoading, walletAddress])  

  useEffect(() => {
      if (status) {
          notify()
          setStatus(null)
      }
  }, [status])

  const onClickConnectWallet = async () => {
      console.log("wallet click")
      const walletResponse = await connectWallet();
      setStatus(walletResponse.status);
      setWalletAddress(walletResponse.address);
    }
  
  const onClickDisconnectWallet = async () => {
      setWalletAddress(null)
  }



  return (
    < >
     <Router>
        <NavBar onClickDisconnectWallet={onClickDisconnectWallet} onClickConnectWallet={onClickConnectWallet} walletAddress={walletAddress} />
        <Route exact path='/minting' 
            render={() => <Mint totalSupply={totalSupply} mintLoading={mintLoading} walletAddress={walletAddress} 
                            setStatus={setStatus} setMintLoading={setMintLoading} tokenPrice={tokenPrice} ethPrice={ethPrice} />} 
        />
        <Route exact path='/feeding'  
            render={() => <Feed walletAddress={walletAddress} setStatus={setStatus} />}
        />
        <Redirect to="/minting" />
     </Router>
     <ToastContainer />
    </>
  );
}

export default App;
