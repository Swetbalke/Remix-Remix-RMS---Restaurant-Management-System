import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  phone: string;
  role: 'admin' | 'staff' | 'customer';
  name?: string;
  email?: string;
}

const UserSchema = new Schema({
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
  name: String,
  email: String,
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);

// Menu Item Schema
export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  stock: number;
}

const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: String,
  available: { type: Boolean, default: true },
  stock: { type: Number, default: 100 },
}, { timestamps: true });

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

// Order Schema
export interface IOrder extends Document {
  tableNumber: string;
  items: { menuItemId: mongoose.Types.ObjectId; quantity: number; price: number; name: string }[];
  total: number;
  status: 'pending' | 'preparing' | 'served' | 'paid' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

const OrderSchema = new Schema({
  tableNumber: String,
  items: [{
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: Number,
    price: Number,
    name: String,
  }],
  total: Number,
  status: { type: String, enum: ['pending', 'preparing', 'served', 'paid', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
