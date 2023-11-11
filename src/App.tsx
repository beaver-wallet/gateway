import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import { Subscribe } from "./Subscription/Subscribe";
import {
  WagmiConfig,
  configureChains,
  createConfig,
} from "wagmi";
import { Home } from "./Home";
import { ManageList } from "./Subscription/ManageList";
import {
  ChainsSettings,
  SupportedChains,
} from "./constants";
import { ManageSingle } from "./Subscription/ManageSingle";
import { All } from "./All";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { SupportedChainIdsType } from "./types";
import { CreatePrompt } from "./CreatePrompt";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { Landing } from "./Landing/Landing";
import { PromptCreated } from "./PromptCreated";

export const metadata = {
  name: "Beaver Subscriptions Gateway",
  description:
    "Beaver Subscriptions Gateway - an easy way to pay for subscriptions with crypto",
  url: "https://paybeaver.xyz",
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

const { connectors } = getDefaultWallets({
  appName: "Beaver Crypto Subscriptions",
  projectId: "YOUR_PROJECT_ID",
  chains,
});

export const wagmiConfig = createConfig({
  publicClient,
  connectors,
});

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={<Landing />}
            />
            <Route
              path="/subscribe"
              element={<Subscribe />}
            />
            <Route
              path="/subscribe/:shortcutId"
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
            <Route
              path="/all"
              element={<All />}
            />
            <Route
              path="/create"
              element={<CreatePrompt />}
            />
            <Route
              path="/create/:promptId"
              element={<PromptCreated />}
            />
          </Routes>
        </BrowserRouter>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
