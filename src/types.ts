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
  onSuccessUrl: string;
  subscriptionId: string;
  freeTrialLength: number;
  paymentPeriod: number;
}

export interface RequiredSearchParams {
  product: string;
  token: string;
  amount: string;
  period: string;
  chains: string;
  domain: string;
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

export interface MerchantBalance {
  amount: number;
  tokenSymbol: string;
  chain: SupportedChain;
}

export interface MerchantInfo {
  address: Hex;
  balances: MerchantBalance[];
  mrrUsd: number;
  activeSubscriptionsNumber: number;
  totalEarnedUsd: number;
  worksOnChains: SupportedChain[];
}
