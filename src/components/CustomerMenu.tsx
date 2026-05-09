import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Minus,
  ShoppingCart,
  ChevronRight,
  Search,
  UtensilsCrossed,
  Filter,
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { MenuItem } from '../types';
import { useCartStore } from '../store/useCartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-[2.5rem] border border-gray-50 shadow-sm">
          <div className="h-56 mb-6 rounded-[2rem] bg-gray-100 animate-pulse" />
          <div className="space-y-3">
            <div className="h-6 bg-gray-100 rounded-xl animate-pulse w-3/4" />
            <div className="h-4 bg-gray-100 rounded-xl animate-pulse w-1/2" />
          </div>
          <div className="mt-6 h-14 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-24 h-12 bg-gray-100 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

export default function CustomerMenu() {
  const [menu, setMenu] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const { items, addItem, removeItem, updateQuantity } = useCartStore();

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenu();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const [menuRes, catsRes] = await Promise.all([
        fetch(`/api/menu?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`),
        fetch('/api/categories')
      ]);
      const [menuData, catsData] = await Promise.all([
        menuRes.json(),
        catsRes.json()
      ]);

      if (menuRes.ok && catsRes.ok) {
        setMenu(menuData.items || []);
        setCategories(Array.isArray(catsData) ? catsData : []);
        setPagination(menuData.pagination || null);
      } else {
        throw new Error('Failed to load menu data');
      }
    } catch (err: any) {
      console.error('Failed to fetch menu', err);
      setError(err.message || 'Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!pagination?.hasMore || loading) return;
    try {
      const nextPage = pagination.page + 1;
      const res = await fetch(`/api/menu?page=${nextPage}&search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
      const data = await res.json();
      if (res.ok) {
        setMenu(prev => [...prev, ...(data.items || [])]);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load more', err);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Our Menu</h2>
          <p className="text-gray-500 font-bold mt-1">Discover our curated selection of fine dishes</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search for dishes..."
              className="pl-12 py-7 rounded-2xl border-gray-100 text-lg font-bold shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[2.5rem] border border-red-100">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500 font-bold mb-6">{error}</p>
          <Button onClick={fetchMenu} className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-4 rounded-2xl">
            Try Again
          </Button>
        </div>
      ) : loading && menu.length === 0 ? (
        <>
          <CategorySkeleton />
          <MenuSkeleton />
        </>
      ) : (
        <>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-8 py-3 rounded-2xl text-sm font-black capitalize transition-all whitespace-nowrap border ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-100'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-100'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-8 py-3 rounded-2xl text-sm font-black capitalize transition-all whitespace-nowrap border ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-100'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {menu.map(item => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id}
                  className="bg-white p-5 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl transition-all group relative"
                >
                  <div className="relative h-56 mb-6 overflow-hidden rounded-[2rem]">
                    <img
                      src={item.imageUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80`}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80`;
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 backdrop-blur text-gray-900 font-black px-3 py-1 rounded-xl shadow-sm border-none">
                        <Star size={12} className="text-orange-500 fill-orange-500 mr-1" /> 4.8
                      </Badge>
                    </div>
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-white text-gray-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-8">
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-xl text-gray-900 line-clamp-1">{item.name}</h3>
                      <span className="text-orange-600 font-black text-lg">₹{item.price}</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {items.find(i => i.menuItemId === item.id) ? (
                      <div className="flex-1 flex items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-100">
                        <button
                          onClick={() => updateQuantity(item.id, (items.find(i => i.menuItemId === item.id)?.quantity || 0) - 1)}
                          className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-red-500 transition-all"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="font-black text-lg">{items.find(i => i.menuItemId === item.id)?.quantity}</span>
                        <button
                          onClick={() => addItem(item)}
                          className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-orange-500 transition-all"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          addItem(item);
                          toast.success(`${item.name} added to cart!`);
                        }}
                        disabled={!item.isAvailable}
                        className={`flex-1 py-7 rounded-2xl font-black text-base transition-all shadow-xl ${
                          item.isAvailable
                            ? 'bg-gray-900 hover:bg-black text-white shadow-gray-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                        }`}
                      >
                        {item.isAvailable ? 'Add to Basket' : 'Out of Stock'}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {pagination?.hasMore && (
            <div className="flex justify-center pt-8">
              <Button
                onClick={loadMore}
                disabled={loading}
                className="bg-white hover:bg-gray-50 text-gray-700 font-black px-12 py-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More ({pagination.total - menu.length} remaining)
                  </>
                )}
              </Button>
            </div>
          )}

          {!loading && menu.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 space-y-6 bg-white rounded-[2.5rem]">
              <UtensilsCrossed size={64} className="text-gray-200" />
              <div className="text-center">
                <h3 className="text-2xl font-black text-gray-900">No dishes found</h3>
                <p className="text-gray-500 font-bold mt-2">
                  {searchQuery ? `No results for "${searchQuery}"` : 'No menu items available'}
                </p>
              </div>
              {searchQuery && (
                <Button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-4 rounded-2xl"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}