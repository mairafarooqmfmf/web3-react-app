import React from 'react'
import { useEffect, useState } from 'react';
import './App.css';
import Web3 from 'web3'
import abi from './abi.json'

const SMART_CONTRACT_ADDRESS = '0xF274C2Bfa2e55684B10042418B4321DEdED23071'

function App() {
  const [isEthEnabled, setIsEthEnabled] = useState(false);
  const [contract, setContract] = useState();
  const [tccf, setTccf] = useState();
  const [balance, setBalance] = useState();
  const [eatAmount, setEatAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [buyLoading, setBuyLoading] = useState(false);
  const [eatLoading, setEatLoading] = useState(false);
  const [buyError, setBuyError] = useState(false);
  const [eatError, setEatError] = useState(false);

  async function getBalance(myContract) {
    const result = await myContract.methods.balanceOf(await getCurrentAccount()).call();
    setBalance(result);
  }

  async function getTccf(myContract) {
    const result = await myContract.methods.tccf().call()
    setTccf(result);
  }

  useEffect(()=>{
   ( async () => {
      if (window.ethereum) {
        await window.ethereum.request({method: 'eth_requestAccounts'});
        window.web3 = new Web3(window.ethereum);
        const myContract = new window.web3.eth.Contract(abi, SMART_CONTRACT_ADDRESS)
        setContract(myContract);
        setIsEthEnabled(true);
        getBalance(myContract);
        getTccf(myContract);
        return;
      }
      setIsEthEnabled(false)
    })();
  },[])

  async function getCurrentAccount() {
    const accounts = await window.web3.eth.getAccounts();
    return accounts[0];
  }

  // async function getRevertReason(txHash){
  //   const tx = await window.web3.eth.getTransaction(txHash)    
  //   var result = await window.ethereum.call(tx, tx.blockNumber)
  //   result = result.startsWith('0x') ? result : `0x${result}`
  
  //   if (result && result.substr(138)) {
  //     const reason = window.web3.utils.toAscii(result.substr(138))
  //     return reason
  //   } else {
  //     console.log('Cannot get reason - No return value')
  //   }
  // }

  async function buyCatFood() {
    try{
      setBuyLoading(true)
      setBuyError(null)
      await contract.methods.buy().send({value: buyAmount, from: await getCurrentAccount() })
      setBuyLoading(false)
      setBuyAmount('')
      getTccf(contract)
      getBalance(contract);
    } catch(e){
      console.log("error in buy", e)
      setBuyError({message: "Something went wrong!"})
      setBuyLoading(false)
      // I am unable to get the failure reason of the trasaction, which is why I'm just showing a generic message
      // "something went wrong" rather than informing the user about the actual error that occured.
      // Even tried to do eth_call on MetaMask JSON-RPC API playground. Below is one example of failed transaction
      // {
      //     "jsonrpc": "2.0",
      //     "method": "eth_call",
      //     "params": [
      //         {
      //             "blockHash": "0x8627d493170a37441f8203625094041863ee470f94cc284e97b677295e225155",
      //             "blockNumber": "0xa43650",
      //             "from": "0x48fbd767e186f48a9b557155d93ccb0558ba46c2",
      //             "gas": "0x1b27369",
      //             "gasPrice": "0x9502f90c",
      //             "hash": "0x1ba8b3c2d704dc75636f7b1908d4e8e7d26bb98ab3afe9ff8885ef0b84ac123d",
      //             "input": "0xa6f2ae3a",
      //             "nonce": "0x2d",
      //             "r": "0x2dfc0899c2a698081df79c2e7d35599ed586e594fc26e7f14c129e7b6612c25c",
      //             "s": "0x56984f1bbfd052e29894f9731b46814c70d44594d6d9a3ea803124d4ae8de605",
      //             "to": "0xf274c2bfa2e55684b10042418b4321deded23071",
      //             "transactionIndex": "0x3",
      //             "v": "0x0"
      //         },
      //         "0xa43650"
      //     ],
      //     "id": 5
      // }
    }
  }

  async function eatCatFood() {
    try{
      setEatLoading(true)
      setEatError(null)
      await contract.methods.eat(eatAmount).send({from: await getCurrentAccount() })
      setEatLoading(false)
      setEatAmount('')
      getBalance(contract)
    } catch(e){
      console.log("error in eat", e)
      setEatError({message: "Something went wrong!"})
      setEatLoading(false)

    }
  }
  
  return (
    <div className="App">
      <div>
        {!isEthEnabled ? <h1>Please connect to a wallet like metamask!</h1> :
        <React.Fragment>
          <span className='tccf'><strong>TCCF: </strong>{tccf}</span>
          <span className='balance'><strong>BALANCE: </strong>{balance}</span>
          <br/>

          <div className='buy-block block'>
            <label>Enter amount of wei to buy cat food (atleast 8888)</label>
            <input value={buyAmount} type="number" onChange={(e)=>setBuyAmount(e.target.value)}/>
            <button disabled={buyLoading || !buyAmount} onClick={buyCatFood}>BUY</button>
            {buyLoading && <span>Loading...</span>}
            {buyError &&<span>{buyError.message}</span>}
          </div>
          <br/>

          <div className='eat-block block'>
            <label>Enter amount of cat food to eat</label>
            <input value={eatAmount} type="number" onChange={(e)=>setEatAmount(e.target.value)}/>
            <button disabled={eatLoading || !eatAmount} onClick={eatCatFood}>EAT</button>
            {eatLoading && <span>Loading...</span>}
            {eatError &&<span>{eatError.message}</span>}
          </div>
        </React.Fragment> 
        }
      </div>

    </div>
  );
}

export default App;
