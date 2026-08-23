import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, getLedger, resetData } from "../api/client";
import StockOverview from "../components/StockOverview";
import TransactionLedger from "../components/TransactionLedger";
import SimulateButton from "../components/Simulatebutton";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, ledgerRes] = await Promise.all([
        getProducts(),
        getLedger(),
      ]);
      setProducts(productsRes.data);
      setTransactions(ledgerRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleReset() {
    if (
      !window.confirm("This will clear all transaction data. Are you sure?")
    ) {
      return;
    }
    try {
      await resetData();
      fetchData();
    } catch (err) {
      console.error("Reset failed:", err);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inventory Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Reset Data
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <SimulateButton onSimulated={fetchData} />
        <StockOverview products={products} />
        <TransactionLedger transactions={transactions} />
      </div>
    </div>
  );
}
