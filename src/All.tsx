import { useEffect, useState } from "react";
import { Subscription } from "./types";
import { getAllSubscriptions } from "./network";

function SubscriptionLine(props: {
  subscription: Subscription;
}) {
  const sub = props.subscription;
  const nextPaymentTimestamp =
    sub.startTs +
    sub.periodSeconds * (sub.paymentsMade + 1);

  const nextPaymentDate = new Date(
    nextPaymentTimestamp * 1000
  );
  const currentTs = Date.now() / 1000;

  const needsToBePaidBefore =
    sub.startTs +
    sub.periodSeconds * sub.paymentsMade +
    sub.paymentPeriod;
  const shouldHaveBeenPaid =
    currentTs > nextPaymentTimestamp;

  const expired = currentTs > needsToBePaidBefore;

  let status = "Active";
  let statusColor = "green";
  if (expired) {
    status = "Expired";
    statusColor = "red";
  } else if (sub.terminated) {
    status = "Terminated";
    statusColor = "blue";
  } else if (shouldHaveBeenPaid) {
    status = "Missing payment!";
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
          {status}
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
        Merchant: {sub.merchantAddress}
      </p>
    </div>
  );
}

export function All() {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>();

  useEffect(() => {
    const getSubscriptions = async () => {
      const subscriptions =
        await getAllSubscriptions();
      setSubscriptions(subscriptions);
    };
    getSubscriptions();
  }, []);
  return (
    <div>
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
