import {
  base,
  polygon,
  mainnet,
  sepolia,
  baseGoerli,
  arbitrum,
  arbitrumGoerli,
} from "wagmi/chains";

export type SupportedChain =
  | typeof mainnet
  | typeof base
  | typeof polygon
  | typeof sepolia
  | typeof baseGoerli
  | typeof arbitrum
  | typeof arbitrumGoerli;

export const SupportedChains = [
  mainnet,
  base,
  polygon,
  sepolia,
  baseGoerli,
  arbitrum,
  arbitrumGoerli,
];

export const SupportedChainIds =
  SupportedChains.map((chain) => chain.id);
