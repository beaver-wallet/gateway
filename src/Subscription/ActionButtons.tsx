import { Hex, encodeFunctionData } from "viem";
import {
  executeTransaction,
  hashProduct,
} from "./utils";
import { RouterABI } from "../abi";
import {
  ChainsSettings,
  PaymentPeriod,
} from "../constants";
import { queryProductExistsOnChain } from "../network";
import { useState } from "react";
import {
  SubscriptionPrompt,
  SupportedChain,
} from "../types";
import { erc20ABI } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function ConnectButton() {
  const { openConnectModal } = useConnectModal();

  return (
    <button onClick={openConnectModal}>
      Connect Wallet
    </button>
  );
}

export function InsufficientBalance(props: {
  tokenSymbol: string;
  onToppedUp: () => void;
}) {
  return (
    <div className="verticalFlex">
      <p className="centralText">
        You don't have enough {props.tokenSymbol}.
      </p>
      <button onClick={props.onToppedUp}>
        I topped up
      </button>
    </div>
  );
}

export function InsufficientAllowance(props: {
  chain: SupportedChain;
  tokenSymbol: string;
  onApproved: () => void;
  minimumApproval: number;
}) {
  const [amount, setAmount] = useState("");
  const floatAmount = parseFloat(amount) || 0;
  const [message, setMessage] = useState("");
  const [isSendingTx, setIsSendingTx] =
    useState(false);

  const onApprove = async () => {
    setMessage("");
    if (floatAmount < props.minimumApproval) {
      setMessage(
        `Approve at least ${props.minimumApproval} ${props.tokenSymbol}.`
      );
      return;
    }

    const chainSettings =
      ChainsSettings[props.chain.id];
    const tokenProps =
      chainSettings.tokens[props.tokenSymbol];
    const txData = {
      value: BigInt(0),
      to: tokenProps.address,
      data: encodeFunctionData({
        abi: erc20ABI as any,
        functionName: "approve",
        args: [
          chainSettings.routerAddress,
          floatAmount * 10 ** tokenProps.decimals,
        ],
      }),
    };

    const success = await executeTransaction(
      txData,
      setIsSendingTx,
      setMessage
    );
    if (success) props.onApproved();
  };

  return (
    <div className="verticalFlex">
      <p>
        Approve {props.tokenSymbol} to be spent.
        You won't be charged yet.
      </p>
      {message && <p>{message}</p>}
      {!isSendingTx && (
        <input
          placeholder={(
            props.minimumApproval * 12
          ).toString()}
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
          }}
        />
      )}
      {!isSendingTx && (
        <button onClick={onApprove}>
          Approve
        </button>
      )}
    </div>
  );
}

export function StartSubscription(props: {
  chain: SupportedChain;
  prompt: SubscriptionPrompt;
  onStarted: () => void;
}) {
  const [message, setMessage] = useState("");
  const [isSendingTx, setIsSendingTx] =
    useState(false);

  const onStart = async () => {
    const chainSettings =
      ChainsSettings[props.chain.id];
    const tokenProps =
      chainSettings.tokens[
        props.prompt.tokenSymbol
      ];

    const uintAmount =
      props.prompt.amount *
      10 ** tokenProps.decimals;

    const productHash = hashProduct(
      props.chain,
      props.prompt.merchantAddress,
      props.prompt.productMetadataCID,
      tokenProps.address as Hex,
      uintAmount,
      props.prompt.periodSeconds,
      props.prompt.freeTrialLengthSeconds,
      PaymentPeriod
    );

    const productExists =
      await queryProductExistsOnChain(
        props.chain,
        productHash
      );

    let txData;
    if (!productExists) {
      txData = {
        to: chainSettings.routerAddress,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: RouterABI as any,
          functionName:
            "setupEnvironmentAndStartSubscription",
          args: [
            props.prompt.merchantAddress,
            tokenProps.address,
            uintAmount,
            props.prompt.periodSeconds,
            props.prompt.freeTrialLengthSeconds,
            PaymentPeriod,
            props.prompt.productMetadataCID,
            props.prompt.subscriptionMetadataCID,
          ],
        }),
      };
    } else {
      txData = {
        to: chainSettings.routerAddress,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: RouterABI as any,
          functionName: "startSubscription",
          args: [
            productHash,
            props.prompt.subscriptionMetadataCID,
          ],
        }),
      };
    }

    const success = await executeTransaction(
      txData,
      setIsSendingTx,
      setMessage
    );
    if (success) props.onStarted();
  };

  return (
    <div className="verticalFlex">
      {message && <p>{message}</p>}
      {!isSendingTx && (
        <button onClick={onStart}>
          Start subscription
        </button>
      )}
    </div>
  );
}

export function TerminateSubscription(props: {
  chain: SupportedChain;
  subscriptionHash: string;
  onTerminated: () => void;
}) {
  const [message, setMessage] = useState("");
  const [isSendingTx, setIsSendingTx] =
    useState(false);

  const onTerminate = async () => {
    const chainSettings =
      ChainsSettings[props.chain.id];

    const txData = {
      to: chainSettings.routerAddress,
      value: BigInt(0),
      data: encodeFunctionData({
        abi: RouterABI as any,
        functionName: "terminateSubscription",
        args: [`0x${props.subscriptionHash}`],
      }),
    };

    const success = await executeTransaction(
      txData,
      setIsSendingTx,
      setMessage
    );
    if (success) props.onTerminated();
  };

  return (
    <div className="verticalFlex">
      {message && <p>{message}</p>}
      {!isSendingTx && (
        <button onClick={onTerminate}>
          Terminate
        </button>
      )}
    </div>
  );
}
