export const TestSubscribeSearchParams = {
  product: "Test product",
  token: "USDT",
  amount: "0.12",
  period: "min",
  chains: "1,137,11155111",
  domain: "ethbeaver.xyz",

  get(property: string): string {
    return this[
      property as keyof typeof TestSubscribeSearchParams
    ] as string;
  },
};
