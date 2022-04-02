import React, { useState } from "react";
import Startbar from "./components/Startbar";
import {
  Header,
  Card,
  Image,
  Icon,
  Segment,
  Button,
  Message,
  Form,
  Grid,
} from "semantic-ui-react";
import {Redirect} from 'react-router-dom'
import idl from '../idl.json'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
let baseAccount = Keypair.generate();

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

function Login() {
  const [wallet, setWallet] = useState(null);
  const [present, setPresent] = useState(false)
  const [init, setInit] = useState(true)

  const connectWallet = async () => {
    const { solana } = window;

    if (solana && solana.isPhantom) {
      const request = await solana.connect();
      console.log(request.publicKey.toString());
      setWallet(request.publicKey.toString())
      // setPresent(true)
      await getPosts();
    }
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const getPosts = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider );
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      console.log("got the account", account)
      setPresent(true)

    } catch (error) {
      console.log(error)
      setInit(false)
    }
  }

  const createAccount = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      })
      console.log("Created a account: ", baseAccount.publicKey.toString());
      setPresent(true)
    } catch (error) {
      console.log(error);
    }
  }

  


  return (
    <div>
      {present && <Redirect to="/dashboard" />}
      <Startbar />
      <div>
        <br />
        {/* <Header as="h1">Welcome to On Chain Blogging</Header> */}
        <div className="leftAlign content">
          <Grid
            textAlign="center"
            style={{ height: "80vh" }}
            verticalAlign="middle"
          >
            <Grid.Column style={{ maxWidth: 450 }}>
              <Header as="h2" textAlign="center">
                On chain Blogging
              </Header>
              {!wallet && (
                <Button color="violet" fluid size="large" onClick={connectWallet}>
                  Connect Wallet
                </Button>
              ) 
              // : (
              //   <Button color="blue" fluid size="large">
              //     Wallet Connected
              //   </Button>
              }
              {!init && <Button color="teal" fluid size="large" onClick={createAccount}>
                  Do One time Initialization
                </Button>}
            </Grid.Column>
          </Grid>
        </div>
      </div>
    </div>
  );
}

export default Login;
