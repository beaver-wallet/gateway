export function periodToHuman(
  seconds: number
): string {
  switch (seconds) {
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
