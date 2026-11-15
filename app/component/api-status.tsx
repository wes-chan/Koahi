import { DAILY_CAP, getUsageToday } from "@/lib/api-usage";
import { connection } from "next/server";

const STATUS = {
  ok: { dot: "bg-emerald-500", label: "Watching eBay" },
  late: { dot: "bg-amber-500", label: "Check delayed" },
  down: { dot: "bg-red-500", label: "Not running" },
};

function getCheckerStatus(lastRun: string | null) {
  if (!lastRun) return STATUS.down;

  const minutes = (Date.now() - new Date(lastRun).getTime()) / 60000;

  if (minutes <= 90) return STATUS.ok;
  if (minutes <= 360) return STATUS.late;

  return STATUS.down;
}

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

  const status = getCheckerStatus(lastRun);

  return (
  <footer className="flex justify-center border-t items-center gap-3">
      <span className={`rounded-full ${status.dot} h-3 w-3`}></span>

      <p className="text-sm py-2">
        Last check {lastRunText} - {calls.toLocaleString()} /{" "}
        {DAILY_CAP.toLocaleString()} calls today
      </p>
    </footer>
  );
}
