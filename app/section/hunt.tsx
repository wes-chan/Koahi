import Image from "next/image";
import Progress from "../component/progress";
import ValueOverview from "../component/valueoverview";
import List from "../component/list";


export default function HuntList() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <Progress />
      <section className="mt-8 space-y-2">
        <h1 className=" text-4xl">16 to find</h1>
        <p className="text-sm">
          You get pinged when a listing hits your target
        </p>
      </section>

      <ValueOverview />

      <p className="py-4">Every card is checked hourly</p>
      <List />
    </main>
  );
}
