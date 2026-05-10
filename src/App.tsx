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
  Monitor,
  History,
  AlertCircle,
  Loader2,
  MapPin,
  Mail,
  Shield,
  UserCog
} from 'lucide-react';
import HomePage from './components/HomePage';
import CustomerMenu from './components/CustomerMenu';
import FoodZoneMenu from './components/FoodZoneMenu';
import CartPage from './components/CartPage';
import OrderTracking from './components/OrderTracking';
import AdminDashboard from './components/AdminDashboard';
import KDS from './components/KDS';
import POS from './components/POS';
import EmployeeOrders from './components/EmployeeOrders';
import OrderHistory from './components/OrderHistory';
import ErrorBoundary from './ErrorBoundary';
import { socketService } from './services/socketService';
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from './firebase';

type View = 'home' | 'menu' | 'cart' | 'tracking' | 'admin' | 'kds' | 'pos' | 'employee-orders' | 'history' | 'profile';

type ViewName = 'home' | 'menu' | 'cart' | 'history' | 'profile' | 'kds' | 'pos' | 'admin' | 'employee-orders';

const NAV_ITEMS: { id: ViewName; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <HomeIcon size={18} /> },
  { id: 'menu', label: 'Menu', icon: <UtensilsCrossed size={18} /> },
  { id: 'cart', label: 'My Cart', icon: <ShoppingCart size={18} /> },
  { id: 'history', label: 'History', icon: <History size={18} /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon size={18} /> },
];

const ADMIN_NAV_ITEMS: { id: ViewName; label: string; icon: React.ReactNode }[] = [
  { id: 'kds', label: 'KDS', icon: <ClipboardList size={18} /> },
  { id: 'pos', label: 'POS', icon: <Monitor size={18} /> },
  { id: 'admin', label: 'Admin', icon: <LayoutDashboard size={18} /> },
];

const VALIDATE_EMAIL = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const VALIDATE_PASSWORD = (password: string): string => {
  if (password.length < 6) return 'Password must be at least 6 characters';
  return '';
};

