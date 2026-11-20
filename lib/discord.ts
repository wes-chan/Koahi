import "server-only";

export async function sendDiscord(embeds: object[]) {
  const res = await fetch(process.env.DISCORD_WEBHOOK!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: embeds }),
  });
  if (!res.ok){
    throw new Error(`Discord failed: ${res.status} ${await res.text()}`)
  }
  
}
