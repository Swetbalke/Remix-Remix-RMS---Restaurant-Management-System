import React from 'react';
import { motion } from 'motion/react';
import { Utensils, Clock, Star, ArrowRight, ChefHat, MapPin, Phone, Sparkles } from 'lucide-react';

export default function HomePage({ onOrderNow }: { onOrderNow: () => void }) {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section with 3D Spline Background */}
      <section className="relative h-[85vh] min-h-[650px] flex items-center justify-center overflow-hidden rounded-[3rem]">
        {/* Spline 3D Background */}
        <div className="absolute inset-0 z-0">
          <spline-viewer
            url="https://prod.spline.design/3db69b6b-1c92-469b-80e9-33e60ff7c2ee/scene.splinecode"
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
        </div>

        {/* Floating Particles Effect */}
        <div className="absolute inset-0 z-5 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-500 rounded-full animate-pulse opacity-60" />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-yellow-500 rounded-full animate-ping opacity-40" />
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse opacity-30" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Restaurant Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest mb-8 shadow-2xl shadow-orange-500/30"
            >
              <Sparkles size={16} />
              Premium Dining Experience
            </motion.div>

            {/* Restaurant Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-6xl md:text-9xl font-black text-white tracking-tighter mb-6 leading-[0.85] drop-shadow-2xl"
            >
              <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
                FLAVOR
              </span>
              <br />
              <span className="text-white">HAVEN</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-lg md:text-2xl text-gray-200 font-bold mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Where Culinary Art Meets Technology
              <br />
              <span className="text-orange-400">Experience the future of dining</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <motion.button
                onClick={onOrderNow}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-12 py-6 rounded-3xl text-xl font-black shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Order Now
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-white/10 backdrop-blur-xl text-white border-2 border-white/30 px-12 py-6 rounded-3xl text-xl font-black hover:bg-white/20 hover:border-white/50 transition-all flex items-center justify-center gap-3"
              >
                <ChefHat size={24} />
                View Menu
              </motion.button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-16 flex flex-col items-center"
            >
              <span className="text-xs text-gray-400 font-black uppercase tracking-widest mb-4">Scroll to explore</span>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
              >
                <div className="w-1.5 h-3 bg-white rounded-full" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
        <StatItem icon={<Utensils />} count="50+" label="Signature Dishes" delay={0} />
        <StatItem icon={<Star />} count="4.9" label="Average Rating" delay={0.1} />
        <StatItem icon={<Clock />} count="15m" label="Fast Delivery" delay={0.2} />
        <StatItem icon={<ChefHat />} count="12" label="Expert Chefs" delay={0.3} />
      </div>

      {/* Featured Dishes Preview */}
      <section className="px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-block bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4"
            >
              Chef's Selection
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Today's Specials</h2>
            <p className="text-gray-500 font-bold mt-2">Handpicked by our executive chef</p>
          </div>
          <motion.button
            onClick={onOrderNow}
            whileHover={{ x: 5 }}
            className="hidden md:flex items-center gap-2 text-orange-500 font-black hover:text-orange-600 transition-colors group"
          >
            View All
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeaturedCard
            image="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
            title="Harvest Grain Bowl"
            price="₹450"
            tag="Healthy"
            delay={0}
          />
          <FeaturedCard
            image="https://images.unsplash.com/photo-1476124369491-e7addf5db378?w=800&q=80"
            title="Truffle Risotto"
            price="₹850"
            tag="Premium"
            delay={0.1}
          />
          <FeaturedCard
            image="https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=800&q=80"
            title="Atlantic Salmon"
            price="₹1200"
            tag="Bestseller"
            delay={0.2}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[3rem] p-12 md:p-16 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-4">Why Choose Us?</h2>
            <p className="text-gray-400 font-bold text-center mb-16 max-w-2xl mx-auto">Experience the perfect blend of technology and culinary excellence</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Utensils />}
                title="Smart Ordering"
                description="QR-based ordering with real-time kitchen updates. No waiting, just dining."
                delay={0}
              />
              <FeatureCard
                icon={<Clock />}
                title="Live Tracking"
                description="Track your order from kitchen to table with our real-time KDS system."
                delay={0.1}
              />
              <FeatureCard
                icon={<Star />}
                title="Premium Quality"
                description="Only the finest ingredients, prepared by our award-winning chefs."
                delay={0.2}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Bar */}
      <div className="bg-white rounded-[2.5rem] p-10 md:p-16 grid grid-cols-1 md:grid-cols-3 gap-10 border border-gray-100 shadow-xl mx-4">
        <ContactCard
          icon={<MapPin />}
          title="Visit Us"
          info="123 Culinary Ave, Foodie City"
          color="from-orange-500 to-yellow-500"
        />
        <ContactCard
          icon={<Phone />}
          title="Call Us"
          info="+1 234 567 890"
          color="from-green-500 to-emerald-500"
        />
        <ContactCard
          icon={<Clock />}
          title="Opening Hours"
          info="Mon - Sun: 10AM - 11PM"
          color="from-blue-500 to-cyan-500"
        />
      </div>
    </div>
  );
}

function StatItem({ icon, count, label, delay }: { icon: React.ReactNode, count: string, label: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      viewport={{ once: true }}
      className="bg-white p-8 rounded-[2rem] border border-gray-100 text-center hover:shadow-2xl hover:shadow-orange-500/10 transition-all group"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-5 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all">
        {icon}
      </div>
      <p className="text-3xl font-black text-gray-900 mb-2">{count}</p>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}

function FeaturedCard({ image, title, price, tag, delay }: { image: string, title: string, price: string, tag: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      <div className="relative h-80 rounded-[2.5rem] overflow-hidden mb-6 shadow-xl">
        <img
          src={image}
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
          alt={title}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-6 left-6">
          <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
            {tag}
          </span>
        </div>
        <div className="absolute bottom-6 right-6">
          <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl text-lg font-black text-gray-900">
            {price}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-gray-900">{title}</h3>
          <p className="text-gray-400 font-bold">Premium Dish</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-all"
        >
          <ArrowRight size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      viewport={{ once: true }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-500/30">
        {icon}
      </div>
      <h3 className="text-xl font-black text-white mb-3">{title}</h3>
      <p className="text-gray-400 font-bold leading-relaxed">{description}</p>
    </motion.div>
  );
}

function ContactCard({ icon, title, info, color }: { icon: React.ReactNode, title: string, info: string, color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="flex items-center gap-5"
    >
      <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="font-black text-gray-900 text-lg">{title}</p>
        <p className="text-sm font-bold text-gray-500">{info}</p>
      </div>
    </motion.div>
  );
}