import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { CoreFrame } from "./CoreFrame";
import { useEffect, useState } from "react";
import { Subscription } from "./types";
import { getSubscriptionsByUser } from "./network";
import { Hex, getAddress } from "viem";

function SingleSubscriptionElement(props: {
  subscription: Subscription;
}) {
  const navigate = useNavigate();
  const nextPaymentTimestamp =
    props.subscription.startTs +
    props.subscription.product.period *
      (props.subscription.paymentsMade + 1);

  const nextPaymentDate = new Date(
    nextPaymentTimestamp * 1000
  );
  return (
    <div
      className="subscriptionListElement"
      onClick={() => {
        navigate(
          "/subscription/" +
            props.subscription.subscriptionHash
        );
      }}
    >
      <p>
        {props.subscription.product.productName} @{" "}
        {
          props.subscription.product
            .merchantDomain
        }
      </p>
      <p>
        {props.subscription.product.humanAmount}{" "}
        {props.subscription.product.tokenSymbol} /{" "}
        {props.subscription.product.periodHuman}
      </p>
      <p>
        Next payment at{" "}
        {nextPaymentDate.toLocaleDateString()}{" "}
        {nextPaymentDate.toLocaleTimeString()}
      </p>
    </div>
  );
}

export function ManageList() {
  const { address } = useParams();
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>();

  let validatedAddress: Hex | undefined =
    undefined;
  if (address) {
    try {
      validatedAddress = getAddress(address);
    } catch (e) {
      console.error("Invalid address", e);
    }
  }

  useEffect(() => {
    (async () => {
      if (!validatedAddress) return;
      const subscriptions =
        await getSubscriptionsByUser(
          address as Hex
        );
      console.log(
        "subscriptions from the indexer",
        subscriptions
      );
      setSubscriptions(subscriptions);
    })();
  }, [address]);

  if (!validatedAddress) {
    return (
      <CoreFrame title="My subscriptions">
        <p>
          Please enter a valid address is in the
          url in format /manage/0x"your-address"
        </p>
      </CoreFrame>
    );
  }

  if (!subscriptions) {
    return (
      <CoreFrame title="My subscriptions">
        <p>Loading...</p>
      </CoreFrame>
    );
  }

  return (
    <CoreFrame
      title="My subscriptions"
      paddingHorizontal={32}
    >
      {subscriptions.map(
        (subscription, index) => (
          <SingleSubscriptionElement
            subscription={subscription}
            key={index}
          />
        )
      )}
    </CoreFrame>
  );
}
