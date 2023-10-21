import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  queryCurrentAllowance,
  queryCurrentBalance,
  resolveDomainToAddress,
} from "./network";
import {
  SubscriptionPrompt,
  SupportedChain,
} from "./types";
import {
  erc20ABI,
  useAccount,
  useNetwork,
  usePrepareSendTransaction,
  useSendTransaction,
  useSwitchNetwork,
  useWaitForTransaction,
} from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { encodeFunctionData } from "viem";
import { RouterABI } from "./abi";
import { CoreFrame } from "./CoreFrame";
import {
  BeaverInitiator,
  ChainByName,
  ChainsSettings,
  RouterAddress,
  SupportedChainNames,
  SupportedChains,
} from "./constants";
import { humanToPeriodSeconds } from "./utils";

function TransactionButton(props: {
  prompt: SubscriptionPrompt;
  chain: SupportedChain;
  onExecuted: () => void;
  buttonType: "approve" | "start";
}) {
  const tokenProps =
    ChainsSettings[props.chain.id].tokens[
      props.prompt
        .tokenSymbol as keyof (typeof ChainsSettings)[typeof props.chain.id]["tokens"]
    ];

  let txData;
  if (props.buttonType === "approve") {
    txData = {
      to: tokenProps.address,
      value: BigInt(0),
      data: encodeFunctionData({
        abi: erc20ABI as any,
        functionName: "approve",
        args: [
          RouterAddress,
          props.prompt.amount *
            10 ** tokenProps.decimals *
            1000,
        ],
      }),
    };
  } else {
    const metadata = {
      subscription_id:
        props.prompt.subscriptionId,
      user_id: props.prompt.userId,
      merchant_domain:
        props.prompt.merchantDomain,
      product: props.prompt.product,
    };

    txData = {
      to: RouterAddress,
      value: BigInt(0),
      data: encodeFunctionData({
        abi: RouterABI as any,
        functionName: "startSubscription",
        args: [
          props.prompt.merchantAddress,
          JSON.stringify(metadata), // produces a minimized json
          tokenProps.address,
          props.prompt.amount *
            10 ** tokenProps.decimals,
          props.prompt.periodSeconds,
          props.prompt.freeTrialLengthSeconds,
          props.prompt.paymentPeriodSeconds,
          BeaverInitiator,
        ],
      }),
    };
  }

  const { config } =
    usePrepareSendTransaction(txData);

  const sendHook = useSendTransaction(config);

  const waitHook = useWaitForTransaction({
    hash: sendHook.data?.hash,
  });

  if (sendHook.isLoading) {
    return (
      <p>
        {props.buttonType === "approve"
          ? "Approving..."
          : "Starting..."}
      </p>
    );
  }
  if (sendHook.isSuccess) {
    if (waitHook.isLoading) {
      return <p>Waiting for execution...</p>;
    }
    if (waitHook.isSuccess) {
      props.onExecuted();
      if (props.buttonType === "approve") {
        return <div />;
      } else {
        return (
          <p>
            Success! Redirecting you back to the
            merchant!
          </p>
        );
      }
    }
    if (waitHook.error) {
      return (
        <p>Error: {waitHook.error.message}</p>
      );
    }
  }
  if (sendHook.error) {
    return <p>Error: {sendHook.error.message}</p>;
  }

  const buttonText =
    props.buttonType === "approve"
      ? `Approve ${props.prompt.tokenSymbol}`
      : "Start the subscription";
  return (
    <button
      onClick={() => sendHook.sendTransaction!()}
    >
      {buttonText}
    </button>
  );
}

