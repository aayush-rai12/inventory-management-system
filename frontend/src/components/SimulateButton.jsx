import { useState } from 'react';
import { simulateTransaction } from '../api/client';

export default function SimulateButton({ onSimulated }) {
  const [loading, setLoading] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  async function handleClick() {
    setLoading(true);
    try {
      const data = await simulateTransaction();
      setLastEvent(data.event);
      onSimulated();
    } catch (err) {
      console.error('Simulate failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">Live Simulation</h2>
        {lastEvent && (
          <p className="text-sm text-gray-500 mt-1">
            Last sent: {lastEvent.event_type} of {lastEvent.quantity} units,{' '}
            {lastEvent.product_id}
          </p>
        )}
      </div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Simulate Transaction'}
      </button>
    </div>
  );
}