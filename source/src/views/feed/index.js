import React, { useState, useEffect } from 'react';
import { BigNumber } from 'ethers';
import { Col, Row } from "react-bootstrap";
import { IMAGES } from "../../utils/images";
import { getNFTContract, getTokenContract } from '../../web3/interact';
import { nftTokenAddress } from '../../constants/address';
import axios from "axios";
import './style.css';

const Feed = (props) => {

    const { setStatus, walletAddress} = props
    const [mintedTokens, setMintedTokens] = useState([])
    const [tokenImgUrl, setTokenImgUrl] = useState("")
    const [tokenAttrs, setTokenAttrs] = useState([])
    const [tokenId, setTokenId] = useState(null)
    const [feedLoading, setFeedLoading] = useState(false)

    useEffect(() => {
        ( async () => {
            if(walletAddress) {
                console.log("get token list start")
                setStatus('Loading, please wait for a moment...')
                const contract = getNFTContract(walletAddress)
                // let tl = await contract.getTokensOfWallet(walletAddress)
                // let tokens_list = tl.map( bn => BigNumber.from(bn).toNumber() );
                let tokens_list = [0, 1, 2, 3, 4, 8, 9];
                let token_rows_list = [];
                for (let i=0; i<tokens_list.length; i=i+4) {
                    let token_row = [];
                    let res;
                    for(let j=0; j<4; j++) {
                        if(tokens_list[i+j] !== undefined) {
                            let token_id = tokens_list[i+j]
                            let token_img = await getImgURL(token_id)
                            token_row.push({id: token_id, img: token_img})
                        }
                    }
                    token_rows_list.push(token_row)
                }
                setMintedTokens(token_rows_list)
                console.log("token list", token_rows_list)
            } else {
                setMintedTokens([])
            }
        })();
    }, [walletAddress])

    const onSelToken = async (tokenID) => {
        if(tokenID == null) return
        const contract = getNFTContract(walletAddress)
        let tokenURI = await contract.tokenURI(tokenID)
        tokenURI = tokenURI.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
        const res = await axios.get(tokenURI)
        const metadata = res.data

        let img_url = metadata.image
        img_url = img_url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/")
        let attrs = metadata.attributes;

        setTokenImgUrl(img_url)
        setTokenAttrs(attrs)
        setTokenId(tokenID)

        attrs.map((attr, i) => {
            console.log(attr.trait_type, attr.value)
        })

    }

    const getImgURL = async (tokenID) => {
        const contract = getNFTContract(walletAddress)
        let tokenURI = await contract.tokenURI(tokenID)
        tokenURI = tokenURI.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
        const res = await axios.get(tokenURI)
        const metadata = res.data
        let img_url = metadata.image
        img_url = img_url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/")
        return img_url
    }

    const onFeed = async (tokenID) => {
        if (!walletAddress) {
            setStatus('Please connect your Wallet')
            return
        }
        if(tokenID == null) return

        const nftContract = getNFTContract(walletAddress)
        const tokenContract = getTokenContract(walletAddress)
        let feedAvailable = false;
        setStatus('Feeding, please wait for a moment...')
        setFeedLoading(true)
        // check if allownced Token amount for NFT contract.
        let fb = await tokenContract.balanceOf(walletAddress)
        let foodBalance = parseInt(BigNumber.from(fb).toString())
        if(foodBalance < 5000000000) {
            setStatus('FOOD token is not enough')
            setFeedLoading(false)
            return
        }
        let at = await tokenContract.allowance(walletAddress, nftTokenAddress)
        let allowncedToken = parseInt(BigNumber.from(at).toString())
        if(allowncedToken < 5000000000 ) {
            try {
                let tx = await tokenContract.approve(nftTokenAddress, (5000000000 - allowncedToken))
                let res = await tx.wait()
                if (res.transactionHash) {
                    feedAvailable = true
                }
            } catch (err) {
                let errorContainer =  (err.error && err.error.message)  ? err.error.message : ''
                let errorBody = errorContainer.substr(errorContainer.indexOf(":")+1)
                let status = "Transaction failed because you have insufficient funds or sales not started"
                errorContainer.indexOf("execution reverted") === -1 ? setStatus(status) : setStatus(errorBody)
            }
        } else {
            feedAvailable = true
        }

        if(feedAvailable) {
            try {
                let tx = await nftContract.action_A(tokenID)
                let res = await tx.wait()
                if (res.transactionHash) {
                    res = await onSelToken(tokenID)
                    setStatus('Feeding is Success!')
                    setFeedLoading(false)
                    return
                }
            } catch (err) {
                let errorContainer =  (err.error && err.error.message)  ? err.error.message : ''
                let errorBody = errorContainer.substr(errorContainer.indexOf(":")+1)
                let status = "Transaction failed because you have insufficient funds or sales not started"
                errorContainer.indexOf("execution reverted") === -1 ? setStatus(status) : setStatus(errorBody)
                setFeedLoading(false)
                return
            }
        } else {
            setFeedLoading(false)
            return
        }

    }


    return (
        <>
            <section id="feed" className="feed_section">
                <div className="container">
                    <div className="row align-items-start mt-5 token_detail">
                        <Col xl="6" lg="6" md="12" className=''>
                            <img className='large_img' src={tokenImgUrl}  />
                        </Col>
                        <Col xl="6" lg="6" md="12" className=''>
                            <div className='token_info'>
                                <p className='token_title'>TOKENID : #{tokenId}</p>
                                <div className='token_attrs'>
                                {
                                    tokenAttrs.map((attr, i) => {
                                        return <p key={i} className="token_attr">{attr.trait_type} - {attr.value}</p>
                                    })
                                }
                                </div>
                                <div> 
                                {
                                    feedLoading ? 
                                    <button className="btn_feed" onClick={e => e.preventDefault()}>FEEDING</button>
                                    :
                                    <button className='btn_feed' onClick={e => onFeed(tokenId)}>FEED</button> 
                                }
                                    
                                </div>
                            </div>
                        </Col>                                          
                    </div>

                    <p className='token_list_title' > Choose your Ovomorph </p>

                    {
                        mintedTokens.map( (row, i) => {
                            return <div className="row align-items-start token_list" key={i}>
                            {
                                row.map( (item, j) => {
                                    return (
                                    <Col xl="3" lg="3" md="6" className='token_item' key={j} onClick={e => onSelToken(item.id)}>
                                        <img className='small_img' src={item.img}/>
                                        <span className='token_id'> {item.id} </span>
                                    </Col> )
                                })
                            }
                            </div>
                        })
                    }

                </div>

            </section>
        </>
    )
}
export default Feed;