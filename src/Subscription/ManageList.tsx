import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { CoreFrame } from "../CoreFrame";
import { useEffect, useState } from "react";
import { Subscription } from "../types";
import { getSubscriptionsByUser } from "../network";
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

  let statusText;
  if (
    props.subscription.status === "paid" ||
    props.subscription.status === "pending"
  ) {
    statusText = `Next payment: ${nextPaymentDate.toDateString()}`;
  } else if (
    props.subscription.status === "expired"
  ) {
    statusText = "Expired.";
  } else if (
    props.subscription.status === "terminated"
  ) {
    statusText = "Terminated.";
  }

  return (
    <div
      className="manageListElement verticalFlex"
      onClick={() => {
        navigate(
          "/subscription/" +
            props.subscription.subscriptionHash
        );
      }}
    >
      <p>
        {props.subscription.product.productName}
      </p>
      <p className="minor1Font">{statusText}</p>
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
          validatedAddress
        );
      console.log(
        "subscriptions from the indexer",
        subscriptions
      );
      setSubscriptions(subscriptions);
    })();
  }, [validatedAddress]);

  if (!validatedAddress) {
    return (
      <CoreFrame title="Your subscriptions">
        <p>
          Please enter a valid address is in the
          url in format /manage/0x"your-address"
        </p>
      </CoreFrame>
    );
  }

  return (
    <CoreFrame
      title="My subscriptions"
      paddingHorizontal={32}
    >
      {subscriptions === undefined ? (
        <p>Loading...</p>
      ) : subscriptions.length === 0 ? (
        <p>No subscriptions.</p>
      ) : null}
      <div className="verticalFlex">
        {subscriptions?.map(
          (subscription, index) => (
            <SingleSubscriptionElement
              subscription={subscription}
              key={index}
            />
          )
        )}
        <div className="heightFiller" />
      </div>
    </CoreFrame>
  );
}
