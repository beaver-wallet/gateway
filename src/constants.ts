import {
  polygon,
  mainnet,
  sepolia,
} from "wagmi/chains";
import { SupportedChain } from "./types";

export const SupportedChains = [
  mainnet,
  polygon,
  sepolia,
];

export const ValidPeriods = [
  "min",
  "day",
  "week",
  "month",
  "year",
];

export const SupportedChainIds =
  SupportedChains.map((chain) => chain.id);

export const ChainByName: {
  [chainName: string]: SupportedChain;
} = {
  sepolia: sepolia,
  mainnet: mainnet,
  polygon: polygon,
};

export const RouterAddress =
  "0xe9265fa920552fE26DffCe55C5606B27eceE9c89";

export const BeaverInitiator =
  "0xB38Bb847D9dC852B70d9ed539C87cF459812DA16";

export let IndexerUrl =
  "https://api.paybeaver.xyz";

export const ChainsSettings = {
  [mainnet.id]: {
    tokens: {
      USDT: {
        address:
          "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        decimals: 6,
      },
      LUSD: {
        address:
          "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
        decimals: 18,
      },
    },
  },
  [polygon.id]: {
    tokens: {
      USDT: {
        address: "",
        decimals: 0,
      },
      LUSD: {
        address:
          "0x23001f892c0c82b79303edc9b9033cd190bb21c7",
        decimals: 18,
      },
    },
  },
  [sepolia.id]: {
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
};
