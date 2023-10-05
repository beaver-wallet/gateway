import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  queryCurrentAllowance,
  resolveDomainToAddress,
} from "./network";
import {
  ChainsSettings,
  RouterAddress,
  SubscriptionPrompt,
  SupportedChain,
  SupportedChainIds,
  SupportedChains,
  ValidPeriods,
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
import { TestSubscribeSearchParams } from "./TestData";
import {
  encodeAbiParameters,
  encodeFunctionData,
} from "viem";

function CoreFrame(props: {
  title: string;
  children?: any;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          width: "400px",
          height: "60vh",
          marginTop: "10vh",
          boxShadow: `0 0 2px 2px black`,
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 16,
        }}
      >
        <p
          style={{
            fontSize: 24,
            marginBottom: 16,
          }}
        >
          {props.title}
        </p>
        {props.children}
      </div>
    </div>
  );
}

function ApproveButton(props: {
  prompt: SubscriptionPrompt;
  chain: SupportedChain;
  onSuccessfulApprove: () => void;
}) {
  const tokenProps =
    ChainsSettings[props.chain.id].tokens[
      props.prompt
        .tokenSymbol as keyof (typeof ChainsSettings)[typeof props.chain.id]["tokens"]
    ];

  const { config } = usePrepareSendTransaction({
    to: tokenProps.address,
    value: BigInt(0),
    data: encodeFunctionData({
      abi: erc20ABI as any,
      functionName: "approve",
      args: [
        RouterAddress,
        props.prompt.amount *
          10 ** tokenProps.decimals,
      ],
    }),
  });

  const sendHook = useSendTransaction(config);

  const waitHook = useWaitForTransaction({
    hash: sendHook.data?.hash,
  });

  if (sendHook.isLoading) {
    return <p>Approving...</p>;
  }
  if (sendHook.isSuccess) {
    if (waitHook.isLoading) {
      return <p>Waiting for execution...</p>;
    }
    if (waitHook.isSuccess) {
      props.onSuccessfulApprove();
      return <p>Approved!</p>;
    }
  }
  if (sendHook.error) {
    return (
      <p>
        Error occured while approving:{" "}
        {sendHook.error.message}
      </p>
    );
  }

  return (
    <button
      onClick={() => sendHook.sendTransaction!()}
    >
      Approve {props.prompt.tokenSymbol}
    </button>
  );
}

function StartButton() {
  return <button>Start the subscription</button>;
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

  useEffect(() => {
    updateAllowance();
  }, [
    userAccount,
    chain,
    props.prompt.tokenSymbol,
  ]);

  if (allowance === undefined) return <div />;

  if (props.prompt.amount > allowance) {
    // Require allowance to cover at least the first payment
    return (
      <ApproveButton
        prompt={props.prompt}
        chain={chain as SupportedChain}
        onSuccessfulApprove={() => {
          setHasJustApproved(true);
          updateAllowance();
        }}
      />
    );
  }

  if (hasJustApproved) {
    return [
      <p style={{ marginBottom: 8 }} key={0}>
        Awesome! You have successfully approved!
      </p>,
      <StartButton key={1} />,
    ];
  }

  return <StartButton />;
}

// Validate provided chain ids and resolve them to number ids
function deserializeAvailableChains(
  serializedChains: string
): SupportedChain[] {
  let chainsToChoose: SupportedChain[];
  try {
    const chainIdsToChoose = serializedChains
      .split(",")
      .map(Number);

    if (chainIdsToChoose.length === 0) {
      throw new Error(
        "No chains for payment were provided."
      );
    }

    // Validate that all chain ids are in SupportedChains list
    const allChainsAreSupported =
      chainIdsToChoose.every((chainId) =>
        SupportedChainIds.includes(chainId as any)
      );
    if (!allChainsAreSupported) {
      throw new Error(
        "Some of the chains provided are not supported."
      );
    }

    chainsToChoose = chainIdsToChoose.map(
      (chainId) =>
        SupportedChains.find(
          (chain) => chain.id === chainId
        )
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
  ] = paramsValues;

  if (!ValidPeriods.includes(period)) {
    throw new Error(
      `Provided period ${period} is not valid.`
    );
  }

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
    period,
    availableChains,
    product,
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
          await resolvePrompt(
            TestSubscribeSearchParams as any
          );
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
      <p>
        {prompt.amount} {prompt.tokenSymbol} per{" "}
        {prompt.period}
      </p>
      {prompt.merchantAddress && (
        <p style={{ marginBottom: 8 }}>
          Money will be transferred to{" "}
          {prompt.merchantAddress}
        </p>
      )}
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
