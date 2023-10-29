import {
  sepolia,
  polygonMumbai,
} from "wagmi/chains";
import { ChainsSettingsType } from "./types";
import { timeDaysSeconds } from "./utils";

export const SupportedChains = [
  sepolia,
  polygonMumbai,
];

export const SupportedChainIds =
  SupportedChains.map((chain) => chain.id);

export let IndexerUrl: string;
if (
  !process.env.NODE_ENV ||
  process.env.NODE_ENV === "development"
) {
  IndexerUrl = "http://127.0.0.1:8000";
} else {
  IndexerUrl = "https://api.paybeaver.xyz";
}

export const PaymentPeriod =
  timeDaysSeconds("7d");

export const ChainsSettings: ChainsSettingsType =
  {
    [sepolia.id]: {
      chain: sepolia,
      etherscanBaseUrl:
        "https://sepolia.etherscan.io/",
      rpc: "https://eth-sepolia-public.unifra.io",
      routerAddress:
        "0x46a432Ee69881Af9067C23AE7680912245A7fF52",
      tokens: {
        USDT: {
          address:
            "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
          decimals: 6,
        },
        AAVE: {
          address:
            "0xD3B304653E6dFb264212f7dd427F9E926B2EaA05",
          decimals: 18,
        },
      },
    },
    [polygonMumbai.id]: {
      chain: polygonMumbai,
      etherscanBaseUrl:
        "https://mumbai.polygonscan.com/",
      rpc: "https://rpc.ankr.com/polygon_mumbai",
      routerAddress:
        "0xbE247668C131b913baDa67E76f9cb219EBa8764c",
      tokens: {
        USDT: {
          address:
            "0x1fdE0eCc619726f4cD597887C9F3b4c8740e19e2",
          decimals: 6,
        },
      },
    },
  };

const AvailableTokensSet = SupportedChainIds.map(
  (chainId) =>
    new Set(
      Object.keys(ChainsSettings[chainId].tokens)
    )
).reduce(
  (accumulated, current) =>
    new Set([...accumulated, ...current])
);

export const AvailableTokens = [
  ...AvailableTokensSet,
];

console.log("Available tokens:", AvailableTokens);
