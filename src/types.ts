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
  encodedProductMetadata: Hex;
  encodedSubscriptionMetadata: Hex;
  initiator: Hex | null;
}

export interface Product {
  productHash: string;
  chain: SupportedChain;
  merchantAddress: Hex;
  tokenAddress: Hex;
  tokenSymbol: string;
  tokenDecimals: number;
  uintAmount: number;
  humanAmount: number;
  period: number;
  periodHuman: string;
  freeTrialLength: number;
  paymentPeriod: number;
  metadataHash: string;
  merchantDomain: string;
  productName: string;
}

export interface Subscription {
  subscriptionHash: string;
  product: Product;
  userAddress: Hex;
  startTs: number;
  paymentsMade: number;
  terminated: boolean;
  metadataHash: string;
  subscriptionId: string | null;
  userId: string | null;
  status: string;
  isActive: boolean;
  nextPaymentAt: number;
}
