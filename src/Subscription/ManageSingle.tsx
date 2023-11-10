import { useParams } from "react-router-dom";
import { CoreFrame } from "../CoreFrame";
import { useEffect, useState } from "react";
import { getSubscriptionByHash } from "../network";
import { Hex, isAddressEqual } from "viem";
import {
  Subscription,
  SupportedChain,
  UserData,
} from "../types";
import {
  SubscriptionInfo,
  SubscriptionLine,
} from "./Table";
import {
  capitalize,
  chainInList,
  shortenAddress,
} from "../utils";
import {
  useAccount,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import {
  ConnectButton,
  TerminateSubscription,
} from "./ActionButtons";
import { GatewayUrl } from "../constants";

function ComputedSubscriptionInfo(props: {
  subscription: Subscription;
  onTerminate: () => void;
  children: any;
}) {
  const sub = props.subscription; // just to make it shorter

  const nextPaymentDate = new Date(
    sub.nextPaymentAt * 1000
  );
  let nextPaymentText: string | undefined;
  if (sub.status === "paid") {
    nextPaymentText =
      nextPaymentDate.toLocaleDateString();
  } else if (sub.status === "pending") {
    nextPaymentText = "Right now";
  }

  return (
    <SubscriptionInfo>
      <SubscriptionLine
        title="Title"
        value={<p>{sub.product.productName}</p>}
      />
      <SubscriptionLine
        title="Website"
        value={
          <a
            href={sub.product.merchantDomain}
            className="SubscriptionLineText"
          >
            {sub.product.merchantDomain}
          </a>
        }
      />
      <SubscriptionLine
        title="Terms"
        value={
          <p>
            {sub.product.humanAmount}{" "}
            {sub.product.tokenSymbol} /{" "}
            {sub.product.periodHuman}
          </p>
        }
      />
      <SubscriptionLine
        title="Wallet"
        value={
          <p>{shortenAddress(sub.userAddress)}</p>
        }
      />
      <SubscriptionLine
        title="Chain"
        value={<p>{sub.product.chain.name}</p>}
      />
      <SubscriptionLine
        title="Status"
        value={<p>{capitalize(sub.status)}</p>}
      />
      {nextPaymentText && (
        <SubscriptionLine
          title="Next payment"
          value={<p>{nextPaymentText}</p>}
        />
      )}
      {sub.status !== "terminated" &&
        sub.status !== "expired" && (
          <SubscriptionLine
            title="Terminate?"
            value={
              <p
                className="underline"
                onClick={props.onTerminate}
              >
                terminate
              </p>
            }
          />
        )}
      {props.children}
    </SubscriptionInfo>
  );
}

function TerminationBlock(props: {
  subscription: Subscription;
}) {
  const { switchNetwork } = useSwitchNetwork();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const [terminated, setTerminated] =
    useState(false);

  const sub = props.subscription; // just to make it shorter
  let userData: UserData | undefined;
  if (isConnected) {
    const validChain =
      chain!.id === sub.product.chain.id
        ? (chain as SupportedChain)
        : undefined;

    userData = {
      address: address!,
      shortAddress: shortenAddress(address!),
      chain: chain!,
      validChain,
      switchChain: switchNetwork!,
    };
  }

  const onTerminated = () => {
    setTerminated(true);
  };

  if (terminated) {
    return (
      <p>Sad to see you go :( Terminated.</p>
    );
  }

  if (!userData) {
    return <ConnectButton />;
  }

  if (
    !isAddressEqual(
      userData.address,
      sub.userAddress
    )
  ) {
    return (
      <p>
        Wrong account. Switch to{" "}
        {shortenAddress(sub.userAddress)}.
      </p>
    );
  }

  if (!userData.validChain) {
    return (
      <div className="verticalFlex">
        <p>You need to change blockchain.</p>
        <button
          onClick={() =>
            userData!.switchChain(
              sub.product.chain.id
            )
          }
        >
          Switch to {sub.product.chain.name}
        </button>
      </div>
    );
  }
  return (
    <TerminateSubscription
      chain={userData.validChain}
      subscriptionHash={sub.subscriptionHash}
      onTerminated={onTerminated}
    />
  );
}

export function ManageSingle() {
  const { subscriptionHash } = useParams();

  const [subscription, setSubscription] =
    useState<Subscription | null>();
  const [wannaTerminate, setWannaTerminate] =
    useState(false);

  useEffect(() => {
    if (!subscriptionHash) return;
    getSubscriptionByHash(
      subscriptionHash as Hex
    ).then((subscription) =>
      setSubscription(subscription)
    );
  });

  if (subscriptionHash === undefined) {
    return (
      <CoreFrame title="Manage subscription">
        <p>
          Bad url. No subscription hash was
          provided.
        </p>
      </CoreFrame>
    );
  }

  if (subscription === undefined) {
    return (
      <CoreFrame title="Manage subscription">
        <p>Loading...</p>
      </CoreFrame>
    );
  }

  if (subscription === null) {
    return (
      <CoreFrame title="Manage Subscription">
        <p>
          Subscription with this hash is not
          known.
        </p>
      </CoreFrame>
    );
  }

  return (
    <CoreFrame
      title="Manage Subscription"
      backPath={`/manage/${subscription.userAddress}`}
    >
      <ComputedSubscriptionInfo
        subscription={subscription}
        onTerminate={() => {
          setWannaTerminate(true);
        }}
      >
        {wannaTerminate && (
          <TerminationBlock
            subscription={subscription}
          />
        )}
      </ComputedSubscriptionInfo>
    </CoreFrame>
  );
}
