import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  saveMetadataRemotely,
  queryCurrentAllowance,
  queryCurrentBalance,
  queryProductExistsOnChain,
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
import {
  Hex,
  bytesToHex,
  concatBytes,
  encodeFunctionData,
  encodePacked,
  hexToBytes,
  keccak256,
  zeroAddress,
} from "viem";
import { RouterABI } from "./abi";
import { CoreFrame } from "./CoreFrame";
import {
  ChainsSettings,
  PaymentPeriod,
} from "./constants";
import {
  getChainByName,
  timeDaysSeconds,
  timeSecondsToHuman,
} from "./utils";
import { base58_to_binary } from "base58-js"; // type: ignore

function minimizeIpfsCID(ipfsCID: string): Hex {
  return bytesToHex(base58_to_binary(ipfsCID));
}

function hashProduct(
  chain: SupportedChain,
  merchant: Hex,
  productMetadata: Hex,
  tokenAddress: Hex,
  uintAmount: number,
  period: number,
  freeTrialLength: number,
  paymentPeriod: number
) {
  return keccak256(
    encodePacked(
      [
        "uint256",
        "address",
        "bytes",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
      ],
      [
        BigInt(chain.id),
        merchant,
        productMetadata,
        tokenAddress,
        BigInt(uintAmount),
        BigInt(period),
        BigInt(freeTrialLength),
        BigInt(paymentPeriod),
      ]
    )
  );
}

function TransactionButton(props: {
  prompt: SubscriptionPrompt;
  chain: SupportedChain;
  onExecuted: () => void;
  buttonType: "approve" | "start";
}) {
  const [productExists, setProductExists] =
    useState<boolean>();

  const tokenProps =
    ChainsSettings[props.chain.id].tokens[
      props.prompt
        .tokenSymbol as keyof (typeof ChainsSettings)[typeof props.chain.id]["tokens"]
    ];

  const routerAddress =
    ChainsSettings[props.chain.id].routerAddress;

  const uintAmount =
    props.prompt.amount *
    10 ** tokenProps.decimals;
  const productHash = hashProduct(
    props.chain,
    props.prompt.merchantAddress,
    props.prompt.encodedProductMetadata,
    tokenProps.address as Hex,
    uintAmount,
    props.prompt.periodSeconds,
    props.prompt.freeTrialLengthSeconds,
    PaymentPeriod
  );
  console.log("Product hash:", productHash);

  useEffect(() => {
    (async () => {
      const productExists =
        await queryProductExistsOnChain(
          props.chain,
          productHash
        );
      setProductExists(productExists);
    })();
  }, [props.chain]);

  let txData;
  if (props.buttonType === "approve") {
    txData = {
      to: tokenProps.address,
      value: BigInt(0),
      data: encodeFunctionData({
        abi: erc20ABI as any,
        functionName: "approve",
        args: [
          routerAddress,
          props.prompt.amount *
            10 ** tokenProps.decimals *
            1000,
        ],
      }),
    };
  } else {
    console.log("Product exists", productExists);
    if (productExists === undefined) {
      txData = {
        to: zeroAddress,
        value: BigInt(0),
      };
    } else if (productExists) {
      txData = {
        to: routerAddress,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: RouterABI as any,
          functionName: "startSubscription",
          args: [
            productHash,
            props.prompt
              .encodedSubscriptionMetadata,
          ],
        }),
      };
    } else {
      // product doesn't exist yet
      txData = {
        to: routerAddress,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: RouterABI as any,
          functionName:
            "setupEnvironmentAndStartSubscription",
          args: [
            props.prompt.merchantAddress,
            props.prompt.encodedProductMetadata,
            tokenProps.address,
            uintAmount,
            props.prompt.periodSeconds,
            props.prompt.freeTrialLengthSeconds,
            PaymentPeriod,
            props.prompt
              .encodedSubscriptionMetadata,
          ],
        }),
      };
    }
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

  if (productExists === undefined) {
    return <p>Loading...</p>;
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
  }, [userAccount.address, chain]);

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
      key={1}
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
      chainNamesToChoose.every(
        (chainName) =>
          getChainByName(chainName) !== null
      );
    if (!allChainsAreSupported) {
      throw new Error(
        "Some of the chains provided are not supported."
      );
    }

    chainsToChoose = chainNamesToChoose.map(
      (chainName) => getChainByName(chainName)
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

  const subscriptionId = searchParams.get(
    "subscriptionId"
  );
  const userId = searchParams.get("userId");
  const onSuccessUrl = searchParams.get(
    "onSuccessUrl"
  );
  const freeTrialLength =
    searchParams.get("freeTrialLength") || "0";
  const initiator = searchParams.get(
    "initiator"
  ) as Hex | null;

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

  const productMetadataHash =
    await saveMetadataRemotely({
      merchantDomain: domain,
      productName: product,
    });

  const encodedProductMetadata = minimizeIpfsCID(
    productMetadataHash
  );

  const subscriptionMetadataHash =
    await saveMetadataRemotely({
      subscriptionId,
      userId,
    });

  const encodedSubscriptionMetadata =
    minimizeIpfsCID(subscriptionMetadataHash);

  const periodSeconds = timeDaysSeconds(period);
  const periodHuman = timeSecondsToHuman(
    periodSeconds
  );

  const freeTrialLengthSeconds = timeDaysSeconds(
    freeTrialLength
  );
  const freeTrialLengthHuman = timeSecondsToHuman(
    freeTrialLengthSeconds
  );

  const prompt: SubscriptionPrompt = {
    merchantAddress: resolvedTargetAddress,
    merchantDomain: domain,
    amount,
    tokenSymbol,
    periodHuman,
    periodSeconds,
    availableChains,
    product,
    onSuccessUrl,
    subscriptionId,
    userId,
    freeTrialLengthHuman,
    freeTrialLengthSeconds,
    encodedProductMetadata,
    encodedSubscriptionMetadata,
    initiator,
  };
  console.log("Got subscription prompt", prompt);

  return prompt;
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

  useEffect(() => {
    if (
      !prompt ||
      !networkHook.chain ||
      !switchNetwork
    )
      return;
    if (
      !prompt.availableChains
        .map((chain) => chain.id)
        .includes(networkHook.chain.id as any)
    ) {
      switchNetwork(prompt.availableChains[0].id);
    }
  }, [prompt, networkHook.chain, switchNetwork]);

  if (!prompt)
    return (
      <CoreFrame title="Start a subscription">
        <p>Loading...</p>
      </CoreFrame>
    );

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
