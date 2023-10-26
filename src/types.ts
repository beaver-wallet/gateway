import { Hex } from "viem";
import {
  SupportedChainIds,
  SupportedChains,
} from "./constants";

export type SupportedChain =
  (typeof SupportedChains)[0];

export type SupportedChainIdsType =
  (typeof SupportedChainIds)[0];

export interface SingleChainSettings {
  routerAddress: Hex;
  tokens: any;
}

export type ChainsSettingsType = Record<
  SupportedChainIdsType,
  SingleChainSettings
>;

export interface SubscriptionPrompt {
  merchantDomain: string;
  merchantAddress: Hex;
  product: string;
  tokenSymbol: string;
  amount: number;
  periodHuman: string;
  periodSeconds: number;
  availableChains: SupportedChain[];
  onSuccessUrl: string | null;
  subscriptionId: string | null;
  userId: string | null;
  freeTrialLengthHuman: string;
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
