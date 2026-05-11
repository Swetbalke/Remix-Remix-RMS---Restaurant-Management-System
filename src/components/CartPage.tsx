import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, Banknote, Smartphone, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const isRazorpayEnabled = (import.meta as any).env?.VITE_RAZORPAY_ENABLED === 'true';

export default function CartPage({ onCheckout }: { onCheckout: (orderId: string) => void }) {
  const { items, tableId, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'CASH'>('CASH');
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const totalAmount = subtotal + tax;

  useEffect(() => {
    if (user) {
      fetchRecentOrders();
    }
  }, [user]);

  const fetchRecentOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userId=${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setRecentOrders(data.slice(0, 3)); // Only show last 3
      }
    } catch (err) {
      console.error('Failed to fetch recent orders', err);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const dbItems = items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price
      }));

      // Create Order
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: dbItems, 
          tableId,
          userId: user?.id,
          total: totalAmount,
          paymentMethod 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');
      const order = data;
      
      // If simulated payment is UPI or Card, log that payment is marked PAID logically 
      if (paymentMethod === 'UPI' || paymentMethod === 'CARD') {
        const payRes = await fetch(`/api/billing/${order.id}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, method: paymentMethod, transactionRef: 'SIMULATED_TXN' })
        });
        if (!payRes.ok) {
          const payData = await payRes.json();
          throw new Error(payData.error || 'Payment failed');
        }
      }

      clearCart();
      onCheckout(order.id);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && recentOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
          <ShoppingBag size={48} />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900">Your cart is empty</h2>
          <p className="text-gray-500 font-bold mt-2">Looks like you haven't added anything yet.</p>
        </div>
        <Button onClick={() => window.location.hash = '#menu'} className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-6 rounded-2xl">
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          {items.length > 0 ? (
            <>
              <div className="flex justify-between items-end gap-4">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Shopping Cart</h2>
                <button onClick={clearCart} className="text-sm font-black whitespace-nowrap text-red-500 hover:underline">Clear All</button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.menuItemId}
                      className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80`} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 w-full">
                        <h3 className="text-base sm:text-lg font-black text-gray-900 line-clamp-2">{item.name}</h3>
                        <p className="text-orange-500 font-black mt-1">₹{item.price}</p>
                      </div>
                      <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0">
                        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl">
                          <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="p-1 hover:text-orange-500 transition-all"><Minus size={18} /></button>
                          <span className="w-6 text-center font-black">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="p-1 hover:text-orange-500 transition-all"><Plus size={18} /></button>
                        </div>
                        <button onClick={() => removeItem(item.menuItemId)} className="p-2 text-gray-300 hover:text-red-500 transition-all sm:ml-4">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mt-8">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <CreditCard className="text-blue-500" /> Select Payment Method
                </h3>
                
                {isRazorpayEnabled ? (
                  <div className="p-6 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col items-center justify-center text-orange-600 gap-3">
                    <CreditCard size={32} />
                    <p className="font-black text-center">Secure Online Payment via Razorpay</p>
                    <p className="text-xs font-bold text-orange-400">You will be redirected to the secure payment gateway after checkout.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button 
                        onClick={() => setPaymentMethod('UPI')}
                        className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${paymentMethod === 'UPI' ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-lg shadow-orange-100' : 'border-gray-100 text-gray-500 hover:border-gray-200 bg-white hover:bg-gray-50'}`}
                      >
                        <Smartphone size={28} />
                        <span className="font-black text-sm uppercase tracking-widest">UPI Details</span>
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('CARD')}
                        className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${paymentMethod === 'CARD' ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-lg shadow-orange-100' : 'border-gray-100 text-gray-500 hover:border-gray-200 bg-white hover:bg-gray-50'}`}
                      >
                        <CreditCard size={28} />
                        <span className="font-black text-sm uppercase tracking-widest">Card</span>
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('CASH')}
                        className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${paymentMethod === 'CASH' ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-lg shadow-orange-100' : 'border-gray-100 text-gray-500 hover:border-gray-200 bg-white hover:bg-gray-50'}`}
                      >
                        <Banknote size={28} />
                        <span className="font-black text-sm uppercase tracking-widest">Pay at Counter</span>
                      </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-[3rem] border border-gray-100 text-center space-y-4">
               <ShoppingBag size={48} className="mx-auto text-gray-200" />
               <h3 className="text-2xl font-black text-gray-900">Your cart is empty</h3>
               <Button onClick={() => window.location.hash = '#menu'} variant="outline" className="rounded-xl font-black px-8">Return to Menu</Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {items.length > 0 && (
            <Card className="p-8 rounded-[2.5rem] border-gray-100 shadow-xl sticky top-32 mb-8">
              <h3 className="text-2xl font-black text-gray-900 mb-8">Order Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>GST (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-2xl font-black text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full py-8 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-lg shadow-2xl shadow-gray-200 group flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : (
                    <>
                      {paymentMethod === 'CASH' ? 'Place Order' : 'Pay & Order'} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Recent Orders Sidebar/Bottom Section */}
          {recentOrders.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <Clock size={20} className="text-orange-500" />
                <h3 className="text-xl font-black text-gray-900">Recent Orders</h3>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <motion.div 
                    key={order.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onCheckout(order.id)}
                    className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm cursor-pointer hover:border-orange-100 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-black text-gray-900">Order #{order.id.slice(-6)}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <Badge variant="outline" className={`font-black uppercase text-[10px] tracking-widest ${order.status === 'completed' ? 'border-green-100 text-green-600' : 'border-orange-100 text-orange-600'}`}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-500">{order.items.length} items</span>
                      <span className="font-black text-gray-900">₹{order.totalAmount}</span>
                    </div>
                  </motion.div>
                ))}
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.hash = '#history'} 
                  className="w-full text-gray-400 font-black text-xs hover:text-orange-500"
                >
                  View Full History
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
