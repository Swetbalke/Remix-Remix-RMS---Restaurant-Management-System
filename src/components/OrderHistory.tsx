import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '../store/useAuthStore';

export default function OrderHistory({ onSelectOrder }: { onSelectOrder: (id: string) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userId=${user?.id}`);
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch order history', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-20 text-center font-black text-gray-400 animate-pulse">LOADING YOUR HISTORY...</div>;

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-gray-200" />
        </div>
        <h3 className="text-2xl font-black text-gray-900">No orders yet</h3>
        <p className="text-gray-500 font-bold mt-2">When you place an order, it will show up here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Your Order History</h2>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectOrder(order.id)}
            className="cursor-pointer"
          >
            <Card className="p-6 border-gray-100 hover:shadow-lg transition-all rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-black text-gray-900">Order #{order.id.slice(-6)}</p>
                    <Badge variant="outline" className={`font-black uppercase text-[10px] tracking-widest ${
                      order.status === 'completed' ? 'border-green-200 text-green-600' : 'border-orange-200 text-orange-600'
                    }`}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>{order.items.length} Items</span>
                    <span className="text-orange-600 font-black">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
