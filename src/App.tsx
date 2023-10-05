import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import { Subscribe } from "./Subscribe";
import { WagmiConfig } from "wagmi";
import { Home } from "./Home";
import { defaultWagmiConfig } from "@web3modal/wagmi/react";
import { SupportedChains } from "./types";

// Wallet connect project id
export const projectId =
  "e73fed4f49cb7c0d4ab26cf055465dcc";

export const metadata = {
  name: "Beaver Subscriptions Gateway",
  description:
    "Beaver Subscriptions Gateway - an easy way to pay for subscriptions with crypto",
  url: "https://gateway.ethbeaver.xyz",
  icons: [
    "https://avatars.githubusercontent.com/u/37784886",
  ],
};

export const wagmiConfig = defaultWagmiConfig({
  chains: SupportedChains,
  projectId,
  metadata,
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
        </Routes>
      </BrowserRouter>
    </WagmiConfig>
  );
}

export default App;
