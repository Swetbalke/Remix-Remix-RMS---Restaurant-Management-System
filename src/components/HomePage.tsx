import React from 'react';
import { motion } from 'motion/react';
import { ChefHat, ArrowRight, Star, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage({ onOrderNow }: { onOrderNow: () => void }) {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden rounded-[3rem]">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2000" 
            alt="Restaurant Banner" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-4xl px-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-orange-500 text-white text-xs font-black uppercase tracking-widest rounded-full mb-6">
              Now Open for Enterprise
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              CRAFTING <br />
              <span className="text-orange-500">CULINARY</span> <br />
              EXCELLENCE.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-medium max-w-xl mb-10 leading-relaxed">
              Experience the future of dining with our AI-powered restaurant management system. Fresh ingredients, real-time tracking, and seamless service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onOrderNow}
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white font-black px-10 py-8 text-lg rounded-2xl shadow-2xl shadow-orange-500/20 group"
              >
                Order Now <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 font-black px-10 py-8 text-lg rounded-2xl"
              >
                View Gallery
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Star className="text-orange-500" />}
          title="Premium Quality"
          description="We source only the finest organic ingredients for every dish we serve."
        />
        <FeatureCard 
          icon={<Clock className="text-blue-500" />}
          title="Real-time Tracking"
          description="Watch your order move from the kitchen to your table in real-time."
        />
        <FeatureCard 
          icon={<ShieldCheck className="text-green-500" />}
          title="Safe & Secure"
          description="Enterprise-grade security for all your transactions and data."
        />
      </section>

      {/* Featured Items Preview */}
      <section>
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Today's Specials</h2>
            <p className="text-gray-500 font-bold mt-2">Hand-picked by our executive chef</p>
          </div>
          <Button variant="ghost" onClick={onOrderNow} className="font-black text-orange-500">View Full Menu</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative h-64 rounded-[2rem] overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all">
                <img 
                  src={`https://picsum.photos/seed/food${i}/800/600`} 
                  alt="Featured Dish" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Chef's Selection {i}</h3>
              <p className="text-gray-500 text-sm font-bold">Starting from ₹299</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
        {React.cloneElement(icon as React.ReactElement, { size: 28 } as any)}
      </div>
      <h3 className="text-2xl font-black text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
