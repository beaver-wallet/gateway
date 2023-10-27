import { useEffect, useState } from "react";
import { Subscription } from "./types";
import { getAllSubscriptions } from "./network";

function SubscriptionLine(props: {
  subscription: Subscription;
}) {
  const sub = props.subscription;
  const nextPaymentDate = new Date(
    sub.nextPaymentAt * 1000
  );

  let statusColor = "green";
  if (sub.status === "expired") {
    statusColor = "red";
  } else if (sub.terminated) {
    statusColor = "blue";
  } else if (sub.status === "pending") {
    statusColor = "yellow";
  }

  return (
    <div
      style={{
        padding: 8,
        borderBottom: "1px dotted grey",
      }}
    >
      <a
        style={{
          display: "inline",
          marginRight: 16,
          color: "black ",
        }}
        href={`/subscription/${sub.subscriptionHash}`}
      >
        {sub.subscriptionHash}
      </a>
      <p
        style={{
          display: "inline",
          marginRight: 16,
        }}
      >
        Status:{" "}
        <span
          style={{ backgroundColor: statusColor }}
        >
          {sub.status}
        </span>
      </p>
      <p
        style={{
          display: "inline",
          marginRight: 16,
        }}
      >
        Next payment at:{" "}
        {nextPaymentDate.toLocaleDateString()}{" "}
        {nextPaymentDate.toLocaleTimeString()}
      </p>
      <p
        style={{
          display: "inline",
          marginRight: 16,
        }}
      >
        Merchant: {sub.product.merchantAddress}
      </p>
    </div>
  );
}

export function All() {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>();

  useEffect(() => {
    const getSubscriptions = async () => {
      console.log("Querying subscriptions");
      const subscriptions =
        await getAllSubscriptions();
      console.log(
        "Got subscriptions",
        subscriptions
      );
      setSubscriptions(subscriptions);
    };
    getSubscriptions();
  }, []);
  return (
    <div>
      {subscriptions === undefined ? (
        <p>Loading...</p>
      ) : subscriptions.length === 0 ? (
        <p>No subscriptions.</p>
      ) : null}
      {subscriptions?.map(
        (subscription, index) => (
          <SubscriptionLine
            key={index}
            subscription={subscription}
          />
        )
      )}
    </div>
  );
}
