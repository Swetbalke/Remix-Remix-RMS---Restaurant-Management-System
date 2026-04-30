import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  CheckCircle2, 
  ChefHat,
  AlertCircle,
  Timer,
  Bell,
  History,
  Filter
} from 'lucide-react';
import { socketService } from '../services/socketService';
import { Order, OrderStatus } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function KDS() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchOrders();
    socketService.joinRoom("kitchen");
    
    const handleNewOrder = (newOrder: Order) => {
      setOrders(prev => [newOrder, ...prev]);
      playAlert();
      toast.info(`New Order from Table ${newOrder.tableNumber}!`, {
        icon: <Bell className="text-orange-500" />
      });
    };

    socketService.onNewOrder(handleNewOrder);
    socketService.onOrderUpdated((updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    return () => {
      socketService.off("new-order", handleNewOrder);
    };
  }, []);

  const playAlert = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed', e));
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data.filter((o: Order) => o.status !== 'paid' && o.status !== 'cancelled'));
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      }
    } catch (err) {
      console.error('Failed to update order', err);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'served': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  return (
    <div className="space-y-8">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-200">
            <ChefHat size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Kitchen Display</h2>
            <p className="text-gray-500 font-bold text-sm">Real-time order orchestration</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="All" count={orders.length} />
          <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')} label="New" count={orders.filter(o => o.status === 'pending').length} color="blue" />
          <FilterButton active={filter === 'preparing'} onClick={() => setFilter('preparing')} label="Cooking" count={orders.filter(o => o.status === 'preparing').length} color="orange" />
          <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')} label="Ready" count={orders.filter(o => o.status === 'completed' || o.status === 'served').length} color="green" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order) => (
            <motion.div key={order.id} layout>
              <OrderCard order={order} onUpdateStatus={updateStatus} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 py-32 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChefHat size={48} className="text-gray-200" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">Kitchen is Clear</h3>
          <p className="text-gray-400 font-bold mt-2">No {filter !== 'all' ? filter : ''} orders at the moment.</p>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onUpdateStatus }: { order: Order, onUpdateStatus: (id: string, s: OrderStatus) => Promise<void> }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000));
    }, 10000);
    setElapsed(Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000));
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const isDelayed = elapsed > 15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-white rounded-[2.5rem] border-2 overflow-hidden flex flex-col transition-all duration-500 ${
        isDelayed ? 'border-red-100 shadow-red-50' : 'border-gray-50 shadow-sm hover:shadow-xl'
      }`}
    >
      <div className="p-8 flex-1">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Table {order.tableNumber}</h3>
              {isDelayed && <Badge className="bg-red-500 text-white font-black text-[10px] animate-pulse">DELAYED</Badge>}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order #{order.id.slice(-6)}</p>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1.5 font-black text-sm ${isDelayed ? 'text-red-500' : 'text-gray-400'}`}>
              <Clock size={16} />
              {elapsed}m
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
              <span className="w-8 h-8 bg-white rounded-xl flex items-center justify-center font-black text-gray-900 shadow-sm border border-gray-100">{item.quantity}x</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800 leading-tight">{item.name}</p>
                {/* Mock special notes if needed */}
                {idx === 0 && <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-1">Extra Spicy</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-gray-50/50 border-t border-gray-50">
        {order.status === 'pending' && (
          <Button 
            onClick={() => onUpdateStatus(order.id, 'preparing')}
            className="w-full py-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100"
          >
            Start Cooking
          </Button>
        )}
        {order.status === 'preparing' && (
          <Button 
            onClick={() => onUpdateStatus(order.id, 'completed')}
            className="w-full py-8 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-100"
          >
            Mark Ready
          </Button>
        )}
        {(order.status === 'served' || order.status === 'completed') && (
          <Button 
            onClick={() => onUpdateStatus(order.id, 'paid')}
            className="w-full py-8 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-lg shadow-xl shadow-gray-200"
          >
            Mark as Paid
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function FilterButton({ active, onClick, label, count, color = 'gray' }: { active: boolean, onClick: () => void, label: string, count: number, color?: string }) {
  const colors: any = {
    gray: active ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50',
    blue: active ? 'bg-blue-600 text-white' : 'bg-white text-blue-500 hover:bg-blue-50',
    orange: active ? 'bg-orange-500 text-white' : 'bg-white text-orange-500 hover:bg-orange-50',
    green: active ? 'bg-green-600 text-white' : 'bg-white text-green-600 hover:bg-green-50'
  };

  return (
    <button 
      onClick={onClick}
      className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-3 transition-all border border-gray-100 shadow-sm ${colors[color]}`}
    >
      {label}
      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${active ? 'bg-white/20' : 'bg-gray-50'}`}>
        {count}
      </span>
    </button>
  );
}
