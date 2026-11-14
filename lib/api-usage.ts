import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const DAILY_CAP = 2500;

export async function getUsageToday() {
  const date = new Date().toISOString().slice(0, 10);

  const { data } = await supabaseAdmin
    .from("api_usage")
    .select("calls, last_run")
    .eq("date", date)
    .maybeSingle();

  return {
    calls: data?.calls ?? 0,
    lastRun: data?.last_run ?? null,
  };
}

export async function saveUsage(calls: number) {
  const last_run = new Date().toISOString();
  const date = last_run.slice(0, 10);

  await supabaseAdmin.from("api_usage").upsert({
    date,
    calls,
    last_run,
  });
}
