import "server-only";

export async function sendDiscord(message: string) {
  await fetch(process.env.DISCORD_WEBHOOK!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  });
}
