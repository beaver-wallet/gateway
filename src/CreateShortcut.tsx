import { useState } from "react";
import {
  ChainsSettings,
  ProductionChains,
} from "./constants";
import {
  SupportedChain,
  SupportedChainIdsType,
} from "./types";
import {
  makeShortcutRemotely,
  resolveDomainToAddress,
} from "./network";
import {
  chainToNormalizedName,
  getAvailableTokensSymbols,
} from "./utils";

const AmountRegexp = /^\d+(\.\d+)?$/;
const PeriodRegexp = /^\d+d$/;

export function CreateShortcut() {
  const [shortcutId, setShortcutId] =
    useState<string>();
  const [merchantDomain, setMerchantDomain] =
    useState("");
  const [productName, setProductName] =
    useState("");
  const [tokenSymbol, setTokenSymbol] =
    useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("");
  const [selectedChainIds, setSelectedChainIds] =
    useState<Set<SupportedChainIdsType>>(
      new Set()
    );
  const [freeTrialLength, setFreeTrialLength] =
    useState("");
  const [onSuccessUrl, setOnSuccessUrl] =
    useState("");
  const [subscriptionId, setSubscriptionId] =
    useState("");
  const [userId, setUserId] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");
  const [loading, setLoading] = useState(false);

  const chainDisabled = (chain: SupportedChain) =>
    !Object.keys(
      ChainsSettings[chain.id].tokens
    ).includes(tokenSymbol);

  const chainChecked = (chain: SupportedChain) =>
    selectedChainIds.has(chain.id);

  const _onCreateShortcut = async () => {
    if (merchantDomain.length === 0) {
      throw new Error(
        "Merchant domain must be entered."
      );
    }

    const merchantAddress =
      await resolveDomainToAddress(
        merchantDomain
      );
    if (!merchantAddress) {
      throw new Error(
        `A merchant Ethereum address must be set at domain "${merchantDomain}" that you entered. If you have set the address recently, please allow ~15 minutes for the address to propagate over the internet.`
      );
    }

    if (productName.length === 0) {
      throw new Error(
        "Product name must be entered."
      );
    }

    if (tokenSymbol.length === 0) {
      throw new Error("Token must be selected.");
    }

    if (!AmountRegexp.test(amount)) {
      throw new Error("Amount must be a number.");
    }

    if (!PeriodRegexp.test(period)) {
      throw new Error(
        "Period is incorrect. Example period: 30d."
      );
    }

    if (selectedChainIds.size === 0) {
      throw new Error(
        "At least one blockchain must be selected."
      );
    }

    if (
      freeTrialLength.length !== 0 &&
      !PeriodRegexp.test(freeTrialLength)
    ) {
      throw new Error(
        "Free trial must either be not specified or contain a valid free trial length. Example: 14d."
      );
    }

    const chainNames = [...selectedChainIds].map(
      (chainId) =>
        chainToNormalizedName(
          ChainsSettings[chainId].chain
        )
    );
    const shortcutId = await makeShortcutRemotely(
      {
        domain: merchantDomain,
        product: productName,
        token: tokenSymbol,
        amount,
        period,
        chains: chainNames.join(","),
        freeTrialLength:
          freeTrialLength.length === 0
            ? null
            : freeTrialLength,
        onSuccessUrl:
          onSuccessUrl.length === 0
            ? null
            : onSuccessUrl,
        subscriptionId:
          subscriptionId.length === 0
            ? null
            : subscriptionId,
        userId:
          userId.length === 0 ? null : userId,
      }
    );
    console.log(
      "Generated a shortcut id.",
      shortcutId
    );
    setShortcutId(shortcutId);
  };

  const onCreateShortcut = async () => {
    setErrorMessage("");
    setLoading(true);
    try {
      await _onCreateShortcut();
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (shortcutId) {
    const shortUrl = `https://paybeaver.xyz/subscribe/${shortcutId}`;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2>
          Create a short Beaver checkout link!
        </h2>
        <div className="shortcutFormContainer">
          <p>
            Congrats! The short code is{" "}
            <strong>{shortcutId}</strong>.
          </p>
          <p>
            Redirect your users to{" "}
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
            >
              {shortUrl}
            </a>{" "}
            to prompt them to pay for this
            product.
          </p>
          <p>
            You can parametrize that url with
            specific{" "}
            <strong>subscriptionId</strong>,{" "}
            <strong>userId</strong> and/or{" "}
            <strong>onSuccessUrl</strong> for
            every particular user and track the
            payments precisely!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h2>
        Create a short Beaver checkout link!
      </h2>
      <div className="shortcutFormContainer">
        <p>Your Website Domain</p>
        <input
          type="text"
          placeholder="paybeaver.xyz"
          value={merchantDomain}
          onChange={(event) =>
            setMerchantDomain(event.target.value)
          }
        />
        <p>Concise product name</p>
        <input
          type="text"
          placeholder="Montly Spotify Subscription"
          value={productName}
          onChange={(event) =>
            setProductName(event.target.value)
          }
        />
        <p>Token to pay in</p>
        <select
          value={tokenSymbol}
          placeholder="Select token"
          onChange={(event) => {
            setTokenSymbol(event.target.value);
            setSelectedChainIds(new Set());
          }}
          style={{ marginBottom: 8 }}
        >
          <option value="" key="" disabled>
            Select a token
          </option>
          {getAvailableTokensSymbols(
            ProductionChains
          ).map((tokenSymbol) => (
            <option
              value={tokenSymbol}
              key={tokenSymbol}
            >
              {tokenSymbol}
            </option>
          ))}
        </select>

        <p>
          Amount of tokens charged every billing
          period.
        </p>
        <input
          type="number"
          placeholder="10"
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
          }}
        />
        <p>
          Billing period length, in days. 1 month
          = 30 days, 1 year = 365 days.
        </p>
        <input
          type="text"
          placeholder="30d"
          value={period}
          onChange={(event) => {
            setPeriod(event.target.value);
          }}
        />
        <div>
          <p>
            Blockchains to accept payments on.
            Some blockchains may be unavailable
            depending on the selected token.
          </p>

          {ProductionChains.map((chain) => (
            <div key={chain.id}>
              <input
                type="checkbox"
                style={{
                  width: "fit-content",
                }}
                disabled={chainDisabled(chain)}
                checked={chainChecked(chain)}
                onChange={(event) => {
                  if (event.target.checked) {
                    setSelectedChainIds(
                      new Set(
                        selectedChainIds.add(
                          chain.id
                        )
                      )
                    );
                  } else {
                    selectedChainIds.delete(
                      chain.id
                    );
                    setSelectedChainIds(
                      new Set(selectedChainIds)
                    );
                  }
                }}
              />
              <p
                style={{
                  display: "inline",
                  color: chainDisabled(chain)
                    ? "grey"
                    : "black",
                }}
              >
                {chain.name}
              </p>
            </div>
          ))}
        </div>
        <p>
          Optional. How much free trial to give to
          the users, in days. 1 month = 30 days, 1
          year = 365 days.
        </p>
        <input
          type="text"
          placeholder="14d"
          value={freeTrialLength}
          onChange={(event) => {
            setFreeTrialLength(
              event.target.value
            );
          }}
        />
        <p>
          Optional. Success url. Where to redirect
          the user when they successfully start a
          subscription.
        </p>
        <input
          type="text"
          placeholder="https://simple-merchant.paybeaver.xyz/success"
          value={onSuccessUrl}
          onChange={(event) => {
            setOnSuccessUrl(event.target.value);
          }}
        />
        <p>
          Optional. Subscription Id. Note: this
          will be available publicly.
        </p>
        <input
          type="text"
          placeholder="31d-random1-12-subscripton-2qw-id"
          value={subscriptionId}
          onChange={(event) => {
            setSubscriptionId(event.target.value);
          }}
        />
        <p>
          Optional. User Id. Note: this will be
          available publicly.
        </p>
        <input
          type="text"
          placeholder="123-randome-12user-21o-id19"
          value={userId}
          onChange={(event) => {
            setUserId(event.target.value);
          }}
        />
        {errorMessage && (
          <p
            style={{
              color: "red",
              textAlign: "center",
            }}
          >
            {errorMessage}
          </p>
        )}
      </div>
      <button
        onClick={onCreateShortcut}
        disabled={loading}
        className="mediumButton"
      >
        Create a shortcut!
      </button>
      <div style={{ height: 200 }} />
    </div>
  );
}
