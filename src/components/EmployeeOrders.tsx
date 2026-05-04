import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, XCircle, Clock, Smartphone } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function EmployeeOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchOrders();
    // In a real app we would use socketService here to listen to 'order-updated'
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      // In a real app, this endpoint should just fetch orders assigned to user.id
      const res = await fetch('/api/orders');
      let data = await res.json();
      if (Array.isArray(data)) {
        data = data.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'served' && o.status !== 'paid');
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center">
          <Smartphone size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Active Orders</h2>
          <p className="text-sm font-bold text-gray-500">Manage orders assigned to you</p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="font-bold text-gray-400">No active orders right now.</p>
          </div>
        ) : (
          orders.map(order => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    order.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {order.status}
                  </span>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    #{order.id.slice(-6)}
                  </span>
                </div>
                <p className="font-black text-lg">{order.totalAmount ? `₹${order.totalAmount}` : 'Order details not available'}</p>
              </div>

              <div className="flex gap-2 items-center">
                {order.status === 'pending' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'confirmed')}
                    className="px-6 py-3 bg-blue-500 text-white font-black text-sm rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Accept Order
                  </button>
                )}
                
                {(order.status === 'confirmed' || order.status === 'preparing') && (
                  <button 
                    onClick={() => updateStatus(order.id, 'completed')}
                    className="px-6 py-3 bg-green-500 text-white font-black text-sm rounded-xl hover:bg-green-600 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Mark Completed
                  </button>
                )}

                <button 
                  onClick={() => updateStatus(order.id, 'cancelled')}
                  className="px-4 py-3 bg-red-50 text-red-500 font-black text-sm rounded-xl hover:bg-red-100 transition-all"
                >
                  <XCircle size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
