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
      routerAddress:
        "0x2918592c2deaBC44f18C8291ae19999D908c23ff",
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
        "0x9f86fAb93F14B98EFe68786606CcF4113C7c1A0b",
      tokens: {
        USDT: {
          address:
            "0x1fdE0eCc619726f4cD597887C9F3b4c8740e19e2",
          decimals: 6,
        },
      },
    },
  };
