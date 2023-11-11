import { ContentBlock } from "./ContentBlock";

export function FeatureDescriptions() {
  return (
    <div className="verticalFlex">
      <ContentBlock
        imageName="usd-repeat"
        imagePosition="left"
        text={
          <p>
            Subscription fees are low with Beaver.
            On every payment you are only charged
            a constant blockchain fee ($0.02 -
            $0.15). That's it. No percentages or
            hidden fees.
          </p>
        }
      />
      <ContentBlock
        imageName="gas-station-with-tokens"
        imagePosition="right"
        text={
          <p>
            Beaver is easy to set up. No
            blockchain transaction is needed to
            start using Beaver. You just create a
            crypto wallet, share it with Beaver
            and start receiving payments from
            subscriptions!
          </p>
        }
      />
      <ContentBlock
        imageName="mood-happy"
        imagePosition="left"
        text={
          <p>
            The checkout process is streamlined
            for your users down to just a couple
            of clicks! It's simple and easy to
            use.{" "}
            <a
              href="https://paybeaver.xyz/subscribe/31rhCK"
              target="_blank"
              rel="noreferrer"
            >
              Check it out by yourself!
            </a>
          </p>
        }
      />
      <ContentBlock
        imageName="lock-image"
        imagePosition="right"
        text={
          <p>
            Beaver is fully self-custodial. Even
            though there is a hosted API, this API
            is needed only for convenience. Funds
            and key data is stored solely on the
            blockchain and a decentralized file
            storage IPFS. Users' payments are sent
            directly to your crypto wallet, we
            never control these funds and are not
            able to freeze them.
          </p>
        }
      />
    </div>
  );
}
