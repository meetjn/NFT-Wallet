
export default function GetIpfsUrlFromPinata(pinataUrl: string): string {
    const IPFSUrl = pinataUrl.split("/");
    const lastIndex = IPFSUrl.length;
    return "https://ipfs.io/ipfs/" + IPFSUrl[lastIndex - 1];
  }
  
  export function shortenAddress(address: string, chars: number = 4): string {
    if (!address) return "";
    return `${address.substring(0, chars + 2)}...${address.substring(
      address.length - chars
    )}`;
  }
  
  export function formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  