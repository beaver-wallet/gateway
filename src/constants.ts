import {
  sepolia,
  polygonMumbai,
  baseGoerli,
  polygon,
  base,
} from "wagmi/chains";
import { ChainsSettingsType } from "./types";
import { timeDaysSeconds } from "./utils";

export const SupportedChains = [
  sepolia,
  polygonMumbai,
  baseGoerli,
  polygon,
  base,
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
        "0x748FC43a4218f28CB6CD99F60c30Fcc09eA4E5f9",
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
        "0x748FC43a4218f28CB6CD99F60c30Fcc09eA4E5f9",
      tokens: {
        USDT: {
          address:
            "0x1fdE0eCc619726f4cD597887C9F3b4c8740e19e2",
          decimals: 6,
        },
      },
    },
    [baseGoerli.id]: {
      chain: baseGoerli,
      etherscanBaseUrl:
        "https://goerli.basescan.org/",
      rpc: "https://goerli.base.org",
      routerAddress:
        "0x748FC43a4218f28CB6CD99F60c30Fcc09eA4E5f9",
      tokens: {
        COMP: {
          address:
            "0xA29b548056c3fD0f68BAd9d4829EC4E66f22f796",
          decimals: 18,
        },
      },
    },
    [polygon.id]: {
      chain: polygon,
      etherscanBaseUrl:
        "https://polygonscan.com/",
      rpc: "https://polygon.llamarpc.com",
      routerAddress:
        "0x748FC43a4218f28CB6CD99F60c30Fcc09eA4E5f9",
      tokens: {
        USDT: {
          address:
            "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
          decimals: 6,
        },
        EURS: {
          address:
            "0xE111178A87A3BFf0c8d18DECBa5798827539Ae99",
          decimals: 2,
        },
      },
    },
    [base.id]: {
      chain: base,
      etherscanBaseUrl: "https://basescan.org/",
      rpc: "https://mainnet.base.org",
      routerAddress:
        "0x27bFF737b405a4C540001BDF9CC184c3392b1733",
      tokens: {
        USDC: {
          address:
            "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
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
