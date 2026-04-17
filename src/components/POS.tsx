import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Receipt, 
  User, 
  Table as TableIcon,
  ChevronRight,
  Printer,
  ShoppingBag,
  ListOrdered,
  Banknote,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MenuItem } from '../types';
import { toast } from 'sonner';

export default function POS() {
  const [activeTab, setActiveTab] = useState<'new' | 'orders'>('new');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [table, setTable] = useState('1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMenu();
    fetchOrders();
    // In a real app we'd poll or listen via socket for new orders here
  }, [activeTab]);

  const fetchMenu = async () => {
    const res = await fetch('/api/menu');
    setMenu(await res.json());
  };

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    if (res.ok) setOrders(await res.json());
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) {
        return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, q: number) => {
    setCart(prev => prev.map(i => i.menuItemId === id ? { ...i, quantity: Math.max(0, q) } : i).filter(i => i.quantity > 0));
  };

  const handleMarkPaid = async (orderId: string, amount: number) => {
    try {
      await fetch(`/api/billing/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method: 'CASH', transactionRef: 'POS_CASH' })
      });
      toast.success('Order marked as Paid!');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to mark order as paid');
    }
  };

  const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const dbItems = cart.map((i: any) => ({
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        price: i.price
      }));
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: table, items: dbItems, total: total * 1.05, paymentMethod: 'CASH' })
      });
      if (res.ok) {
        toast.success('Order placed successfully!');
        setCart([]);
        setTable('1');
        fetchOrders();
      }
    } catch (err) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const filteredMenu = menu.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden">
      {/* Top Navigation */}
      <div className="flex gap-4 mb-2">
        <Button 
          onClick={() => setActiveTab('new')} 
          variant={activeTab === 'new' ? 'default' : 'outline'}
          className={`rounded-2xl rounded-tr-sm font-black px-8 ${activeTab === 'new' ? 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200' : ''}`}
        >
          <Plus className="mr-2" /> New Order
        </Button>
        <Button 
          onClick={() => setActiveTab('orders')} 
          variant={activeTab === 'orders' ? 'default' : 'outline'}
          className={`rounded-2xl rounded-tl-sm font-black px-8 ${activeTab === 'orders' ? 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200' : ''}`}
        >
          <ListOrdered className="mr-2" /> Active Orders
        </Button>
      </div>

      {activeTab === 'new' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
          {/* Left: Menu Selection */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input 
                  placeholder="Search items (e.g. Pizza)..." 
                  className="pl-12 py-7 rounded-2xl border-gray-200 text-lg font-bold"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {['1', '2', '3', '4', '5', '6'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTable(t)}
                    className={`w-14 h-14 rounded-2xl font-black transition-all border ${
                      table === t ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    T{t}
                  </button>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMenu.map(item => (
                  <Card 
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="p-4 rounded-3xl border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 cursor-pointer transition-all group relative overflow-hidden"
                  >
                    {!item.available && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center font-black text-red-500 uppercase text-xs">Sold Out</div>}
                    <div className="h-32 rounded-2xl overflow-hidden mb-3">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    </div>
                    <h4 className="font-black text-gray-900 line-clamp-1">{item.name}</h4>
                    <p className="text-orange-500 font-black text-sm">₹{item.price}</p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-orange-500 text-white p-1.5 rounded-lg shadow-lg">
                        <Plus size={16} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Cart & Billing */}
          <Card className="lg:col-span-4 rounded-[2.5rem] border-gray-100 shadow-2xl flex flex-col overflow-hidden bg-white">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <Receipt size={20} />
                </div>
                <h3 className="text-xl font-black text-gray-900">Current Order</h3>
              </div>
              <Badge variant="secondary" className="bg-white text-gray-500 font-black px-3 py-1">Table {table}</Badge>
            </div>

            <ScrollArea className="flex-1 p-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 py-20">
                  <ShoppingBag size={48} className="mb-4 opacity-20" />
                  <p className="font-black uppercase tracking-widest text-xs">Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.menuItemId} className="flex items-center justify-between group">
                      <div className="flex-1">
                        <p className="font-black text-gray-900">{item.name}</p>
                        <p className="text-xs font-bold text-orange-500">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-xl">
                        <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-red-500"><Minus size={14} /></button>
                        <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-orange-500"><Plus size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="p-8 bg-gray-50/50 border-t border-gray-50 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-500 font-bold text-sm">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-bold text-sm">
                  <span>Tax (GST 5%)</span>
                  <span>₹{(total * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-gray-900 pt-2">
                  <span>Total</span>
                  <span className="text-orange-600">₹{(total * 1.05).toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="py-7 rounded-2xl font-black border-gray-200 text-gray-600 hover:bg-white flex items-center gap-2">
                  <Printer size={18} /> Print KOT
                </Button>
                <Button 
                  onClick={handlePlaceOrder}
                  disabled={loading || cart.length === 0}
                  className="py-7 rounded-2xl font-black bg-gray-900 hover:bg-black text-white shadow-xl shadow-gray-200 flex items-center gap-2 group"
                >
                  Place Order <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Manage Orders</h2>
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map(order => (
                <Card key={order.id} className="p-6 rounded-3xl border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant="outline" className="text-gray-500 font-black tracking-widest text-[10px] uppercase">
                        #{order.id.slice(-6)}
                      </Badge>
                      <Badge className={`font-black uppercase text-[10px] ${
                        order.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                       <span className="font-bold text-gray-600 text-sm">{order.items?.length || 0} Items</span>
                       <span className="font-black text-gray-900 text-xl">₹{order.totalAmount}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl mb-6">
                      <h4 className="text-xs font-black uppercase text-gray-400 mb-2">Order Items</h4>
                      <div className="space-y-1">
                        {order.items?.slice(0, 3).map((oi: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm font-bold text-gray-600">
                             <span>{oi.quantity}x {oi.name}</span>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <p className="text-xs text-gray-400 font-black">+ {order.items.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {order.paymentStatus !== 'paid' ? (
                    <Button 
                      onClick={() => handleMarkPaid(order.id, order.totalAmount)}
                      className="w-full py-6 rounded-xl font-black bg-orange-50 text-orange-600 hover:bg-orange-100 text-sm flex items-center justify-center gap-2 border-none shadow-none"
                    >
                      <Banknote size={16} /> Mark as Paid (Cash)
                    </Button>
                  ) : (
                    <Button 
                      disabled
                      className="w-full py-6 rounded-xl font-black bg-gray-50 text-green-600 text-sm flex items-center justify-center gap-2 border-none shadow-none opacity-100"
                    >
                      <CheckCircle2 size={16} /> Paid in Full
                    </Button>
                  )}
                </Card>
              ))}
              {orders.length === 0 && (
                <div className="col-span-full py-20 text-center font-black text-gray-400">
                  No active orders found.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
