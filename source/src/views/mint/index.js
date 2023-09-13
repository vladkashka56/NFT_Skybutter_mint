import React, { useState, useEffect } from 'react';
import { BigNumber } from 'ethers';
import { Col, Row } from "react-bootstrap";
import { IMAGES } from "../../utils/images";
import { getNFTContract, getTokenContract } from '../../web3/interact';
import { nftTokenAddress } from '../../constants/address';
import './style.css';

const Mint = (props) => {

    const { setStatus, mintLoading, walletAddress, setMintLoading, ethPrice, tokenPrice, totalSupply } = props
    const [mintCount, setMintCount] = useState(1);
    const [preMintLoading, setPreMintLoading] = useState(false);
    const [ethMintLoading, setEthMintLoading] = useState(false);
    const [tokenMintLoading, setTokenMintLoading] = useState(false);
    const [mintedCount, setMintedCount] = useState(0);

    function onChangeCountInput(e) {  
        if (!e.target.validity.patternMismatch) {
          if(e.target.value == "") {
            e.preventDefault()
            return
          }
          let inputVal = parseInt(e.target.value)
          if (inputVal > 10 || inputVal < 1) {
            e.preventDefault()
            return
          }
          setMintCount(inputVal)  
        }
      }

    const onClickIncrement = () => {
        if(mintCount < 10) {
            setMintCount(mintCount+1)
        }else {
            setMintCount(10)
        }
    }

    const onClickdecrement = () => {
        if(mintCount > 1) {
            setMintCount(mintCount-1)
        }else {
            setMintCount(1)
        }
    }

    async function onPresale(event) {
        if (!walletAddress) {
            setStatus('Please connect your Wallet')
            return
        }
        const contract = getNFTContract(walletAddress)
        setMintLoading(true)
        setPreMintLoading(true)
        setStatus('Minting, please wait for a moment...')

        let pc = await contract.getPresaleCount()
        let presaleCount = parseInt(BigNumber.from(pc).toString())

        try {
            let tx = await contract.preSaleToken()
            let res = await tx.wait()
            if (res.transactionHash) {
                setStatus(`You minted ${presaleCount} NFT Successfully`)
                setMintLoading(false)
                setPreMintLoading(false)
            }
        } catch (err) {
            let errorContainer =  (err.error && err.error.message)  ? err.error.message : ''
            let errorBody = errorContainer.substr(errorContainer.indexOf(":")+1)
            let status = "Transaction failed because you have insufficient funds or sales not started"
            errorContainer.indexOf("execution reverted") === -1 ? setStatus(status) : setStatus(errorBody)
            console.log("mint error", err, errorBody)
            setMintLoading(false)
            setPreMintLoading(false)
        }
    }

    async function onMintWithEth(event) {
        if (!walletAddress) {
            setStatus('Please connect your Wallet')
            return
        }
        const contract = getNFTContract(walletAddress)
        setMintLoading(true)
        setEthMintLoading(true)
        setStatus('Minting, please wait for a moment...')
        try {
            let tx = await contract.mintWithEthToken(mintCount, { value: BigNumber.from(1e9).mul(BigNumber.from(1e4)).mul(ethPrice).mul(mintCount), from: walletAddress })
            let res = await tx.wait()
            if (res.transactionHash) {
                setStatus(`You minted ${mintCount} NFT Successfully`)
                setMintLoading(false)
                setEthMintLoading(false)
            }
        } catch (err) {
            let errorContainer =  (err.error && err.error.message)  ? err.error.message : ''
            let errorBody = errorContainer.substr(errorContainer.indexOf(":")+1)
            let status = "Transaction failed because you have insufficient funds or sales not started"
            errorContainer.indexOf("execution reverted") === -1 ? setStatus(status) : setStatus(errorBody)
            setMintLoading(false)
            setEthMintLoading(false)
        }
    }

    async function onMintWithToken(event) {
        if (!walletAddress) {
            setStatus('Please connect your Wallet')
            return
        }

        const nftContract = getNFTContract(walletAddress)
        const tokenContract = getTokenContract(walletAddress)
        let mintAvailable = false;
        setMintLoading(true)
        setTokenMintLoading(true)
        setStatus('Minting, please wait for a moment...')

        // check if allownced Token amount for NFT contract.
        let at = await tokenContract.allowance(walletAddress, nftTokenAddress)
        let allowncedToken = parseInt(BigNumber.from(at).toString())
        if(allowncedToken < mintCount * tokenPrice ) {
            try {
                let tx = await tokenContract.approve(nftTokenAddress, (mintCount * tokenPrice - allowncedToken))
                let res = await tx.wait()
                if (res.transactionHash) {
                    mintAvailable = true
                }
            } catch (err) {
                let errorContainer =  (err.error && err.error.message)  ? err.error.message : ''
                let errorBody = errorContainer.substr(errorContainer.indexOf(":")+1)
                let status = "Transaction failed because you have insufficient funds or sales not started"
                errorContainer.indexOf("execution reverted") === -1 ? setStatus(status) : setStatus(errorBody)
            }
        } else {
            mintAvailable = true
        }

        if(mintAvailable) {
            try {
                let tx = await nftContract.mintWithFoodToken(mintCount)
                let res = await tx.wait()
                if (res.transactionHash) {
                    setStatus(`You minted ${mintCount} NFT Successfully`)
                    setMintLoading(false)
                    setTokenMintLoading(false)
                }
            } catch (err) {
                let errorContainer =  (err.error && err.error.message)  ? err.error.message : ''
                let errorBody = errorContainer.substr(errorContainer.indexOf(":")+1)
                let status = "Transaction failed because you have insufficient funds or sales not started"
                errorContainer.indexOf("execution reverted") === -1 ? setStatus(status) : setStatus(errorBody)
                setMintLoading(false)
                setTokenMintLoading(false)
            }
        } else {
            setMintLoading(false)
            setTokenMintLoading(false)
        }
    }

    async function onCheck() {
        if (!walletAddress) {
            setStatus('Please connect your Wallet')
            return
        }
        const contract = getNFTContract(walletAddress)
        let tl = await contract.getTokensOfWallet(walletAddress)
        let tokens_list = tl.map( bn => BigNumber.from(bn).toNumber() );
        setMintedCount(tokens_list.length)
    }

    return (
        <>
            <section id="mint" className="mint_section">
                <div className="container">
                    <div className="row align-items-start mt-5">
                        <Col xl="6" lg="6" md="6" xs="12" className='presale_section'>
                            <div className='sale_box'>
                                <p className='sec_title'> WHITELIST MINT </p>
                                <p className='sec_info'>
                                    Lorem ipsum dolor sitamet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                </p>

                                <div className='btn_box'>
                                    <p className='sec_info'> You have {mintedCount} NFT </p>
                                    <button className='mint_btn' onClick={e => onCheck(e)}> CHECK </button>
                                    {
                                        preMintLoading ? 
                                        <button className="mint_btn" onClick={e => e.preventDefault()}>MINTING</button>
                                        :
                                        <button className="mint_btn" onClick={e => onPresale(e)}>MINT</button>
                                    }
                                </div>

                            </div>
                        </Col>

                        <Col xl="6" lg="6" md="6" xs="12" className='pubsale_section'>
                            <div className='sale_box'>
                                <p className='sec_title'> PUBLIC MINT </p>
                                <p className='sec_info'>
                                    Lorem ipsum dolor sitamet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                </p>

                                <div className='btn_box'>
                                    <p className='sec_info'>{parseFloat(mintCount * ethPrice / 100000)} ETH / {parseFloat(mintCount * tokenPrice)} Token </p>

                                    <div className="d-flex align-items-center input_label">
                                        <button onClick={()=>onClickdecrement()}>-</button>
                                        <input value={mintCount || ''} pattern="^[0-9]*$" onChange={e => onChangeCountInput(e)} />
                                        <button onClick={()=>onClickIncrement()} >+</button>
                                    </div>

                                    {
                                        tokenMintLoading ? 
                                        <button className="mint_btn" onClick={e => e.preventDefault()}>MINTING WITH TOKEN</button>
                                        :
                                        <button className="mint_btn" onClick={e => onMintWithToken(e)}>MINT WITH TOKEN</button>
                                    }
                                    {
                                        ethMintLoading ? 
                                        <button className="mint_btn" onClick={e => e.preventDefault()}>MINTING WITH ETH</button>
                                        :
                                        <button className="mint_btn" onClick={e => onMintWithEth(e)}>MINT WITH ETH</button>
                                    }

                                </div>
                            </div>
                        </Col>                                          
                    
                    </div>
                </div>
            </section>
        </>
    )
}
export default Mint;