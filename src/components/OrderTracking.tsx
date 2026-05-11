import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, ChefHat, Utensils, PackageCheck, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { socketService } from '../services/socketService';
import { toast } from 'sonner';

export default function OrderTracking({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrder();
    
    const handleOrderUpdate = (updatedOrder: any) => {
      if (updatedOrder.id === orderId) {
        setOrder(updatedOrder);
        toast.info(`Order Status: ${updatedOrder.status.toUpperCase()}`);
      }
    };

    socketService.on('order-updated', handleOrderUpdate);
    return () => {
      socketService.off('order-updated', handleOrderUpdate);
    };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) setOrder(await res.json());
    } catch (err) {
      console.error('Failed to fetch order', err);
    }
  };

  if (!order) return <div className="py-32 text-center font-black text-gray-400 animate-pulse">LOCATING YOUR ORDER...</div>;

  const steps = [
    { id: 'pending', label: 'Order Placed', icon: <CheckCircle2 />, color: 'text-blue-500' },
    { id: 'preparing', label: 'In Kitchen', icon: <ChefHat />, color: 'text-orange-500' },
    { id: 'completed', label: 'Served', icon: <Utensils />, color: 'text-green-500' },
    { id: 'paid', label: 'Payment complete', icon: <PackageCheck />, color: 'text-gray-900' },
  ];

  const currentStepIdx = Math.max(
    steps.findIndex(s => s.id === order.status || (s.id === 'preparing' && order.status === 'confirmed')),
    (order.paymentStatus === 'paid' && order.status === 'completed') || order.status === 'paid' ? 3 : -1
  );

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-12">
      <div className="text-center">
        <Badge variant="outline" className="mb-4 border-orange-200 text-orange-600 font-black uppercase tracking-widest px-4 py-1">
          Order ID: #{orderId.slice(-6)}
        </Badge>
        <h2 className="text-5xl font-black text-gray-900 tracking-tight">Track Your Feast</h2>
        {order.status === 'pending' || order.status === 'preparing' || order.status === 'confirmed' ? (
          <p className="text-orange-500 font-black mt-2 text-xl animate-pulse">Wait time: ~1 min. Kitchen is confirming!</p>
        ) : (
          <p className="text-gray-500 font-bold mt-2">We're working hard to get your food ready!</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Card className="p-10 rounded-[3rem] border-gray-100 shadow-2xl relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 p-8">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 animate-bounce">
              <Clock size={32} />
            </div>
          </div>

          <div className="space-y-10 relative">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              
              return (
                <div key={step.id} className="flex gap-8 relative">
                  {idx !== steps.length - 1 && (
                    <div className={`absolute left-6 top-12 w-0.5 h-12 ${isCompleted ? 'bg-orange-500' : 'bg-gray-100'}`} />
                  )}
                  
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    isCompleted ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-50 text-gray-300'
                  } ${isCurrent ? 'ring-4 ring-orange-100 scale-110' : ''}`}>
                    {React.cloneElement(step.icon as React.ReactElement, { size: 24 } as any)}
                  </div>
                  
                  <div className="flex-1 pt-2">
                    <h3 className={`text-xl font-black ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                      {step.label}
                    </h3>
                    <p className={`text-sm font-bold ${isCompleted ? 'text-gray-500' : 'text-gray-200'}`}>
                      {isCurrent ? 'Current Status' : isCompleted ? 'Completed' : 'Upcoming'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="text-orange-500" /> Dining Details
            </h3>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Serving at</p>
               <p className="text-xl font-black text-gray-900">{order.tableNumber}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6">Order Summary</h3>
            <div className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-black text-gray-400">{item.quantity}x</span>
                    <span className="font-bold text-gray-700">{item.name || item.menuItem?.name || 'Item'}</span>
                  </div>
                  <span className="font-black text-gray-900">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-gray-50 pt-4 mt-4 flex justify-between items-center">
                <span className="font-black text-gray-900 text-lg">Total Amount</span>
                <span className="font-black text-orange-600 text-2xl">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
