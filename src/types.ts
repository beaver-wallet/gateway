import { Hex } from "viem";
import {
  polygon,
  mainnet,
  sepolia,
} from "wagmi/chains";
import { ValidPeriods } from "./constants";

export type SupportedChain =
  | typeof mainnet
  | typeof polygon
  | typeof sepolia;

export type Period =
  (typeof ValidPeriods)[number];

export interface SubscriptionPrompt {
  merchantDomain: string;
  merchantAddress: Hex;
  product: string;
  tokenSymbol: string;
  amount: number;
  periodHuman: Period;
  periodSeconds: number;
  availableChains: SupportedChain[];
  onSuccessUrl: string | null;
  subscriptionId: string | null;
  userId: string | null;
  freeTrialLengthHuman: Period;
  freeTrialLengthSeconds: number;
}

export interface Subscription {
  subscriptionHash: string;
  chain: SupportedChain;
  userAddress: Hex;
  merchantAddress: Hex;
  merchantDomain: Hex;
  product: string;
  nonce: Hex;
  tokenAddress: Hex;
  tokenSymbol: string;
  uintAmount: number;
  humanAmount: number;
  periodHuman: Period;
  periodSeconds: number;
  startTs: number;
  paymentPeriod: number;
  paymentsMade: number;
  terminated: boolean;
}
