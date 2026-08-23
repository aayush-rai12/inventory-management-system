export default function StockOverview({ products }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Product Stock Overview</h2>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="py-2">Product ID</th>
            <th className="py-2">Current Quantity</th>
            <th className="py-2">Total Inventory Cost</th>
            <th className="py-2">Avg Cost/Unit</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="4" className="py-4 text-center text-gray-400">
                No stock data yet
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.product_id} className="border-b">
                <td className="py-2">{p.product_id}</td>
                <td className="py-2">{p.current_quantity}</td>
                <td className="py-2">₹{p.total_inventory_cost}</td>
                <td className="py-2">₹{p.average_cost_per_unit}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}