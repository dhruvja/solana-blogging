import React,{useEffect, useState} from 'react'
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
    Card
} from "semantic-ui-react";
import {Link, Redirect} from 'react-router-dom'
import Vaultbar from './components/Vaultbar';
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

function Projects() {

    const [webInfo, setWebInfo] = useState({})
    const [projects, setProjects] = useState([])
    const [present, setPresent] = useState(false)
    const [redirect,setRedirect] = useState(false)
    const [wallet, setWallet] = useState(null)

    const OnlyIfTrusted = async() => {
      const {solana} = window;
  
      if(solana && solana.isPhantom){
          const request = await solana.connect({onlyIfTrusted: true})
          console.log(request.publicKey.toString());
          setWallet(request.publicKey.toString())
          getPosts()
      }
    }

    const getProvider = () => {
      const connection = new Connection(network, opts.preflightCommitment);
      const provider = new Provider(
        connection, window.solana, opts.preflightCommitment,
      );
      return provider;
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
  
    const getPosts = async() => {
      try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider );
        const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
        console.log("got the account", account)
        setProjects(account.postList)
        setPresent(true)
  
      } catch (error) {
        console.log(error)
        createAccount();
      }
    }

    
  
    useEffect(() => {
      getPosts();
      const onLoad = async () => {
        console.log("hey")
          await OnlyIfTrusted();
        };
        window.addEventListener("load", onLoad);
        return () => window.removeEventListener("load", onLoad);
    },[])

    useEffect(() => {
      if (wallet) {
        console.log("Fetching gif list...");
  
        getPosts();
      }
    }, [wallet]);

    return (
        <div>
        {/* {redirect && <Redirect to="/payment" ></Redirect> } */}
            <Vaultbar />
            
            <Header as="h1">
                Projects
            </Header>
            <div className="leftAlign content">
                <Segment>
                    <Header as="h3" dividing>
                        All the Projects
                    </Header>
                    <Grid columns={3}>
                    {
                        present && projects.map((project) => {
                          if(project.image == "")
                            project.image = "QmW3LDx9txmQonBpTqpUJtMbWTZWp9cRfh3ptKfkiHodLc";
                            return (
                                
                                <Grid.Column >
                                {/* <Link to={{
                                    pathname: "/payment",
                                    state: {id: project.project_id}
                                }} > */}
                                    <Card raised >
                                        <Image src={"https://ipfs.io/ipfs/" + project.image} wrapped ui={false} />
                                        <Card.Content>
                                        <Card.Header>{project.title}</Card.Header>
                                        <Card.Meta>27/12/2019</Card.Meta>
                                        <Card.Description>
                                            {project.subject}
                                        </Card.Description>
                                        </Card.Content>
                                        <Card.Content extra >
                                        <a>
                                            <Icon name='user' />
                                            Dhruv
                                        </a>
                                        </Card.Content>
                                    </Card>
                                    {/* </Link> */}
                                </Grid.Column>
                                
                            )
                        })
                    }
                        
                    </Grid>
                </Segment>
            </div>
            
        </div>
    )
}

export default Projects
