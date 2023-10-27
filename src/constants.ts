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

export const EmptyProduct =
  "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000";

export const ChainsSettings: ChainsSettingsType =
  {
    [sepolia.id]: {
      routerAddress:
        "0x97a64798E1CB5B34c5868aA1F19758831F13eBf4",
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
      routerAddress:
        "0x9CdB06a9689C07a8834B3B5E1209C3cF1E7fC5E4",
      tokens: {
        USDT: {
          address:
            "0x1fdE0eCc619726f4cD597887C9F3b4c8740e19e2",
          decimals: 6,
        },
      },
    },
  };
