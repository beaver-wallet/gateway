import { FeatureDescriptions } from "./FeatureDescriptions";
import { Highlights } from "./Highlights";
import { CoreFrame } from "./LandingFrame";
import { useContext } from "react";
import { OnMobileContext } from "./Responsive";

export function Landing() {
  const onMobile = useContext(OnMobileContext);

  return (
    <CoreFrame>
      <Highlights />
      <p>
        🚀Start using Beaver today by checking out{" "}
        <a href="https://docs.paybeaver.xyz/">
          our documentation.
        </a>
      </p>
      <FeatureDescriptions />
      <p>
        🚀Start using Beaver today by checking out{" "}
        <a href="https://docs.paybeaver.xyz/">
          our documentation.
        </a>
      </p>
    </CoreFrame>
  );
}
