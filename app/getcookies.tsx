// app/server/GetCookies.tsx
import { headers } from "next/headers";

export default async function GetCookies() {
  const cookies = (await headers()).get("cookie") || "";
  return cookies;
}
