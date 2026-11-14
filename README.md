# Koahi

**Hourly eBay deal alerts for the cards on your wantlist**

## Why I built it
I collected Pokemon cards as a kid, and when I got back into it, I asked myself what I actually wanted to collect. The answer was Psyduck. His moments in the anime always stood out to me, and he became my favourite Pokemon. So I set out to collect every unique Psyduck card ever printed.

For two years, I tracked them in a Google Sheet and checked eBay constantly. But eBay's saved searches only notify you once a day, missing many potential deals.

Being in Australia made it harder. Most price guides show American prices, which don't reflect what cards actually cost here. And on eBay, many cards looked like a great deal would often turn out to have huge shipping.

So I thought: **Why keep my collection in one place and do the hunting in another?**  Koahi brings them together. It keeps my wantlist organised, and use that same list to watch eBay for me, so I hear about deals sooner, with Australian listings and shipping counted in the price.

## What it does
- **Tracks your wantlist** - each card has its own search and target price
- **Checks eBay every hour** using their official eBay Browser API
- **Includes shipping to your postcode** - compares the total cost against your target
- **Only alerts on new listings** - you're never pinged twice about the same one
- **Sends Discord alerts** with the listing photo, price breakdown and how far under target.

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgre)
- eBay Browser API
- Discord Webhooks
- GitHub Actions + Vercel

## How it works
```
GitHub Action (every hour)
    ↓
/api/check - protected by a secret
    ↓
Check today's API usage → stop if over the daily cap
    ↓
Get one eBay token for the whole run
    ↓
For each missing card:
    search eBay (Buy it Now, ships to Australia, under target)
        ↓
    for each listing:
        total = price + shipping to postcode
        over target? → skip
        already alerted? → skip
        otherwise → Discord alert + remember it
        ↓
Save today's API usage
```

### Database
| Table | Purpose |
| --- | --- |
| `cards` | The wantlist - name, set, variation, search query, target price |
| `seen_listings` | Every listings already alerted on, so nothing is sent twice |
| `api_usage` | One row per day - eBay calls used and when the last run happpened |

## Running it locally
```bash
npm install 
npm run dev
```

Create a `.env` file with:
```
SUPABASE_URL=
SUPABASE_SECRET_KEY=
APP_ID=
CERT_ID=
DISCORD_WEBHOOK=
POSTCODE=
CRON_SECRET=
```

- `APP_ID` / `CERT_ID` - your eBay Production keyset
- `DISCORD_WEBHOOK` - a webhook URL for the channel alert
- `POSTCODE` - used to calculate shipping costs
- `CRON_SECRET` - any long random string for `/api/check`

Then visit `http://localhost:3000/api/check` to run a check manually