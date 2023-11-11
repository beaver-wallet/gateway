import {
  Hex,
  bytesToHex,
  encodePacked,
  keccak256,
} from "viem";
import {
  getPromptRemotely,
  resolveDomainToAddress,
  saveMetadataRemotely,
} from "../network";
import {
  SubscriptionPrompt,
  SupportedChain,
} from "../types";
import {
  getChainByName,
  timeDaysSeconds,
  timeSecondsToHuman,
} from "../utils";
import { base58_to_binary } from "base58-js"; // type: ignore
import {
  waitForTransaction,
  sendTransaction,
} from "@wagmi/core";

export function minimizeIpfsCID(
  ipfsCID: string
): Hex {
  const binaryIpfsCID: Uint8Array =
    base58_to_binary(ipfsCID);

  // remove IPFS version so that the CID fits in bytes32
  const minimizedIpfsCID = binaryIpfsCID.slice(2);
  return bytesToHex(minimizedIpfsCID);
}

export async function resolvePrompt(
  searchParams: URLSearchParams,
  shortcutId: string
): Promise<SubscriptionPrompt> {
  const prompt = await getPromptRemotely(
    shortcutId
  );
  if (!prompt) {
    throw new Error(
      `There is no checkout form with id ${shortcutId}.`
    );
  }

  const merchantAddress =
    await resolveDomainToAddress(prompt.domain);

  if (!merchantAddress) {
    throw new Error(
      `Could not resolve domain ${prompt.domain} to address`
    );
  }

  const periodSeconds = timeDaysSeconds(
    prompt.period
  );
  const periodHuman = timeSecondsToHuman(
    periodSeconds
  );

  const freeTrialLengthSeconds = timeDaysSeconds(
    prompt.freeTrialLength || "0d"
  );
  const freeTrialLengthHuman = timeSecondsToHuman(
    freeTrialLengthSeconds
  );

  const userId =
    searchParams.get("userId") || prompt.userId;
  const subscriptionId =
    searchParams.get("subscriptionId") ||
    prompt.subscriptionId;
  const onSuccessUrl =
    searchParams.get("onSuccessUrl") ||
    prompt.onSuccessUrl;

  const availableChains = prompt.chains
    .split(",")
    .map((strChain) => getChainByName(strChain)!);

  const productMetadataCID = minimizeIpfsCID(
    await saveMetadataRemotely({
      merchantDomain: prompt.domain,
      productName: prompt.product,
    })
  );

  const subscriptionMetadataCID = minimizeIpfsCID(
    await saveMetadataRemotely({
      subscriptionId,
      userId,
    })
  );

  return {
    merchantDomain: prompt.domain,
    merchantAddress,
    amount: parseFloat(prompt.amount),
    tokenSymbol: prompt.token,
    periodSeconds,
    periodHuman,
    availableChains,
    freeTrialLengthSeconds,
    freeTrialLengthHuman,
    onSuccessUrl,
    product: prompt.product,
    userId,
    subscriptionId,
    productMetadataCID,
    subscriptionMetadataCID,
  };
}

export async function executeTransaction(
  txData: any,
  setIsSendingTx: (isSending: boolean) => void,
  setMessage: (message: string) => void
): Promise<boolean> {
  setIsSendingTx(true);
  setMessage("Sign transaction in your wallet.");
  let txHash: Hex;
  try {
    const { hash } = await sendTransaction(
      txData
    );
    txHash = hash;
  } catch (e: any) {
    console.error("Error while signing", e);
    setIsSendingTx(false);
    setMessage("Error. Please try again.");
    return false;
  }
  setMessage("Waiting for execution...");
  try {
    await waitForTransaction({ hash: txHash });
  } catch (e: any) {
    console.error("Error while executing", e);
    setIsSendingTx(false);
    setMessage("Error. Please try again.");
    return false;
  }
  return true;
}

export function hashProduct(
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
        "address",
        "uint256",
        "uint40",
        "uint40",
        "uint40",
        "bytes32",
      ],
      [
        BigInt(chain.id),
        merchant,
        tokenAddress,
        BigInt(uintAmount),
        period,
        freeTrialLength,
        paymentPeriod,
        productMetadata,
      ]
    )
  );
}
