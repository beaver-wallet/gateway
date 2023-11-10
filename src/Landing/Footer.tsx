import { useContext } from "react";
import { OnMobileContext } from "./Responsive";

export function Footer() {
  const onMobile = useContext(OnMobileContext);

  return (
    <footer
      className="verticalFlex"
      style={{
        height: 250,
        textAlign: "right",
        paddingTop: 32,
        marginTop: 64,
      }}
    >
      <p>
        <a href="https://twitter.com/paybeaver">
          Twitter
        </a>
      </p>
      <p>
        <a href="https://discord.gg/WCKcRkXdSW">
          Discord
        </a>
      </p>
      <a href="https://github.com/pay-beaver">
        Github
      </a>
      <p>contact@paybeaver.xyz</p>
      <p>alexey@nebols.in</p>
    </footer>
  );
}
