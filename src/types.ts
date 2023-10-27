import { Hex } from "viem";
import {
  SupportedChainIds,
  SupportedChains,
} from "./constants";

export type SupportedChain =
  (typeof SupportedChains)[0];

export type SupportedChainIdsType =
  (typeof SupportedChainIds)[0];

export type ChainsSettingsType = Record<
  SupportedChainIdsType,
  {
    routerAddress: Hex;
    rpc: string;
    tokens: any;
  }
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
  productMetadataCID: Hex;
  subscriptionMetadataCID: Hex;
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
  metadataCID: string;
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
  metadataCID: string;
  subscriptionId: string | null;
  userId: string | null;
  status: string;
  isActive: boolean;
  nextPaymentAt: number;
}
