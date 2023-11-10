import { useContext } from "react";
import { OnMobileContext } from "./Responsive";
import { Footer } from "./Footer";

export function CoreFrame({ children }: any) {
  const onMobile = useContext(OnMobileContext);

  const mobileHeader = (
    <div>
      <p className="title1Font">
        Beaver Crypto Subscriptions
      </p>
      <a
        href="https://docs.paybeaver.xyz/"
        style={{
          display: "block",
          textAlign: "right",
        }}
      >
        Documentation
      </a>
    </div>
  );

  const desktopHeader = (
    <div>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div />
        <h1 className="title1Font">
          Beaver Crypto Subscriptions
        </h1>
        <a
          href="https://docs.paybeaver.xyz/"
          style={{
            marginLeft: 48,
          }}
        >
          Documentation
        </a>
      </header>
    </div>
  );

  return (
    <div
      className="verticalFlex mediumSpacing"
      style={{
        paddingLeft: onMobile ? 4 : 200,
        paddingRight: onMobile ? 4 : 200,
        paddingTop: 16,
      }}
    >
      {onMobile ? mobileHeader : desktopHeader}
      {children}
      <Footer />
    </div>
  );
}
