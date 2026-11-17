import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";
import { getToken, searchEbay, getShipping } from "@/lib/ebay";
import { sendDiscord } from "@/lib/discord";
import { getUsageToday, saveUsage, DAILY_CAP } from "@/lib/api-usage";

export async function GET(req: NextRequest) {
  if (
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { data: cards, error } = await supabaseAdmin
    .from("cards")
    .select("*")
    .eq("status", "missing");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // The main checks, and notifications

  let alerted = 0;
  let skipped = 0;
  let apiCall = 0;
  const { calls: usedToday } = await getUsageToday();

  if (usedToday >= DAILY_CAP)
    return Response.json({ error: "Daily API cap reached" });

  const token = await getToken();
  apiCall++;

  for (const card of cards) {
    if (!card.search_query || card.target_price == null) continue;

    if (usedToday + apiCall + 1 > DAILY_CAP) break;

    let listings;

    apiCall++;

    try {
      listings = await searchEbay(token, card.search_query, card.target_price);
    } catch (error) {
      console.error("eBay search failed: ", error);
      break;
    }

    for (const l of listings) {
      const target = Number(card.target_price);

      if (l.price > target) continue;

      const { data: seen } = await supabaseAdmin
        .from("seen_listings")
        .select("item_id")
        .eq("item_id", l.itemId)
        .maybeSingle();

      if (seen) {
        skipped++;
        continue;
      }

      if (l.shipping == null && usedToday + apiCall + 1 <= DAILY_CAP) {
        apiCall++;
        try {
          l.shipping = await getShipping(token, l.itemId);
          console.log(`Looked up ${l.title} - ${l.shipping}`);
        } catch (error) {
          console.error(`getItem failed for ${l.itemId}:`, error);
        }
      }

      const total = l.price + (l.shipping ?? 0);

      if (total > target) {
        await supabaseAdmin.from("seen_listings").insert({
          item_id: l.itemId,
          card_id: card.id,
          price: l.price,
        });
        continue;
      }
      const underBy = target - total;
      const shippingText =
        l.shipping !== undefined ? `$${l.shipping.toFixed(2)}` : "??";

      await sendDiscord([
        {
          author: {
            name: `New Deal - ${card.set_name}`,
          },

          title: `${card.name} - ${card.variation ?? ""} `,
          url: l.url,
          description: l.title,
          color: 15975999,
          image: l.imageUrl ? { url: l.imageUrl } : undefined,

          footer: {
            text:
              l.shipping === undefined
                ? `${card.set_name} - Postage not included, check listing`
                : `${card.set_name}`,
          },

          timestamp: new Date().toISOString(),

          fields: [
            {
              name: "Price",
              value: `$${l.price} + ${shippingText}`,
              inline: true,
            },

            {
              name: "Target",
              value: `$${card.target_price}`,
              inline: true,
            },

            {
              name: "Under by",
              value: `$${underBy.toFixed(2)}`,
              inline: true,
            },
          ],
        },
      ]);

      await supabaseAdmin.from("seen_listings").insert({
        item_id: l.itemId,
        card_id: card.id,
        price: l.price,
      });
      alerted++;
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  await saveUsage(usedToday + apiCall);

  return Response.json({ Alert: alerted, Seen: skipped, API: apiCall });
}