function PayButton(props: {
  prompt: SubscriptionPrompt;
}) {
  const { chain } = useNetwork();
  const [allowance, setAllowance] =
    useState<number>();
  const userAccount = useAccount();
  const [hasJustApproved, setHasJustApproved] =
    useState<boolean>(false);
  const [
    hasStartedSubscription,
    setHasStartedSubscription,
  ] = useState<boolean>(false);
  const [userBalance, setUserBalance] =
    useState<number>();

  const updateAllowance = async () => {
    if (
      !userAccount ||
      !chain ||
      !userAccount.address
    )
      return;
    const allowance = await queryCurrentAllowance(
      chain as SupportedChain,
      props.prompt.tokenSymbol,
      userAccount.address
    );
    console.log("Allowance is:", allowance);
    setAllowance(allowance);
  };

  const updateBalance = async () => {
    if (
      !userAccount ||
      !chain ||
      !userAccount.address
    )
      return;

    const balance = await queryCurrentBalance(
      chain as SupportedChain,
      props.prompt.tokenSymbol,
      userAccount.address
    );
    setUserBalance(balance);
  };

  useEffect(() => {
    updateAllowance();
    updateBalance();
  }, [
    userAccount,
    chain,
    props.prompt.tokenSymbol,
  ]);

  if (
    allowance === undefined ||
    userBalance === undefined
  )
    return <p>Loading...</p>;

  if (props.prompt.amount > userBalance) {
    return [
      <p key={0} style={{ marginBottom: 8 }}>
        Your current balance is {userBalance}{" "}
        {props.prompt.tokenSymbol}. You need to
        hold at least {props.prompt.amount}{" "}
        {props.prompt.tokenSymbol} to start the
        subscription.
      </p>,
      <button key={1} onClick={updateBalance}>
        I topped up
      </button>,
    ];
  }

  if (props.prompt.amount > allowance) {
    // Require allowance to cover at least the first payment
    return (
      <TransactionButton
        prompt={props.prompt}
        chain={chain as SupportedChain}
        onExecuted={() => {
          setHasJustApproved(true);
          updateAllowance();
        }}
        buttonType="approve"
      />
    );
  }

  const startButton = (
    <TransactionButton
      prompt={props.prompt}
      chain={chain as SupportedChain}
      onExecuted={() => {
        setHasStartedSubscription(true);

        if (props.prompt.onSuccessUrl) {
          // Redirect to merchant after 3 seconds
          window.setTimeout(function () {
            window.location = props.prompt
              .onSuccessUrl as any;
          }, 3000);
        }
      }}
      buttonType="start"
    />
  );

  if (hasJustApproved) {
    return [
      <p style={{ marginBottom: 8 }} key={0}>
        Awesome! You have successfully approved!
      </p>,
      startButton,
    ];
  }

  let startedText =
    "Awesome! You have started the subscription!";
  if (props.prompt.onSuccessUrl) {
    startedText +=
      "Redirecting you back to the merchant.";
  }
  if (hasStartedSubscription) {
    <p style={{ marginBottom: 8 }}>
      {startedText}
    </p>;
  }

  return startButton;
}

// Validate provided chain names and resolve them to number ids
function deserializeAvailableChains(
  serializedChains: string
): SupportedChain[] {
  let chainsToChoose: SupportedChain[];
  try {
    const chainNamesToChoose = serializedChains
      .split(",")
      .map((value) => value.toLowerCase());

    if (chainNamesToChoose.length === 0) {
      throw new Error(
        "No chains for payment were provided."
      );
    }

    // Validate that all chain names are in SupportedChains list
    const allChainsAreSupported =
      chainNamesToChoose.every((chainName) =>
        SupportedChainNames.includes(
          chainName as any
        )
      );
    if (!allChainsAreSupported) {
      throw new Error(
        "Some of the chains provided are not supported."
      );
    }

    chainsToChoose = chainNamesToChoose.map(
      (chainName) => ChainByName[chainName]
    ) as any;
  } catch (e) {
    throw new Error(
      "Provided chains to choose are in incorrect format."
    );
  }
  return chainsToChoose;
}

// Validate that provided token symbol is supported on all provided chains.
// If not, throw an error.
function validateTokenSymbol(
  tokenSymbol: string,
  chainsToChoose: SupportedChain[]
) {
  const missingInChains: string[] = [];
  for (let chain of chainsToChoose) {
    const availableTokensSymbol = Object.keys(
      ChainsSettings[chain.id].tokens
    );

    if (
      !availableTokensSymbol.includes(tokenSymbol)
    ) {
      missingInChains.push(chain.name);
    }
  }

  if (missingInChains.length > 0) {
    throw new Error(
      `Token ${tokenSymbol} is not supported on ${missingInChains.join(
        ", "
      )}.`
    );
  }
}

