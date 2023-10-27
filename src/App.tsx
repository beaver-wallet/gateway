import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import { Subscribe } from "./Subscribe";
import {
  WagmiConfig,
  configureChains,
  createConfig,
} from "wagmi";
import { Home } from "./Home";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { ManageList } from "./ManageList";
import {
  ChainsSettings,
  SupportedChains,
} from "./constants";
import { ManageSingle } from "./ManageSingle";
import { All } from "./All";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { SupportedChainIdsType } from "./types";

// Wallet connect project id
export const projectId =
  "e73fed4f49cb7c0d4ab26cf055465dcc";

export const metadata = {
  name: "Beaver Subscriptions Gateway",
  description:
    "Beaver Subscriptions Gateway - an easy way to pay for subscriptions with crypto",
  url: "https://gateway.paybeaver.xyz",
  icons: [
    "https://avatars.githubusercontent.com/u/37784886",
  ],
};

const { chains, publicClient } = configureChains(
  SupportedChains,
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: ChainsSettings[
          chain.id as SupportedChainIdsType
        ].rpc,
      }),
    }),
  ]
);

export const wagmiConfig = createConfig({
  publicClient,
  connectors: [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId,
        metadata,
        showQrModal: false,
      },
    }),
  ],
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains: SupportedChains,
  defaultChain: SupportedChains[0],
});

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/subscribe"
            element={<Subscribe />}
          />
          <Route
            path="/manage"
            element={<ManageList />}
          />
          <Route
            path="/manage/:address"
            element={<ManageList />}
          />
          <Route
            path="/subscription"
            element={<ManageSingle />}
          />
          <Route
            path="/subscription/:subscriptionHash"
            element={<ManageSingle />}
          />
          <Route path="/all" element={<All />} />
        </Routes>
      </BrowserRouter>
    </WagmiConfig>
  );
}

export default App;
