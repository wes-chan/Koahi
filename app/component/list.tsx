import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";


export default async function List() {
  const { data: cards, error } = await supabaseAdmin
    .from("cards")
    .select("id, set_name, name, variation, target_price")
    .eq("status", "missing")
    .order("target_price", { ascending: true, nullsFirst: false });

  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul className="">
      {cards.map((card) => (
        <li key={card.id}>
          <Link
            href={`/cards/${card.id}`}
            className="flex justify-between gap-3 border-t py-4 items-center"
          >
            <div className="min-w-0">
              <p className="text-xs truncate">{card.set_name}</p>
              <h3  className="text-sm font-bold">{card.name}</h3>
              <p className="text-sm">{card.variation} </p>
            </div>


           {card.target_price != null ? (
            <div className="flex flex-col justify-center">
              <span>${card.target_price}</span>
              <p>target</p>
            </div>

           ) : (

            <button type="button" className="border text-sm px-3 py-2 rounded-xl" >
              Set target
            </button>




            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
