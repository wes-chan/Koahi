import { DAILY_CAP, getUsageToday } from "@/lib/api-usage";
import { connection } from "next/server";

export default async function ApiStatus() {
  await connection();
  const { calls, lastRun } = await getUsageToday();

  const lastRunText = lastRun
    ? new Date(lastRun).toLocaleTimeString("en-AU", {
        timeZone: "Australia/Sydney",
        hour: "numeric",
        minute: "2-digit",
      })
    : "not yet today";

  return (
    <footer className="flex justify-center border-t">
      <p>
        Last check {lastRunText} - {calls.toLocaleString()} /{" "}
        {DAILY_CAP.toLocaleString()} calls today
      </p>
    </footer>
  );
}
