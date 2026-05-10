import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = [
  { id: 'all', icon: '🍽', label: 'All' },
  { id: 'breakfast', icon: '🍳', label: 'Breakfast' },
  { id: 'burger', icon: '🍔', label: 'Burger' },
  { id: 'pizza', icon: '🍕', label: 'Pizza' },
  { id: 'salad', icon: '🥗', label: 'Salad' },
  { id: 'dessert', icon: '🧁', label: 'Dessert' },
  { id: 'drinks', icon: '🥤', label: 'Drinks' },
];

const COLORS = {
  red: '#C0392B',
  redLight: '#E74C3C',
  redBg: '#FFF0EE',
  dark: '#1A1A1A',
  gray: '#6B7280',
  lightGray: '#F5F5F5',
  border: '#E8E8E8',
  white: '#FFFFFF',
  gold: '#F59E0B',
  green: '#059669',
};

interface MenuItem {
  _id: string;
  name: string;
  category: string;
  emoji: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  prepTime: string;
  tag: string;
  nutrition: { value: string; label: string }[];
  sideOptions: { sideId: number; emoji: string; name: string; price: number }[];
  isAvailable: boolean;
}

interface CartItem extends MenuItem {
  qty: number;
  selectedSides: { name: string; price: number }[];
}

const cardStyles: React.CSSProperties = {
  background: COLORS.white,
  borderRadius: 16,
  border: `1px solid ${COLORS.border}`,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
};

const buttonStyles = (isActive: boolean): React.CSSProperties => ({
  padding: '7px 14px',
  borderRadius: 20,
  border: `1.5px solid ${isActive ? COLORS.red : COLORS.border}`,
  background: isActive ? COLORS.red : COLORS.white,
  fontSize: 12,
  fontWeight: 600,
  color: isActive ? COLORS.white : COLORS.gray,
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
});

const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: COLORS.dark,
};

const priceStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  color: COLORS.red,
};

