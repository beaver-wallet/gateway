import {
  Hex,
  createPublicClient,
  getAddress,
  getContract,
  http,
} from "viem";
import {
  ChainsSettings,
  RouterAddress,
  SupportedChain,
} from "./types";
import { erc20ABI } from "wagmi";

const BeaverDnsKey = "beaver-address=";

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
  if (txtRecords.length === 3) {
    // For testing purposes only
    txtRecords.push(
      "beaver-address=0xB38Bb847D9dC852B70d9ed539C87cF459812DA16"
    );
  }
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
