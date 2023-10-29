import { useState } from "react";
import {
  AvailableTokens as AvailableTokensSymbols,
  ChainsSettings,
  SupportedChains,
} from "./constants";
import { SupportedChain } from "./types";
import { resolveDomainToAddress } from "./network";

const AmountRegexp = /^$/;
const PeriodRegexp = /^\d+d$/;

export function CreateShortcut() {
  const [merchantDomain, setMerchantDomain] =
    useState("");
  const [productName, setProductName] =
    useState("");
  const [tokenSymbol, setTokenSymbol] =
    useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("");
  const [selectedChainIds, setSelectedChainIds] =
    useState<Set<number>>(new Set());
  const [freeTrialLength, setFreeTrialLength] =
    useState("");
  const [onSuccessUrl, setOnSuccessUrl] =
    useState("");
  const [subscriptionId, setSubscriptionId] =
    useState("");
  const [userId, setUserId] = useState("");
  const [initiator, setInitiator] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");
  const [loading, setLoading] = useState(false);

  const chainDisabled = (chain: SupportedChain) =>
    !Object.keys(
      ChainsSettings[chain.id].tokens
    ).includes(tokenSymbol);

  const chainChecked = (chain: SupportedChain) =>
    selectedChainIds.has(chain.id);

  const onCreateShortcut = async () => {
    const merchantAddress =
      resolveDomainToAddress(merchantDomain);

    if (!merchantAddress) {
      // set;
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
          {AvailableTokensSymbols.map(
            (tokenSymbol) => (
              <option
                value={tokenSymbol}
                key={tokenSymbol}
              >
                {tokenSymbol}
              </option>
            )
          )}
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
            Note: some blockchains may be
            unavailable depending on the selected
            token.
          </p>

          {SupportedChains.map((chain) => (
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
        <p>
          Optional. Advanced. Initiator. What
          blockchain address is permitted to
          initiate subscription payments.
        </p>
        <input
          type="text"
          placeholder="0x34207C538E39F2600FE672bB84A90efF190ae4C7"
          value={initiator}
          onChange={(event) => {
            setInitiator(event.target.value);
          }}
        />
      </div>
      <button
        className="mediumButton"
        disabled={loading}
      >
        Create a shortcut!
      </button>
      <div style={{ height: 200 }} />
    </div>
  );
}
