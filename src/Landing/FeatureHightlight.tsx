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
        {<props.icon size={onMobile ? 32 : 48} />}
      </div>
      <p>{props.text}</p>
    </div>
  );
}
