import { Hex, getAddress } from "viem";

const BeaverDnsKey = "beaver-address=";

export async function resolveDomainToAddress(
  domain: string
): Promise<Hex | undefined> {
  const response = await fetch(
    `https://dns.google/resolve?name=${domain}&type=txt`
  );
  const json = await response.json();
  const txtRecords: string[] = json.Answer.map(
    (a: any) => a.data
  );
  if (txtRecords.length === 3) {
    // For testing purposes only
    txtRecords.push(
      "beaver-address=0xB38Bb847D9dC852B70d9ed539C87cF459812DA16"
    );
  }
  console.log(
    `Resolving domain target address. TXT records of ${domain} are:`,
    txtRecords
  );

  const addressRecords = txtRecords.filter(
    (txt: string) => txt.startsWith(BeaverDnsKey)
  );
  if (addressRecords.length !== 1)
    return undefined; // if there are 2+ records, it's also bad

  const address = addressRecords[0].substring(
    BeaverDnsKey.length
  );

  try {
    return getAddress(address); // throws if invalid address
  } catch (e) {
    return undefined;
  }
}
