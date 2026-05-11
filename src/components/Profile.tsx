import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Clock, ShoppingBag, CreditCard, LogOut, Edit2, Check, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Profile() {
  const { user, setUser, logout } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserOrders();
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userId=${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data.slice(0, 5) : []);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`/api/staff/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, phone: editPhone })
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...user!, ...data });
        toast.success('Profile updated!');
        setEditing(false);
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.hash = '#home';
    toast.success('Logged out successfully');
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
          <User size={48} />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900">Please log in</h2>
          <p className="text-gray-500 font-bold mt-2">You need to be logged in to view your profile.</p>
        </div>
        <button
          onClick={() => window.location.hash = '#home'}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">My Profile</h2>
        <p className="text-gray-500 font-bold mt-2">Manage your account details</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
              <User size={40} className="text-orange-500" />
            </div>
            <div className="text-white">
              <h3 className="text-2xl font-black">{user.name || 'Guest User'}</h3>
              <Badge className="mt-2 bg-white/20 text-white border-none font-black uppercase tracking-widest text-xs">
                {user.role}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <ShoppingBag size={28} className="text-orange-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-gray-900">{totalOrders}</p>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Orders</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <CreditCard size={28} className="text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-gray-900">₹{totalSpent.toFixed(0)}</p>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Spent</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <Clock size={28} className="text-blue-500 mx-auto mb-2" />
              <p className="text-xl font-black text-gray-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Member Since</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-black text-gray-900">Account Details</h4>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 text-orange-500 font-black text-sm hover:text-orange-600"
                >
                  <Edit2 size={14} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-green-600"
                  >
                    <Check size={14} /> Save
                  </button>
                  <button
                    onClick={() => { setEditing(false); setEditName(user.name || ''); setEditPhone(user.phone || ''); }}
                    className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-black text-sm hover:bg-gray-200"
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <User size={20} className="text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Name</p>
                  {editing ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full font-black text-gray-900 bg-transparent outline-none border-b-2 border-orange-500 py-1"
                    />
                  ) : (
                    <p className="font-black text-gray-900">{user.name || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <Mail size={20} className="text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Email</p>
                  <p className="font-black text-gray-900">{user.email || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <Phone size={20} className="text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone</p>
                  {editing ? (
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full font-black text-gray-900 bg-transparent outline-none border-b-2 border-orange-500 py-1"
                    />
                  ) : (
                    <p className="font-black text-gray-900">{user.phone || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8"
      >
        <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
          <ShoppingBag className="text-orange-500" /> Recent Orders
        </h4>
        {loading ? (
          <div className="text-center py-8 font-black text-gray-400 animate-pulse">LOADING...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="font-bold text-gray-400">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-black text-gray-900">#{order.id.slice(-6)}</p>
                  <p className="text-xs font-bold text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-orange-600">₹{order.totalAmount}</p>
                  <Badge variant="outline" className={`font-black text-[10px] uppercase ${
                    order.status === 'completed' ? 'border-green-200 text-green-600' : 'border-orange-200 text-orange-600'
                  }`}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <button
        onClick={handleLogout}
        className="w-full py-5 bg-red-50 text-red-500 rounded-2xl font-black hover:bg-red-100 transition-all flex items-center justify-center gap-3"
      >
        <LogOut size={20} /> Log Out
      </button>
    </div>
  );
}