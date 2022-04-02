import React, { useState, useEffect } from "react";
import VaultBar from "./components/Vaultbar";
import { Segment, Menu, Icon, Form, Header, Button ,Image} from "semantic-ui-react";
import ipfs from "./ipfs";
import idl from '../idl.json'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import kp from '../keypair.json'

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

function Upload() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hosted, setHosted] = useState(false);
  const [details, setDetails] = useState({
    content: "",
    title: "",
  });
  const [image, setImage] = useState(null);
  const [imagePresent, setImagePresent] = useState(false)
  const [hash, setHash] = useState("")

  const OnlyIfTrusted = async () => {
    const { solana } = window;

    if (solana && solana.isPhantom) {
      const request = await solana.connect({ onlyIfTrusted: true });
      console.log(request.publicKey.toString());
      setWallet(request.publicKey.toString());
    }
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const addPost = async(image) => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider );

      const tx = await program.rpc.addPost(details.title, details.subject, details.content, image,{
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      })
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log(account)
      setHosted(true)
      setLoading(false)

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const onLoad = async () => {
      await OnlyIfTrusted();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const handleChange = (e) => {
    setDetails({...details, [e.target.name]: e.target.value})
  };

  const imageInput = (e) => {
    const file = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setImage(Buffer(reader.result));
      console.log(Buffer(reader.result));
    };
  };

  const submit = (e) => {
    e.preventDefault();
    console.log(details)
    setLoading(true)
    ipfs.files.add(image,(err,result) => {
        if(err){
            console.log(err)
        }
        else{
            console.log(result)
            setImagePresent(true)
            setHash(result[0].hash)
            addPost(result[0].hash)
        }
    })
  };

  return (
    <div>
      <VaultBar />
      <Header as="h1">Host Your Project</Header>
      <div className="leftAlign content">
        <Segment>
          <Header as="h3" dividing>
            Enter the details
          </Header>
          <Form>
            <Form.Input
              fluid
              label="Blog Title"
              placeholder="Blog Title ..."
              name="title"
              onChange={handleChange}
            />
            <Form.Input
              fluid
              label="Blog Subject"
              placeholder="Blog Subject ..."
              name="subject"
              onChange={handleChange}
            />
            <Form.TextArea
              label="Content"
              placeholder="Tell us more about the blog..."
              name="content"
              onChange={handleChange}
            />
            <Button
              as="label"
              htmlFor="file"
              type="button"
              primary
              icon
              labelPosition="right"
            >
              Upload Image
              <Icon name="upload" />
            </Button>
            <input type="file" id="file" hidden onChange={imageInput} />
            <br />
            <br />
            {loading ? (
              <Button secondary onClick={submit} loading>
                Host Project
              </Button>
            ) : (
              <Button secondary onClick={submit}>
                Host Project
              </Button>
            )}
            {hosted
              ? "Project Hosted successfully"
              : "Project has not been hosted"}
            {imagePresent && <Image src={"https://ipfs.io/ipfs/" + hash}  ></Image>}
          </Form>
        </Segment>
      </div>
    </div>
  );
}

export default Upload;
