import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";
import { searchEbay } from "@/lib/ebay";
import { sendDiscord } from "@/lib/discord";

export async function GET(req: NextRequest) {
  /*  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`){
        return Response.json({ error: 'Unauthorised'}, {status: 401})
    }*/

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

  for (const card of cards) {
    if (!card.search_query || card.target_price == null) continue;

    let listings;

    try {
      listings = await searchEbay(card.search_query, card.target_price);
    } catch (error) {
      console.error("eBay search failed: ", error);
      break;
    }

    for (const l of listings) {
      const target = Number(card.target_price);
      const total = l.price + (l.shipping ?? 0);

      if (total > target) continue;

      const { data: seen } = await supabaseAdmin
        .from("seen_listings")
        .select("item_id")
        .eq("item_id", l.itemId)
        .maybeSingle();

      if (seen) {
        skipped++;
        continue;
      }

      const underBy = target - total;

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
            text: `${card.set_name} `,
          },

          timestamp: new Date().toISOString(),

          fields: [
            {
              name: "Price",
              value: `$${l.price}`,
              inline: true,
            },

            {
              name: "Shipping",
              value: l.shipping !== undefined ? `$${l.shipping.toFixed(2)}` : "Unknown",

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

  return Response.json({ Alert: alerted, Seen: skipped });
}
