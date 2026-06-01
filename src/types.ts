/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Kept secure on server
  role: UserRole;
  createdAt: string;
}

export type RoomType = 'Standard' | 'Deluxe' | 'Luxury Suite';

export interface Room {
  id: string;
  roomNumber: string;
  roomType: RoomType;
  description: string;
  images: string[];
  price: number;
  capacity: number;
  availabilityStatus: 'available' | 'unavailable';
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'pending';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  totalAmount: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  paymentId: string; // Razorpay Payment ID or simulated ID
  amount: number;
  paymentMethod: string; // UPI, Card, Net Banking
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface AppState {
  currentUser: User | null;
  rooms: Room[];
  userBookings: Booking[];
  allBookings: Booking[]; // Admin only
  allUsers: User[]; // Admin only
  allPayments: Payment[]; // Admin only
  allMessages: ContactMessage[]; // Admin only
  isLoading: boolean;
  currentView: string; // 'home' | 'rooms' | 'room-detail' | 'booking' | 'login' | 'register' | 'dashboard' | 'admin' | 'about' | 'contact'
  selectedRoom: Room | null;
}
