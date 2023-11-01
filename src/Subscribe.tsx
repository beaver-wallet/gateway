import { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  saveMetadataRemotely,
  queryCurrentAllowance,
  queryCurrentBalance,
  queryProductExistsOnChain,
  resolveDomainToAddress,
  getShortcutPrompt,
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
import {
  Hex,
  bytesToHex,
  encodeFunctionData,
  encodePacked,
  keccak256,
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
import {
  ConnectButton,
  useConnectModal,
} from "@rainbow-me/rainbowkit";

function minimizeIpfsCID(ipfsCID: string): Hex {
  console.log("IPFS CID", ipfsCID);
  const binaryIpfsCID: Uint8Array =
    base58_to_binary(ipfsCID);
  console.log(
    "BINARY IPFS CID",
    binaryIpfsCID,
    bytesToHex(binaryIpfsCID)
  );

  // remove IPFS version so that the CID fits in bytes32
  const minimizedIpfsCID = binaryIpfsCID.slice(2);
  return bytesToHex(minimizedIpfsCID);
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
  const [amountToApprove, setAmountToApprove] =
    useState<number>();

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
    props.prompt.productMetadataCID,
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
          (amountToApprove || 0) *
            10 ** tokenProps.decimals,
        ],
      }),
    };
  } else {
    console.log("Product exists", productExists);
    if (
      productExists === undefined ||
      productExists === false
    ) {
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
            props.prompt.productMetadataCID,
            tokenProps.address,
            uintAmount,
            props.prompt.periodSeconds,
            props.prompt.freeTrialLengthSeconds,
            PaymentPeriod,
            props.prompt.subscriptionMetadataCID,
          ],
        }),
      };
    } else {
      txData = {
        to: routerAddress,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: RouterABI as any,
          functionName: "startSubscription",
          args: [
            productHash,
            props.prompt.subscriptionMetadataCID,
          ],
        }),
      };
    }
  }

  const { config } =
    usePrepareSendTransaction(txData);

  const sendHook = useSendTransaction(config);
  const txHash = sendHook.data?.hash;

  const waitHook = useWaitForTransaction({
    hash: sendHook.data?.hash,
  });

  const buttonText =
    props.buttonType === "approve"
      ? `Approve ${props.prompt.tokenSymbol}`
      : "Start the subscription";
  const actionButton = (
    <button
      onClick={() => sendHook.sendTransaction!()}
      disabled={
        props.buttonType === "approve" &&
        (amountToApprove || 0) <
          props.prompt.amount
      }
    >
      {buttonText}
    </button>
  );

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
      const etherscanBaseUrl =
        ChainsSettings[props.chain.id]
          .etherscanBaseUrl;
      const etherscanUrl = `${etherscanBaseUrl}/tx/${txHash}`;
      return (
        <p>
          Waiting for execution... Transaction
          details:{" "}
          <a
            href={etherscanUrl}
            target="_blank"
            rel="noreferrer"
          >
            Etherscan.
          </a>
        </p>
      );
    }
    if (waitHook.isSuccess) {
      props.onExecuted();
      if (props.buttonType === "approve") {
        return <div />;
      } else {
        const etherscanBaseUrl =
          ChainsSettings[props.chain.id]
            .etherscanBaseUrl;
        const etherscanUrl = `${etherscanBaseUrl}/tx/${txHash}`;

        let text;
        if (props.prompt.onSuccessUrl) {
          text =
            "Success! Redirecting you back to the merchant!";
        } else {
          text =
            "Success! Go back to the merchant website and start enjoying the service!";
        }
        return (
          <p>
            {text} Transaction details:{" "}
            <a
              href={etherscanUrl}
              target="_blank"
              rel="noreferrer"
            >
              Etherscan
            </a>
          </p>
        );
      }
    }
    if (waitHook.error) {
      return (
        <p>
          Error while subscribing:{" "}
          {waitHook.error.message}.
        </p>
      );
    }
  }
  if (sendHook.error) {
    console.error(
      "Problem when prompted the user to start a subscription:",
      sendHook.error.message
    );
    return [
      <p style={{ marginBottom: 8 }}>
        There was a problem. Please try again.
      </p>,
      actionButton,
    ];
  }

  if (productExists === undefined) {
    return <p>Loading...</p>;
  }

  if (props.buttonType === "approve") {
    return [
      <p key={0} style={{ marginBottom: 8 }}>
        Tokens are taken from your wallet only
        when the time is right for a payment. But
        it's not possible if you don't approve
        them to be taken. Your approval (in{" "}
        {props.prompt.tokenSymbol}):
      </p>,
      <input
        key={1}
        type="number"
        placeholder={(
          props.prompt.amount * 100
        ).toString()}
        value={amountToApprove}
        onChange={(event) =>
          setAmountToApprove(
            parseFloat(event.target.value)
          )
        }
        style={{ maxWidth: 160 }}
      />,
      amountToApprove ? (
        <p key={2} style={{ marginBottom: 8 }}>
          This will cover{" "}
          {Math.floor(
            amountToApprove / props.prompt.amount
          )}{" "}
          payments.
        </p>
      ) : null,
      actionButton,
    ];
  }

  return actionButton;
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

  if (
    props.prompt.amount > userBalance &&
    props.prompt.freeTrialLengthSeconds === 0
  ) {
    return [
      <p key={0} style={{ marginBottom: 8 }}>
        Your current balance is {userBalance}{" "}
        {props.prompt.tokenSymbol}. You need to
        hold at least {props.prompt.amount}{" "}
        {props.prompt.tokenSymbol} to start the
        subscription.
      </p>,
      <button
        key="iToppedUpButton"
        onClick={updateBalance}
      >
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
      key="startButton"
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
  shortcutId: string | undefined,
  searchParams: URLSearchParams
): Promise<SubscriptionPrompt> {
  console.log("shortcutId", shortcutId);

  let domain: string;
  let product: string;
  let tokenSymbol: string;
  let rawAmount: string;
  let period: string;
  let serializedChains: string;
  let freeTrialLength: string;
  let onSuccessUrl: string | null;
  let subscriptionId: string | null;
  let userId: string | null;

  if (shortcutId) {
    const shortcutPrompt =
      await getShortcutPrompt(shortcutId);

    if (!shortcutPrompt) {
      throw new Error(
        `Shortcut with id ${shortcutId} doesn't exist!!!`
      );
    }

    domain = shortcutPrompt.domain;
    product = shortcutPrompt.product;
    tokenSymbol = shortcutPrompt.token;
    rawAmount = shortcutPrompt.amount;
    period = shortcutPrompt.period;
    serializedChains = shortcutPrompt.chains;
    freeTrialLength =
      shortcutPrompt.freeTrialLength || "0";
    onSuccessUrl = shortcutPrompt.onSuccessUrl;
    subscriptionId =
      shortcutPrompt.subscriptionId;
    userId = shortcutPrompt.userId;

    // Potentially override subscriptionId and userId
    subscriptionId =
      searchParams.get("subscriptionId") ||
      subscriptionId;
    userId = searchParams.get("userId") || userId;
    onSuccessUrl =
      searchParams.get("onSuccessUrl") ||
      onSuccessUrl;
  } else {
    // RequiredSearchParams
    const requiredParams = [
      "domain",
      "product",
      "token",
      "amount",
      "period",
      "chains",
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

    [
      // Assigning params to variables this way instead of using .get in order to not forget anything when adding or removing params
      domain,
      product,
      tokenSymbol,
      rawAmount,
      period,
      serializedChains,
    ] = paramsValues;

    freeTrialLength =
      searchParams.get("freeTrialLength") || "0";
    onSuccessUrl = searchParams.get(
      "onSuccessUrl"
    );
    subscriptionId = searchParams.get(
      "subscriptionId"
    );
    userId = searchParams.get("userId");
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
    productMetadataCID: encodedProductMetadata,
    subscriptionMetadataCID:
      encodedSubscriptionMetadata,
  };
  console.log("Got subscription prompt", prompt);

  return prompt;
}

export function Subscribe() {
  let [searchParams] = useSearchParams();
  const [prompt, setPrompt] =
    useState<SubscriptionPrompt>();
  const networkHook = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { shortcutId } = useParams();
  const userAccount = useAccount();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    (async () => {
      try {
        const resolvedPrompt =
          await resolvePrompt(
            shortcutId,
            searchParams
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
      {prompt.freeTrialLengthSeconds > 0 && (
        <p style={{ marginBottom: 8 }}>
          This subscription includes{" "}
          {prompt.freeTrialLengthHuman} of free
          trial.
        </p>
      )}
      {!networkHook.chain && (
        <button
          onClick={() => openConnectModal!()}
          style={{ marginBottom: 8 }}
        >
          Connect wallet
        </button>
      )}
      {chainSwitchComponent}
      {networkHook.chain && (
        <PayButton prompt={prompt} />
      )}
      {userAccount.address && (
        <p
          style={{
            fontSize: 14,
            textAlign: "center",
            marginTop: "auto",
          }}
        >
          You can unsubscribe at any time at{" "}
          <a
            href={`https://gateway.paybeaver.xyz/manage/${userAccount.address}`}
            target="_blank"
            rel="noreferrer"
          >
            your account page.
          </a>
        </p>
      )}
    </CoreFrame>
  );
}
