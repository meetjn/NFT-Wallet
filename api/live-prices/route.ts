import { fetchLivePrices } from "../../../utils/api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pairs = url.searchParams.get("pairs") || "";
  const pairsList = pairs.split(",");

  try {
    const prices = await fetchLivePrices(pairsList);
    return new Response(JSON.stringify(prices), { status: 200 });
  } catch (error) {
    console.error("Error fetching live prices:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch live prices" }),
      { status: 500 }
    );
  }
}
