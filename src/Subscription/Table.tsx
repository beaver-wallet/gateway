export function SubscriptionLine(props: {
  title: string;
  value: JSX.Element;
}) {
  return (
    <div className="subscriptionLine ">
      <p>{props.title}</p>
      <div className="lineFiller" />
      {props.value}
    </div>
  );
}

export function SubscriptionInfo(props: {
  children: any;
}) {
  return (
    <div className="verticalFlex">
      {props.children}
    </div>
  );
}
