import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  Sparkles,
  ArrowUpRight,
  Instagram,
  BarChart3,
  RefreshCw,
  Package,
  UserPlus,
  Trash2,
  Check,
  X,
  Send,
  Clock,
  UtensilsCrossed
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { aiService } from '../services/aiService';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type AdminTab = 'analytics' | 'orders' | 'menu' | 'inventory' | 'staff' | 'ai';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [analytics, setAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Menu Form State
  const [showDishForm, setShowDishForm] = useState(false);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [dishState, setDishState] = useState({ name: '', description: '', price: '', imageUrl: '', categoryId: '' });

  // AI Tools State
  const [captionItem, setCaptionItem] = useState('');
  const [captionDesc, setCaptionDesc] = useState('');
  const [generatedCaption, setGeneratedCaption] = useState('');

  useEffect(() => {
    fetchData();
    let interval: NodeJS.Timeout;
    if (activeTab === 'orders') {
      interval = setInterval(fetchData, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        setAnalytics(data?.error ? null : data);
      } else if (activeTab === 'orders') {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setAllOrders(Array.isArray(data) ? data : []);
      } else if (activeTab === 'inventory') {
        const res = await fetch('/api/inventory');
        const data = await res.json();
        setInventory(Array.isArray(data) ? data : []);
      } else if (activeTab === 'menu') {
        const [menuRes, categoriesRes] = await Promise.all([
          fetch('/api/menu'),
          fetch('/api/categories')
        ]);
        const mData = await menuRes.json();
        const cData = await categoriesRes.json();
        setMenuItems(Array.isArray(mData) ? mData : []);
        setCategories(Array.isArray(cData) ? cData : []);
      } else if (activeTab === 'staff') {
        const res = await fetch('/api/staff');
        const data = await res.json();
        setStaff(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAiInsights = async () => {
    if (!analytics) return;
    setAiLoading(true);
    try {
      const data = await aiService.getBusinessInsights(analytics);
      setInsights(data);
    } catch (err) {
      console.error('AI Insight Error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const generateCaption = async () => {
    if (!captionItem) return;
    setAiLoading(true);
    try {
      const caption = await aiService.generateInstagramCaption(captionItem, captionDesc);
      setGeneratedCaption(caption);
    } catch (err) {
      console.error('AI Caption Error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const updateInventory = async (id: string, updates: any) => {
    try {
      await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      fetchData();
    } catch (err) {
      console.error('Failed to update inventory', err);
    }
  };

  const addStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      email: formData.get('email'),
      name: formData.get('name'),
      role: formData.get('role')
    };
    try {
      await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error('Failed to add staff', err);
    }
  };

  const removeStaff = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Failed to remove staff', err);
    }
  };

  const handleDeleteDish = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dish?')) return;
    try {
      await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      fetchData();
      toast.success('Dish deleted successfully');
    } catch (err) {
      console.error('Failed to delete dish', err);
      toast.error('Failed to delete dish');
    }
  };

  const handleEditDish = (item: any) => {
    setEditingDishId(item.id);
    setDishState({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      imageUrl: item.imageUrl || '',
      categoryId: item.categoryId
    });
    setShowDishForm(true);
  };

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingDishId ? `/api/menu/${editingDishId}` : '/api/menu';
      const method = editingDishId ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dishState.name,
          description: dishState.description,
          price: parseFloat(dishState.price),
          imageUrl: dishState.imageUrl,
          categoryId: dishState.categoryId || undefined
        })
      });
      
      if (res.ok) {
        setShowDishForm(false);
        setEditingDishId(null);
        setDishState({ name: '', description: '', price: '', imageUrl: '', categoryId: '' });
        fetchData();
        toast.success(editingDishId ? 'Dish updated!' : 'Dish added!');
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to save dish');
      }
    } catch (err) {
      console.error('Failed to save dish', err);
      toast.error('Failed to save dish');
    }
  };

  return (
    <div className="space-y-10">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Management Console</h2>
          <div className="flex gap-4 mt-4">
            {(['analytics', 'orders', 'menu', 'inventory', 'staff', 'ai'] as AdminTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={fetchData}
          className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'analytics' && analytics && (
          <motion.div 
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Revenue" value={`₹${analytics?.revenue || 0}`} trend="+12.5%" icon={<DollarSign />} color="orange" />
              <StatCard 
                 title="Total Orders" 
                 value={analytics?.totalOrders?.toString() || '0'} 
                 trend="+8.2%" 
                 icon={<ShoppingBag />} 
                 color="blue" 
                 onClick={() => setActiveTab('orders')}
              />
              <StatCard title="Active Orders" value={analytics?.activeOrders?.toString() || '0'} trend="Live" icon={<TrendingUp />} color="green" />
              <StatCard title="Avg Order Value" value={`₹${((analytics?.revenue || 0) / (analytics?.totalOrders || 1)).toFixed(0)}`} trend="+5.1%" icon={<Users />} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                    <BarChart3 className="text-orange-500" /> Revenue Trends
                  </h3>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.salesByDay}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 900 }} />
                      <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-1 bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Sparkles className="text-orange-400" />
                      <h3 className="text-xl font-black tracking-tight">AI Insights</h3>
                    </div>
                    <button 
                      onClick={generateAiInsights}
                      disabled={aiLoading}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
                    >
                      <RefreshCw size={16} className={aiLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {insights.length === 0 ? (
                      <p className="text-gray-400 text-sm font-bold leading-relaxed">Click refresh to analyze performance.</p>
                    ) : (
                      insights.map((item, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                          <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-1">Insight #{idx + 1}</p>
                          <p className="font-bold text-sm mb-2">{item.insight}</p>
                          <div className="flex items-center gap-2 text-[10px] font-black text-green-400 uppercase">
                            <ArrowUpRight size={12} /> {item.impact}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <ShoppingBag className="text-orange-500" /> Top Selling Items
                </h3>
                <div className="space-y-6">
                  {analytics.topItems?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center font-black text-gray-400 text-xs">{idx + 1}</span>
                        <p className="font-bold text-gray-700">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500" style={{ width: `${(item.count / (analytics.topItems[0]?.count || 1)) * 100}%` }} />
                        </div>
                        <span className="font-black text-gray-900">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <Clock className="text-blue-500" /> Peak Time Heatmap
                </h3>
                <div className="grid grid-cols-12 gap-2 h-48">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const intensity = Math.random(); // Mock intensity
                    return (
                      <div 
                        key={i} 
                        className="flex flex-col items-center gap-2"
                        title={`${i}:00`}
                      >
                        <div 
                          className="w-full flex-1 rounded-lg transition-all"
                          style={{ 
                            backgroundColor: `rgba(249, 115, 22, ${intensity})`,
                            height: `${intensity * 100}%`
                          }} 
                        />
                        <span className="text-[8px] font-black text-gray-400">{i}h</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-xl font-black text-gray-900">Order Management</h3>
                <p className="text-sm font-bold text-gray-500 mt-1">View and handle customer payments & overall orders.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-gray-400 font-black text-xs uppercase tracking-widest">
                    <tr>
                      <th className="p-6">Order ID</th>
                      <th className="p-6">Total Amount</th>
                      <th className="p-6">Status</th>
                      <th className="p-6">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {allOrders.length === 0 ? (
                       <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-bold">No orders found.</td></tr>
                     ) : (
                       allOrders.map((o: any) => (
                         <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                           <td className="p-6">
                             <p className="font-bold text-gray-900">#{o.id.slice(-6)}</p>
                             <p className="text-xs text-gray-400 font-bold">{new Date(o.createdAt).toLocaleString()}</p>
                           </td>
                           <td className="p-6 font-black text-orange-600">₹{o.totalAmount}</td>
                           <td className="p-6">
                             <Badge variant="outline" className={`font-black uppercase tracking-widest ${o.status === 'completed' ? 'border-green-200 text-green-600 bg-green-50' : 'border-blue-200 text-blue-600 bg-blue-50'}`}>
                               {o.status}
                             </Badge>
                           </td>
                           <td className="p-6">
                             <Badge variant="outline" className={`font-black uppercase tracking-widest ${o.paymentStatus === 'paid' ? 'border-green-200 text-green-600 bg-green-50' : 'border-red-200 text-red-600 bg-red-50'}`}>
                               {o.paymentStatus}
                             </Badge>
                           </td>
                         </tr>
                       ))
                     )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'menu' && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <UtensilsCrossed className="text-orange-500" /> Menu Builder
              </h3>
              <button 
                onClick={() => {
                  setEditingDishId(null);
                  setDishState({ name: '', description: '', price: '', imageUrl: '', categoryId: '' });
                  setShowDishForm(true);
                }}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-black hover:bg-black transition-all flex items-center gap-2"
              >
                + Add Dish
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map(item => (
                <div key={item.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
                  <div className="h-48 bg-gray-100 relative">
                    <img src={item.imageUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80`} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase">
                      ₹{item.price}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-lg text-gray-900">{item.name}</h4>
                      <span className={`w-3 h-3 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{item.category?.name}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{item.description || 'No description provided.'}</p>
                    <div className="mt-6 flex gap-2">
                      <button onClick={() => handleEditDish(item)} className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-black hover:bg-gray-100 transition-all">Edit</button>
                      <button onClick={() => handleDeleteDish(item.id)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-black hover:bg-red-100 transition-all">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'inventory' && (
          <motion.div 
            key="inventory"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-x-auto"
          >
            <table className="w-full text-left whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Item Name</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Stock Level</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inventory.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-6 font-black text-gray-900">{item.name}</td>
                    <td className="px-8 py-6"><span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-500">{item.category}</span></td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <button onClick={() => updateInventory(item.id, { stock: item.stock - 1 })} className="p-1 hover:text-red-500"><Trash2 size={14} /></button>
                        <span className={`font-black ${item.stock < 10 ? 'text-red-500' : 'text-gray-900'}`}>{item.stock}</span>
                        <button onClick={() => updateInventory(item.id, { stock: item.stock + 1 })} className="p-1 hover:text-green-500"><UserPlus size={14} /></button>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => updateInventory(item.id, { available: !item.available })}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.available ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                      >
                        {item.available ? 'Available' : 'Sold Out'}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <button className="text-orange-500 font-black text-xs hover:underline">Edit Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'staff' && (
          <motion.div 
            key="staff"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <UserPlus className="text-orange-500" /> Add New Staff
              </h3>
              <form onSubmit={addStaff} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Full Name</label>
                  <input name="name" required className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Email Address</label>
                  <input name="email" type="email" required className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Role</label>
                  <select name="role" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500">
                    <option value="EMPLOYEE">Kitchen Staff</option>
                    <option value="ADMIN">Manager/Admin</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-4 bg-orange-500 text-white rounded-xl font-black shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all">
                  Register Staff
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Staff Member</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Role</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Contact</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {staff.map(member => (
                    <tr key={member.id}>
                      <td className="px-8 py-6 font-black text-gray-900">{member.name || 'Unnamed'}</td>
                      <td className="px-8 py-6"><span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase">{member.role}</span></td>
                      <td className="px-8 py-6 text-sm font-bold text-gray-500">{member.email}</td>
                      <td className="px-8 py-6">
                        <button onClick={() => removeStaff(member.id)} className="text-red-500 hover:text-red-700 transition-all"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'ai' && (
          <motion.div 
            key="ai"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Instagram className="text-pink-600" />
                <h3 className="text-xl font-black text-gray-900">Instagram Caption Generator</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Dish Name</label>
                  <input 
                    value={captionItem}
                    onChange={(e) => setCaptionItem(e.target.value)}
                    placeholder="e.g. Truffle Mushroom Risotto"
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-pink-500" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Key Highlights</label>
                  <textarea 
                    value={captionDesc}
                    onChange={(e) => setCaptionDesc(e.target.value)}
                    placeholder="e.g. creamy, earthy, fresh herbs"
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-pink-500 h-24 resize-none" 
                  />
                </div>
                <button 
                  onClick={generateCaption}
                  disabled={aiLoading || !captionItem}
                  className="w-full py-4 bg-gradient-to-r from-pink-600 to-orange-500 text-white rounded-xl font-black shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles size={18} className={aiLoading ? 'animate-spin' : ''} />
                  {aiLoading ? 'Generating...' : 'Generate Viral Caption'}
                </button>
              </div>
            </div>

            <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black flex items-center gap-3">
                  <Send className="text-blue-400" /> Generated Content
                </h3>
                {generatedCaption && (
                  <button 
                    onClick={() => navigator.clipboard.writeText(generatedCaption)}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300"
                  >
                    Copy to Clipboard
                  </button>
                )}
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 font-medium text-gray-300 leading-relaxed italic">
                {generatedCaption || "Your AI-generated caption will appear here..."}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dish Form Modal */}
      <AnimatePresence>
        {showDishForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDishForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-3xl font-black text-gray-900 mb-8">{editingDishId ? 'Edit Dish' : 'Add New Dish'}</h3>
              <form onSubmit={handleAddDish} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Dish Name</label>
                  <input required value={dishState.name} onChange={(e) => setDishState({...dishState, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Price (₹)</label>
                  <input type="number" required value={dishState.price} onChange={(e) => setDishState({...dishState, price: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Description</label>
                  <textarea value={dishState.description} onChange={(e) => setDishState({...dishState, description: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 h-24 resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Category</label>
                  <select required value={dishState.categoryId} onChange={(e) => setDishState({...dishState, categoryId: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500">
                    <option value="">Select Category...</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block flex justify-between">
                    Image URL
                    <button 
                      type="button" 
                      onClick={() => {
                        if (!dishState.name) return;
                        const keywords = encodeURIComponent(dishState.name.trim().replace(/\s+/g, ','));
                        const lockId = Math.floor(Math.random() * 10000);
                        setDishState({...dishState, imageUrl: `https://loremflickr.com/600/400/${keywords}?lock=${lockId}`});
                      }}
                      className="text-orange-500 hover:text-orange-600"
                    >
                      🪄 Auto-Generate
                    </button>
                  </label>
                  <input value={dishState.imageUrl} onChange={(e) => setDishState({...dishState, imageUrl: e.target.value})} placeholder="https://..." className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500" />
                </div>
                <button type="submit" className="w-full py-4 bg-orange-500 text-white rounded-xl font-black shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all">Save Dish</button>
                <button type="button" onClick={() => setShowDishForm(false)} className="w-full py-4 bg-gray-50 text-gray-500 rounded-xl font-black hover:bg-gray-100 transition-all">Cancel</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, trend, icon, color, onClick }: { title: string, value: string, trend: string, icon: React.ReactNode, color: string, onClick?: () => void }) {
  const colors: any = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group ${onClick ? 'cursor-pointer hover:border-orange-200' : ''}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]} transition-transform group-hover:scale-110`}>
          {React.cloneElement(icon as React.ReactElement, { size: 28 } as any)}
        </div>
        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
          trend.includes('+') ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
        }`}>
          {trend}
        </span>
      </div>
      <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-4xl font-black text-gray-900 tracking-tight">{value}</h4>
    </div>
  );
}
