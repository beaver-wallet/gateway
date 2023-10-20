export function periodToHuman(
  seconds: number
): string {
  switch (seconds) {
    case 0:
      return "0";
    case 60:
      return "minute";
    case 3600:
      return "hour";
    case 86400:
      return "day";
    case 604800:
      return "week";
    case 2592000:
      return "month";
    case 31536000:
      return "year";
    default:
      return `${seconds} seconds`;
  }
}

export function humanToPeriodSeconds(
  human: string
): number {
  let periodSeconds: number;
  switch (human) {
    case "0":
      periodSeconds = 0;
      break;
    case "min":
      periodSeconds = 60;
      break;
    case "day":
      periodSeconds = 60 * 60 * 24;
      break;
    case "week":
      periodSeconds = 60 * 60 * 24 * 7;
      break;
    case "month":
      periodSeconds = 60 * 60 * 24 * 30;
      break;
    case "year":
      periodSeconds = 60 * 60 * 24 * 365;
      break;
    default:
      throw new Error(
        `Provided human period ${human} is not valid.`
      );
  }

  return periodSeconds;
}
