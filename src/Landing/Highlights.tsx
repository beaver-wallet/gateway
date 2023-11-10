import { useContext } from "react";
import { FeatureHighlight } from "./FeatureHightlight";
import {
  GasStationIcon,
  LockIcon,
  LoopIcon,
  MoodHappyIcon,
} from "./icons";
import { OnMobileContext } from "./Responsive";

export function Highlights() {
  const onMobile = useContext(OnMobileContext);

  const highlight1 = (
    <FeatureHighlight
      icon={LoopIcon}
      text="Your users are charged reliably and securely, with low fees."
    />
  );
  const highlight2 = (
    <FeatureHighlight
      icon={GasStationIcon}
      text="Easy to set up. No blockchain transactions are needed."
    />
  );

  const highlight3 = (
    <FeatureHighlight
      icon={MoodHappyIcon}
      text="Simple checkout form that makes the process easy for your users."
    />
  );

  const highlight4 = (
    <FeatureHighlight
      icon={LockIcon}
      text="It's secure. Earned money are in your full self custody."
    />
  );

  let highlights;
  if (onMobile) {
    highlights = (
      <div
        style={{
          marginBottom: 40,
          marginTop: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          {highlight1}
          {highlight2}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {highlight3}
          {highlight4}
        </div>
      </div>
    );
  } else {
    highlights = (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 40,
          marginTop: 16,
        }}
      >
        {highlight1}
        {highlight2}
        {highlight3}
        {highlight4}
      </div>
    );
  }

  return highlights;
}
