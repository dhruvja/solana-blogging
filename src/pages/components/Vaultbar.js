import React, { useEffect, useState } from "react";
import { Segment, Menu, Icon } from "semantic-ui-react";
import { Link, Redirect } from "react-router-dom";

function Vaultbar(props) {
  const [wallet, setWallet] = useState(null);

  const handleItemClick = () => {
    console.log("Item Clicked");
  };


  const connectToWeb3 = async() => {
      const {solana} = window;

      if(solana && solana.isPhantom){
        const request = await solana.connect();
        setWallet(request.publicKey.toString())
      }
      else{
          alert("Not Phantom wallet found")
      }
  }

  const OnlyIfTrusted = async() => {
    const {solana} = window;

    if(solana && solana.isPhantom){
        const request = await solana.connect({onlyIfTrusted: true})
        console.log(request.publicKey.toString());
        setWallet(request.publicKey.toString())
    }
  }

  // useEffect(() => {
  //   OnlyIfTrusted();
  //   // const onLoad = async () => {
  //   //   console.log("hey")
  //   //     await OnlyIfTrusted();
  //   //     await connectToWeb3();
  //   //   };
  //   //   window.addEventListener("load", onLoad);
  //   //   return () => window.removeEventListener("load", onLoad);
  // },[])

  return (
    <div>
      <Segment inverted>
        <Menu inverted pointing secondary stackable>
          <Menu.Item header>On Chain Blog Platform</Menu.Item>
          <Link to="/upload">
            <Menu.Item
              name="Host"
              active={props.type === "host"}
              onClick={handleItemClick}
            />
          </Link>
          <Link to="/dashboard">
            <Menu.Item
              name="Projects"
              active={props.type === "projects"}
              onClick={handleItemClick}
            />
          </Link>
          <Link to="/investments">
            <Menu.Item
              name="Previous Investments"
              active={props.type === "investment"}
              onClick={handleItemClick}
            />
          </Link>
          <Menu.Menu position="right">
            <Menu.Item name="video camera">
              {wallet ? (
                <Icon name="circle" color="green" onClick={connectToWeb3} />
              ) : (
                <Icon name="circle" color="red" onClick={connectToWeb3} />
              )}
              {wallet ? "Connected" : "Not Connected"}
            </Menu.Item>
          </Menu.Menu>
          {/* </Link> */}
        </Menu>
      </Segment>
    </div>
  );
}

export default Vaultbar;
