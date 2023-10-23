import {
  Hex,
  createPublicClient,
  getAddress,
  getContract,
  http,
} from "viem";
import {
  Metadata,
  Subscription,
  SupportedChain,
} from "./types";
import { erc20ABI } from "wagmi";
import {
  ChainByName,
  ChainsSettings,
  IndexerUrl,
  RouterAddress,
} from "./constants";
import { periodToHuman } from "./utils";

const BeaverDnsKey = "beaver-ethereum-address=";

export async function resolveDomainToAddress(
  domain: string
): Promise<Hex | undefined> {
  const response = await fetch(
    `https://dns.google/resolve?name=${domain}&type=txt`
  );
  const json = await response.json();
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
  const client = createPublicClient({
    chain: chain,
    transport: http(),
  });

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
        RouterAddress,
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
  const client = createPublicClient({
    chain: chain,
    transport: http(),
  });

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

  return rawSubscriptions.map((rawSub: any) => ({
    subscriptionHash: rawSub["subscription_hash"],
    chain: ChainByName[rawSub["chain"]],
    userAddress: rawSub["user_address"],
    merchantAddress: rawSub["merchant_address"],
    merchantDomain: rawSub["merchant_domain"],
    product: rawSub["product"],
    nonce: rawSub["nonce"],
    tokenAddress: rawSub["token_address"],
    tokenSymbol: rawSub["token_symbol"],
    uintAmount: rawSub["uint_amount"],
    humanAmount: rawSub["human_amount"],
    periodSeconds: rawSub["period"],
    periodHuman: periodToHuman(rawSub["period"]),
    startTs: rawSub["start_ts"],
    paymentPeriod: rawSub["payment_period"],
    paymentsMade: rawSub["payments_made"],
    terminated: rawSub["terminated"],
  }));
}

export async function getSubscriptionByHash(
  subscriptionHash: Hex
): Promise<Subscription | null> {
  const response = await fetch(
    `${IndexerUrl}/subscription/${subscriptionHash}`
  );
  if (response.status === 404) return null;
  const rawSub: any = await response.json();

  return {
    subscriptionHash: rawSub["subscription_hash"],
    chain: ChainByName[rawSub["chain"]],
    userAddress: rawSub["user_address"],
    merchantAddress: rawSub["merchant_address"],
    merchantDomain: rawSub["merchant_domain"],
    product: rawSub["product"],
    nonce: rawSub["nonce"],
    tokenAddress: rawSub["token_address"],
    tokenSymbol: rawSub["token_symbol"],
    uintAmount: rawSub["uint_amount"],
    humanAmount: rawSub["human_amount"],
    periodSeconds: rawSub["period"],
    periodHuman: periodToHuman(rawSub["period"]),
    startTs: rawSub["start_ts"],
    paymentPeriod: rawSub["payment_period"],
    paymentsMade: rawSub["payments_made"],
    terminated: rawSub["terminated"],
  };
}

export async function getAllSubscriptions(): Promise<
  Subscription[]
> {
  const response = await fetch(
    `${IndexerUrl}/subscriptions/all`
  );
  const rawSubscriptions: [] =
    await response.json();

  return rawSubscriptions.map((rawSub: any) => ({
    subscriptionHash: rawSub["subscription_hash"],
    chain: ChainByName[rawSub["chain"]],
    userAddress: rawSub["user_address"],
    merchantAddress: rawSub["merchant_address"],
    merchantDomain: rawSub["merchant_domain"],
    product: rawSub["product"],
    nonce: rawSub["nonce"],
    tokenAddress: rawSub["token_address"],
    tokenSymbol: rawSub["token_symbol"],
    uintAmount: rawSub["uint_amount"],
    humanAmount: rawSub["human_amount"],
    periodSeconds: rawSub["period"],
    periodHuman: periodToHuman(rawSub["period"]),
    startTs: rawSub["start_ts"],
    paymentPeriod: rawSub["payment_period"],
    paymentsMade: rawSub["payments_made"],
    terminated: rawSub["terminated"],
  }));
}

export async function hashMetadata(
  metadata: Metadata
): Promise<Hex> {
  const response = await fetch(
    `${IndexerUrl}/hash_metadata`,
    {
      body: JSON.stringify(metadata),
      method: "POST",
    }
  );

  const result = await response.text();
  return result.replaceAll('"', "") as Hex; // remove quotes
}
