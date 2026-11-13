import "server-only";

export async function sendDiscord(embeds: object[]) {
  await fetch(process.env.DISCORD_WEBHOOK!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: embeds }),
  });
}
