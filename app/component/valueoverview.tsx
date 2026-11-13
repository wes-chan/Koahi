
export default function ValueOverview() {
  return (
    <dl className="grid grid-cols-3 border-t border-b py-2 mt-2 text-sm ">
        <div>
            <dt>Total Spent</dt>
            <dd className="font-bold">$100</dd>
        </div>

        <div>
            <dt>WOTC</dt>
            <dd className="font-bold">$100</dd>
        </div>

        <div>
            <dt>Modern</dt>
            <dd className="font-bold">$100</dd>
        </div>
    </dl>
  
  );
}
