export const TestSubscribeSearchParams = {
  product: "Test product",
  token: "USDT",
  amount: "5",
  period: "min",
  chains: "1,11155111",
  domain: "ethbeaver.xyz",
  onSuccessUrl: "https://ethereum.org",
  subscriptionId: "312dfs2@#j",
  freeTrialLength: "0",
  paymentPeriod: "10000000000",

  get(property: string): string {
    return this[
      property as keyof typeof TestSubscribeSearchParams
    ] as string;
  },
};
