import {
  polygon,
  mainnet,
  sepolia,
} from "wagmi/chains";
import { SupportedChain } from "./types";
import { timeDaysSeconds } from "./utils";

export const SupportedChains = [
  mainnet,
  polygon,
  sepolia,
];

export const SupportedChainIds =
  SupportedChains.map((chain) => chain.id);

export const SupportedChainNames = [
  "sepolia",
  "mainnet",
  "ethereum",
  "polygon",
];

export const ChainByName: {
  [chainName: string]: SupportedChain;
} = {
  sepolia: sepolia,
  mainnet: mainnet,
  ethereum: mainnet,
  polygon: polygon,
};

export const RouterAddress =
  "0x00d7eA8c8d5e9f488658787Aad2A0C33d33122fC";

export const BeaverInitiator =
  "0xB38Bb847D9dC852B70d9ed539C87cF459812DA16";

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

export const ChainsSettings = {
  [mainnet.id]: {
    tokens: {
      USDT: {
        address:
          "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        decimals: 6,
      },
      EURS: {
        address:
          "0xdB25f211AB05b1c97D595516F45794528a807ad8",
        decimals: 2,
      },
    },
  },
  [polygon.id]: {
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
