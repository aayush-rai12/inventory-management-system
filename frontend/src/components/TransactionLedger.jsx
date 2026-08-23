export default function TransactionLedger({ transactions }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Transaction Ledger</h2>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="py-2">Type</th>
            <th className="py-2">Product ID</th>
            <th className="py-2">Quantity</th>
            <th className="py-2">Price / Cost</th>
            <th className="py-2">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-4 text-center text-gray-400">
                No transactions yet
              </td>
            </tr>
          ) : (
            transactions.map((t, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">
                  <span
                    className={
                      t.type === 'purchase'
                        ? 'text-green-600 font-medium'
                        : 'text-blue-600 font-medium'
                    }
                  >
                    {t.type}
                  </span>
                </td>
                <td className="py-2">{t.product_id}</td>
                <td className="py-2">{t.quantity}</td>
                <td className="py-2">
                  ₹{t.type === 'purchase' ? t.price : t.cost}
                </td>
                <td className="py-2">
                  {new Date(t.timestamp).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}