// Resolves payment prompt from URL search params
// Throws an error if some of the required params are bad.
async function resolvePrompt(
  searchParams: URLSearchParams
): Promise<SubscriptionPrompt> {
  // RequiredSearchParams
  const requiredParams = [
    "product",
    "token",
    "amount",
    "period",
    "chains",
    "domain",
    "freeTrialLength",
    "paymentPeriod",
  ];

  const missingParams = requiredParams.filter(
    (param) => !searchParams.get(param)
  );

  if (missingParams.length > 0) {
    throw new Error(
      `Missing required parameters: ${missingParams.join(
        ", "
      )}`
    );
  }

  const paramsValues = requiredParams.map(
    (param) => searchParams.get(param)!
  );
  const [
    // Assigning params to variables this way instead of using .get in order to not forget anything when adding or removing params
    product,
    tokenSymbol,
    rawAmount,
    period,
    serializedChains,
    domain,
    freeTrialLength,
    paymentPeriod,
  ] = paramsValues;

  const subscriptionId = searchParams.get(
    "subscriptionId"
  );
  const userId = searchParams.get("userId");
  const onSuccessUrl = searchParams.get(
    "onSuccessUrl"
  );

  const resolvedTargetAddress =
    await resolveDomainToAddress(domain);

  if (!resolvedTargetAddress) {
    throw new Error(
      `Could not resolve domain ${domain} to address`
    );
  }

  const availableChains =
    deserializeAvailableChains(serializedChains);

  validateTokenSymbol(
    tokenSymbol,
    availableChains
  );

  let amount: number;
  try {
    amount = parseFloat(rawAmount);
  } catch (e) {
    throw new Error(
      `Provided amount ${rawAmount} is not a valid number.`
    );
  }

  return {
    merchantAddress: resolvedTargetAddress,
    merchantDomain: domain,
    amount,
    tokenSymbol,
    periodHuman: period,
    periodSeconds: humanToPeriodSeconds(period),
    availableChains,
    product,
    onSuccessUrl,
    subscriptionId,
    userId,
    freeTrialLengthHuman: freeTrialLength,
    freeTrialLengthSeconds: humanToPeriodSeconds(
      freeTrialLength
    ),
    paymentPeriodHuman: paymentPeriod,
    paymentPeriodSeconds: humanToPeriodSeconds(
      paymentPeriod
    ),
  };
}

export function Subscribe() {
  let [searchParams] = useSearchParams();
  const [prompt, setPrompt] =
    useState<SubscriptionPrompt>();
  const { open } = useWeb3Modal();
  const networkHook = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    (async () => {
      try {
        const resolvedPrompt =
          await resolvePrompt(searchParams);
        setPrompt(resolvedPrompt);
      } catch (e) {
        console.error(e);
        alert(
          `${e} Report the issue to the merchant.`
        );
      }
    })();
  }, [searchParams]);

  if (!prompt) return <div />;

  let chainSwitchComponent;
  if (networkHook.chain) {
    if (switchNetwork) {
      chainSwitchComponent = (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <p style={{ marginBottom: 8 }}>
            On which chain do you want to pay?
          </p>
          <select
            value={networkHook.chain.id}
            placeholder="Select chain"
            onChange={(event) =>
              switchNetwork(
                event.target.value as any
              )
            }
            style={{ marginBottom: 8 }}
          >
            {prompt!.availableChains.map(
              (chain, index) => (
                <option
                  value={chain.id}
                  key={index}
                >
                  {chain.name}
                </option>
              )
            )}
          </select>
        </div>
      );
    } else {
      chainSwitchComponent = (
        <p>
          Please use another wallet that supports
          automatic chain switching.
        </p>
      );
    }
  }

  return (
    <CoreFrame title="Start a subscription">
      <p style={{ marginBottom: 8 }}>
        {prompt.merchantDomain}
      </p>
      <p style={{ marginBottom: 8 }}>
        {prompt.product}
      </p>
      <p style={{ marginBottom: 8 }}>
        {prompt.amount} {prompt.tokenSymbol} per{" "}
        {prompt.periodHuman}
      </p>
      {!networkHook.chain && (
        <button
          onClick={() => open()}
          style={{ marginBottom: 8 }}
        >
          Connect wallet
        </button>
      )}
      {chainSwitchComponent}
      {networkHook.chain && (
        <PayButton prompt={prompt} />
      )}
    </CoreFrame>
  );
}
