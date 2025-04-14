import React, { useEffect, useState } from 'react';
import '../index.css';
import { basic_ethereum } from 'declarations/basic_ethereum';
import { Actor } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";

const App = () => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState("");
  const [isAuthed, setAuthed] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [authCreated, setAuthCreated] = useState(false);
  const [myAddress, setMyAddress] = useState("");

  const [targetAcc, setTargetAcc] = useState('');
  const [amountToSend, setAmountToSend] = useState(0);

  const [transactionResult, setTransactionResult] = useState('');

  const renderAccountBalance = async () => {
    // showLoading();
    try {
      const data = await basic_ethereum.get_balance([account]);
      setBalance(data.toString() + ' WEI');
      console.log("Fetched balance: ", data);
    } catch (error) {
      console.error('Error rendering day detail:', error);
    }
    // hideLoading();
  };


  const identityProvider = () => {
    if (process.env.DFX_NETWORK === "local") {
      return `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;
    } else if (process.env.DFX_NETWORK === "ic") {
      return `https://${process.env.CANISTER_ID_INTERNET_IDENTITY}.ic0.app`;
    } else {
      return `https://${process.env.CANISTER_ID_INTERNET_IDENTITY}.dfinity.network`;
    }
  };

  const onIdentityUpdate = async () => {
    Actor.agentOf(basic_ethereum).replaceIdentity(authClient.getIdentity());
    const isAuthenticated = await authClient.isAuthenticated();
    setAuthed(isAuthenticated);
  };

  const createAuthClient = async () => {
    const authClient = await AuthClient.create();
    setAuthClient(authClient);
    await onIdentityUpdate();
  };
  

  useEffect(() => {
    if (!authCreated) {
      createAuthClient();
      setAuthCreated(true);
    }
  }, [authCreated]);

  const login = async () => {
    await new Promise((resolve, reject) => authClient.login({
      identityProvider: identityProvider(),
      onSuccess: resolve,
      onError: reject
    }));
    await onIdentityUpdate();
    await getMyEthAddress();
    setAccount(myAddress);
    await renderAccountBalance();
  };
  
  
  const logout = async () => {
    await authClient.logout();
    await onIdentityUpdate();
  };

  const getMyEthAddress = async () => {
    const address = await basic_ethereum.ethereum_address([]);
    setMyAddress(address);
  };

  const send = async () => {
    const hash = await basic_ethereum.send_eth(targetAcc, amountToSend);
    setTransactionResult(hash);
  };

  return (
    <div id="root">
      <h1>Wallet ETH Sepoia</h1>

      {
        !isAuthed ?
        <button onClick={login}>Login</button>
        :
        <div>
          <button onClick={logout}>Logout</button>

          <p>Your address: {myAddress}</p>
          <div id="calendar">
            <input 
              type="text" 
              value={account}
              onChange={(e) => setAccount(e.target.value)} 
              placeholder="Enter account"
            />
            <button onClick={renderAccountBalance}>Check balance</button> 

          

            <h2>
              Balance: {balance}
            </h2>

            <h3>Send ETH</h3>
            <input 
              type="text" 
              value={targetAcc}
              onChange={(e) => setTargetAcc(e.target.value)} 
              placeholder="To..."
            />


            <input 
              type="number" 
              value={amountToSend}
              onChange={(e) => setAmountToSend(parseFloat(e.target.value))} 
              placeholder="Amount (WEI)"
            />

            <button onClick={send}>Login</button>

            {transactionResult != "" ? 
            "Transaction hash: " + transactionResult : ""}
            
          </div>
        </div>
        
      }

      
      
    </div>
  );
};

export default App;
