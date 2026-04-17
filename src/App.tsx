import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChefHat,
  User as UserIcon,
  LogOut,
  ShoppingCart,
  Home as HomeIcon,
  UtensilsCrossed,
  LayoutDashboard,
  ClipboardList,
  Monitor
} from 'lucide-react';
import HomePage from './components/HomePage';
import CustomerMenu from './components/CustomerMenu';
import CartPage from './components/CartPage';
import OrderTracking from './components/OrderTracking';
import AdminDashboard from './components/AdminDashboard';
import KDS from './components/KDS';
import POS from './components/POS';
import EmployeeOrders from './components/EmployeeOrders';
import { socketService } from './services/socketService';
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';
import { Toaster } from './components/ui/sonner';

type View = 'home' | 'menu' | 'cart' | 'tracking' | 'admin' | 'kds' | 'pos' | 'employee-orders';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const { user, setUser, logout } = useAuthStore();
  const { items } = useCartStore();
  
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    socketService.connect();
    // Handle hash routing for simple navigation
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as View;
      if (['home', 'menu', 'cart', 'tracking', 'admin', 'kds', 'pos', 'employee-orders'].includes(hash)) {
        setView(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => {
      socketService.disconnect();
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  const handleAuth = async () => {
    try {
      if (loginMode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setShowLogin(false);
          if (data.user.role === 'ADMIN' || data.user.role === 'MANAGER') navigate('admin');
          else if (data.user.role === 'EMPLOYEE') navigate('employee-orders');
        } else {
          alert(data.error || 'Registration failed');
        }
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setShowLogin(false);
          if (data.user.role === 'ADMIN' || data.user.role === 'MANAGER') {
            setView('admin');
          } else if (data.user.role === 'EMPLOYEE') {
            setView('employee-orders' as any);
          }
        } else {
          alert(data.error || 'Login failed');
        }
      }
    } catch (err) {
      console.error('Auth error', err);
    }
  };

  const navigate = (newView: View) => {
    setView(newView);
    window.location.hash = newView;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Top Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <ChefHat size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter text-gray-900">RMS ENTERPRISE</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <nav className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <NavButton active={view === 'home'} onClick={() => navigate('home')} icon={<HomeIcon size={18} />} label="Home" />
            <NavButton active={view === 'menu'} onClick={() => navigate('menu')} icon={<UtensilsCrossed size={18} />} label="Menu" />
            
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <>
                <NavButton active={view === 'kds'} onClick={() => navigate('kds')} icon={<ClipboardList size={18} />} label="KDS" />
                <NavButton active={view === 'pos'} onClick={() => navigate('pos')} icon={<Monitor size={18} />} label="POS" />
                <NavButton active={view === 'admin'} onClick={() => navigate('admin')} icon={<LayoutDashboard size={18} />} label="Admin" />
              </>
            )}
            {user?.role === 'EMPLOYEE' && (
              <NavButton active={view === 'employee-orders'} onClick={() => navigate('employee-orders')} icon={<ClipboardList size={18} />} label="My Orders" />
            )}
          </nav>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('cart')}
              className="relative p-3 bg-white border border-gray-100 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
            >
              <ShoppingCart size={20} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {items.length}
                </span>
              )}
            </button>

            {!user ? (
              <button 
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-black hover:bg-black transition-all shadow-xl shadow-gray-200"
              >
                <UserIcon size={18} /> <span className="hidden sm:inline">Login</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-gray-900">{user.name || 'Customer'}</p>
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{user.role}</p>
                </div>
                <button onClick={logout} className="p-3 text-gray-400 hover:text-red-500 transition-all">
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl"
            >
              <h3 className="text-3xl font-black text-gray-900 mb-2">
                {loginMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-gray-500 font-bold mb-8">
                {loginMode === 'login' ? 'Enter your email to login.' : 'Sign up to place your order.'}
              </p>
              
              <div className="space-y-6">
                {loginMode === 'register' && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-lg font-black focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                )}
                
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Email</label>
                  <input 
                    type="email" 
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-lg font-black focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-lg font-black focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
                
                <button 
                  onClick={handleAuth}
                  className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all"
                >
                  {loginMode === 'login' ? 'Login' : 'Sign Up'}
                </button>
                
                <div className="flex justify-between items-center text-sm font-bold mt-4">
                  <button 
                    onClick={() => setLoginMode(loginMode === 'login' ? 'register' : 'login')}
                    className="text-orange-500 hover:text-orange-600 transition-all"
                  >
                    {loginMode === 'login' ? 'Create an account' : 'Already have an account?'}
                  </button>
                  <button 
                    onClick={() => setShowLogin(false)}
                    className="text-gray-400 hover:text-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto py-8 px-6">
        <AnimatePresence mode="wait">
          {view === 'home' && <HomePage onOrderNow={() => navigate('menu')} />}
          {view === 'menu' && <CustomerMenu />}
          {view === 'cart' && <CartPage onCheckout={(orderId) => { setActiveOrderId(orderId); navigate('tracking'); }} />}
          {view === 'tracking' && <OrderTracking orderId={activeOrderId || ''} />}
          {view === 'admin' && <AdminDashboard />}
          {view === 'kds' && <KDS />}
          {view === 'pos' && <POS />}
          {view === 'employee-orders' && <EmployeeOrders />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all ${
        active ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {icon} {label}
    </button>
  );
}
