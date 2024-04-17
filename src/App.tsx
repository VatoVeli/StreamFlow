import logo from "./logo.svg";
import { useEffect, useState } from "react";
import "./App.css";
import { BN } from "bn.js";
import Types, {
  IChain,
  ICluster,
  GenericStreamClient,
  getBN,
} from "@streamflow/stream";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";


async function connectWallet() {
  const signerWalletAdapter = new PhantomWalletAdapter();
  await signerWalletAdapter.connect();
  return signerWalletAdapter;
}

export const client = new GenericStreamClient<Types.IChain.Solana>({
  chain: IChain.Solana,
  clusterUrl: "https://api.devnet.solana.com",
  cluster: ICluster.Devnet,
});

function App() {
  const [wallet, setWallet] = useState<PhantomWalletAdapter | null>(null);
  useEffect(() => {
    connectWallet()
      .then((signerWalletAdapter) => {
        if (signerWalletAdapter.connected) {
          console.log("Wallet connected");
          setWallet(signerWalletAdapter);
        } else {
          console.log("Wallet not connected");
        }
      })
      .catch((error) => {
        console.error("Error connecting wallet:", error);
      });
  }, []);

  const createStream = async () => {
    try {
      if (!wallet) return;
      if (!wallet.publicKey) throw new Error("Wallet not connected");

      const solanaParams = { sender: wallet, isNative: false };
      
      const createStreamParams: Types.ICreateStreamData = {
        start: 10, // Timestamp (in seconds) when the stream/token vesting starts.
        amount: getBN(0.05, 9), // depositing 100 tokens with 9 decimals mint.
        period: 1, // Time step (period) in seconds per which the unlocking occurs.
        cliff: 1643363040, // Vesting contract "cliff" timestamp in seconds.
        cliffAmount: new BN(10), // Amount unlocked at the "cliff" timestamp.
        amountPerPeriod: getBN(0.05, 9), // Release rate: how many tokens are unlocked per each period.
        name: "Transfer to Jane Doe.", // The stream name or subject.
        canTopup: false, // setting to FALSE will effectively create a vesting contract.
        cancelableBySender: true, // Whether or not sender can cancel the stream.
        cancelableByRecipient: false, // Whether or not recipient can cancel the stream.
        transferableBySender: true, // Whether or not sender can transfer the stream.
        transferableByRecipient: false, // Whether or not recipient can transfer the stream.
        automaticWithdrawal: true, // Whether or not a 3rd party (e.g. cron job, "cranker") can initiate a token withdraw/transfer.
        withdrawalFrequency: 10, // Relevant when automatic withdrawal is enabled. If greater than 0 our withdrawor will take care of withdrawals. If equal to 0 our withdrawor will skip, but everyone else can initiate withdrawals.
        partner: "", //  (optional) Partner's wallet address (string | null).
        recipient: "73GoVzZJH8Tx1UQEtT6U7nowL1Ha2AR7WvZuQKkVSZAb", // Recipient address.
        tokenId: "6eyiGGS9EyzpPd67hWYuyoVA7TcKuzAba9WpXRCxTYEt", // Token mint address.
      };
      const { ixs } = await client.create(createStreamParams, solanaParams); // Create the stream
      console.log("Stream created. ", ixs);
    } catch (error) {
      console.error("Error creating stream:", error);
    }
  };

  const topUpStream = async () => {
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    const topupStreamParams: Types.ITopUpData = {
      id: "PBwG6VGE629MUSa8Hh6msB5rfZBbhR7kxeCZCvQXnTJ", // Identifier of a stream to be topped up.
      amount: getBN(100, 9), // Specified amount to topup (increases deposited amount).
    };

    const solanaParams = {
      invoker: wallet, // SignerWalletAdapter or Keypair signing the transaction
      // isNative: // [ONLY FOR wSOL STREAMS] [optional] Wether topup is with Native Solanas
    };

    try {
      const { ixs } = await client.topup(topupStreamParams, solanaParams);
      console.log(ixs);
    } catch (error) {
      console.log(error);
    }
  };

  const getStream = async () => {
    const data: Types.IGetOneData = {
      id: "", // Identifier of a stream
    };

    try {
      const stream = await client.getOne(data);
      console.log(stream);
    } catch (error) {
      console.log(error);
    }
  };

  const getMultipleStreams = async () => {
    const data: Types.IGetAllData = {
      address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
    };

    try {
      const streams = client.get(data);
      console.log(streams);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          StreamFlow Finance App
        </p>
        <br />
        <button onClick={() => createStream()}>Create Stream</button>
        <br />
        <button onClick={() => topUpStream()}>TopUp Stream</button>
        <br />
        <button onClick={() => getStream()}>Get Stream</button>
        <br />
        <button onClick={() => getMultipleStreams()}>
          Get Multiple Streams
        </button>
      </header>
    </div>
  );
}

export default App;
