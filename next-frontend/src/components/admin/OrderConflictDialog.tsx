'use client';

import { useState } from 'react';

interface OrderConflict {
  warning: string;
  suggestion: string;
  nextAvailable: number;
}

interface OrderConflictDialogProps {
  conflict: OrderConflict;
  onResolve: (order: number | string) => void;
  onCancel: () => void;
}

export default function OrderConflictDialog({ conflict, onResolve, onCancel }: OrderConflictDialogProps) {
  const [selectedOrder, setSelectedOrder] = useState<number | 'custom' | null>(null);
  const [customOrder, setCustomOrder] = useState('');

  const handleResolve = () => {
    if (selectedOrder === 'custom') {
      if (!customOrder || parseInt(customOrder) < 1) {
        alert('Please enter a valid order number');
        return;
      }
      onResolve(customOrder);
    } else if (selectedOrder !== null) {
      onResolve(selectedOrder);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in duration-300">
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-start gap-3">
          <div className="text-3xl">⚠️</div>
          <div>
            <h2 className="font-bold text-slate-900">Display Order Conflict</h2>
            <p className="text-sm text-slate-600 mt-1">{conflict.warning}</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
            <p className="font-semibold mb-2">💡 Suggestion:</p>
            <p>{conflict.suggestion}</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
              <input
                type="radio"
                name="order-choice"
                checked={selectedOrder === conflict.nextAvailable}
                onChange={() => {
                  setSelectedOrder(conflict.nextAvailable);
                  setCustomOrder('');
                }}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="ml-3 flex-1">
                <span className="font-semibold text-slate-900">
                  Use suggested order: {conflict.nextAvailable}
                </span>
                <p className="text-xs text-slate-500">Automatically assign the next available order</p>
              </span>
            </label>

            <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
              <input
                type="radio"
                name="order-choice"
                checked={selectedOrder === 'custom'}
                onChange={() => setSelectedOrder('custom')}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="ml-3 flex-1">
                <span className="font-semibold text-slate-900">Enter custom order:</span>
                <input
                  type="number"
                  placeholder="Enter order number"
                  value={customOrder}
                  onChange={(e) => setCustomOrder(e.target.value)}
                  onClick={() => setSelectedOrder('custom')}
                  className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  min="1"
                />
              </span>
            </label>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition duration-150"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
