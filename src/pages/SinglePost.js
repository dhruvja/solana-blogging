import React, { useEffect, useState } from "react";
import {
  Segment,
  Menu,
  Icon,
  Header,
  Sidebar,
  Divider,
  Button,
  Grid,
  Image,
  Form,
  Card,
  Modal
} from "semantic-ui-react";
import { Link, Redirect } from "react-router-dom";
import Vaultbar from "./components/Vaultbar";
import idl from "../idl.json";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import kp from "../keypair.json";
import {
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} from "@solana/web3.js";

const bs58 = require("bs58");

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);
// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl("devnet");

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed",
};

const connection = new Connection(network, opts.preflightCommitment);

function SinglePost(props) {
  const [blog, setBlog] = useState({});
  const [present, setPresent] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [value, setValue] = useState(0);
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const OnlyIfTrusted = async () => {
    console.log("Trusted");
    const { solana } = window;

    if (solana && solana.isPhantom) {
      const request = await solana.connect({ onlyIfTrusted: true });
    //   console.log(request.publicKey.toString());
      setWallet(request.publicKey);
    }
  };

  const connectToWeb3 = async () => {
    const { solana } = window;

    if (solana && solana.isPhantom) {
      const request = await solana.connect();
	//   console.log(request.publicKey.toString())
      setWallet(request.publicKey);
    } else {
      alert("Not Phantom wallet found");
    }
  };

  useEffect(() => {
    const dets = props.location.state.data;
    setBlog(dets);
    setPresent(true);
    console.log(dets);
    console.log(dets.upvote.words[0]);
    OnlyIfTrusted();
  }, []);

  const payUser = async (value) => {
    try {
		setLoading(true)
      console.log(blog.userAddress.toString());
      const toAddress = blog.userAddress;
      if (!wallet) await connectToWeb3();
      console.log(typeof wallet, wallet);
      let walletAccountInfo = await connection.getAccountInfo(
        baseAccount.publicKey
      );
      console.log(walletAccountInfo);
      console.log("Balance before payment", walletAccountInfo.lamports);

      let recentBlockhash = await connection.getRecentBlockhash();
      let manualTransaction = new Transaction({
        recentBlockhash: recentBlockhash.blockhash,
        feePayer: wallet,
      });
      console.log(typeof wallet, typeof toAddress);
      manualTransaction.add(
        web3.SystemProgram.transfer({
          fromPubkey: wallet,
          toPubkey: toAddress,
          lamports: LAMPORTS_PER_SOL * 1.5,
        })
      );
      let sign = await window.solana.signTransaction(manualTransaction);
      let signature = await connection.sendRawTransaction(sign.serialize());
      let result = await connection.confirmTransaction(
        signature,
        "myFirstTransaction"
      );
      console.log("send money", result);
	  setLoading(false)
    } catch (error) {
      console.log("Couldnt pay ", error);
	  setLoading(false)
    }
  };

  const airDrop = async () => {
    try {
      const double = LAMPORTS_PER_SOL * 2;
      console.log(LAMPORTS_PER_SOL);
      console.log(wallet);
      const airdropSignature = await connection.requestAirdrop(wallet, double);
      const result = await connection.confirmTransaction(airdropSignature);
      console.log(result);
    } catch (error) {
      console.log("Couldnt airdrop ", error);
    }
  };

  return (
    <div>
      <Modal
        closeIcon
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
      >
        <Header icon="archive" content="Archive Old Messages" />
        <Modal.Content>
          <Form> 
			  <input type="number"></input>
		  </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color="red" onClick={() => setOpen(false)}>
            <Icon name="remove" /> No
          </Button>
          <Button color="green" onClick={() => setOpen(false)}>
            <Icon name="checkmark" /> Yes
          </Button>
        </Modal.Actions>
      </Modal>
      <Vaultbar />
      <Header as="h1">Post</Header>
      <div className="leftAlign content">
        <Segment>
          <Header as="h3" dividing>
            Blog Post
          </Header>
          {present && (
            <div>
              <Header as="h1" style={{ textAlign: "center" }}>
                {blog.title}
              </Header>
              <Header as="h3">{blog.subject}</Header>
              <Image
                src={"https://ipfs.io/ipfs/" + blog.image}
                centered
                size="massive"
              />
              <Header as="h5">{blog.content}</Header>
              <Button color="teal" onClick={airDrop}>
                Upvote {blog.upvote.words[0]}
              </Button>
              { loading ? <Button color="violet" loading>
                Fund {blog.fund.words[0]} Sol
              </Button> : <Button color="violet" onClick={payUser}>
                Fund {blog.fund.words[0]} Sol
              </Button>}
            </div>
          )}

          <br />
          <br />
        </Segment>
        <br />
        <br />
        <br />
      </div>
    </div>
  );
}

export default SinglePost;