export default function FoodZoneMenu() {
  const [view, setView] = useState<'home' | 'menu' | 'detail' | 'cart'>('home');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCatHome, setActiveCatHome] = useState('all');
  const [activeCatMenu, setActiveCatMenu] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [currentQty, setCurrentQty] = useState(1);
  const [selectedSides, setSelectedSides] = useState<number[]>([]);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(true);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async (category = 'all') => {
    try {
      setLoading(true);
      const url = category === 'all'
        ? '/api/customer/menu'
        : `/api/customer/menu?category=${category}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  const addToCart = (item: MenuItem, qty = 1, sides: { name: string; price: number }[] = []) => {
    setCart(prev => {
      const existing = prev.find(c => c._id === item._id);
      if (existing) {
        return prev.map(c => 
          c._id === item._id 
            ? { ...c, qty: c.qty + qty, selectedSides: [...c.selectedSides, ...sides] }
            : c
        );
      }
      return [...prev, { ...item, qty, selectedSides: sides }];
    });
    updateBadge();
  };

  const updateBadge = () => {
    const count = cart.reduce((s, c) => s + c.qty, 0);
    const badge = document.getElementById('foodzone-cart-badge');
    if (badge) badge.textContent = count.toString();
  };

  const filteredHomeItems = items.filter(i =>
    activeCatHome === 'all' || i.category === activeCatHome
  );

  const filteredMenuItems = items.filter(i => {
    const catOk = activeCatMenu === 'all' || i.category === activeCatMenu;
    const searchOk = !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase());
    return catOk && searchOk;
  });

  const openDetail = (item: MenuItem) => {
    setCurrentItem(item);
    setCurrentQty(1);
    setSelectedSides([]);
    setView('detail');
  };

  const handleCheckout = async () => {
    const tableNumber = window.prompt('Enter table number:') || '1';
    try {
      const res = await fetch('/api/customer/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          items: cart.map(i => ({
            menuItemId: i._id,
            quantity: i.qty,
            selectedSides: i.selectedSides,
            price: i.price
          })),
          totalAmount: cart.reduce((s, i) => s + i.price * i.qty, 0) + 25 - 15
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Order placed! 🎉');
        setCart([]);
        updateBadge();
        setTimeout(() => setView('home'), 2000);
      } else {
        showToast('Failed: ' + data.message);
      }
    } catch (e) {
      showToast('Network error!');
    }
  };

  const getSidesTotal = () => {
    if (!currentItem) return 0;
    return selectedSides.reduce((sum, idx) => {
      const side = currentItem.sideOptions[idx];
      return sum + (side?.price || 0);
    }, 0);
  };

  const containerStyle: React.CSSProperties = isMobile 
    ? {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        maxWidth: 430,
        margin: '0 auto',
        background: COLORS.white,
        minHeight: '80vh',
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }
    : {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        maxWidth: 1200,
        margin: '0 auto',
        background: COLORS.white,
        minHeight: '100vh',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
      };

  const gridStyle: React.CSSProperties = isMobile
    ? { display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px 16px' }
    : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, padding: '0 40px 24px' };

  const cardWidth = isMobile ? 155 : '100%';

  return (
    <div style={containerStyle}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* HOME VIEW */}
      {view === 'home' && (
        <div style={{ paddingBottom: isMobile ? 80 : 40, padding: isMobile ? '16px 20px' : '32px 40px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? 16 : 24 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: '50%', 
                background: `linear-gradient(135deg, ${COLORS.red}, ${COLORS.redLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: COLORS.white, fontWeight: 700, fontSize: 18
              }}>G</div>
              <div>
                <div style={{ fontSize: isMobile ? 13 : 16, color: COLORS.gray }}>Hello, <span style={{ color: COLORS.red, fontWeight: 700 }}>Guest</span> 👋</div>
                <div style={{ fontSize: isMobile ? 11 : 14, color: COLORS.gray }}>What do you want to eat today?</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ width: 44, height: 44, borderRadius: '50%', background: COLORS.lightGray, border: 'none', fontSize: 20, cursor: 'pointer' }}>🔔</button>
              <button onClick={() => setView('cart')} style={{ width: 44, height: 44, borderRadius: '50%', background: COLORS.red, border: 'none', fontSize: 18, cursor: 'pointer', color: COLORS.white, position: 'relative' }}>
                🛒
                {cart.reduce((s, c) => s + c.qty, 0) > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: COLORS.dark, color: COLORS.white, borderRadius: 10, padding: '2px 6px', fontSize: 10, fontWeight: 700 }}>
                    {cart.reduce((s, c) => s + c.qty, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div style={{ margin: `0 ${isMobile ? 20 : 0}px ${isMobile ? 16 : 20}px`, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
            <input 
              placeholder="Find your favourite food" 
              style={{ 
                width: '100%', padding: '14px 16px 14px 42px', 
                border: `1.5px solid ${COLORS.border}`, borderRadius: 12, 
                fontSize: isMobile ? 13 : 15, fontFamily: 'inherit', background: COLORS.lightGray, outline: 'none' 
              }} 
            />
          </div>

          <div style={{ padding: `0 ${isMobile ? 20 : 0}px 8px`, ...sectionTitle }}>Food Category</div>
          <div style={{ ...gridStyle, paddingBottom: isMobile ? 16 : 24 }}>
            {CATEGORIES.map(cat => (
              <div 
                key={cat.id} 
                onClick={() => { setActiveCatHome(cat.id); fetchMenuItems(cat.id); }}
                style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', 
                  flexShrink: 0,
                  padding: isMobile ? 0 : 16,
                  borderRadius: isMobile ? 0 : 16,
                  background: activeCatHome === cat.id ? COLORS.redBg : 'transparent',
                }}
              >
                <div style={{ 
                  width: isMobile ? 52 : 72, height: isMobile ? 52 : 72, borderRadius: 14, 
                  background: activeCatHome === cat.id ? COLORS.redBg : COLORS.lightGray, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 22 : 28 
                }}>{cat.icon}</div>
                <span style={{ fontSize: isMobile ? 10 : 12, fontWeight: 600, color: activeCatHome === cat.id ? COLORS.red : COLORS.gray }}>{cat.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `0 ${isMobile ? 20 : 0}px 12px` }}>
            <div style={{ ...sectionTitle }}>Popular Foods</div>
            <button onClick={() => setView('menu')} style={{ fontSize: 12, color: COLORS.red, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>See All →</button>
          </div>
          
          {loading ? (
            <div style={{ padding: `0 ${isMobile ? 20 : 0}px`, textAlign: 'center', color: COLORS.gray, fontSize: 16 }}>Loading...</div>
          ) : (
            <div style={{ ...gridStyle }}>
              {filteredHomeItems.slice(0, isMobile ? 4 : 8).map(item => (
                <div 
                  key={item._id} 
                  onClick={() => openDetail(item)}
                  style={{ 
                    ...cardStyles, 
                    width: cardWidth,
                    display: 'flex', 
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ height: isMobile ? 100 : 140, background: COLORS.lightGray, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 40 : 48 }}>{item.emoji}</div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700, color: COLORS.dark, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontSize: isMobile ? 10 : 11, color: COLORS.gray, marginBottom: 8 }}>{(item.description || '').slice(0, 50)}...</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ ...priceStyle }}>₹{item.price}</span>
                      <span style={{ fontSize: 9, background: COLORS.lightGray, color: COLORS.gray, padding: '2px 6px', borderRadius: 6 }}>{item.tag}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderTop: `1px solid ${COLORS.border}` }}>
                    <span style={{ fontSize: 10, color: COLORS.gold }}>★ <span style={{ color: COLORS.gray, fontWeight: 600 }}>{item.rating}</span></span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(item, 1, []); showToast(`${item.name} added! 🛒`); }}
                      style={{ background: COLORS.red, color: COLORS.white, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                    >+ Add</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `20px ${isMobile ? 20 : 0}px 12px` }}>
            <div style={{ ...sectionTitle }}>Recommended</div>
            <button onClick={() => setView('menu')} style={{ fontSize: 12, color: COLORS.red, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>See All →</button>
          </div>
          <div style={{ ...gridStyle, paddingBottom: 40 }}>
            {items.filter(i => ['breakfast', 'salad', 'dessert'].includes(i.category)).slice(0, isMobile ? 4 : 8).map(item => (
              <div 
                key={item._id} 
                onClick={() => openDetail(item)}
                style={{ 
                  ...cardStyles, 
                  width: cardWidth,
                  display: 'flex', 
                  flexDirection: 'column',
                }}
              >
                <div style={{ height: isMobile ? 90 : 120, background: COLORS.lightGray, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 36 : 42 }}>{item.emoji}</div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: COLORS.dark }}>{item.name}</div>
                  <span style={{ display: 'inline-block', background: COLORS.lightGray, color: COLORS.gray, fontSize: 9, padding: '2px 6px', borderRadius: 6, margin: '4px 0' }}>{item.tag}</span>
                  <div style={{ ...priceStyle, marginTop: 4 }}>₹{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MENU VIEW */}
      {view === 'menu' && (
        <div style={{ paddingBottom: isMobile ? 80 : 40, padding: isMobile ? '16px 20px' : '32px 40px 0' }}>
          <div style={{ padding: '0 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: isMobile ? 18 : 24, fontWeight: 800, color: COLORS.dark, margin: 0 }}>
              Choose Your Food <span style={{ color: COLORS.red }}>Today</span>
            </h2>
            <button 
              onClick={() => setView('cart')} 
              style={{ 
                background: COLORS.red, color: COLORS.white, border: 'none', borderRadius: 12, 
                padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                position: 'relative'
              }}
            >
              🛒 Cart ({cart.reduce((s, c) => s + c.qty, 0)})
            </button>
          </div>
          <div style={{ margin: `0 0 16px`, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find your favourite food" 
              style={{ 
                width: '100%', padding: '14px 16px 14px 42px', 
                border: `1.5px solid ${COLORS.border}`, borderRadius: 12, 
                fontSize: isMobile ? 13 : 15, fontFamily: 'inherit', background: COLORS.lightGray, outline: 'none' 
              }} 
            />
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '0 0 16px', overflowX: 'auto' }}>
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => { setActiveCatMenu(cat.id); fetchMenuItems(cat.id); }}
                style={buttonStyles(activeCatMenu === cat.id)}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
            {filteredMenuItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: COLORS.gray, fontSize: 13 }}>No items found</div>
            ) : (
              filteredMenuItems.map(item => (
                <div 
                  key={item._id} 
                  onClick={() => openDetail(item)}
                  style={{ 
                    display: 'flex', gap: 16, padding: 16, borderBottom: `1px solid ${COLORS.border}`, 
                    cursor: 'pointer', position: 'relative', background: COLORS.white, borderRadius: 12,
                    border: `1px solid ${COLORS.border}`
                  }}
                >
                  <div style={{ width: isMobile ? 78 : 100, height: isMobile ? 78 : 100, borderRadius: 12, background: COLORS.lightGray, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 32 : 40 }}>{item.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: COLORS.dark, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.gold, marginBottom: 4 }}>★{'★'.repeat(Math.floor(item.rating || 4))} <span style={{ color: COLORS.gray, fontSize: 10, fontWeight: 600 }}>{item.rating}</span></div>
                    <div style={{ fontSize: 11, color: COLORS.gray, lineHeight: 1.4, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.description}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ ...priceStyle, fontSize: isMobile ? 15 : 18 }}>₹{item.price}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(item, 1, []); showToast(`${item.name} added! 🛒`); }}
                        style={{ background: COLORS.red, color: COLORS.white, border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                      >+ Quick Add 🛒</button>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setLiked(prev => { const n = new Set(prev); n.has(item._id) ? n.delete(item._id) : n.add(item._id); return n; }); }}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
                  >
                    {liked.has(item._id) ? '❤️' : '🤍'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* DETAIL VIEW */}
      {view === 'detail' && currentItem && (
        <div style={{ 
          position: isMobile ? 'fixed' : 'relative', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: COLORS.white, overflowY: 'auto', zIndex: 200, 
          maxWidth: isMobile ? 430 : '100%', margin: isMobile ? '0 auto' : '0 auto',
          left: isMobile ? 0 : undefined,
          right: isMobile ? 0 : undefined,
        }}>
          <div style={{ width: '100%', height: isMobile ? 240 : 320, background: COLORS.lightGray, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 80 : 100, position: 'relative' }}>
            {currentItem.emoji}
            <div style={{ position: 'absolute', top: isMobile ? 20 : 40, left: 0, right: 0, padding: '0 20px', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setView('menu')} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', fontSize: 18 }}>←</button>
              <button 
                onClick={() => setLiked(prev => { const n = new Set(prev); n.has(currentItem._id) ? n.delete(currentItem._id) : n.add(currentItem._id); return n; })}
                style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', fontSize: 18 }}
              >
                {liked.has(currentItem._id) ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
          <div style={{ padding: isMobile ? 20 : '24px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 800, color: COLORS.dark, marginBottom: 4 }}>{currentItem.name}</div>
                <div style={{ fontSize: 12, color: COLORS.gold }}>★{'★'.repeat(Math.floor(currentItem.rating || 4))} <span style={{ color: COLORS.gray, fontWeight: 600 }}>{currentItem.rating} ({currentItem.reviewCount} Reviews)</span></div>
              </div>
              <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: COLORS.red }}>₹{currentItem.price}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: COLORS.lightGray, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: COLORS.dark }}>⏱ {currentItem.prepTime || '20 mins'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: COLORS.lightGray, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: COLORS.dark }}>🏷 {currentItem.tag}</div>
              <div style={{ display: 'flex', alignItems: 'center', background: COLORS.lightGray, borderRadius: 10, overflow: 'hidden', marginLeft: 'auto' }}>
                <button onClick={() => setCurrentQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, border: 'none', background: COLORS.red, color: COLORS.white, fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>−</button>
                <span style={{ width: 40, textAlign: 'center', fontSize: 16, fontWeight: 700 }}>{currentQty}</span>
                <button onClick={() => setCurrentQty(q => q + 1)} style={{ width: 36, height: 36, border: 'none', background: COLORS.red, color: COLORS.white, fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>+</button>
              </div>
            </div>
            {(currentItem.nutrition || []).length > 0 && (
              <>
                <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: COLORS.dark, marginBottom: 10 }}>Nutrition Facts</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginBottom: 20 }}>
                  {(currentItem.nutrition || []).slice(1).map((n, i) => (
                    <div key={i} style={{ background: COLORS.dark, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                      <div style={{ color: COLORS.white, fontSize: isMobile ? 14 : 16, fontWeight: 700 }}>{n.value}</div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 }}>{n.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: COLORS.dark, marginBottom: 8 }}>Description</div>
            <div style={{ fontSize: isMobile ? 12 : 14, color: COLORS.gray, lineHeight: 1.6, marginBottom: 20 }}>{currentItem.description}</div>
            {(currentItem.sideOptions || []).length > 0 && (
              <>
                <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: COLORS.dark, marginBottom: 12 }}>Side Options</div>
                <div style={{ display: 'flex', gap: 12, marginBottom: isMobile ? 100 : 40, overflowX: 'auto', flexWrap: 'wrap' }}>
                  {(currentItem.sideOptions || []).map((side, i) => {
                    const isSelected = selectedSides.includes(i);
                    return (
                      <div 
                        key={i} 
                        onClick={() => setSelectedSides(prev => prev.includes(i) ? prev.filter(s => s !== i) : [...prev, i])}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', flexShrink: 0 }}
                      >
                        <div style={{ 
                          width: isMobile ? 52 : 64, height: isMobile ? 52 : 64, borderRadius: 12, background: COLORS.lightGray, 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 24 : 28, 
                          position: 'relative', border: `2px solid ${isSelected ? COLORS.red : 'transparent'}` 
                        }}>
                          {side.emoji}
                          <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, background: COLORS.red, borderRadius: '50%', color: COLORS.white, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isSelected ? '✓' : '+'}
                          </div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.dark }}>{side.name}</span>
                        {side.price > 0 && <span style={{ fontSize: 10, color: COLORS.red, fontWeight: 700 }}>+₹{side.price}</span>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          {!isMobile && (
            <div style={{ padding: '0 40px 24px', borderTop: `1px solid ${COLORS.border}`, marginTop: 20 }}>
              <button 
                onClick={() => {
                  const sidesData = selectedSides.map(i => currentItem.sideOptions[i]);
                  addToCart(currentItem, currentQty, sidesData);
                  showToast(`${currentItem.name} added! 🛒`);
                  setView('menu');
                }}
                style={{ 
                  width: '100%', padding: 16, background: COLORS.red, color: COLORS.white, 
                  border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' 
                }}
              >
                Add To Cart — ₹{(currentItem.price + getSidesTotal()) * currentQty} 🛒
              </button>
            </div>
          )}
          {isMobile && (
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 20px 24px', background: COLORS.white, borderTop: `1px solid ${COLORS.border}`, maxWidth: 430, margin: '0 auto' }}>
              <button 
                onClick={() => {
                  const sidesData = selectedSides.map(i => currentItem.sideOptions[i]);
                  addToCart(currentItem, currentQty, sidesData);
                  showToast(`${currentItem.name} added! 🛒`);
                  setView('menu');
                }}
                style={{ 
                  width: '100%', padding: 14, background: COLORS.red, color: COLORS.white, 
                  border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' 
                }}
              >
                Add To Cart — ₹{(currentItem.price + getSidesTotal()) * currentQty} 🛒
              </button>
            </div>
          )}
        </div>
      )}

      {/* CART VIEW */}
      {view === 'cart' && (
        <div style={{ padding: isMobile ? '16px 20px' : '32px 40px', minHeight: '100vh' }}>
          <div style={{ padding: '0 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>← Back to Menu</button>
            <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: COLORS.dark }}>My Cart</span>
            <span style={{ fontSize: 13, color: COLORS.gray, background: COLORS.lightGray, padding: '6px 12px', borderRadius: 20, fontWeight: 600 }}>
              {cart.reduce((s, c) => s + c.qty, 0)} items
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: 24 }}>
            <div style={{ maxHeight: isMobile ? 400 : 500, overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.gray }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Cart is empty</div>
                  <button onClick={() => setView('menu')} style={{ marginTop: 16, background: COLORS.red, color: COLORS.white, border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Browse Menu</button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: `1px solid ${COLORS.border}`, alignItems: 'center' }}>
                    <div style={{ width: isMobile ? 60 : 80, height: isMobile ? 60 : 80, borderRadius: 12, background: COLORS.lightGray, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 26 : 32, flexShrink: 0 }}>{item.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: COLORS.dark }}>{item.name}</div>
                      {item.selectedSides.length > 0 && <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 2 }}>+ {item.selectedSides.map(s => s.name).join(', ')}</div>}
                      <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 800, color: COLORS.red, marginTop: 6 }}>₹{item.price * item.qty}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button 
                        onClick={() => setCart(prev => prev.map((c, i) => i === idx ? { ...c, qty: Math.max(1, c.qty - 1) } : c))}
                        style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${COLORS.border}`, background: COLORS.white, cursor: 'pointer', fontSize: 16, fontWeight: 700 }}
                      >−</button>
                      <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                      <button 
                        onClick={() => setCart(prev => prev.map((c, i) => i === idx ? { ...c, qty: c.qty + 1 } : c))}
                        style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${COLORS.border}`, background: COLORS.white, cursor: 'pointer', fontSize: 16, fontWeight: 700 }}
                      >+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div style={{ background: COLORS.lightGray, borderRadius: 16, padding: isMobile ? 16 : 24, height: 'fit-content' }}>
                {[
                  { label: 'Subtotal', val: `₹${cart.reduce((s, i) => s + i.price * i.qty, 0)}` },
                  { label: 'Delivery', val: '₹25' },
                  { label: 'Discount', val: '-₹15', color: COLORS.green }
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: isMobile ? 13 : 15 }}>
                    <span style={{ color: COLORS.gray }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: row.color || COLORS.dark }}>{row.val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
                  <span style={{ fontSize: isMobile ? 15 : 18, fontWeight: 800, color: COLORS.dark }}>Total</span>
                  <span style={{ fontSize: isMobile ? 15 : 18, fontWeight: 800, color: COLORS.red }}>₹{cart.reduce((s, i) => s + i.price * i.qty, 0) + 25 - 15}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  style={{ marginTop: 20, width: '100%', padding: 16, background: COLORS.red, color: COLORS.white, border: 'none', borderRadius: 14, fontSize: isMobile ? 15 : 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM NAV (Mobile Only) */}
      {view !== 'detail' && isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: COLORS.white, borderTop: `1px solid ${COLORS.border}`, display: 'flex', padding: '10px 0 16px', zIndex: 100, maxWidth: 430, margin: '0 auto' }}>
          {[
            { id: 'home', icon: '🏠', label: 'Home' },
            { id: 'menu', icon: '📋', label: 'Menu' },
            { id: 'cart', icon: '🛒', label: 'My Cart' },
            { id: 'profile', icon: '👤', label: 'Profile' },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => tab.id === 'profile' ? showToast('Profile coming soon!') : setView(tab.id as any)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', position: 'relative' }}
            >
              <span style={{ fontSize: 20, color: view === tab.id ? COLORS.red : COLORS.gray }}>{tab.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 500, color: view === tab.id ? COLORS.red : COLORS.gray }}>{tab.label}</span>
              {tab.id === 'cart' && cart.reduce((s, c) => s + c.qty, 0) > 0 && (
                <span style={{ position: 'absolute', top: -2, right: 16, background: COLORS.red, color: COLORS.white, borderRadius: 10, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>
                  {cart.reduce((s, c) => s + c.qty, 0)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ 
          position: 'fixed', 
          bottom: isMobile ? 90 : 30, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          background: COLORS.dark, 
          color: COLORS.white, 
          padding: '12px 24px', 
          borderRadius: 12, 
          fontSize: 14, 
          fontWeight: 600, 
          whiteSpace: 'nowrap', 
          zIndex: 400,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}