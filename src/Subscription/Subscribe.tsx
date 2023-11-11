import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { CoreFrame } from "../CoreFrame";
import {
  SubscriptionPrompt,
  SupportedChain,
  UserData,
  UserFinancials,
} from "../types";
import { Chain } from "viem";
import { GatewayUrl } from "../constants";
import {
  useAccount,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";

import {
  chainInList,
  shortenAddress,
} from "../utils";
import {
  queryCurrentAllowance,
  queryCurrentBalance,
} from "../network";
import {
  useParams,
  useSearchParams,
} from "react-router-dom";
import { resolvePrompt } from "./utils";
import {
  SubscriptionInfo,
  SubscriptionLine,
} from "./Table";
import {
  ConnectButton,
  InsufficientAllowance,
  InsufficientBalance,
  StartSubscription,
} from "./ActionButtons";

function ChainSelect(props: {
  chain: Chain;
  availableChains: SupportedChain[];
  switchChain: (chainId: number) => void;
}) {
  return (
    <select
      value={
        chainInList(
          props.chain,
          props.availableChains
        )
          ? props.chain.id
          : "none"
      }
      onChange={(event) =>
        props.switchChain(
          parseInt(event.target.value)
        )
      }
    >
      <option key={0} value="none" disabled>
        Select chain
      </option>
      {props.availableChains.map((chain) => (
        <option key={chain.id} value={chain.id}>
          {chain.name}
        </option>
      ))}
    </select>
  );
}

function ActionSection(props: {
  userData: UserData | undefined;
  prompt: SubscriptionPrompt | null | undefined;
}) {
  const [userFinancials, setUserFinancials] =
    useState<UserFinancials>();

  const [started, setStarted] = useState(false);

  const updateFinancials =
    useCallback(async () => {
      if (
        !props.userData || // user has not connected their wallet yet
        !props.userData.validChain
      )
        return;

      const balance = await queryCurrentBalance(
        props.userData.validChain,
        props.prompt!.tokenSymbol,
        props.userData.address
      );

      const allowance =
        await queryCurrentAllowance(
          props.userData.validChain,
          props.prompt!.tokenSymbol,
          props.userData.address
        );

      setUserFinancials({
        humanBalance: balance,
        humanAllowance: allowance,
      });
    }, [props.prompt, props.userData]);

  const onApproved = async () => {
    await updateFinancials();
  };

  const onStarted = () => {
    if (props.prompt!.onSuccessUrl) {
      window.setTimeout(function () {
        window.location = props.prompt!
          .onSuccessUrl as any;
      }, 3000);
    }
    setStarted(true);
  };

  useEffect(() => {
    updateFinancials();
  }, [updateFinancials]);

  if (props.prompt === undefined) {
    return <p>Loading...</p>;
  }

  if (props.prompt === null) {
    return (
      <p>This checkout link does not exist.</p>
    );
  }

  if (started) {
    let successText: string;
    if (props.prompt.onSuccessUrl) {
      successText =
        "Success! Redirecting you back to the merchant.";
    } else {
      successText =
        "Success! You can now go back to the merchant.";
    }
    return <p>{successText}</p>;
  }

  if (!props.userData) {
    return <ConnectButton />;
  }

  if (!userFinancials) return <div />;

  if (
    userFinancials.humanBalance <
    props.prompt.amount
  ) {
    return (
      <InsufficientBalance
        tokenSymbol={props.prompt.tokenSymbol}
        onToppedUp={updateFinancials}
      />
    );
  }

  if (
    userFinancials.humanAllowance <
    props.prompt.amount
  ) {
    return (
      <InsufficientAllowance
        chain={props.userData.validChain!}
        onApproved={onApproved}
        tokenSymbol={props.prompt.tokenSymbol}
        minimumApproval={props.prompt.amount}
      />
    );
  }

  return (
    <StartSubscription
      chain={props.userData.validChain!}
      prompt={props.prompt}
      onStarted={onStarted}
    />
  );
}

export function Subscribe() {
  const { switchNetwork } = useSwitchNetwork();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  let [searchParams] = useSearchParams();
  const { shortcutId } = useParams();

  const [prompt, setPrompt] =
    useState<SubscriptionPrompt | null>();

  useEffect(() => {
    if (!shortcutId) {
      setPrompt(null);
      return;
    }

    resolvePrompt(searchParams, shortcutId)
      .then((prompt) => setPrompt(prompt))
      .catch((error) => {
        console.error(error);
        setPrompt(null);
      });
  }, [searchParams, shortcutId]);

  let userData: UserData | undefined;
  if (isConnected && prompt) {
    const validChain = chainInList(
      chain!,
      prompt.availableChains
    )
      ? (chain! as SupportedChain)
      : undefined;

    userData = {
      address: address!,
      shortAddress: shortenAddress(address!),
      chain: chain!,
      validChain,
      switchChain: switchNetwork!,
    };
  }

  let terminateBlock: JSX.Element;
  if (userData) {
    terminateBlock = (
      <p className="centralText minor1Font">
        Terminate anytime{" "}
        <a
          href={`${GatewayUrl}/manage/${userData.address}`}
          className="minor1Font"
        >
          here
        </a>
      </p>
    );
  } else {
    terminateBlock = (
      <p className="centralText minor1Font">
        You can terminate anytime.
      </p>
    );
  }

  return (
    <CoreFrame title="Start a subscription">
      <SubscriptionInfo>
        {prompt && (
          <SubscriptionLine
            title="Title"
            value={<p>{prompt.product}</p>}
          />
        )}
        {prompt && (
          <SubscriptionLine
            title="Website"
            value={
              <a
                href={prompt.merchantDomain}
                className="SubscriptionLineText"
              >
                {prompt.merchantDomain}
              </a>
            }
          />
        )}
        {prompt && (
          <SubscriptionLine
            title="Terms"
            value={
              <p>
                {prompt.amount}{" "}
                {prompt.tokenSymbol} /{" "}
                {prompt.periodHuman}
              </p>
            }
          />
        )}
        {prompt &&
          prompt.freeTrialLengthSeconds > 0 && (
            <SubscriptionLine
              title="Free Trial"
              value={
                <p>
                  {prompt.freeTrialLengthHuman}
                </p>
              }
            />
          )}
        {userData && (
          <SubscriptionLine
            title="Wallet"
            value={<p>{userData.shortAddress}</p>}
          />
        )}
        {userData && (
          <SubscriptionLine
            title="Chain"
            value={
              <ChainSelect
                chain={userData.chain}
                availableChains={
                  prompt!.availableChains
                }
                switchChain={userData.switchChain}
              />
            }
          />
        )}
        <ActionSection
          userData={userData}
          prompt={prompt}
        />
      </SubscriptionInfo>
      {terminateBlock}
    </CoreFrame>
  );
}
