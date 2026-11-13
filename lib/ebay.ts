import "server-only";

type EbayItemSummary = {
  itemId: string;
  title: string;
  price: { value: string; currency: string };
  itemWebUrl: string;
  image?: { imageUrl: string };
  shippingOptions?: { shippingCost?: { value: string } }[];
};

type EbaySearchResponse = {
  itemSummaries?: EbayItemSummary[];
};

const bannedWord = ["custom", "proxy", "replica", "orica", "fake"];

async function getToken() {
  const auth = Buffer.from(
    `${process.env.APP_ID}:${process.env.CERT_ID}`,
  ).toString("base64");

  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },

    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    }),
  });

  if (!res.ok)
    throw new Error(`eBay token failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token as string;
}

export async function searchEbay(query: string, maxPrice: number) {
  const token = await getToken();
  const exclude = bannedWord.map((word) => `-${word}`).join(" ");

  const params = new URLSearchParams({
    q: `${query} ${exclude}`,
    filter: `price:[..${maxPrice}],priceCurrency:AUD,buyingOptions:{FIXED_PRICE},deliveryCountry:AU,itemLocationCountry:AU`,
    sort: "newlyListed",
    limit: "16",
  });

  const res = await fetch(
    `https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_AU",
        "X-EBAY-C-ENDUSERCTX": `contextualLocation=country=AU,zip=${process.env.POSTCODE}`,
      },
    },
  );

  if (!res.ok)
    throw new Error(`eBay search failed: ${res.status} ${await res.text()}`);

  const data: EbaySearchResponse = await res.json();

  return (data.itemSummaries ?? []).map((item) => ({
    itemId: item.itemId,
    title: item.title,
    price: Number(item.price.value),
    url: item.itemWebUrl,
    imageUrl: item.image?.imageUrl,
    shipping: item.shippingOptions?.[0]?.shippingCost
      ? Number(item.shippingOptions[0].shippingCost.value)
      : undefined,
  }));
}
