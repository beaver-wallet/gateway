import {
  Chain,
  Hex,
  PublicClient,
  Transport,
  createPublicClient,
  encodeFunctionData,
  getAddress,
  getContract,
  hexToNumber,
  http,
} from "viem";
import {
  ShortcutPrompt,
  Subscription,
  SupportedChain,
} from "./types";
import { erc20ABI } from "wagmi";
import {
  ChainsSettings,
  IndexerUrl,
} from "./constants";
import {
  getChainByName,
  timeSecondsToHuman,
} from "./utils";
import { RouterABI } from "./abi";

const BeaverDnsKey = "beaver-ethereum-address=";

function getClientForChain(
  chain: SupportedChain
): PublicClient<Transport, SupportedChain> {
  // const rpc = ChainsSettings[chain.id].rpc;

  return createPublicClient({
    chain: chain,
    transport: http(),
  });
}

function deserializeSubscription(
  rawSub: any
): Subscription {
  const rawProduct = rawSub["product"];
  return {
    subscriptionHash: rawSub["subscription_hash"],
    product: {
      productHash: rawProduct["product_hash"],
      chain: getChainByName(rawProduct["chain"])!,
      merchantAddress:
        rawProduct["merchant_address"],
      tokenAddress: rawProduct["token_address"],
      tokenSymbol: rawProduct["token_symbol"],
      tokenDecimals: rawProduct["token_decimals"],
      uintAmount: rawProduct["uint_amount"],
      humanAmount: rawProduct["human_amount"],
      period: rawProduct["period"],
      periodHuman: timeSecondsToHuman(
        rawProduct["period"]
      ),
      freeTrialLength:
        rawProduct["free_trial_length"],
      paymentPeriod: rawProduct["payment_period"],
      metadataCID: rawProduct["metadata_cid"],
      merchantDomain:
        rawProduct["merchant_domain"],
      productName: rawProduct["product_name"],
    },
    userAddress: rawSub["user_address"],
    startTs: rawSub["start_ts"],
    paymentsMade: rawSub["payments_made"],
    terminated: rawSub["terminated"],
    metadataCID: rawSub["metadata_cid"],
    subscriptionId: rawSub["subscription_id"],
    userId: rawSub["user_id"],
    status: rawSub["status"],
    isActive: rawSub["is_active"],
    nextPaymentAt: rawSub["next_payment_at"],
  };
}

export async function resolveDomainToAddress(
  domain: string
): Promise<Hex | undefined> {
  const response = await fetch(
    `https://dns.google/resolve?name=${domain}&type=txt`
  );
  if (response.status !== 200) return undefined;

  const json = await response.json();
  if (json.Status !== 0) return undefined; // json.Status is Google-specific status code

  const txtRecords: string[] = json.Answer.map(
    (a: any) => a.data
  );
  console.log(
    `Resolving domain target address. TXT records of ${domain} are:`,
    txtRecords
  );

  const addressRecords = txtRecords.filter(
    (txt: string) => txt.startsWith(BeaverDnsKey)
  );
  if (addressRecords.length !== 1)
    return undefined; // if there are 2+ records, it's also bad

  const address = addressRecords[0].substring(
    BeaverDnsKey.length
  );

  try {
    return getAddress(address); // throws if invalid address
  } catch (e) {
    return undefined;
  }
}

// Returns current allowance for the given token. In human readable format.
export async function queryCurrentAllowance(
  chain: SupportedChain,
  tokenSymbol: string,
  userAddress: Hex
): Promise<number> {
  const client = getClientForChain(chain);

  const tokenProps =
    ChainsSettings[chain.id].tokens[
      tokenSymbol as keyof (typeof ChainsSettings)[typeof chain.id]["tokens"]
    ];

  const contract = getContract({
    address: tokenProps.address as Hex,
    abi: erc20ABI,
    publicClient: client,
  });

  try {
    const allowance =
      await contract.read.allowance([
        userAddress,
        ChainsSettings[chain.id].routerAddress,
      ]);
    return (
      Number(allowance) /
      10 ** tokenProps.decimals
    );
  } catch (e) {
    console.log(
      `Failed to query allowance for ${tokenSymbol} on ${chain.name} chain`,
      e
    );
    return 0;
  }
}

// Returns current balance for the given token. In human readable format.
export async function queryCurrentBalance(
  chain: SupportedChain,
  tokenSymbol: string,
  userAddress: Hex
): Promise<number> {
  const client = getClientForChain(chain);

  const tokenProps =
    ChainsSettings[chain.id].tokens[
      tokenSymbol as keyof (typeof ChainsSettings)[typeof chain.id]["tokens"]
    ];

  const contract = getContract({
    address: tokenProps.address as Hex,
    abi: erc20ABI,
    publicClient: client,
  });

  try {
    const balance = await contract.read.balanceOf(
      [userAddress]
    );
    return (
      Number(balance) / 10 ** tokenProps.decimals
    );
  } catch (e) {
    console.log(
      `Failed to query balance for ${tokenSymbol} on ${chain.name} chain`,
      e
    );
    return 0;
  }
}

export async function getSubscriptionsByUser(
  userAddress: Hex
): Promise<Subscription[]> {
  const response = await fetch(
    `${IndexerUrl}/subscriptions/user/${userAddress}`
  );
  const rawSubscriptions: [] =
    await response.json();

  return rawSubscriptions.map((rawSub: any) =>
    deserializeSubscription(rawSub)
  );
}

export async function getSubscriptionByHash(
  subscriptionHash: Hex
): Promise<Subscription | null> {
  const response = await fetch(
    `${IndexerUrl}/subscription/${subscriptionHash}`
  );
  if (response.status === 404) return null;
  const rawSub: any = await response.json();

  return deserializeSubscription(rawSub);
}

export async function getAllSubscriptions(): Promise<
  Subscription[]
> {
  const response = await fetch(
    `${IndexerUrl}/subscriptions/all`
  );
  const rawSubscriptions: [] =
    await response.json();

  return rawSubscriptions.map((rawSub: any) =>
    deserializeSubscription(rawSub)
  );
}

export async function saveMetadataRemotely(
  metadata: any
): Promise<string> {
  const response = await fetch(
    `${IndexerUrl}/save_metadata`,
    {
      body: JSON.stringify(metadata),
      method: "POST",
    }
  );

  const result = await response.text();
  return result.replaceAll('"', ""); // remove quotes
}

export async function queryProductExistsOnChain(
  chain: SupportedChain,
  productHash: Hex
): Promise<boolean> {
  const rpcClient = getClientForChain(chain);

  const result = await rpcClient.call({
    to: ChainsSettings[chain.id].routerAddress,
    data: encodeFunctionData({
      abi: RouterABI,
      functionName: "products",
      args: [productHash],
    }),
  });
  if (!result.data) {
    return false;
  }

  console.log(
    "Checking product result:",
    result.data
  );

  return hexToNumber(result.data) !== 0;
}

export async function makeShortcutRemotely(
  shortcuted: ShortcutPrompt
): Promise<string> {
  const response = await fetch(
    `${IndexerUrl}/shortcut`,
    {
      body: JSON.stringify(shortcuted),
      method: "POST",
    }
  );

  const result = await response.text();
  return result.replaceAll('"', ""); // remove quotes
}

export async function getShortcutPrompt(
  shortcutId: string
): Promise<ShortcutPrompt | null> {
  const response = await fetch(
    `${IndexerUrl}/shortcut/${shortcutId}`
  );
  if (response.status !== 200) return null;
  return (await response.json()) as ShortcutPrompt;
}
