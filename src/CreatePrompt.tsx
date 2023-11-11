import { useState } from "react";
import { ChainsSettings } from "./constants";
import {
  SupportedChain,
  SupportedChainIdsType,
} from "./types";
import {
  makePromptRemotely,
  resolveDomainToAddress,
  saveMetadataRemotely,
} from "./network";
import {
  chainToNormalizedName,
  getAvailableTokensSymbols,
} from "./utils";

const AmountRegexp = /^\d+(\.\d+)?$/;
const PeriodRegexp = /^\d+d$/;

export function CreatePrompt(props: {
  chains: SupportedChain[];
}) {
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

  const _onCreatePrompt = async () => {
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
    const subscriptionIdToSave =
      subscriptionId.length === 0
        ? null
        : subscriptionId;
    const userIdToSave =
      userId.length === 0 ? null : userId;
    const promptId = await makePromptRemotely({
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
      subscriptionId: subscriptionIdToSave,
      userId: userIdToSave,
    });
    console.log(
      "Generated a prompt id.",
      promptId
    );

    // Cache metadata on the server. Makes the checkout form loading faster.
    await saveMetadataRemotely({
      merchantDomain,
      productName,
    });

    await saveMetadataRemotely({
      subscriptionId: subscriptionIdToSave,
      userId: userIdToSave,
    });

    window.location.href = `/create/${promptId}`;
  };

  const onCreatePrompt = async () => {
    setErrorMessage("");
    setLoading(true);
    try {
      await _onCreatePrompt();
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <p className="title1Font">
        Create a checkout link!
      </p>
      <div className="promptFormContainer">
        <div>
          <p>Your Website Domain</p>
          <input
            type="text"
            placeholder="paybeaver.xyz"
            value={merchantDomain}
            onChange={(event) =>
              setMerchantDomain(
                event.target.value
              )
            }
            className="scalingInput"
          />
        </div>
        <div>
          <p>Concise product name</p>
          <input
            type="text"
            placeholder="Montly Spotify"
            value={productName}
            onChange={(event) =>
              setProductName(event.target.value)
            }
            className="scalingInput"
          />
        </div>
        <div>
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
              props.chains
            ).map((tokenSymbol) => (
              <option
                value={tokenSymbol}
                key={tokenSymbol}
              >
                {tokenSymbol}
              </option>
            ))}
          </select>
        </div>
        <div>
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
        </div>
        <div>
          <p>
            Billing period length, in days. 1
            month = 30 days, 1 year = 365 days.
          </p>
          <input
            type="text"
            placeholder="30d"
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value);
            }}
          />
        </div>
        <div>
          <p>
            Blockchains to accept payments on.
          </p>
          <p>
            Some blockchains may be unavailable
            depending on the selected token.
          </p>
          {props.chains.map((chain) => (
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
        <div>
          <p>
            Optional. How much free trial to give
            to the users, in days. 1 month = 30
            days, 1 year = 365 days.
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
        </div>
        <div>
          <p>
            Optional. Success url. Where to
            redirect the user when they
            successfully start a subscription.
          </p>
          <input
            type="text"
            placeholder="https://simple-merchant.paybeaver.xyz/success"
            value={onSuccessUrl}
            onChange={(event) => {
              setOnSuccessUrl(event.target.value);
            }}
          />
        </div>
        <div>
          <p>
            Optional. Subscription Id. Note: this
            will be available publicly.
          </p>
          <input
            type="text"
            placeholder="31d-random1-12-subscripton-2qw-id"
            value={subscriptionId}
            onChange={(event) => {
              setSubscriptionId(
                event.target.value
              );
            }}
          />
        </div>
        <div>
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
        </div>
        {errorMessage && (
          <p
            style={{
              textAlign: "center",
            }}
          >
            {errorMessage}
          </p>
        )}
        <button
          onClick={onCreatePrompt}
          disabled={loading}
          className="mediumButton"
        >
          {loading
            ? "Creating..."
            : "Create a link!"}
        </button>
      </div>
      <div style={{ height: 200 }} />
    </div>
  );
}
