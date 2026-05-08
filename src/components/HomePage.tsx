import React from 'react';
import { motion } from 'motion/react';
import { Utensils, Clock, Star, ArrowRight, ChefHat, MapPin, Phone } from 'lucide-react';

export default function HomePage({ onOrderNow }: { onOrderNow: () => void }) {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden rounded-[3rem] bg-gray-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover opacity-40"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge label="New: AI-Powered Menu" />
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
              CRAFTING <br />
              <span className="text-orange-500">DIGITAL</span> FLAVORS
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-bold mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience the future of dining with RMS Enterprise. Fast ordering, real-time kitchen tracking, and premium ingredients.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onOrderNow}
                className="w-full sm:w-auto bg-orange-500 text-white px-10 py-5 rounded-2xl text-lg font-black shadow-2xl shadow-orange-500/20 hover:bg-orange-600 hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                Order Now <ArrowRight size={20} />
              </button>
              <button className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl text-lg font-black hover:bg-white/20 transition-all">
                View Gallery
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
        <StatItem icon={<Utensils />} count="50+" label="Signature Dishes" />
        <StatItem icon={<Star />} count="4.9" label="Average Rating" />
        <StatItem icon={<Clock />} count="15m" label="Fast Delivery" />
        <StatItem icon={<ChefHat />} count="12" label="Expert Chefs" />
      </div>

      {/* Featured Dishes Preview */}
      <section className="px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Today's Specials</h2>
            <p className="text-gray-500 font-bold mt-1">Handpicked by our executive chef</p>
          </div>
          <button onClick={onOrderNow} className="hidden md:flex items-center gap-2 text-orange-500 font-black hover:underline">
            View All <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeaturedCard 
            image="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
            title="Harvest Grain Bowl"
            price="₹450"
            tag="Healthy"
          />
          <FeaturedCard 
            image="https://images.unsplash.com/photo-1476124369491-e7addf5db378?w=800&q=80"
            title="Truffle Risotto"
            price="₹850"
            tag="Premium"
          />
          <FeaturedCard 
            image="https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=800&q=80"
            title="Atlantic Salmon"
            price="₹1200"
            tag="Bestseller"
          />
        </div>
      </section>

      {/* Contact Info Bar */}
      <div className="bg-gray-50 rounded-[2.5rem] p-10 grid grid-cols-1 md:grid-cols-3 gap-8 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
            <MapPin size={24} />
          </div>
          <div>
            <p className="font-black text-gray-900">Visit Us</p>
            <p className="text-sm font-bold text-gray-500">123 Culinary Ave, Foodie City</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
            <Phone size={24} />
          </div>
          <div>
            <p className="font-black text-gray-900">Call Us</p>
            <p className="text-sm font-bold text-gray-500">+1 234 567 890</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
            <Clock size={24} />
          </div>
          <div>
            <p className="font-black text-gray-900">Opening Hours</p>
            <p className="text-sm font-bold text-gray-500">Mon - Sun: 10AM - 11PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-block bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-sm border border-orange-500/20">
      {label}
    </span>
  );
}

function StatItem({ icon, count, label }: { icon: React.ReactNode, count: string, label: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 text-center hover:shadow-xl transition-all group">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mx-auto mb-4 group-hover:bg-orange-500 group-hover:text-white transition-all">
        {icon}
      </div>
      <p className="text-2xl font-black text-gray-900 mb-1">{count}</p>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function FeaturedCard({ image, title, price, tag }: { image: string, title: string, price: string, tag: string }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative h-80 rounded-[2.5rem] overflow-hidden mb-6">
        <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={title} />
        <div className="absolute top-6 left-6">
          <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            {tag}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-gray-900">{title}</h3>
          <p className="text-gray-400 font-bold">Premium Dish</p>
        </div>
        <p className="text-2xl font-black text-orange-500">{price}</p>
      </div>
    </div>
  );
}
