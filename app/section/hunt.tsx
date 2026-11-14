import Progress from "../component/progress";
import ValueOverview from "../component/valueoverview";
import List from "../component/list";
import ApiStatus from "../component/api-status";
import { Suspense } from "react";

export default function HuntList() {
  return (
    <>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <Progress />
        <section className="mt-8 space-y-2">
          <h1 className=" text-4xl">16 to find</h1>
          <p className="text-sm">
            You get pinged when a listing hits your target
          </p>
        </section>

        <ValueOverview />

        <p className="py-4">Every card is checked hourly</p>
        <Suspense fallback={<p>Loading...</p>}>
          <List />
        </Suspense>
      </main>
      <Suspense fallback={<p>Loading...</p>}>
        <ApiStatus />
      </Suspense>
    </>
  );
}
