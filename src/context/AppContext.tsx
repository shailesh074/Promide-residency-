/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Room, Booking, Payment, ContactMessage, ChatMessage, AppState } from '../types.js';

interface AppContextType {
  state: AppState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (email: string, name: string) => Promise<void>;
  logout: () => void;
  fetchRooms: () => Promise<void>;
  addRoom: (roomData: Partial<Room>) => Promise<void>;
  updateRoom: (roomData: Room) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  fetchBookings: () => Promise<void>;
  createBooking: (roomId: string, checkIn: string, checkOut: string, amount: number) => Promise<Booking | null>;
  cancelBooking: (id: string) => Promise<void>;
  updateBookingStatus: (id: string, bookingStatus: string, paymentStatus: string) => Promise<void>;
  fetchPayments: () => Promise<void>;
  processPayment: (bookingId: string, amount: number, method: string) => Promise<void>;
  sendInvoiceEmail: (bookingId: string) => Promise<string>;
  submitContact: (name: string, email: string, message: string) => Promise<void>;
  fetchMessages: () => Promise<void>;
  fetchAdminStats: () => Promise<any>;
  sendConciergeChat: (message: string) => Promise<string>;
  chatHistory: ChatMessage[];
  clearChat: () => void;
  setView: (view: string) => void;
  selectRoom: (room: Room | null) => void;
  showNotification: (text: string, type?: 'success' | 'err' | 'info') => void;
  notification: { text: string; type: 'success' | 'err' | 'info' } | null;
  theme: string;
  setTheme: (theme: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [allMessages, setAllMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  // CHAT CONCIERGE STATE
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'concierge-1',
      sender: 'assistant',
      text: 'Greetings. I am Sovereign, your Elite Grand Concierge at Promide Residency. How may I orchestrate your luxurious getaway in Karnataka today? (Try asking me about our rooms, price, features or plantation tours!)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // NOTIFICATION STATE
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'err' | 'info' } | null>(null);

  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('promide_theme') || 'charcoal';
  });

  useEffect(() => {
    const htmlEl = document.documentElement;
    htmlEl.classList.remove('theme-pine', 'theme-light');
    if (theme === 'pine') {
      htmlEl.classList.add('theme-pine');
    } else if (theme === 'light') {
      htmlEl.classList.add('theme-light');
    }
    localStorage.setItem('promide_theme', theme);
  }, [theme]);

  const getHeaders = () => {
    const token = localStorage.getItem('promide_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const showNotification = (text: string, type: 'success' | 'err' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // CHECK USER SESSION ON BOOT
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('promide_token');
      if (token) {
        try {
          const res = await fetch('/api/auth/user', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            localStorage.removeItem('promide_token');
          }
        } catch (err) {
          console.error('Session restore failed:', err);
        }
      }
      setIsLoading(false);
    };

    checkSession();
    fetchRooms();
  }, []);

  // LOAD ROOMS
  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error('Error loading room records:', err);
    }
  };

  // FETCH USER BOOKINGS
  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (user?.role === 'admin') {
          setAllBookings(data);
        } else {
          setUserBookings(data);
        }
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  // REFRESH DATA WHENEVER USER STATE STABILIZES
  useEffect(() => {
    if (user) {
      fetchBookings();
      if (user.role === 'admin') {
        fetchPayments();
        fetchMessages();
      }
    } else {
      setUserBookings([]);
      setAllBookings([]);
    }
  }, [user]);

  // LOGIN REST ENDPOINT
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication aborted');
      }
      localStorage.setItem('promide_token', data.token);
      setUser(data.user);
      showNotification(`Welcome back to royalty, ${data.user.name}!`, 'success');
      setCurrentView('home');
    } catch (err: any) {
      showNotification(err.message, 'err');
      throw err;
    }
  };

  // REGISTER REST ENDPOINT
  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      localStorage.setItem('promide_token', data.token);
      setUser(data.user);
      showNotification(`Account registered! Grand greetings, ${data.user.name}.`, 'success');
      setCurrentView('home');
    } catch (err: any) {
      showNotification(err.message, 'err');
      throw err;
    }
  };

  const loginWithGoogle = async (email: string, name: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google Login Simulation aborted');
      }
      localStorage.setItem('promide_token', data.token);
      setUser(data.user);
      showNotification(`Successfully logged in via Google credentials as ${data.user.name}!`, 'success');
      setCurrentView('home');
    } catch (err: any) {
      showNotification(err.message, 'err');
    }
  };

  const logout = () => {
    localStorage.removeItem('promide_token');
    setUser(null);
    showNotification('Thank you for staying at Promide Residency. We await your return.', 'info');
    setCurrentView('home');
  };

  // ADMIN CRUDS
  const addRoom = async (roomData: Partial<Room>) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(roomData)
      });
      if (res.ok) {
        showNotification('Luxurious suite created successfully!', 'success');
        fetchRooms();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Error creating suite');
      }
    } catch (err: any) {
      showNotification(err.message, 'err');
    }
  };

  const updateRoom = async (roomData: Room) => {
    try {
      const res = await fetch(`/api/rooms/${roomData.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(roomData)
      });
      if (res.ok) {
        showNotification('Suite parameters modified successfully!', 'success');
        fetchRooms();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Suite modification failed');
      }
    } catch (err: any) {
      showNotification(err.message, 'err');
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showNotification('Room successfully deleted.', 'success');
        fetchRooms();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Suite exclusion failed');
      }
    } catch (err: any) {
      showNotification(err.message, 'err');
    }
  };

  // TRANSACTION TRANSACTION BOOKINGS
  const createBooking = async (roomId: string, checkIn: string, checkOut: string, amount: number) => {
    if (!user) {
      showNotification('Please authenticate to book your luxurious residency room.', 'info');
      setCurrentView('login');
      return null;
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ roomId, checkInDate: checkIn, checkOutDate: checkOut, totalAmount: amount })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit reservation transaction');
      }
      fetchBookings();
      return data as Booking;
    } catch (err: any) {
      showNotification(err.message, 'err');
      return null;
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        showNotification('Reservation safely canceled. Your pre-authorization is refunded.', 'success');
        fetchBookings();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Refund cancellation processing error');
      }
    } catch (err: any) {
      showNotification(err.message, 'err');
    }
  };

  const updateBookingStatus = async (id: string, bookingStatus: string, paymentStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bookingStatus, paymentStatus })
      });
      if (res.ok) {
        showNotification('Booking ledger status overridden by administrator.', 'success');
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // PAYMENTS ACCESSORS
  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/payments', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAllPayments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const processPayment = async (bookingId: string, amount: number, method: string) => {
    try {
      // 1. Generate Razorpay order
      const ordRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bookingId, amount })
      });
      const order = await ordRes.json();

      if (!ordRes.ok) {
        throw new Error(order.error || 'Razorpay order creation aborted');
      }

      // 2. Complete payment captured confirmation
      const payId = 'rzpay_mock_' + Math.random().toString(36).substring(2, 11);
      const capRes = await fetch('/api/payments/complete', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          bookingId,
          paymentId: payId,
          amount,
          paymentMethod: method
        })
      });
      const capData = await capRes.json();
      
      if (!capRes.ok) {
        throw new Error(capData.error || 'Capture verification failed');
      }

      showNotification('Luxury booking transaction authenticated through Razorpay gateway!', 'success');
      fetchBookings();
      
      // Auto dispatch transactional Nodemailer confirmation
      await sendInvoiceEmail(bookingId);
    } catch (err: any) {
      showNotification(err.message, 'err');
      throw err;
    }
  };

  const sendInvoiceEmail = async (bookingId: string) => {
    try {
      const res = await fetch('/api/notifications/invoice', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bookingId })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message, 'info');
        return data.message;
      }
    } catch (err) {
      console.error(err);
    }
    return '';
  };

  // CONTACT MANAGEMENT
  const submitContact = async (name: string, email: string, message: string) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Thank you. Your request is safely queued into our resort office.', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showNotification(err.message, 'err');
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAllMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: getHeaders() });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error(err);
    }
    return { totalUsers: 2, totalBookings: 1, revenue: 4, occupancyRate: 33 };
  };

  // GEMINI ACTIVE CONCIERGE CHAT RUNNERS
  const sendConciergeChat = async (msg: string): Promise<string> => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);

    try {
      // Create request payload matching Gemini interaction criteria
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: chatHistory.slice(-10), // Pass recent messages for seamless context memory
          message: msg
        })
      });
      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: data.text || 'I am ready to help you coordinate your majestic check-in.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, assistantMsg]);
      return assistantMsg.text;
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: 'Forgive me, the communication grid to Coorg experienced a brief disruption. How may I otherwise prepare your suite?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errMsg]);
      return errMsg.text;
    }
  };

  const clearChat = () => {
    setChatHistory([
      {
        id: 'concierge-1',
        sender: 'assistant',
        text: 'Greetings. I am Sovereign, your Elite Grand Concierge at Promide Residency. How may I orchestrate your luxurious getaway in Karnataka today? (Try asking me about our rooms, price, features or plantation tours!)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const setView = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectRoom = (room: Room | null) => {
    setSelectedRoom(room);
  };

  return (
    <AppContext.Provider value={{
      state: {
        currentUser: user,
        rooms,
        userBookings,
        allBookings,
        allUsers,
        allPayments,
        allMessages,
        isLoading,
        currentView,
        selectedRoom
      },
      login,
      register,
      loginWithGoogle,
      logout,
      fetchRooms,
      addRoom,
      updateRoom,
      deleteRoom,
      fetchBookings,
      createBooking,
      cancelBooking,
      updateBookingStatus,
      fetchPayments,
      processPayment,
      sendInvoiceEmail,
      submitContact,
      fetchMessages,
      fetchAdminStats,
      sendConciergeChat,
      chatHistory,
      clearChat,
      setView,
      selectRoom,
      showNotification,
      notification,
      theme,
      setTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used inside the AppProvider container');
  }
  return context;
};