export default function App() {
  const [view, setView] = useState<View>('home');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const { user, setUser, logout } = useAuthStore();
  const { items, setTableId } = useCartStore();

  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    socketService.connect();

    const params = new URLSearchParams(window.location.search);
    const tableIdParam = params.get('table');
    if (tableIdParam) {
      setTableId(tableIdParam);
      navigate('menu');
    }

    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as View;
      if (['home', 'menu', 'cart', 'tracking', 'admin', 'kds', 'pos', 'employee-orders', 'history', 'profile'].includes(hash)) {
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

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string; name?: string } = {};

    if (loginMode === 'register' && (!name.trim() || name.trim().length < 2)) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!VALIDATE_EMAIL(email)) {
      errors.email = 'Please enter a valid email address';
    }

    const passwordError = VALIDATE_PASSWORD(password);
    if (!password) {
      errors.password = 'Password is required';
    } else if (passwordError) {
      errors.password = passwordError;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const authenticateWithBackend = async (firebaseUser: any, nameStr: string) => {
    try {
      const res = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName || nameStr || 'User',
          uid: firebaseUser.uid
        })
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        const text = await res.text();
        throw new Error("Server API is not running correctly. Ensure your backend is deployed (e.g. on Render as a Web Service). Server said: " + text.substring(0, 50));
      }

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setShowLogin(false);
        if (data.user.role === 'ADMIN' || data.user.role === 'MANAGER') navigate('admin');
        else if (data.user.role === 'EMPLOYEE') navigate('pos');
        else navigate('menu');
      } else {
        toast.error(data.error || 'Authentication failed on server');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Authentication failed');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsAuthLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      await authenticateWithBackend(result.user, result.user.displayName || '');
    } catch (err: any) {
      console.error('Google Auth error', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(err.message || 'Google sign in failed');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setIsAuthLoading(true);
    try {
      const endpoint = loginMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.accessToken);
      setUser(data.user);
      setShowLogin(false);
      setEmail('');
      setPassword('');
      setName('');
      setFormErrors({});

      if (data.user.role === 'ADMIN' || data.user.role === 'MANAGER') navigate('admin');
      else if (data.user.role === 'EMPLOYEE') navigate('pos');
      else navigate('menu');

    } catch (err: any) {
      console.error('Auth error', err);
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const navigate = (newView: View) => {
    setView(newView);
    window.location.hash = newView;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />

        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate('home')}>
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <ChefHat size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter text-gray-900 hidden lg:block">RMS ENTERPRISE</span>
          </div>

          <div className="flex flex-1 justify-end items-center gap-2 md:gap-4 overflow-hidden">
            <nav className="flex overflow-x-auto items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100 no-scrollbar w-full md:w-auto">
              <NavButton active={view === 'home'} onClick={() => navigate('home')} icon={<HomeIcon size={18} />} label="Home" />
              <NavButton active={view === 'menu'} onClick={() => navigate('menu')} icon={<UtensilsCrossed size={18} />} label="Menu" />

              {user && (
                <NavButton active={view === 'history'} onClick={() => navigate('history')} icon={<History size={18} />} label="History" />
              )}

              {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'EMPLOYEE') && (
                <>
                  <NavButton active={view === 'kds'} onClick={() => navigate('kds')} icon={<ClipboardList size={18} />} label="KDS" />
                  <NavButton active={view === 'pos'} onClick={() => navigate('pos')} icon={<Monitor size={18} />} label="POS" />
                </>
              )}
              {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                <NavButton active={view === 'admin'} onClick={() => navigate('admin')} icon={<LayoutDashboard size={18} />} label="Admin" />
              )}
              {user?.role === 'EMPLOYEE' && (
                <NavButton active={view === 'employee-orders'} onClick={() => navigate('employee-orders')} icon={<ClipboardList size={18} />} label="My Jobs" />
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

        <AnimatePresence>
          {showLogin && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setShowLogin(false); setFormErrors({}); }}
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
                        onChange={(e) => { setName(e.target.value); setFormErrors(prev => ({ ...prev, name: undefined })); }}
                        className={`w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-lg font-black focus:ring-2 transition-all ${
                          formErrors.name ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-orange-500'
                        }`}
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1">
                          <AlertCircle size={12} /> {formErrors.name}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Email</label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFormErrors(prev => ({ ...prev, email: undefined })); }}
                      className={`w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-lg font-black focus:ring-2 transition-all ${
                        formErrors.email ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-orange-500'
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFormErrors(prev => ({ ...prev, password: undefined })); }}
                      className={`w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-lg font-black focus:ring-2 transition-all ${
                        formErrors.password ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-orange-500'
                      }`}
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.password}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleAuth}
                    disabled={isAuthLoading}
                    className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAuthLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Please wait...
                      </>
                    ) : (
                      loginMode === 'login' ? 'Login' : 'Sign Up'
                    )}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500 font-bold tracking-widest">Or continue with</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isAuthLoading}
                    className="w-full py-5 bg-white border border-gray-200 text-gray-900 rounded-2xl font-black shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>

                  <div className="flex justify-between items-center text-sm font-bold mt-4">
                    <button
                      onClick={() => { setLoginMode(loginMode === 'login' ? 'register' : 'login'); setFormErrors({}); }}
                      className="text-orange-500 hover:text-orange-600 transition-all"
                    >
                      {loginMode === 'login' ? 'Create an account' : 'Already have an account?'}
                    </button>
                    <button
                      onClick={() => { setShowLogin(false); setFormErrors({}); }}
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

        <main className={`max-w-7xl mx-auto py-8 px-6 ${isMobile ? 'pb-24' : ''}`}>
          {/* Admin Mobile Tabs */}
          {isMobile && (user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'EMPLOYEE') && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {ADMIN_NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id as View)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all shrink-0 whitespace-nowrap ${
                    view === item.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {view === 'home' && <HomePage onOrderNow={() => navigate('menu')} />}
            {view === 'menu' && <FoodZoneMenu />}
            {view === 'cart' && <CartPage onCheckout={(orderId) => { setActiveOrderId(orderId); navigate('tracking'); }} />}
            {view === 'tracking' && <OrderTracking orderId={activeOrderId || ''} />}
            {view === 'history' && <OrderHistory onSelectOrder={(id) => { setActiveOrderId(id); navigate('tracking'); }} />}
            {view === 'profile' && (
              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-black">
                      {user?.name?.charAt(0) || 'G'}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900">{user?.name || 'Guest User'}</h2>
                      <p className="text-sm text-gray-500">{user?.email || 'guest@example.com'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <UserCog size={20} className="text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-500 font-bold">User ID</p>
                        <p className="text-sm font-black text-gray-900">{user?.uid || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Shield size={20} className="text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-500 font-bold">Role</p>
                        <p className="text-sm font-black text-gray-900">{user?.role || 'CUSTOMER'}</p>
                      </div>
                    </div>
                  </div>

                  {user ? (
                    <button
                      onClick={() => { logout(); navigate('home'); }}
                      className="w-full mt-6 py-4 bg-red-500 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-red-600 transition-all"
                    >
                      <LogOut size={20} /> Logout
                    </button>
                  ) : (
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowLogin(true)}
                        className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-black hover:bg-orange-600 transition-all"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => { setLoginMode('register'); setShowLogin(true); }}
                        className="flex-1 py-4 bg-gray-900 text-white rounded-xl font-black hover:bg-black transition-all"
                      >
                        Register
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {view === 'admin' && <AdminDashboard />}
            {view === 'kds' && <KDS />}
            {view === 'pos' && <POS />}
            {view === 'employee-orders' && <EmployeeOrders />}
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 pb-5 z-50 shadow-lg">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id as View)}
                className={`flex flex-col items-center gap-1 px-4 py-1 ${
                  view === item.id ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-bold">{item.label}</span>
                {item.id === 'cart' && items.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all shrink-0 whitespace-nowrap ${
        active ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {icon} {label}
    </button>
  );
}