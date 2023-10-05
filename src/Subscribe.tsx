import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { resolveDomainToAddress } from "./network";
import {
  SupportedChain,
  SupportedChainIds,
  SupportedChains,
} from "./types";

function CoreFrame(props: {
  title: string;
  children?: any;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          width: "400px",
          height: "60vh",
          marginTop: "10vh",
          boxShadow: `0 0 2px 2px black`,
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 16,
        }}
      >
        <p
          style={{
            fontSize: 24,
            marginBottom: 16,
          }}
        >
          {props.title}
        </p>
        {props.children}
      </div>
    </div>
  );
}

export function Subscribe() {
  let [searchParams] = useSearchParams();
  const [targetAddress, setTargetAddress] =
    useState("");
  const [chainToPayOn, setChainToPayOn] =
    useState<SupportedChain>();

  // const domain = searchParams.get("domain");
  // const product = searchParams.get("product");
  // const tokenSymbol = searchParams.get("token");
  // const amount = searchParams.get("amount");
  // const period = searchParams.get("period");
  // const chainsToChoose =
  //   searchParams.get("chains");

  const domain = "ethbeaver.xyz";
  const product = "test";
  const tokenSymbol = "ETH";
  const amount = "0.1";
  const period = "week";
  const serializedChains = "1,137";

  useEffect(() => {
    (async () => {
      if (!domain) {
        return;
      }
      const targetAddress =
        await resolveDomainToAddress(domain);

      if (!targetAddress) {
        alert(
          `Beaver target address is not set up at domain ${domain}. Please report this issue to the merchant.`
        );
      } else {
        setTargetAddress(targetAddress);
      }
    })();
  }, []);

  if (
    !domain ||
    !tokenSymbol ||
    !amount ||
    !period ||
    !serializedChains ||
    !product
  ) {
    alert(
      "Not all the needed data was supplied. Please report this issue to the merchant."
    );
    return <div />;
  }

  let chainsToChoose: SupportedChain[];
  try {
    const chainIdsToChoose = serializedChains
      .split(",")
      .map(Number);

    if (chainIdsToChoose.length === 0) {
      alert(
        "No chains for payment were provided. Please report this issue to the merchant."
      );
      return <div />;
    }

    // Validate that all chain ids are in SupportedChains list
    const allChainsAreSupported =
      chainIdsToChoose.every((chainId) =>
        SupportedChainIds.includes(chainId as any)
      );
    if (!allChainsAreSupported) {
      alert(
        "Some of the chains provided are not supported. Please report this issue to the merchant."
      );
      return <div />;
    }

    chainsToChoose = chainIdsToChoose.map(
      (chainId) =>
        SupportedChains.find(
          (chain) => chain.id === chainId
        )
    ) as any;
  } catch (e) {
    alert(
      "Provided chains to choose are in incorrect format. Please report this issue to the merchant."
    );
    return <div />;
  }

  return (
    <CoreFrame title="Start a subscription">
      <p style={{ marginBottom: 8 }}>{domain}</p>
      <p style={{ marginBottom: 8 }}>{product}</p>
      <p>
        {amount} {tokenSymbol} per {period}
      </p>
      {targetAddress && (
        <p>
          Money will be transferred to{" "}
          {targetAddress}
        </p>
      )}
      <p>On which chain do you want to pay?</p>
      <select
        value={chainToPayOn?.id}
        placeholder="Select chain"
        onChange={(event) =>
          setChainToPayOn(
            event.target.value as any
          )
        }
      >
        <option disabled selected>
          Select chain
        </option>
        {chainsToChoose.map((chain, index) => (
          <option value={chain.id} key={index}>
            {chain.name}
          </option>
        ))}
      </select>
      {/* <w3m-button /> */}
    </CoreFrame>
  );
}
