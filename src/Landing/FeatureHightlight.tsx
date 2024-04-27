import { OnMobileContext } from "./Responsive";
import { useContext } from "react";

export function FeatureHighlight(props: {
  icon: any;
  text: string;
}) {
  const onMobile = useContext(OnMobileContext);

  return (
    <div className="featureHighlight">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 10,
          marginBottom: 16,
        }}
      >
        {<props.icon style={{ width: onMobile ? '20vw' : '10vw', height: onMobile ? '20vw' : '10vw' }} />}
      </div>
      <p>{props.text}</p>
    </div>
  );
}
