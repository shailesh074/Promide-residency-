/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { BackgroundParticles } from './components/BackgroundParticles.js';
import { AIChatBot } from './components/AIChatBot.js';
import { Room, Booking, Payment, User, ContactMessage } from './types.js';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, User as UserIcon, Shield, CreditCard, MapPin, Sparkles, Star, 
  Wifi, Tv, Compass, ShieldCheck, CheckCircle, ChevronRight, Eye, Phone, 
  Plus, Edit, Trash, Settings, Mail, Lock, Key, Users, BookOpen, 
  ArrowRight, Heart, Loader2, IndianRupee, FileText, Check, AlertCircle, RefreshCw, X, Palette,
  Coffee, Dumbbell, Car, Briefcase, Utensils, Clock, Wind
} from 'lucide-react';

function AppContent() {
  const { 
    state, setView, selectRoom, login, register, loginWithGoogle, logout,
    createBooking, cancelBooking, updateBookingStatus, processPayment, submitContact, 
    showNotification, notification, fetchRooms, addRoom, updateRoom, deleteRoom,
    theme, setTheme
  } = useApp();

  const { currentUser, rooms, userBookings, allBookings, allUsers, allPayments, allMessages, currentView, selectedRoom } = state;

  // HERO BOOKING WIDGET FORM STATE
  const [heroCheckIn, setHeroCheckIn] = useState('2026-06-15');
  const [heroCheckOut, setHeroCheckOut] = useState('2026-06-18');
  const [heroGuests, setHeroGuests] = useState(2);
  const [heroRoomType, setHeroRoomType] = useState<string>('Standard');

  // ROOMS LIST FILTER STATE
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPrice, setFilterPrice] = useState<number>(5); // Above literal prices

  // BOOKING STEP STATE
  const [bookingIn, setBookingIn] = useState('');
  const [bookingOut, setBookingOut] = useState('');
  const [bookingGuests, setBookingGuests] = useState(2);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  
  // RAZORPAY MODAL STATE
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('upi');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCVV, setCardCVV] = useState('980');
  const [upiId, setUpiId] = useState('shailesh@ybl');
  const [isPaying, setIsPaying] = useState(false);

  // AUTH FORM STATE
  const [emailText, setEmailText] = useState('');
  const [passwordText, setPasswordText] = useState('');
  const [nameText, setNameText] = useState('');
  const [userRoleSelect, setUserRoleSelect] = useState<'user' | 'admin'>('user');

  // USER PROFILE EDIT STATE
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState('+91 91106 19177');

  // CONTACT FORM STATE
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // ADMIN DASHBOARD TAB STATE
  const [adminTab, setAdminTab] = useState<'stats' | 'rooms' | 'bookings' | 'users' | 'messages'>('stats');
  
  // ADMIN COMPONENT MUTATION FORM STATE
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomFormNo, setRoomFormNo] = useState('');
  const [roomFormType, setRoomFormType] = useState<'Standard' | 'Deluxe' | 'Luxury Suite'>('Standard');
  const [roomFormPrice, setRoomFormPrice] = useState('1');
  const [roomFormCap, setRoomFormCap] = useState('2');
  const [roomFormDesc, setRoomFormDesc] = useState('');

  // ADMIN ANALYTICS LIVE METRICS
  const [adminStats, setAdminStats] = useState({ totalUsers: 2, totalBookings: 1, revenue: 4, occupancyRate: 33 });

  // 5-STAR IMPERIAL GUEST SERVICES STATE
  const [guestServiceTab, setGuestServiceTab] = useState<'dining' | 'housekeeping' | 'spa' | 'wifi'>('dining');
  const [foodQuantities, setFoodQuantities] = useState<{ [key: string]: number }>({
    curry: 0,
    coffee: 0,
    risotto: 0,
    kheer: 0
  });
  const [diningOrders, setDiningOrders] = useState<{id: string, items: string, cost: number, time: string, status: string}[]>([]);
  const [housekeepingStatus, setHousekeepingStatus] = useState<'idle' | 'requested' | 'accepted' | 'completed'>('idle');
  const [housekeepingProgress, setHousekeepingProgress] = useState(0);
  const [housekeepingOptions, setHousekeepingOptions] = useState({
    towels: true,
    turnDown: false,
    sanitize: false,
    lavender: false
  });
  const [spaService, setSpaService] = useState('Traditional Ayurvedic Massage (Abhyanga)');
  const [spaSlot, setSpaSlot] = useState('09:00 AM - 10:30 AM');
  const [activeSpaBookings, setActiveSpaBookings] = useState<{id: string, service: string, slot: string, status: string}[]>([]);
  const [wifiState, setWifiState] = useState<'inactive' | 'loading' | 'active'>('inactive');
  const [wifiProgress, setWifiProgress] = useState(0);
  const [wifiToken, setWifiToken] = useState('');
  const [wifiSpeed, setWifiSpeed] = useState(0);

  // Sync profile editing placeholders
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
    }
  }, [currentUser]);

  // Sync Admin Analytics
  useEffect(() => {
    if (currentUser?.role === 'admin' && currentView === 'admin') {
      const loadStats = async () => {
        const stats = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('promide_token')}` }
        }).then(r => r.json()).catch(() => ({ totalUsers: 2, totalBookings: 1, revenue: 4, occupancyRate: 33 }));
        setAdminStats(stats);
      };
      loadStats();
    }
  }, [currentUser, currentView, allBookings]);

  // CALCULATE STAYS DAYS HELPERS
  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e.getTime() - s.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  };

  // INITIALIZE DETAILED CHECKOUT
  const handleInitiateBooking = (room: Room) => {
    selectRoom(room);
    setBookingIn(heroCheckIn);
    setBookingOut(heroCheckOut);
    setBookingGuests(heroGuests);
    setView('booking');
  };

  // VERIFY AND LOCK BOOKING FOR PAYMENT
  const handleProceedToPayment = async () => {
    if (!selectedRoom) return;
    if (!bookingIn || !bookingOut) {
      showNotification('Please select valid check-in and check-out dates.', 'err');
      return;
    }

    const days = calculateDays(bookingIn, bookingOut);
    const totalCost = selectedRoom.price * days;

    setIsPaying(true);
    // Create pending booking on database to lock the dates
    const booking = await createBooking(selectedRoom.id, bookingIn, bookingOut, totalCost);
    setIsPaying(false);

    if (booking) {
      setActiveBooking(booking);
      setShowRazorpay(true);
    }
  };

  // COMPLETE RAZORPAY CHECKOUT Flow
  const handleRazorpayVerifiedSubmit = async () => {
    if (!activeBooking) return;
    setIsPaying(true);
    try {
      const methodLabel = paymentMethod === 'upi' ? `UPI (${upiId})` : paymentMethod === 'card' ? `Card (...${cardNumber.slice(-4)})` : 'Net Banking';
      await processPayment(activeBooking.id, activeBooking.totalAmount, methodLabel);
      setShowRazorpay(false);
      setView('dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsPaying(false);
    }
  };

  // SUBMIT ADMIN ROOM FORM
  const handleRoomFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      roomNumber: roomFormNo,
      roomType: roomFormType,
      price: Number(roomFormPrice),
      capacity: Number(roomFormCap),
      description: roomFormDesc,
      images: editingRoom ? editingRoom.images : []
    };

    if (editingRoom) {
      await updateRoom({ ...editingRoom, ...payload });
    } else {
      await addRoom(payload);
    }
    setShowRoomModal(false);
    setEditingRoom(null);
  };

  // INITIATE CREATE ROOM MODAL
  const openAddRoomModal = () => {
    setEditingRoom(null);
    setRoomFormNo('');
    setRoomFormType('Standard');
    setRoomFormPrice('1');
    setRoomFormCap('2');
    setRoomFormDesc('');
    setShowRoomModal(true);
  };

  // INITIATE EDIT ROOM MODAL
  const openEditRoomModal = (room: Room) => {
    setEditingRoom(room);
    setRoomFormNo(room.roomNumber);
    setRoomFormType(room.roomType);
    setRoomFormPrice(room.price.toString());
    setRoomFormCap(room.capacity.toString());
    setRoomFormDesc(room.description);
    setShowRoomModal(true);
  };

  // INVOICE PREPARATION HELPER FOR PRINT
  const handleDownloadInvoice = (booking: Booking) => {
    const targetRoom = rooms.find(r => r.id === booking.roomId);
    const days = calculateDays(booking.checkInDate, booking.checkOutDate);
    const invoiceHTML = `
      <html>
        <head>
          <title>Invoice - Promide Residency</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; }
            .header { border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #0a0d1a; letter-spacing: 2px; }
            .invoice-title { font-size: 28px; color: #d4af37; text-align: right; }
            .details { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 40px; gap: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background-color: #0d1326; color: white; padding: 12px; text-align: left; font-size: 13px; text-transform: uppercase; }
            td { padding: 14px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .seal { color: #d4af37; border: 1px solid #d4af37; padding: 10px; display: inline-block; transform: rotate(-5deg); margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">PROMIDE GRAND</div>
              <div>Scenic Coorg, Karnataka, India</div>
              <div>Helpline: +91 91106 19177</div>
            </div>
            <div class="invoice-title">RECEIPT INVOICE</div>
          </div>
          <div class="details">
            <div>
              <h3>Guest Credentials</h3>
              <div>Name: ${currentUser?.name}</div>
              <div>Email: ${currentUser?.email}</div>
            </div>
            <div style="text-align: right;">
              <h3>Reservation Ledger</h3>
              <div>Invoice ID: INV-${booking.id.toUpperCase()}</div>
              <div>Issued: ${new Date(booking.createdAt).toLocaleDateString()}</div>
              <div>Status: ${booking.bookingStatus.toUpperCase()}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Duration</th>
                <th>Rate / Night</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Residency Room ${targetRoom?.roomType} (Suite No. ${targetRoom?.roomNumber})</td>
                <td>${booking.checkInDate}</td>
                <td>${booking.checkOutDate}</td>
                <td>${days} Nights</td>
                <td>₹${targetRoom?.price}</td>
                <td>₹${booking.totalAmount}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">Grand Total Paid: ₹${booking.totalAmount}</div>
          <div style="text-align: center;">
            <div class="seal">TRANSACTION VERIFIED & AUTHENTICATED</div>
            <p style="font-size: 10px; color: #94a3b8; margin-top: 40px;">Thank you for staying at Promide Residency. This is a computer-generated invoice from our central ledger database.</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(invoiceHTML);
      win.document.close();
    }
  };

  return (
    <div id="lobby-layout-frame" className="min-h-screen text-white font-sans flex flex-col justify-between">
      
      {/* GLOBAL NOTIFICATION NOTIFIER BAR */}
      <AnimatePresence>
        {notification && (
          <motion.div
            id="notification-toast"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 px-6 py-4.5 rounded-full shadow-2xl border backdrop-blur-md ${
              notification.type === 'success' 
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10'
                : notification.type === 'err'
                ? 'bg-red-950/90 text-red-300 border-red-500/30 shadow-red-500/10'
                : 'bg-navy-950/90 text-gold border-gold/30 shadow-gold/10'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : notification.type === 'err' ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-gold shrink-0" />
            )}
            <span className="text-xs font-semibold uppercase tracking-wider">{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* ==================== 1. HOME VIEW ==================== */}
          {currentView === 'home' && (
            <motion.section
              id="view-home"
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative space-y-16"
            >
              
              {/* CINEMATIC HERO SECTION WITH SIMPLE ENGLISH COPY */}
              <div className="relative min-h-[85vh] flex items-center justify-center pt-24 pb-12 overflow-hidden px-4">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                  
                  {/* Brand Tagline and Text statement */}
                  <div id="hero-pitch-block" className="lg:col-span-6 space-y-6 text-center lg:text-left select-none">
                    <div className="flex items-center justify-center lg:justify-start space-x-2">
                      <h2 className="serif italic text-lg sm:text-2xl text-gold tracking-wider mb-1 font-light">
                        Stay Comfortable. Stay Promide.
                      </h2>
                    </div>
                    
                    <h1 className="serif text-5xl sm:text-7xl lg:text-[90px] leading-[0.95] sm:leading-[0.9] tracking-tight text-white mb-2 font-light">
                      Promide<br/>
                      <span className="italic sm:ml-16 text-gold drop-shadow-lg font-normal">Grand</span>
                    </h1>
                    
                    <div className="w-32 h-px bg-gold/40 my-6 mx-auto lg:mx-0"></div>

                    <p className="text-xs sm:text-sm text-text-sand/85 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
                      Enjoy a comfortable stay with great service, modern rooms, and everything you need for a relaxing trip. Tucked in the beautiful mountains of Coorg, we offer an easy way to unwind starting at only <strong className="text-gold font-normal p-0.5 bg-white/5 rounded border border-gold/10">₹1 per night</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                      <button
                        onClick={() => setView('rooms')}
                        className="w-full sm:w-auto px-8 py-3.5 bg-gold hover:bg-white text-black font-semibold text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-xl shadow-gold/5 flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <span>Choose Your Room</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setView('about')}
                        className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full text-xs uppercase tracking-widest transition duration-300 flex items-center justify-center space-x-2"
                      >
                        <span>About Our Hotel</span>
                      </button>
                    </div>

                  </div>

                  {/* Premium Showcase Image Block */}
                  <div id="hero-image-block" className="lg:col-span-6 w-full flex items-center justify-center lg:justify-end relative select-none animate-fadeIn">
                    <div className="w-full max-w-[420px] aspect-[4/5] bg-[#1a1c24] rounded-t-full relative overflow-hidden border border-white/10 shadow-2xl shadow-gold/5 group">
                      <img 
                        src="/src/assets/images/promide_coorg_residency_1780347321399.png" 
                        alt="Room view of Promide Grand resort in Coorg" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-955 via-transparent to-transparent"></div>
                      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                        <span className="text-[10px] uppercase tracking-[0.25em] text-text-sand/50 block mb-1">Our Location</span>
                        <h3 className="serif text-2xl italic text-gold drop-shadow-md">Coorg Plantation Belt</h3>
                        <div className="text-text-sand text-[9px] mt-1.5 font-mono tracking-[0.2em] font-light">
                          Karnataka, India
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* QUICK BOOKING BAR WIDGET */}
              <div className="relative z-20 max-w-5xl mx-auto px-4 -mt-10 sm:-mt-16 mb-20 animate-fadeIn">
                <div className="glass p-1.5 rounded-2xl flex flex-col md:flex-row items-center gap-1.5 shadow-2xl shadow-black/80">
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-xl overflow-hidden w-full">
                    
                    {/* Input 1: Room category selection */}
                    <div className="bg-navy-950/60 p-4 hover:bg-white/5 transition-colors duration-300">
                      <label className="block text-[9.5px] font-mono text-text-sand/40 uppercase tracking-[0.18em] mb-1">Room Type</label>
                      <div className="relative">
                        <select
                          value={heroRoomType}
                          onChange={(e) => setHeroRoomType(e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-white font-serif text-sm tracking-wide focus:outline-none cursor-pointer [&>option]:bg-navy-950 [&>option]:text-text-sand font-light"
                        >
                          <option value="Standard">Basic Room (₹1/Night)</option>
                          <option value="Deluxe">Deluxe Room (₹2/Night)</option>
                          <option value="Luxury Suite">Luxury Suite (₹3/Night)</option>
                        </select>
                      </div>
                    </div>

                    {/* Input 2: Check-in Date */}
                    <div className="bg-navy-950/60 p-4 hover:bg-white/5 transition-colors duration-300">
                      <label className="block text-[9.5px] font-mono text-text-sand/40 uppercase tracking-[0.18em] mb-1">Check In</label>
                      <input
                        type="date"
                        value={heroCheckIn}
                        onChange={(e) => setHeroCheckIn(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-white font-serif text-sm tracking-wide focus:outline-none cursor-pointer [color-scheme:dark] font-light"
                      />
                    </div>

                    {/* Input 3: Check-out Date */}
                    <div className="bg-navy-950/60 p-4 hover:bg-white/5 transition-colors duration-300">
                      <label className="block text-[9.5px] font-mono text-text-sand/40 uppercase tracking-[0.18em] mb-1">Check Out</label>
                      <input
                        type="date"
                        value={heroCheckOut}
                        onChange={(e) => setHeroCheckOut(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-white font-serif text-sm tracking-wide focus:outline-none cursor-pointer [color-scheme:dark] font-light"
                      />
                    </div>

                    {/* Input 4: Guest count */}
                    <div className="bg-navy-950/60 p-4 hover:bg-white/5 transition-colors duration-300">
                      <label className="block text-[9.5px] font-mono text-text-sand/40 uppercase tracking-[0.18em] mb-1">Guests</label>
                      <select
                        value={heroGuests}
                        onChange={(e) => setHeroGuests(Number(e.target.value))}
                        className="w-full bg-transparent border-none p-0 text-white font-serif text-sm tracking-wide focus:outline-none cursor-pointer [&>option]:bg-navy-950 [&>option]:text-text-sand font-light"
                      >
                        <option value="1">01 Guest</option>
                        <option value="2">02 Guests</option>
                        <option value="3">03 Guests</option>
                        <option value="4">04 Guests</option>
                      </select>
                    </div>

                  </div>
                  
                  <button
                    onClick={() => {
                      const targetRoom = rooms.find(r => r.roomType === heroRoomType);
                      if (targetRoom) {
                        handleInitiateBooking(targetRoom);
                      } else {
                        showNotification('Checking room list...', 'info');
                        fetchRooms().then(() => {
                          const rb = rooms.find(r => r.roomType === heroRoomType);
                          if (rb) handleInitiateBooking(rb);
                        });
                      }
                    }}
                    className="w-full md:w-auto h-full px-10 py-5 bg-gold hover:bg-[#e5c158] text-black font-bold uppercase text-[11px] tracking-[0.25em] transition-all rounded-xl md:rounded-l-none md:rounded-r-xl shrink-0 cursor-pointer text-center flex items-center justify-center min-h-[58px]"
                  >
                    Check Availability
                  </button>

                </div>
              </div>

              {/* SELECT THE ATMOSPHERE IMPERIAL THEME SHOWCASE */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
                <div className="glass rounded-3xl p-8 md:p-10 border border-gold/15 relative overflow-hidden">
                  
                  {/* Atmospheric background glow matching currently selected theme */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 transition-all duration-700 bg-gradient-to-tr from-gold/10 via-transparent to-transparent"></div>
                  
                  <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="text-center lg:text-left space-y-3.5 max-w-xl">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gold/10 border border-gold/25 rounded-full">
                        <Palette className="w-3.5 h-3.5 text-gold animate-bounce" />
                        <span className="text-[10px] font-mono text-gold uppercase tracking-widest">Imperial Theme Space</span>
                      </div>
                      <h2 className="serif text-3xl sm:text-4xl text-white font-light tracking-tight leading-tight">
                        Choose Your <span className="italic text-gold">Visual Theme</span>
                      </h2>
                      <p className="text-xs text-text-sand/70 leading-relaxed font-light">
                        Select a design theme below to immediately change the colors across our entire website. Pick whichever style makes you feel most comfortable.
                      </p>
                    </div>

                    {/* Interactive Selection Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:max-w-2xl shrink-0">
                      
                      {/* CARD 1: charcoal */}
                      <button
                        onClick={() => {
                          setTheme('charcoal');
                          showNotification('Theme changed to Royal Charcoal', 'success');
                        }}
                        className={`group relative text-left p-5 rounded-2xl transition-all duration-300 border cursor-pointer hover:-translate-y-1 ${
                          theme === 'charcoal'
                            ? 'bg-[#0a0c14]/90 border-gold shadow-lg shadow-gold/5'
                            : 'bg-navy-900/40 border-gold/10 hover:border-gold/30'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-2xl">👑</span>
                          {theme === 'charcoal' && (
                            <span className="text-[9px] font-mono text-gold border border-gold/30 bg-gold/10 px-2 py-0.5 rounded-full uppercase font-bold">
                              Selected
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif text-sm text-white tracking-wide group-hover:text-gold transition font-semibold">
                          Royal Charcoal
                        </h4>
                        <p className="text-[10.5px] text-text-sand/40 font-light mt-1.5 leading-snug">
                          A warm, pleasant dark theme offset with beautiful gold details.
                        </p>
                        <div className="mt-4 flex space-x-1">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#040508] border border-white/10"></span>
                          <span className="w-3.5 h-3.5 rounded-full bg-[#0a0c14] border border-white/10"></span>
                          <span className="w-3.5 h-3.5 rounded-full bg-[#d4af37] border border-white/10"></span>
                        </div>
                      </button>

                      {/* CARD 2: pine */}
                      <button
                        onClick={() => {
                          setTheme('pine');
                          showNotification('Theme changed to Highland Pine', 'success');
                        }}
                        className={`group relative text-left p-5 rounded-2xl transition-all duration-300 border cursor-pointer hover:-translate-y-1 ${
                          theme === 'pine'
                            ? 'bg-[#051410]/95 border-[#10B981] shadow-lg shadow-[#10B981]/5'
                            : 'bg-navy-900/40 border-[#10B981]/15 hover:border-[#10B981]/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-2xl">🌿</span>
                          {theme === 'pine' && (
                            <span className="text-[9px] font-mono text-[#10B981] border border-[#10B981]/30 bg-[#10B981]/10 px-2 py-0.5 rounded-full uppercase font-bold">
                              Selected
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif text-sm text-white tracking-wide group-hover:text-[#34D399] transition font-semibold">
                          Highland Pine
                        </h4>
                        <p className="text-[10.5px] text-text-sand/40 font-light mt-1.5 leading-snug">
                          Deep forest color palette inspired by nature and spruce trees of Coorg.
                        </p>
                        <div className="mt-4 flex space-x-1">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#051410] border border-white/10"></span>
                          <span className="w-3.5 h-3.5 rounded-full bg-[#0d221c] border border-white/10"></span>
                          <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] border border-white/10"></span>
                        </div>
                      </button>

                      {/* CARD 3: light */}
                      <button
                        onClick={() => {
                          setTheme('light');
                          showNotification('Theme changed to Sandalwood Light', 'success');
                        }}
                        className={`group relative text-left p-5 rounded-2xl transition-all duration-300 border cursor-pointer hover:-translate-y-1 ${
                          theme === 'light'
                            ? 'bg-[#faf8f5]/95 border-[#a07812] shadow-lg shadow-[#a07812]/5'
                            : 'bg-navy-900/40 border-gold/10 hover:border-gold/30'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-2xl">🏺</span>
                          {theme === 'light' && (
                            <span className="text-[9px] font-mono text-[#a07812] border border-[#a07812]/30 bg-[#a07812]/10 px-2 py-0.5 rounded-full uppercase font-bold">
                              Selected
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif text-sm text-slate-800 tracking-wide group-hover:text-[#a07812] transition font-semibold font-medium">
                          Sandalwood Light
                        </h4>
                        <p className="text-[10.5px] text-[#201b15]/60 font-light mt-1.5 leading-snug">
                          A bright, fresh morning look reflecting beautiful local woodwork.
                        </p>
                        <div className="mt-4 flex space-x-1">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#faf8f5] border border-black/10"></span>
                          <span className="w-3.5 h-3.5 rounded-full bg-[#f2ede4] border border-black/10"></span>
                          <span className="w-3.5 h-3.5 rounded-full bg-[#a07812] border border-black/10"></span>
                        </div>
                      </button>

                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION 1: WHY CHOOSE PROMIDE GRAND */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-xs font-semibold text-gold font-mono uppercase tracking-[0.25em]">Why Stay With Us</span>
                  <h2 className="serif text-3xl sm:text-5xl text-white font-light tracking-tight">Enjoy a Wonderful Travel Experience</h2>
                  <p className="text-xs sm:text-sm text-text-sand/65 leading-relaxed font-light">
                    We designed our resort to give you the ultimate sense of comfort and ease. Here are some of the popular reasons guests enjoy booking their holidays at our resort.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "High-Speed WiFi", desc: "Reliable internet in every room and garden area so you stay connected.", icon: Wifi },
                    { title: "24x7 Room Service", desc: "Our friendly kitchen staff is always ready to bring hot food right to your door.", icon: Coffee },
                    { title: "Swimming Pool", desc: "Unwind in our clean pool while taking in beautiful plantation views.", icon: Sparkles },
                    { title: "Spa & Wellness", desc: "Melt your stress away with comforting massages and traditional treatments.", icon: Heart },
                    { title: "Fitness Center", desc: "Keep up with your healthy routine in our fully equipped workout studio.", icon: Dumbbell },
                    { title: "Airport Pickup", desc: "We can arrange a friendly driver to meet you when you land at the airport.", icon: Car },
                    { title: "Free Parking", desc: "Safe, secure, and hassle-free spots for your vehicle during your stay.", icon: MapPin },
                    { title: "Business Lounge", desc: "A cozy, quiet workspace with printers and desks for taking quick calls.", icon: Briefcase }
                  ].map((feat, index) => {
                    const IconComp = feat.icon;
                    return (
                      <div key={index} className="glass p-6 rounded-2xl hover:border-gold/30 transition-all duration-300 space-y-3 group text-left">
                        <div className="w-10 h-10 rounded-lg bg-gold/5 flex items-center justify-center border border-gold/10 text-gold group-hover:bg-gold/10 transition">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <h3 className="serif text-lg font-light text-white group-hover:text-gold transition">{feat.title}</h3>
                        <p className="text-xs text-text-sand/60 leading-relaxed font-light">{feat.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: HOTEL AMENITIES GRID SECTION (16 major amenities) */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-xs font-semibold text-gold font-mono uppercase tracking-[0.25em]">Hotel Amenities</span>
                  <h2 className="serif text-3xl sm:text-5xl text-white font-light tracking-tight">Everything You Need for a Relaxing Stay</h2>
                  <p className="text-xs sm:text-sm text-text-sand/65 leading-relaxed font-light">
                    From fresh bedsheets to secure digital room access, we provide all the modern comforts you would expect from a trusted hotel.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Free WiFi", icon: Wifi },
                    { label: "Smart TV", icon: Tv },
                    { label: "Air Conditioning", icon: Wind },
                    { label: "Room Service", icon: Coffee },
                    { label: "Restaurant", icon: Utensils },
                    { label: "Breakfast Buffet", icon: Coffee },
                    { label: "Swimming Pool", icon: Sparkles },
                    { label: "Fitness Center", icon: Dumbbell },
                    { label: "Spa Services", icon: Heart },
                    { label: "Laundry Service", icon: CheckCircle },
                    { label: "Valet Parking", icon: Car },
                    { label: "Conference Hall", icon: Briefcase },
                    { label: "Airport Transfer", icon: Compass },
                    { label: "CCTV Security", icon: ShieldCheck },
                    { label: "Digital Access", icon: Key },
                    { label: "Concierge Service", icon: UserIcon }
                  ].map((amenity, index) => {
                    const AmenityIcon = amenity.icon;
                    return (
                      <div key={index} className="bg-navy-900/40 border border-gold/10 p-4 rounded-xl flex items-center space-x-3 hover:bg-navy-900/60 hover:border-gold/20 transition text-left">
                        <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center text-gold shrink-0">
                          <AmenityIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-text-sand/90">{amenity.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: GUEST EXPERIENCE HIGHLIGHT */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="glass rounded-3xl p-8 md:p-12 border border-gold/15 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  <div className="space-y-6 text-left">
                    <span className="text-xs font-semibold text-gold font-mono uppercase tracking-[0.25em]">Our Commitment</span>
                    <h2 className="serif text-3xl sm:text-5xl text-white font-light tracking-tight leading-tight">
                      A Better Way <br />
                      to Enjoy Your <span className="italic text-gold">Holidays</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-text-sand/70 leading-relaxed font-light">
                      We believe that a great hotel stay is about more than just a place to sleep. It is about feeling truly welcomed, supported, and cared for from the moment you reserve your dates to the day you check out.
                    </p>

                    <div className="space-y-4">
                      {[
                        { title: "Comfortable Rooms", desc: "Clean sheets, cozy beds, and quiet interiors for a peaceful sleep." },
                        { title: "Delicious Fresh Food", desc: "Hot meals prepared by our chefs using healthy, local ingredients." },
                        { title: "Fast and Free Internet", desc: "Whether you are catching up on emails or watching your favorite shows." },
                        { title: "Helpful and Kind Staff", desc: "Our team is always on call to bring extra towels, arrange cars, or offer tips." },
                        { title: "Easy Online Booking", desc: "Instantly reserve your favorite rooms with no confusing menus or processes." }
                      ].map((exp, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <div className="mt-1 flex items-center justify-center w-4 h-4 rounded-full bg-gold/20 text-gold text-[10px]">
                            ✓
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-xs uppercase font-semibold text-white tracking-wider">{exp.title}</h4>
                            <p className="text-[11px] text-text-sand/50 font-light">{exp.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gold/15 group">
                    <img 
                      src="/src/assets/images/promide_coorg_residency_1780347321399.png" 
                      alt="Comfortable garden dining setup at Promide Grand" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-955 via-transparent to-transparent/30"></div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: FEATURED ROOMS SECTION */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-xs font-semibold text-gold font-mono uppercase tracking-[0.25em]">Choose Your Space</span>
                  <h2 className="serif text-3xl sm:text-5xl text-white font-light tracking-tight">Our Comfortable Guest Bedrooms</h2>
                  <p className="text-xs sm:text-sm text-text-sand/65 leading-relaxed font-light">
                    Every room is clean, quiet, and fully equipped with modern conveniences. We only have 6 rooms total, guaranteeing personal service and zero noise.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      name: "Basic Room",
                      price: "₹1",
                      capacity: "2 Guests",
                      image: "/src/assets/images/promide_coorg_residency_1780347321399.png",
                      features: ["Queen Bed", "Free WiFi", "Smart TV", "Garden Views", "Hot Shower"]
                    },
                    {
                      name: "Deluxe Room",
                      price: "₹2",
                      capacity: "3 Guests",
                      image: "/src/assets/images/promide_coorg_residency_1780347321399.png",
                      features: ["King Bed", "Private Balcony", "Smart Room Control", "Coffee Maker", "Great Valley Views"]
                    },
                    {
                      name: "Luxury Suite",
                      price: "₹3",
                      capacity: "4 Guests",
                      image: "/src/assets/images/promide_coorg_residency_1780347321399.png",
                      features: ["Master King King Bed", "Living Area Room", "Luxury Bath Products", "Double Balcony", "Panoramic Views"]
                    }
                  ].map((roomCard, rIdx) => (
                    <div key={rIdx} className="glass rounded-2xl overflow-hidden border border-gold/15 flex flex-col hover:border-gold/30 transition group text-left">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img 
                          src={roomCard.image} 
                          alt={roomCard.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 right-4 bg-navy-950/80 backdrop-blur border border-gold/30 px-3 py-1 rounded-full text-[10.5px] font-mono text-gold uppercase tracking-wider">
                          {roomCard.capacity}
                        </div>
                      </div>

                      <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-baseline">
                            <h3 className="serif text-xl sm:text-2xl text-white">{roomCard.name}</h3>
                            <span className="text-gold font-serif text-lg font-bold">{roomCard.price} <span className="text-[10px] font-mono font-light text-text-sand/50">/ Night</span></span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {roomCard.features.map((feat, fIdx) => (
                              <span key={fIdx} className="text-[9.5px] font-mono text-text-sand/50 border border-white/5 bg-white/5 px-2 py-0.5 rounded-md">
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => setView('rooms')}
                          className="w-full py-3 bg-gold/10 hover:bg-gold border border-gold/25 hover:text-black hover:border-gold text-gold rounded-xl text-xs uppercase tracking-widest font-semibold transition cursor-pointer text-center"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: STATISTICS SECTION */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-navy-900/10 border-y border-gold/15 py-12">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    
                    <div>
                      <p className="font-serif text-4xl sm:text-5xl text-gold font-light tracking-tight">5000+</p>
                      <p className="text-[10.5px] font-mono text-text-sand/50 tracking-widest uppercase mt-2">Happy Guests</p>
                    </div>

                    <div>
                      <p className="font-serif text-4xl sm:text-5xl text-gold font-light tracking-tight">6</p>
                      <p className="text-[10.5px] font-mono text-text-sand/50 tracking-widest uppercase mt-2">Premium Rooms</p>
                    </div>

                    <div>
                      <p className="font-serif text-4xl sm:text-5xl text-gold font-light tracking-tight">24/7</p>
                      <p className="text-[10.5px] font-mono text-text-sand/50 tracking-widest uppercase mt-2">Service & Care</p>
                    </div>

                    <div>
                      <p className="font-serif text-4xl sm:text-5xl text-gold font-light tracking-tight">99%</p>
                      <p className="text-[10.5px] font-mono text-text-sand/50 tracking-widest uppercase mt-2">Guest Satisfaction</p>
                    </div>

                  </div>
                </div>
              </div>

              {/* SECTION 6: GUEST TESTIMONIALS SECTION */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-xs font-semibold text-gold font-mono uppercase tracking-[0.25em]">Guest Reviews</span>
                  <h2 className="serif text-3xl sm:text-5xl text-white font-light tracking-tight">What Our Customers Say</h2>
                  <p className="text-xs sm:text-sm text-text-sand/65 leading-relaxed font-light">
                    We feel incredibly grateful to host guests from all over the world. Here are a few honest reviews left by travelers who stayed at our resort.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      quote: "The rooms were extremely clean, and the staff was always ready to help with our questions. Having hot breakfast and fast internet made our weekend trip so easy and relaxing.",
                      author: "Rajesh K.",
                      stay: "Stayed in Deluxe Room"
                    },
                    {
                      quote: "Booking was simple and quick. We loved walking through the coffee estates in the morning and sitting by the clean pool. The service feels very genuine and simple.",
                      author: "Anjali S.",
                      stay: "Stayed in Luxury Suite"
                    },
                    {
                      quote: "Ideal place if you need a quiet spot to rest. Every room is independent so there is no door slamming or noise. We'll definitely book again during our next holiday.",
                      author: "Vikram R.",
                      stay: "Stayed in Basic Room"
                    }
                  ].map((review, rvIdx) => (
                    <div key={rvIdx} className="glass p-6 rounded-2xl flex flex-col justify-between text-left space-y-6 hover:border-gold/25 transition">
                      <p className="text-xs sm:text-sm text-text-sand/85 font-light leading-relaxed font-serif italic">
                        "{review.quote}"
                      </p>
                      <div className="space-y-1">
                        <strong className="text-gold text-xs uppercase tracking-wider block font-semibold">{review.author}</strong>
                        <span className="text-[10px] text-text-sand/40 font-mono tracking-wide">{review.stay}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 7: HOMEPAGE CTA (Headline: Ready for Your Next Stay?) */}
              <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="glass rounded-3xl p-8 md:p-12 border border-gold/15 bg-navy-900/40 relative overflow-hidden text-center md:text-left">
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-r from-gold/5 via-transparent to-gold/5"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    
                    <div className="space-y-3 max-w-xl">
                      <h2 className="serif text-3xl sm:text-4xl text-white font-light tracking-tight leading-tight">
                        Ready for Your Next Stay?
                      </h2>
                      <p className="text-xs sm:text-sm text-text-sand/70 leading-relaxed font-light">
                        Book your room in minutes and enjoy a comfortable stay at Promide Grand. We look forward to welcoming you soon.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => setView('rooms')}
                        className="w-full sm:w-auto px-8 py-3.5 bg-gold hover:bg-[#e5c158] text-black font-semibold text-xs uppercase tracking-widest rounded-full transition cursor-pointer text-center"
                      >
                        Book Now
                      </button>
                      <button
                        onClick={() => setView('rooms')}
                        className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full text-xs uppercase tracking-widest transition cursor-pointer text-center"
                      >
                        Explore Rooms
                      </button>
                    </div>

                  </div>
                </div>
              </div>

            </motion.section>
          )}

          {/* ==================== 2. ROOMS GRID VIEW ==================== */}
          {currentView === 'rooms' && (
            <motion.section
              id="view-rooms"
              key="rooms"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                  <span className="text-xs font-semibold text-gold font-mono uppercase tracking-[0.25em] block mb-2">Our Guest Rooms</span>
                  <h2 className="serif text-3xl sm:text-5xl text-white font-light tracking-tight">Simple Rooms & Clear Prices</h2>
                  <p className="text-xs sm:text-sm text-[#e0d8d0]/60 leading-relaxed max-w-xl font-light">
                    Browse our comfortable room types starting at only ₹1 per night. Every room is carefully prepared and kept sparkling clean for your arrival.
                  </p>
                </div>

                {/* Filter and limits bar */}
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block text-[9.5px] font-mono text-[#e0d8d0]/40 uppercase tracking-[0.18em] mb-1">Max Hourly Rate</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="glass bg-[#050508]/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gold uppercase tracking-wider focus:outline-none cursor-pointer font-light [&>option]:bg-[#050508] [&>option]:text-[#e0d8d0]"
                    >
                      <option value="all">Display All Suites</option>
                      <option value="Standard">Standard (₹1)</option>
                      <option value="Deluxe">Deluxe (₹2)</option>
                      <option value="Luxury Suite">Luxury Suite (₹3)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid representation list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {rooms
                  .filter(r => filterType === 'all' || r.roomType === filterType)
                  .map((room) => (
                    <div
                      key={room.id}
                      id={`room-card-${room.id}`}
                      className="glass rounded-2xl overflow-hidden flex flex-col group hover:border-gold/30 transition-all duration-300"
                    >
                      
                      {/* Image block */}
                      <div className="relative h-48 sm:h-56 overflow-hidden">
                        <img
                          src={room.images[0]}
                          alt={room.roomType}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full">
                          <span className="text-gold font-sans font-bold text-xs">₹{room.price} <span className="text-[9px] font-normal text-white/50">/ night</span></span>
                        </div>
                        <div className="absolute bottom-4 left-4 flex space-x-1">
                          <span className="text-[10px] bg-black/60 px-2.5 py-1 rounded backdrop-blur uppercase tracking-wider text-white">Capacity: {room.capacity} Guests</span>
                        </div>
                      </div>

                      {/* Info payload */}
                      <div className="p-6 flex-grow flex flex-col justify-between space-y-4 text-left">
                        <div>
                          <h3 className="serif text-lg sm:text-xl text-[#e0d8d0] font-light tracking-wide uppercase">{room.roomType} Suite</h3>
                          <p className="text-[10px] font-mono text-gold tracking-[0.2em] uppercase mb-2">Residency No. {room.roomNumber}</p>
                          <p className="text-xs text-[#e0d8d0]/60 leading-relaxed line-clamp-3 font-light">
                            {room.description}
                          </p>
                        </div>

                        {/* Listed Features items */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                          <span className="text-[9px] font-mono text-[#e0d8d0]/60 bg-white/5 px-2 py-0.5 rounded flex items-center space-x-1">
                            <Wifi className="w-2.5 h-2.5 text-gold mr-1" /> Wifi
                          </span>
                          <span className="text-[9px] font-mono text-[#e0d8d0]/60 bg-white/5 px-2 py-0.5 rounded flex items-center space-x-1">
                            <Tv className="w-2.5 h-2.5 text-gold mr-1" /> TV
                          </span>
                          {room.roomType !== 'Standard' && (
                            <span className="text-[9px] font-mono text-[#e0d8d0]/60 bg-white/5 px-2 py-0.5 rounded">
                              Glass Balcony
                            </span>
                          )}
                          {room.roomType === 'Luxury Suite' && (
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded">
                              Private Butler
                            </span>
                          )}
                        </div>

                        {/* CTAs */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <button
                            onClick={() => {
                              selectRoom(room);
                              setView('room-detail');
                            }}
                            className="py-2.5 border border-white/10 hover:border-gold px-3 text-center text-xs text-[#e0d8d0]/80 hover:text-white uppercase tracking-wider rounded-lg transition font-medium cursor-pointer"
                          >
                            Suite Specs
                          </button>
                          <button
                            onClick={() => handleInitiateBooking(room)}
                            className="py-2.5 bg-gold hover:bg-white text-black px-3 text-center text-xs font-bold uppercase tracking-widest rounded-lg transition cursor-pointer"
                          >
                            Book Room
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
              </div>
            </motion.section>
          )}

          {/* ==================== 3. ROOM DETAIL VIEW ==================== */}
          {currentView === 'room-detail' && selectedRoom && (
            <motion.section
              id="view-room-detail"
              key="room-detail"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
            >
              <button
                onClick={() => setView('rooms')}
                className="text-gold/80 hover:text-white text-xs font-mono uppercase tracking-widest flex items-center mb-6"
              >
                &larr; Return to Chamber Gallery
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Visual side Carousel */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="h-[280px] sm:h-[450px] rounded-2xl overflow-hidden border border-white/15">
                    <img
                      src={selectedRoom.images[0]}
                      alt={selectedRoom.roomType}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Secondary images grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRoom.images.map((img, idx) => (
                      <div key={idx} className="h-28 sm:h-36 rounded-xl overflow-hidden border border-white/10">
                        <img
                          src={img}
                          alt={`${selectedRoom.roomType} Alternative ${idx}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specs metadata details */}
                <div className="lg:col-span-5 glass rounded-2xl p-6 sm:p-8 space-y-6 text-left">
                  <div>
                    <span className="text-[10px] font-mono text-gold tracking-widest block uppercase mb-1">Luxury Suite Specs No. {selectedRoom.roomNumber}</span>
                    <h2 className="serif text-2xl sm:text-3xl font-light tracking-tight text-white uppercase">{selectedRoom.roomType} Workspace</h2>
                    <p className="text-xl font-bold text-gold mt-2">
                      ₹{selectedRoom.price} <span className="text-xs text-white/40 font-normal">/ Nightly Stay</span>
                    </p>
                  </div>

                  <p className="text-xs text-white/60 leading-relaxed font-sans">
                    {selectedRoom.description} Equipped with fully automated soundproofed glass panels facing the highlands, bringing natural tranquility directly to your bed with zero cabin pressure.
                  </p>

                  <div className="space-y-4 border-t border-b border-white/5 py-4">
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Included Premium Amenities</h4>
                    <div className="grid grid-cols-2 gap-3.5 text-xs text-white/80">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-gold rounded-full shrink-0"></span>
                        <span>Individual HVAC AC</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-gold rounded-full shrink-0"></span>
                        <span>Fast Satellite Wifi</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-gold rounded-full shrink-0"></span>
                        <span>65-inch Smart TV</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-gold rounded-full shrink-0"></span>
                        <span>Coorg Plantation Tea Set</span>
                      </div>
                      {selectedRoom.roomType !== 'Standard' && (
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-gold shrink-0"></span>
                          <span>Glass Sunbed Balcony</span>
                        </div>
                      )}
                      {selectedRoom.roomType === 'Luxury Suite' && (
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-emerald-400 shrink-0"></span>
                          <span>Butler & Hot Tub</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Immediate reservation details select widget */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8.5px] font-mono text-white/50 uppercase tracking-widest mb-1.5">Check In</label>
                        <input
                          type="date"
                          value={heroCheckIn}
                          onChange={(e) => setHeroCheckIn(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-gold/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[8.5px] font-mono text-white/50 uppercase tracking-widest mb-1.5">Check Out</label>
                        <input
                          type="date"
                          value={heroCheckOut}
                          onChange={(e) => setHeroCheckOut(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-gold/40"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleInitiateBooking(selectedRoom)}
                      className="w-full py-3.5 bg-gold hover:bg-white text-black font-semibold text-xs uppercase tracking-widest rounded-lg transition duration-200"
                    >
                      Process Royal Check-in
                    </button>
                  </div>

                </div>

              </div>
            </motion.section>
          )}

          {/* ==================== 4. BOOKING / CHECKOUT VIEW WITH RAZORPAY ==================== */}
          {currentView === 'booking' && selectedRoom && (
            <motion.section
              id="view-booking-checkout"
              key="booking-checkout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto px-4 py-20 text-left"
            >
              <h2 className="text-2xl sm:text-3xl text-white font-medium tracking-tight mb-8">Confirm Elite Reservation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Column 1: Verification Form details */}
                <div className="md:col-span-7 bg-navy-950/40 border border-white/5 rounded-2xl p-6 space-y-6">
                  <h3 className="text-sm font-semibold text-gold uppercase tracking-widest border-b border-white/5 pb-2">Guest Ledger Attributes</h3>
                  
                  <div className="space-y-4 text-xs text-white/80">
                    <div>
                      <p className="text-white/40 uppercase text-[9px] mb-1">Distinguished Guest</p>
                      <p className="bg-white/5 px-3 py-2.5 rounded border border-white/5 font-semibold">{currentUser?.name || 'Prestige Guest'}</p>
                    </div>
                    <div>
                      <p className="text-white/40 uppercase text-[9px] mb-1">Communications Dispatch</p>
                      <p className="bg-white/5 px-3 py-2.5 rounded border border-white/5 font-semibold">{currentUser?.email || 'user@promide.com'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/40 uppercase text-[9px] mb-1">Check In Schedule</p>
                        <input
                          type="date"
                          value={bookingIn}
                          onChange={(e) => setBookingIn(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold"
                        />
                      </div>
                      <div>
                        <p className="text-white/40 uppercase text-[9px] mb-1">Check Out Schedule</p>
                        <input
                          type="date"
                          value={bookingOut}
                          onChange={(e) => setBookingOut(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-white/40 uppercase text-[9px] mb-1">Accompanying Guests</p>
                      <select
                        value={bookingGuests}
                        onChange={(e) => setBookingGuests(Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold"
                      >
                        <option value="1">1 person</option>
                        <option value="2">2 persons</option>
                        <option value="3">3 persons</option>
                        <option value="4">4 persons</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Column 2: Booking Total Breakdown card */}
                <div className="md:col-span-5 bg-navy-950/80 border border-gold/20 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gold uppercase tracking-widest border-b border-white/5 pb-2">Rate Audit</h3>
                    
                    <div className="text-xs space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/50">Suit Selected:</span>
                        <span className="text-white font-semibold">{selectedRoom.roomType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Nightly Rate:</span>
                        <span className="text-gold font-bold">₹{selectedRoom.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Stay Duration:</span>
                        <span className="text-white font-semibold">{calculateDays(bookingIn, bookingOut)} nights</span>
                      </div>
                      
                      <div className="border-t border-white/10 pt-3 flex justify-between text-sm">
                        <span className="text-white font-medium">Grand Amount Total:</span>
                        <span className="text-gold font-extrabold">₹{selectedRoom.price * calculateDays(bookingIn, bookingOut)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={handleProceedToPayment}
                      disabled={isPaying}
                      className="w-full py-3.5 bg-gold hover:bg-white text-black font-extrabold text-xs uppercase tracking-widest rounded-lg transition-transform flex items-center justify-center space-x-2"
                    >
                      {isPaying ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CreditCard className="w-4 h-4 mr-2" />
                      )}
                      <span>Secure Payment via Razorpay</span>
                    </button>
                    <p className="text-[10px] text-white/40 text-center mt-2.5 font-mono">Date occupancy checker runs in background</p>
                  </div>
                </div>

              </div>
            </motion.section>
          )}

          {/* ==================== 5. LOGIN VIEW ==================== */}
          {currentView === 'login' && (
            <motion.section
              id="view-login"
              key="login"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="max-w-md mx-auto px-4 py-20 text-left"
            >
              <div className="bg-navy-950/80 rounded-2xl p-8 border border-gold/15 shadow-2xl space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-sans tracking-tight text-white uppercase">Grand Login</h2>
                  <p className="text-xs text-white/40">Step into the Promide Residency members ledger</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    login(emailText, passwordText).then(() => {
                      setEmailText('');
                      setPasswordText('');
                    }).catch(() => {});
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Registered Email Address</label>
                    <input
                      type="email"
                      required
                      value={emailText}
                      onChange={(e) => setEmailText(e.target.value)}
                      placeholder="e.g., guest@promide.com"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Secret Key Password</label>
                    <input
                      type="password"
                      required
                      value={passwordText}
                      onChange={(e) => setPasswordText(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none"
                    />
                  </div>

                  {/* Prepopulated credentials help text block to speed up testing workflows */}
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-1.5">
                    <p className="text-[9px] font-mono text-gold uppercase tracking-widest">Rapid Sandbox Logins</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-white/60">
                      <button
                        type="button"
                        onClick={() => {
                          setEmailText('user@promide.com');
                          setPasswordText('user123');
                        }}
                        className="py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 uppercase tracking-wide truncate"
                      >
                        Guest Login
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailText('admin@promide.com');
                          setPasswordText('admin123');
                        }}
                        className="py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 uppercase tracking-wide truncate"
                      >
                        Admin Login
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gold hover:bg-white text-black font-extrabold uppercase tracking-widest rounded-lg transition"
                  >
                    Authenticate Entry
                  </button>
                </form>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-[9px] text-white/30 uppercase tracking-widest font-mono">Google Credentials Integration</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <button
                  onClick={() => loginWithGoogle('shaileshhiremath074@gmail.com', 'Shailesh Hiremath')}
                  className="w-full py-3 bg-navy-900 hover:bg-white/5 text-white border border-white/15 hover:border-gold font-semibold rounded-lg text-xs uppercase tracking-widest transition flex items-center justify-center space-x-2"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                    alt="Google G logo"
                    className="w-4 h-4 mr-1"
                  />
                  <span>Sign In with Google Account</span>
                </button>

                <p className="text-[11px] text-center text-white/40 mt-3">
                  New to Promide Grand?{' '}
                  <button onClick={() => setView('register')} className="text-gold hover:underline">
                    Apply for Member Registry
                  </button>
                </p>
              </div>
            </motion.section>
          )}

          {/* ==================== 6. REGISTER VIEW ==================== */}
          {currentView === 'register' && (
            <motion.section
              id="view-register"
              key="register"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="max-w-md mx-auto px-4 py-20 text-left"
            >
              <div className="bg-navy-950/80 rounded-2xl p-8 border border-gold/15 shadow-2xl space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-sans tracking-tight text-white uppercase">Member Registry</h2>
                  <p className="text-xs text-white/40">Apply for exclusive access to Promide Grand benefits</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    register(nameText, emailText, passwordText).then(() => {
                      setNameText('');
                      setEmailText('');
                      setPasswordText('');
                    }).catch(() => {});
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Distinguished Full Name</label>
                    <input
                      type="text"
                      required
                      value={nameText}
                      onChange={(e) => setNameText(e.target.value)}
                      placeholder="e.g., Shailesh Hiremath"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Digital Mail Address</label>
                    <input
                      type="email"
                      required
                      value={emailText}
                      onChange={(e) => setEmailText(e.target.value)}
                      placeholder="e.g., shailesh@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Create Secure Password</label>
                    <input
                      type="password"
                      required
                      value={passwordText}
                      onChange={(e) => setPasswordText(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gold hover:bg-white text-black font-extrabold uppercase tracking-widest rounded-lg transition"
                  >
                    Submit Registry Request
                  </button>
                </form>

                <p className="text-[11px] text-center text-white/40 mt-3">
                  Have an account loaded?{' '}
                  <button onClick={() => setView('login')} className="text-gold hover:underline">
                    Authenticate Entry instead
                  </button>
                </p>
              </div>
            </motion.section>
          )}

          {/* ==================== 7. USER DASHBOARD / BOOKINGS / PROFILE ==================== */}
          {currentView === 'dashboard' && currentUser && (
            <motion.section
              id="view-dashboard"
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-left space-y-8"
            >
              
              {/* Profile Card Summary header */}
              <div className="bg-gradient-to-tr from-navy-950 to-navy-900 border border-gold/15 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full border border-gold/40 bg-gold/5 flex items-center justify-center text-gold">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gold tracking-widest uppercase block mb-0.5">MEMBER ACCOUNT SUMMARY</span>
                    <h2 className="text-xl sm:text-2xl text-white font-medium">{currentUser.name}</h2>
                    <p className="text-xs text-white/50">{currentUser.email} &bull; Member since {new Date(currentUser.createdAt).getFullYear()}</p>
                  </div>
                </div>

                <div className="flex space-x-2.5">
                  <span className="text-[10px] font-mono border border-emerald-500/20 text-emerald-400 bg-emerald-550/5 px-3 py-1.5 rounded uppercase tracking-wider">
                    Member Tier: Elite Platinum
                  </span>
                  <button
                    onClick={logout}
                    className="text-[10px] uppercase font-semibold text-red-400 border border-red-500/10 hover:bg-red-500/10 px-3 py-1.5 rounded"
                  >
                    Disassociate Session
                  </button>
                </div>
              </div>

              {/* Panels Segment */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Column 1: Bookings List */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-navy-950/40 border border-white/5 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-gold uppercase tracking-widest border-b border-white/5 pb-2">My Reservations</h3>
                    
                    {userBookings.length === 0 ? (
                      <div className="text-center py-10 space-y-3">
                        <p className="text-xs text-white/40 uppercase tracking-widest">No reservations booked on your ledger.</p>
                        <button
                          onClick={() => setView('rooms')}
                          className="px-5 py-2 bg-gold hover:bg-white text-black text-xs font-semibold uppercase tracking-wider rounded-full transition"
                        >
                          Book Royal Room Now
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left min-w-[500px]">
                          <thead>
                            <tr className="border-b border-white/10 text-white/40 font-mono text-[9px] uppercase tracking-wider">
                              <th className="py-2.5">Reservation Suite</th>
                              <th className="py-2.5">Check In</th>
                              <th className="py-2.5">Check Out</th>
                              <th className="py-2.5">Paid</th>
                              <th className="py-2.5">Status</th>
                              <th className="py-2.5 text-right">Ledger Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-white/80">
                            {userBookings.map((bk) => {
                              const bRoom = rooms.find(r => r.id === bk.roomId);
                              return (
                                <tr key={bk.id}>
                                  <td className="py-3">
                                    <p className="font-semibold">{bRoom?.roomType || 'Chamber'}</p>
                                    <p className="text-[10px] font-mono text-gold/80 block">No. {bRoom?.roomNumber || '101'}</p>
                                  </td>
                                  <td className="py-3 font-mono">{bk.checkInDate}</td>
                                  <td className="py-3 font-mono">{bk.checkOutDate}</td>
                                  <td className="py-3 font-semibold text-gold">₹{bk.totalAmount}</td>
                                  <td className="py-3">
                                    <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                                      bk.bookingStatus === 'confirmed' 
                                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                                        : bk.bookingStatus === 'cancelled'
                                        ? 'bg-red-950/40 text-red-400 border border-red-500/20'
                                        : 'bg-yellow-950/40 text-yellow-500 border border-yellow-500/20'
                                    }`}>
                                      {bk.bookingStatus}
                                    </span>
                                  </td>
                                  <td className="py-3 text-right space-x-2">
                                    {bk.bookingStatus === 'confirmed' && (
                                      <button
                                        onClick={() => handleDownloadInvoice(bk)}
                                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] uppercase font-semibold text-white tracking-wider rounded"
                                        title="Print Transaction Ledger Invoice"
                                      >
                                        Invoice
                                      </button>
                                    )}
                                    {bk.bookingStatus !== 'cancelled' && (
                                      <button
                                        onClick={() => cancelBooking(bk.id)}
                                        className="px-2.5 py-1 bg-red-950/15 border border-red-900/30 text-[10px] uppercase font-semibold text-red-400 hover:bg-red-500/20 rounded"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Profile adjustments */}
                <div className="lg:col-span-4 bg-navy-950/40 border border-white/5 rounded-2xl p-6 text-xs space-y-4">
                  <h3 className="text-sm font-semibold text-gold uppercase tracking-widest border-b border-white/5 pb-2">Profile Attributes</h3>
                  
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      showNotification('Profile updated successfully!', 'success');
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[8.5px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Registered Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[8.5px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Communications Email</label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full bg-stone-900/40 border border-white/5 rounded-lg p-2.5 text-white/40 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-[8.5px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Member Hotline Phone</label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gold hover:bg-white text-black font-semibold uppercase tracking-widest rounded-lg transition"
                    >
                      Lock Changes
                    </button>
                  </form>
                </div>

              </div>

              {/* ===================== IMPERIAL 5-STAR DIGITAL CONCIERGE PORTAL ===================== */}
              <div id="concierge-portal-block" className="glass rounded-2xl border border-gold/15 p-6 sm:p-8 space-y-8 mt-12 animate-fadeIn relative overflow-hidden">
                {/* Glowing Background Elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full filter blur-[100px] pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>

                <div className="border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-mono font-semibold">Imperial In-Suite Digital Portal</span>
                    </div>
                    <h3 className="serif text-2xl sm:text-4xl text-[#e0d8d0] font-light">Elevated 5-Star Guest Services</h3>
                    <p className="text-xs text-[#e0d8d0]/60 font-light">
                      Seamless, instant-touch requests. Savor exquisite in-room dining, order standard housekeeping mists, preheat wellness pools, or link to premium satellite networks.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 rounded">
                      Active Suite Link: ONLINE
                    </span>
                  </div>
                </div>

                {/* Main Hub Split Layout */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                  
                  {/* Left Column Services List */}
                  <div className="flex flex-col space-y-2 md:col-span-1 border-r border-white/5 pr-4 text-left">
                    <button
                      onClick={() => setGuestServiceTab('dining')}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition duration-300 text-left ${
                        guestServiceTab === 'dining'
                          ? 'bg-gold/10 text-gold border border-gold/30'
                          : 'bg-white/5 text-[#e0d8d0]/60 hover:bg-white/10 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Compass className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-medium">In-Room Dining</span>
                      </div>
                      <span className="text-[9px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-white/40">Gourmet</span>
                    </button>

                    <button
                      onClick={() => setGuestServiceTab('housekeeping')}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition duration-300 text-left ${
                        guestServiceTab === 'housekeeping'
                          ? 'bg-gold/10 text-gold border border-gold/30'
                          : 'bg-white/5 text-[#e0d8d0]/60 hover:bg-white/10 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-medium">Housekeeping</span>
                      </div>
                      <span className="text-[9px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-white/40">Clean</span>
                    </button>

                    <button
                      onClick={() => setGuestServiceTab('spa')}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition duration-300 text-left ${
                        guestServiceTab === 'spa'
                          ? 'bg-gold/10 text-gold border border-gold/30'
                          : 'bg-white/5 text-[#e0d8d0]/60 hover:bg-white/10 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-medium">Pool & Spa Lounge</span>
                      </div>
                      <span className="text-[9px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-white/40">Heated</span>
                    </button>

                    <button
                      onClick={() => setGuestServiceTab('wifi')}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition duration-300 text-left ${
                        guestServiceTab === 'wifi'
                          ? 'bg-gold/10 text-gold border border-gold/30'
                          : 'bg-white/5 text-[#e0d8d0]/60 hover:bg-white/10 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Wifi className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-medium">Satellite Net Link</span>
                      </div>
                      <span className="text-[9px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-white/40">Elite</span>
                    </button>
                  </div>

                  {/* Right Active Workspace Box */}
                  <div className="md:col-span-3 min-h-[300px] bg-[#050508]/60 border border-white/5 rounded-2xl p-6 relative">
                    
                    {/* TAB WORKSPACE 1: IN-ROOM DINING */}
                    {guestServiceTab === 'dining' && (
                      <div className="space-y-6">
                        <div className="flex justify-between border-b border-white/5 pb-3">
                          <h4 className="serif text-lg text-white">The Royal Dining Hall Menu</h4>
                          <span className="text-[10px] font-mono text-gold uppercase tracking-wider">Five-Star Culinary standards</span>
                        </div>
                        
                        {/* Food Menu selections */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* Item 1: Pandi Curry */}
                          <div className="border border-white/5 rounded-xl p-3 flex justify-between items-center bg-white/5 hover:border-gold/30 transition">
                            <div className="space-y-1">
                              <h5 className="text-xs font-semibold uppercase text-[#e0d8d0]">Estate Coorg Pandi Curry</h5>
                              <p className="text-[10px] text-[#e0d8d0]/50 font-light">Traditional slow-cooked highland spice luxury.</p>
                              <p className="text-xs font-semibold text-gold font-mono">₹1</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setFoodQuantities(prev => ({...prev, curry: Math.max(0, prev.curry - 1)}))}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-gold hover:text-black flex items-center justify-center text-xs font-bold font-mono transition"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-white font-mono w-4 text-center">{foodQuantities.curry}</span>
                              <button
                                onClick={() => setFoodQuantities(prev => ({...prev, curry: prev.curry + 1}))}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-gold hover:text-black flex items-center justify-center text-xs font-bold font-mono transition"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Item 2: Estate Espresso */}
                          <div className="border border-white/5 rounded-xl p-3 flex justify-between items-center bg-white/5 hover:border-gold/30 transition">
                            <div className="space-y-1">
                              <h5 className="text-xs font-semibold uppercase text-[#e0d8d0]">Sunset Arabica Brew</h5>
                              <p className="text-[10px] text-[#e0d8d0]/50 font-light">Freshly roasted beans from our proprietary estates.</p>
                              <p className="text-xs font-semibold text-gold font-mono">₹1</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setFoodQuantities(prev => ({...prev, coffee: Math.max(0, prev.coffee - 1)}))}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-gold hover:text-black flex items-center justify-center text-xs font-bold font-mono transition"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-white font-mono w-4 text-center">{foodQuantities.coffee}</span>
                              <button
                                onClick={() => setFoodQuantities(prev => ({...prev, coffee: prev.coffee + 1}))}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-gold hover:text-black flex items-center justify-center text-xs font-bold font-mono transition"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Item 3: Truffle Risotto */}
                          <div className="border border-white/5 rounded-xl p-3 flex justify-between items-center bg-white/5 hover:border-gold/30 transition">
                            <div className="space-y-1">
                              <h5 className="text-xs font-semibold uppercase text-[#e0d8d0]">Highlands Truffle Risotto</h5>
                              <p className="text-[10px] text-[#e0d8d0]/50 font-light">Exquisite slow risotto with harvested forest chanterelles.</p>
                              <p className="text-xs font-semibold text-gold font-mono">₹1</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setFoodQuantities(prev => ({...prev, risotto: Math.max(0, prev.risotto - 1)}))}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-gold hover:text-black flex items-center justify-center text-xs font-bold font-mono transition"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-white font-mono w-4 text-center">{foodQuantities.risotto}</span>
                              <button
                                onClick={() => setFoodQuantities(prev => ({...prev, risotto: prev.risotto + 1}))}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-gold hover:text-black flex items-center justify-center text-xs font-bold font-mono transition"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Item 4: Royal Kheer */}
                          <div className="border border-white/5 rounded-xl p-3 flex justify-between items-center bg-white/5 hover:border-gold/30 transition">
                            <div className="space-y-1">
                              <h5 className="text-xs font-semibold uppercase text-[#e0d8d0]">Royal Saffron Rose Kheer</h5>
                              <p className="text-[10px] text-[#e0d8d0]/50 font-light">With organic cardamom and luxurious 24k gold dusting.</p>
                              <p className="text-xs font-semibold text-gold font-mono">₹1</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setFoodQuantities(prev => ({...prev, kheer: Math.max(0, prev.kheer - 1)}))}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-gold hover:text-black flex items-center justify-center text-xs font-bold font-mono transition"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-white font-mono w-4 text-center">{foodQuantities.kheer}</span>
                              <button
                                onClick={() => setFoodQuantities(prev => ({...prev, kheer: prev.kheer + 1}))}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-gold hover:text-black flex items-center justify-center text-xs font-bold font-mono transition"
                              >
                                +
                              </button>
                            </div>
                          </div>

                        </div>

                        {/* Order Placement and Summary */}
                        <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-[#e0d8d0]/60 text-xs font-mono">
                            Total Order Price: <strong className="text-gold font-sans text-sm">₹{
                              (foodQuantities.curry * 1) + (foodQuantities.coffee * 1) + (foodQuantities.risotto * 1) + (foodQuantities.kheer * 1)
                            }</strong>
                          </div>
                          
                          <button
                            onClick={() => {
                              const total = (foodQuantities.curry * 1) + (foodQuantities.coffee * 1) + (foodQuantities.risotto * 1) + (foodQuantities.kheer * 1);
                              if (total === 0) {
                                showNotification('Select at least one high-luxury culinary item first!', 'error');
                                return;
                              }
                              // Form detail items string
                              const parts = [];
                              if (foodQuantities.curry > 0) parts.push(`${foodQuantities.curry}x Pandi Curry`);
                              if (foodQuantities.coffee > 0) parts.push(`${foodQuantities.coffee}x Sunset Arabica`);
                              if (foodQuantities.risotto > 0) parts.push(`${foodQuantities.risotto}x Truffle Risotto`);
                              if (foodQuantities.kheer > 0) parts.push(`${foodQuantities.kheer}x Royal Kheer`);
                              
                              const newOrder = {
                                id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
                                items: parts.join(', '),
                                cost: total,
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                status: 'Prepping (In Kitchen)'
                              };
                              setDiningOrders(prev => [newOrder, ...prev]);
                              setFoodQuantities({ curry: 0, coffee: 0, risotto: 0, kheer: 0 });
                              showNotification(`Order ${newOrder.id} successfully queued with the royal kitchen butler!`, 'success');

                              // Set simple delayed simulation to reflect completed prep
                              setTimeout(() => {
                                setDiningOrders(prev => 
                                  prev.map(o => o.id === newOrder.id ? {...o, status: 'Completed (Delivered)'} : o)
                                );
                                showNotification(`Your culinary order ${newOrder.id} has been delivered to your Suite! Savor the taste of Coorg.`, 'success');
                              }, 15000);
                            }}
                            className="bg-gold hover:bg-white text-black text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg transition"
                          >
                            Dispatch Chef Butler
                          </button>
                        </div>

                        {/* Recent Orders queue */}
                        {diningOrders.length > 0 && (
                          <div className="space-y-2.5 text-left">
                            <h5 className="text-[10px] font-mono text-[#e0d8d0]/40 uppercase tracking-widest">Active Suite Servings Ledger</h5>
                            <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1">
                              {diningOrders.map((ord) => (
                                <div key={ord.id} className="flex justify-between items-center text-xs border border-white/5 bg-white/5 rounded-lg px-4 py-2.5">
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-semibold text-white">{ord.id}</span>
                                      <span className="text-[10px] text-[#e0d8d0]/40 font-mono">at {ord.time}</span>
                                    </div>
                                    <p className="text-[11px] text-[#e0d8d0]/60 max-w-md line-clamp-1">{ord.items}</p>
                                  </div>
                                  <div className="text-right space-y-1">
                                    <p className="text-gold font-semibold font-mono text-[11px]">₹{ord.cost}</p>
                                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono bg-emerald-950/20 text-emerald-400 border border-emerald-500/25">
                                      {ord.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                    {/* TAB WORKSPACE 2: HOUSEKEEPING */}
                    {guestServiceTab === 'housekeeping' && (
                      <div className="space-y-6 text-left">
                        <div className="flex justify-between border-b border-white/5 pb-3">
                          <h4 className="serif text-lg text-white">Imperial Housekeeping & Turndown Requests</h4>
                          <span className="text-[10px] font-mono text-gold uppercase tracking-wider">Five-Star Clean Standards</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          <label className="flex items-start space-x-3 p-3 bg-white/5 border border-white/5 hover:border-gold/20 rounded-xl transition cursor-pointer">
                            <input
                              type="checkbox"
                              checked={housekeepingOptions.towels}
                              onChange={(e) => setHousekeepingOptions(prev => ({...prev, towels: e.target.checked}))}
                              className="mt-1 accent-gold"
                            />
                            <div className="space-y-0.5 text-left">
                              <span className="text-xs font-semibold text-white uppercase tracking-wider">Fresh Egyptian Bath Linens</span>
                              <p className="text-[10px] text-[#e0d8d0]/50 font-light">Replenished extra-heavy cotton towels & premium robes.</p>
                            </div>
                          </label>

                          <label className="flex items-start space-x-3 p-3 bg-white/5 border border-white/5 hover:border-gold/20 rounded-xl transition cursor-pointer">
                            <input
                              type="checkbox"
                              checked={housekeepingOptions.turnDown}
                              onChange={(e) => setHousekeepingOptions(prev => ({...prev, turnDown: e.target.checked}))}
                              className="mt-1 accent-gold"
                            />
                            <div className="space-y-0.5 text-left">
                              <span className="text-xs font-semibold text-white uppercase tracking-wider">Sandalwood Turndown Refresh</span>
                              <p className="text-[10px] text-[#e0d8d0]/50 font-light">Delicate bed smoothing, high-quality botanical incense lighting.</p>
                            </div>
                          </label>

                          <label className="flex items-start space-x-3 p-3 bg-white/5 border border-white/5 hover:border-gold/20 rounded-xl transition cursor-pointer">
                            <input
                              type="checkbox"
                              checked={housekeepingOptions.sanitize}
                              onChange={(e) => setHousekeepingOptions(prev => ({...prev, sanitize: e.target.checked}))}
                              className="mt-1 accent-gold"
                            />
                            <div className="space-y-0.5 text-left">
                              <span className="text-xs font-semibold text-white uppercase tracking-wider">Full Air Purify & Deep Sanitization</span>
                              <p className="text-[10px] text-[#e0d8d0]/50 font-light">Hypoallergenic ozone filters & clean tea tree spray mist.</p>
                            </div>
                          </label>

                          <label className="flex items-start space-x-3 p-3 bg-white/5 border border-white/5 hover:border-gold/20 rounded-xl transition cursor-pointer">
                            <input
                              type="checkbox"
                              checked={housekeepingOptions.lavender}
                              onChange={(e) => setHousekeepingOptions(prev => ({...prev, lavender: e.target.checked}))}
                              className="mt-1 accent-gold"
                            />
                            <div className="space-y-0.5 text-left">
                              <span className="text-xs font-semibold text-white uppercase tracking-wider">Bespoke Lavender Oil Diffuser</span>
                              <p className="text-[10px] text-[#e0d8d0]/50 font-light">Slow aromatic vapor release for sleep enhancement.</p>
                            </div>
                          </label>

                        </div>

                        {/* Order Placement and Progress Tracking */}
                        <div className="border-t border-white/5 pt-4 space-y-4">
                          
                          {housekeepingStatus === 'idle' ? (
                            <div className="flex justify-end">
                              <button
                                onClick={() => {
                                  setHousekeepingStatus('requested');
                                  setHousekeepingProgress(0);
                                  showNotification('Housekeeping request sent immediately to floor supervisor!', 'success');
                                  
                                  // Run progress bar simulation
                                  let current = 0;
                                  const interval = setInterval(() => {
                                    current += 20;
                                    setHousekeepingProgress(current);
                                    if (current === 40) {
                                      setHousekeepingStatus('accepted');
                                      showNotification('Staff assigned! Imperial Housekeeping butler on route.', 'success');
                                    }
                                    if (current >= 100) {
                                      clearInterval(interval);
                                      setHousekeepingStatus('completed');
                                      showNotification('Housekeeping completed flawlessly. Your suite has been refreshed!', 'success');
                                      setTimeout(() => {
                                        setHousekeepingStatus('idle');
                                        setHousekeepingProgress(0);
                                      }, 6000);
                                    }
                                  }, 3000);
                                }}
                                className="bg-gold hover:bg-white text-black text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg transition"
                              >
                                Summon Master Butler
                              </button>
                            </div>
                          ) : (
                            <div className="bg-[#050508]/60 border border-white/5 p-4 rounded-xl space-y-3">
                              <div className="flex justify-between items-center text-xs">
                                <div className="space-y-0.5 text-left">
                                  <span className="text-[10px] font-mono text-gold uppercase tracking-wider">Concierge Request Active Stay</span>
                                  <p className="font-semibold text-white">
                                    {housekeepingStatus === 'requested' && 'Queueing & Assigning Butler Staff...'}
                                    {housekeepingStatus === 'accepted' && 'Staff Inside Suite: Room Refurbishment in Progress'}
                                    {housekeepingStatus === 'completed' && 'Refurbishment Status: Complete & Sealed'}
                                  </p>
                                </div>
                                <span className="font-mono text-xs text-gold">{housekeepingProgress}%</span>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gold h-full transition-all duration-300"
                                  style={{ width: `${housekeepingProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                        </div>

                      </div>
                    )}

                    {/* TAB WORKSPACE 3: SPA & POOL WELLNESS */}
                    {guestServiceTab === 'spa' && (
                      <div className="space-y-6 text-left">
                        <div className="flex justify-between border-b border-white/5 pb-3">
                          <h4 className="serif text-lg text-white">Imperial Spa & Infinity Pool Scheduling</h4>
                          <span className="text-[10px] font-mono text-gold uppercase tracking-wider">Five-Star Wellness and Heat Control</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          <div>
                            <label className="block text-[8.5px] font-mono text-[#e0d8d0]/40 uppercase tracking-widest mb-1.5 font-light text-left">Service Treatment Select</label>
                            <select
                              value={spaService}
                              onChange={(e) => setSpaService(e.target.value)}
                              className="w-full bg-[#050508]/80 border border-white/10 rounded-lg p-2.5 text-xs text-[#e0d8d0] uppercase tracking-wider focus:outline-none"
                            >
                              <option value="Traditional Ayurvedic Massage (Abhyanga)">Traditional Ayurvedic Massage (Abhyanga)</option>
                              <option value="Hot Basalt Stone Deep Healing Therapy">Hot Basalt Stone Deep Healing Therapy</option>
                              <option value="Preheat Suite Private Infinity Plunge Pool">Preheat Suite Private Infinity Pool</option>
                              <option value="Botanical Forest Bathing Meditation Session">Botanical Forest Bathing Meditation Session</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[8.5px] font-mono text-[#e0d8d0]/40 uppercase tracking-widest mb-1.5 font-light text-left">Preferred Time Slot</label>
                            <select
                              value={spaSlot}
                              onChange={(e) => setSpaSlot(e.target.value)}
                              className="w-full bg-[#050508]/80 border border-white/10 rounded-lg p-2.5 text-xs text-[#e0d8d0] uppercase tracking-wider focus:outline-none"
                            >
                              <option value="09:00 AM - 10:30 AM">09:00 AM - 10:30 AM</option>
                              <option value="11:30 AM - 01:00 PM">11:30 AM - 01:00 PM</option>
                              <option value="03:00 PM - 04:30 PM">03:00 PM - 04:30 PM</option>
                              <option value="06:30 PM - 08:00 PM">06:30 PM - 08:00 PM (Primal Twilight)</option>
                            </select>
                          </div>

                        </div>

                        {/* Booking Controls */}
                        <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <p className="text-[10px] text-[#e0d8d0]/50 font-light max-w-sm text-left">
                            *Spa bookings are administered by certified royal masters within open-air glass pavilions in Coorg. Charges are catalogued directly as standard stay allowances (₹1/session).
                          </p>
                          <button
                            onClick={() => {
                              const newBooking = {
                                id: 'SPA-' + Math.floor(1000 + Math.random() * 9000),
                                service: spaService,
                                slot: spaSlot,
                                status: 'Confirmed & Cleared'
                              };
                              setActiveSpaBookings(prev => [newBooking, ...prev]);
                              showNotification(`Spa / Pool Reservation ${newBooking.id} confirmed immediately! Space secured.`, 'success');
                            }}
                            className="bg-gold hover:bg-white text-black text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg transition"
                          >
                            Lock Appointment
                          </button>
                        </div>

                        {/* Spa bookings ledger */}
                        {activeSpaBookings.length > 0 && (
                          <div className="space-y-2.5 text-left">
                            <h5 className="text-[10px] font-mono text-[#e0d8d0]/40 uppercase tracking-widest">Active Spa & Pool Appointments</h5>
                            <div className="space-y-2">
                              {activeSpaBookings.map((sb) => (
                                <div key={sb.id} className="flex justify-between items-center text-xs border border-white/5 bg-white/5 rounded-lg px-4 py-2.5">
                                  <div>
                                    <span className="font-semibold text-white font-mono">{sb.id}</span>
                                    <h5 className="text-xs uppercase text-gold font-medium">{sb.service}</h5>
                                    <p className="text-[10px] text-[#e0d8d0]/50 font-light">{sb.slot}</p>
                                  </div>
                                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950/45 text-emerald-400 border border-emerald-500/20">
                                    {sb.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                    {/* TAB WORKSPACE 4: SAT WiFi */}
                    {guestServiceTab === 'wifi' && (
                      <div className="space-y-6 text-left">
                        <div className="flex justify-between border-b border-white/5 pb-3">
                          <h4 className="serif text-lg text-[#e0d8d0]">High-Speed Space Link Satellite WiFi</h4>
                          <span className="text-[10px] font-mono text-gold uppercase tracking-wider">Dedicated Fiber Gateway</span>
                        </div>

                        {wifiState === 'inactive' && (
                          <div className="text-center py-8 space-y-4">
                            <p className="text-xs text-[#e0d8d0]/70 max-w-md mx-auto font-light">
                              Through our dedicated orbital satellite receiver array over the Coorg Mountains, we deliver gigabit capacities to remote workspaces. Ready to connect your devices?
                            </p>
                            <button
                              onClick={() => {
                                setWifiState('loading');
                                setWifiProgress(0);
                                showNotification('Initializing Space Link Satellite array handshake...', 'success');
                                
                                let current = 0;
                                const interval = setInterval(() => {
                                  current += 20;
                                  setWifiProgress(current);
                                  if (current >= 100) {
                                    clearInterval(interval);
                                    setWifiState('active');
                                    // Generate token and speed
                                    setWifiToken('PROMIDE_SAT_' + Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase());
                                    setWifiSpeed(Math.floor(380 + Math.random() * 80));
                                    showNotification('Satellite hand-shake successful! Premium connection launched.', 'success');
                                  }
                                }, 600);
                              }}
                              className="bg-gold hover:bg-white text-black text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg transition animate-pulse"
                            >
                              Ignite Satellite Net Link
                            </button>
                          </div>
                        )}

                        {wifiState === 'loading' && (
                          <div className="space-y-4 py-8">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-mono text-gold uppercase animate-pulse">Running orbital tracking calibration diagnostics...</span>
                              <span className="font-mono text-white/50">{wifiProgress}%</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                              <div className="bg-gold h-full" style={{ width: `${wifiProgress}%` }}></div>
                            </div>
                          </div>
                        )}

                        {wifiState === 'active' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center animate-fadeIn py-3">
                            <div className="space-y-4">
                              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-1.5">
                                <span className="text-[9px] font-mono text-emerald-400 block tracking-widest uppercase">Link Secured Flawlessly</span>
                                <h5 className="text-xs font-semibold text-white uppercase tracking-wider">Access WPA3 Key Credentials:</h5>
                                <div className="bg-black/60 border border-white/5 p-2 rounded text-center">
                                  <span className="font-mono text-sm text-gold tracking-widest select-all">{wifiToken}</span>
                                </div>
                              </div>

                              <p className="text-[10px] text-[#e0d8d0]/50 font-light font-mono">
                                SSid Node: <strong>Promide_Imperial_VIP_5G</strong>
                              </p>
                            </div>

                            <div className="glass p-4 rounded-xl border border-white/5 space-y-2 text-center">
                              <span className="text-[9.5px] font-mono text-[#e0d8d0]/40 uppercase tracking-widest">Active Latency Diagnostics</span>
                              <div className="text-3xl font-extrabold text-[#e0d8d0] font-sans">
                                {wifiSpeed} <span className="text-xs text-white/50 font-normal">Mbps</span>
                              </div>
                              <div className="w-full bg-white/5 h-1 rounded-full relative overflow-hidden">
                                <div className="absolute inset-y-0 left-0 bg-emerald-500 h-full rounded-full w-[85%] animate-pulse"></div>
                              </div>
                              <span className="text-[8.5px] font-mono text-emerald-400 block">Jitter Code: 1.4ms &bull; Payload Loss: 0%</span>
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>

                </div>

              </div>

          </motion.section>
        )}

          {currentView === 'about' && (
            <motion.section
              id="view-about"
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto px-4 py-20 text-left space-y-16 animate-fadeIn"
            >
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <span className="text-xs font-semibold text-gold font-mono uppercase tracking-[0.25em]">Our Story</span>
                <h2 className="serif text-4xl sm:text-6xl text-white font-light tracking-tight leading-none">A Simple, Welcoming Nature Escape</h2>
                <p className="text-xs sm:text-sm text-[#e0d8d0]/65 leading-relaxed font-light max-w-xl mx-auto">
                  Welcome to Promide Grand. We started our hotel with a simple goal: to provide a clean, peaceful place where travellers can rest and enjoy Coorg's beautiful green hills.
                </p>
              </div>

              {/* Deep Narrative Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                <div className="md:col-span-6 space-y-6">
                  <div className="space-y-2 border-l-2 border-gold pl-4">
                    <span className="text-[10px] font-mono text-gold tracking-widest uppercase">How It Started</span>
                    <h3 className="serif text-2xl sm:text-3xl font-light text-[#e0d8d0] tracking-wide">Built From the Ground Up</h3>
                  </div>
                  
                  <p className="text-sm text-[#e0d8d0]/80 leading-relaxed font-serif italic text-lg pr-4">
                    "We wanted to create a resort where anyone could come to sleep in peace, enjoy hot, delicious meals, and take walks among healthy coffee trees."
                  </p>
                  
                  <p className="text-xs sm:text-sm text-[#e0d8d0]/60 leading-relaxed font-light">
                    The foundation of our resort was built block-by-block using local stone and wood. We kept the old Coorg trees and nature trails exactly as they were, making sure you can enjoy peaceful morning walks right outside your room.
                  </p>
                  
                  <p className="text-xs sm:text-sm text-[#e0d8d0]/60 leading-relaxed font-light">
                    Whether you are travelling with family or just need some quiet time, we are here to make your trip comfortable. Our team is always on call to bring fresh coffee, help with airport drivers, or suggest the best local sights in Karnataka.
                  </p>
                </div>

                <div className="md:col-span-6 space-y-6">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                    <img
                      src="/src/assets/images/promide_coorg_residency_1780347321399.png"
                      alt="Karnataka mists at Promide Grand resort"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[#040508]/20 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                  
                  <div className="glass p-6 rounded-2xl border border-white/5 space-y-2">
                    <h4 className="font-mono text-gold text-xs uppercase tracking-wider">Enjoy the Local Coffee and Fresh Air</h4>
                    <p className="text-xs text-[#e0d8d0]/60 leading-relaxed font-light">
                      Wander across our beautiful 40-acre estate, sample freshly brewed local Coorg coffee, and enjoy a safe, reliable booking system where you never have to worry about overlapping dates.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* ==================== 9. CONTACT VIEW ==================== */}
          {currentView === 'contact' && (
            <motion.section
              id="view-contact"
              key="contact"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto px-4 py-20 text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-stretch">
                
                {/* Column 1: Details info */}
                <div className="md:col-span-5 bg-navy-955/60 border border-white/5 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-gold tracking-widest block uppercase">Grand Residency Helpline</span>
                    <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white uppercase">Reach the Resort Offices</h2>
                    <p className="text-xs text-white/50 leading-relaxed leading-loose">
                      Your luxurious requests are processed directly by our executive hosts. We answer member inquiries within two business hours.
                    </p>
                  </div>

                  <div className="space-y-3.5 text-xs text-[#e0d8d0]/60">
                    <div className="flex items-center space-x-2.5">
                      <Phone className="w-4 h-4 text-gold shrink-0" />
                      <span>Hotline: +91 91106 19177</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Mail className="w-4 h-4 text-gold shrink-0" />
                      <span>Email: shaileshhiremath074@gmail.com</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <MapPin className="w-4 h-4 text-gold shrink-0" />
                      <span>Coorg, scenic Karnataka, India</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Form */}
                <div className="md:col-span-7 bg-navy-950/80 border border-gold/15 rounded-2xl p-6 sm:p-8">
                  <h3 className="text-sm font-semibold text-gold uppercase tracking-widest border-b border-white/5 pb-2 mb-4">File Inquiry Form</h3>
                  
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitContact(contactName, contactEmail, contactMessage).then(() => {
                        setContactName('');
                        setContactEmail('');
                        setContactMessage('');
                      });
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block text-[8.5px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Distinguished Full Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Shailesh Hiremath"
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Communications Mail Address</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="e.g. shailesh@example.com"
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Luxurious Message</label>
                      <textarea
                        required
                        rows={4}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Describe your early check-in needs, spa treatments requests, or group reservation bookings..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gold hover:bg-white text-black font-extrabold uppercase tracking-widest rounded-lg transition"
                    >
                      Connect with Elite butler
                    </button>
                  </form>
                </div>

              </div>
            </motion.section>
          )}

          {/* ==================== 10. ADMIN DASHBOARD VIEW ==================== */}
          {currentView === 'admin' && currentUser?.role === 'admin' && (
            <motion.section
              id="view-admin"
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-left space-y-8"
            >
              
              {/* Executive visual cockpit introduction banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">Residency Administration Control</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl text-white font-medium">Executive Command Deck</h2>
                  <p className="text-xs text-white/50">Manage luxury suite assets, review date exclusions, oversee payments database transactions & message feeds.</p>
                </div>

                <div className="flex space-x-1 bg-white/5 border border-white/10 rounded-lg p-1">
                  {(['stats', 'rooms', 'bookings', 'users', 'messages'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setAdminTab(tab)}
                      className={`px-3 py-1.5 text-[10px] uppercase font-semibold tracking-wider rounded transition-all ${
                        adminTab === tab 
                          ? 'bg-gold text-black shadow'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* ==================== Command Tab Content ==================== */}
              {adminTab === 'stats' && (
                <div className="space-y-8 animate-fadeIn" id="admin-tab-stats">
                  
                  {/* Grid Metrics cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    
                    {/* Stat Card 1 */}
                    <div className="bg-navy-950/60 border border-white/5 rounded-2xl p-5 hover:border-gold/20 transition duration-300">
                      <Users className="w-5 h-5 text-gold mb-2" />
                      <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Total Registered</p>
                      <h4 className="text-2xl sm:text-3xl text-white font-semibold mt-1">{adminStats.totalUsers} <span className="text-xs text-white/50">Users</span></h4>
                      <span className="text-[9px] font-mono text-emerald-400">&uarr; +100% Secure Auth</span>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-navy-950/60 border border-white/5 rounded-2xl p-5 hover:border-gold/20 transition duration-300">
                      <BookOpen className="w-5 h-5 text-gold mb-2" />
                      <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Total Bookings</p>
                      <h4 className="text-2xl sm:text-3xl text-white font-semibold mt-1">{adminStats.totalBookings} <span className="text-xs text-white/50">Lodgers</span></h4>
                      <span className="text-[9px] font-mono text-gold">Transaction date Locked</span>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-navy-950/60 border border-white/5 rounded-2xl p-5 hover:border-gold/20 transition duration-300">
                      <IndianRupee className="w-5 h-5 text-gold mb-2" />
                      <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Running Revenue</p>
                      <h4 className="text-2xl sm:text-3xl text-gold font-semibold mt-1">₹{adminStats.revenue}</h4>
                      <span className="text-[9px] font-mono text-emerald-400">Captured on Razorpay</span>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="bg-navy-950/60 border border-white/5 rounded-2xl p-5 hover:border-gold/20 transition duration-300">
                      <Compass className="w-5 h-5 text-gold mb-2" />
                      <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Occupancy Rate</p>
                      <h4 className="text-2xl sm:text-3xl text-white font-semibold mt-1">{adminStats.occupancyRate}%</h4>
                      <span className="text-[9px] font-mono text-white/30">Ratio booked vs total</span>
                    </div>

                  </div>

                  {/* CUSTOM FLUID SVG GRAPH ANALYTICS CHARTS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    
                    {/* Occupancy Trends Graph */}
                    <div className="bg-navy-950/40 border border-white/5 rounded-2xl p-6 space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gold uppercase tracking-widest">Coorg Occupancy Trends</h4>
                        <p className="text-[10px] text-white/40">Real-time room occupancy curve ratio %</p>
                      </div>

                      <div className="h-44 flex items-end">
                        <svg className="w-full h-full" viewBox="0 0 400 150">
                          {/* Graph Gradients */}
                          <defs>
                            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.25"/>
                              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0"/>
                            </linearGradient>
                          </defs>

                          {/* Guidelines reference */}
                          <line x1="5" y1="120" x2="395" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                          <line x1="5" y1="60" x2="395" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />

                          {/* Data spline path */}
                          <path
                            d="M 10 130 Q 80 80, 150 95 T 290 40 T 390 20"
                            fill="none"
                            stroke="#d4af37"
                            strokeWidth="2.5"
                          />
                          {/* Area shading */}
                          <path
                            d="M 10 130 Q 80 80, 150 95 T 290 40 T 390 20 L 390 148 L 10 148 Z"
                            fill="url(#chartGlow)"
                          />

                          {/* Data dots */}
                          <circle cx="150" cy="95" r="4" fill="#ffffff" stroke="#d4af37" strokeWidth="1.5" />
                          <circle cx="290" cy="40" r="4" fill="#ffffff" stroke="#d4af37" strokeWidth="1.5" />
                          <circle cx="390" cy="20" r="4" fill="#ffffff" stroke="#d4af37" strokeWidth="1.5" />
                        </svg>
                      </div>

                      <div className="flex justify-between text-[10px] font-mono text-white/40">
                        <span>April (20%)</span>
                        <span>May (45%)</span>
                        <span>June (Active: 67%)</span>
                      </div>
                    </div>

                    {/* Revenue visual summary */}
                    <div className="bg-navy-950/40 border border-white/5 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-gold uppercase tracking-widest">Captured Yield Ledger</h4>
                        <p className="text-[10px] text-white/40">Revenue distribution by category (Rupees)</p>
                      </div>

                      <div className="space-y-3 pt-4">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-white/60">Standard Entry Room (₹1/night)</span>
                            <span className="text-gold font-semibold">₹1 (25%)</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gold rounded-full" style={{ width: '25%' }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-white/60">Deluxe Glass Suites (₹2/night)</span>
                            <span className="text-gold font-semibold">₹2 (50%)</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gold rounded-full" style={{ width: '50%' }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-white/60">Crown Luxury Suite (₹3/night)</span>
                            <span className="text-gold font-semibold">₹1 (25%)</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gold rounded-full" style={{ width: '25%' }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-3.5 flex items-center justify-between text-xs font-mono">
                        <p className="text-white/30 uppercase tracking-wider">Total Ledger Audited</p>
                        <p className="text-white font-bold">100% Captured verified</p>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* CRUD inventory management section */}
              {adminTab === 'rooms' && (
                <div className="space-y-4 animate-fadeIn" id="admin-tab-rooms">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gold uppercase tracking-widest">Inventory of Suites</h3>
                    <button
                      onClick={openAddRoomModal}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Suite Asset
                    </button>
                  </div>

                  <div className="overflow-x-auto bg-navy-950/40 border border-white/5 rounded-2xl p-6">
                    <table className="w-full text-xs text-left min-w-[500px]">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 font-mono text-[9px] uppercase tracking-wider">
                          <th className="py-2.5">Room Number</th>
                          <th className="py-2.5">Category</th>
                          <th className="py-2.5">Price Rate (INR)</th>
                          <th className="py-2.5">Capacity limit</th>
                          <th className="py-2.5">Availability Status</th>
                          <th className="py-2.5 text-right">Inventory Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/80">
                        {rooms.map((rm) => (
                          <tr key={rm.id}>
                            <td className="py-4 font-mono font-bold text-gold">Suite {rm.roomNumber}</td>
                            <td className="py-4 uppercase font-semibold">{rm.roomType}</td>
                            <td className="py-4 text-gold font-bold">₹{rm.price} / night</td>
                            <td className="py-4 font-semibold">{rm.capacity} Guests Max</td>
                            <td className="py-4">
                              <button
                                onClick={() => {
                                  const toggled = rm.availabilityStatus === 'available' ? 'unavailable' : 'available';
                                  updateRoom({ ...rm, availabilityStatus: toggled });
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono border ${
                                  rm.availabilityStatus === 'available'
                                    ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20'
                                    : 'bg-red-950/20 text-red-400 border-red-500/20'
                                }`}
                              >
                                {rm.availabilityStatus}
                              </button>
                            </td>
                            <td className="py-4 text-right space-x-2">
                              <button
                                onClick={() => openEditRoomModal(rm)}
                                className="p-1.5 rounded bg-white/5 border border-white/10 text-white/60 hover:text-white"
                                title="Modify Specifications"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteRoom(rm.id)}
                                className="p-1.5 rounded bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-500/20"
                                title="Decommission Room"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bookings override ledger section */}
              {adminTab === 'bookings' && (
                <div className="space-y-4 animate-fadeIn" id="admin-tab-bookings">
                  <h3 className="text-sm font-semibold text-gold uppercase tracking-widest">Central Reservations ledger</h3>
                  
                  <div className="overflow-x-auto bg-navy-950/40 border border-white/5 rounded-2xl p-6">
                    <table className="w-full text-xs text-left min-w-[650px]">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 font-mono text-[9px] uppercase tracking-wider">
                          <th className="py-2.5">Booking / Guest</th>
                          <th className="py-2.5">Room Detail</th>
                          <th className="py-2.5">Check In/Out Dates</th>
                          <th className="py-2.5">Total Cost</th>
                          <th className="py-2.5">Booking Status</th>
                          <th className="py-2.5">Payment Status</th>
                          <th className="py-2.5 text-right">Override Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/80">
                        {allBookings.map((bk) => {
                          const bkRoom = rooms.find(r => r.id === bk.roomId);
                          const bkUser = allUsers.find(u => u.id === bk.userId);
                          return (
                            <tr key={bk.id}>
                              <td className="py-4">
                                <p className="font-semibold">{bkUser?.name || 'Prestige Guest'}</p>
                                <p className="text-[10px] font-mono text-white/30 block">ID: {bk.id}</p>
                              </td>
                              <td className="py-4">
                                <p className="font-semibold">{bkRoom?.roomType || 'Chamber'}</p>
                                <p className="text-[10px] font-mono text-gold/80 block">No. {bkRoom?.roomNumber || '101'}</p>
                              </td>
                              <td className="py-4 font-mono">{bk.checkInDate} &bull; {bk.checkOutDate}</td>
                              <td className="py-4 font-bold text-gold">₹{bk.totalAmount}</td>
                              <td className="py-4 uppercase font-mono">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  bk.bookingStatus === 'confirmed' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                                }`}>
                                  {bk.bookingStatus}
                                </span>
                              </td>
                              <td className="py-4 uppercase font-mono text-white/70">
                                {bk.paymentStatus}
                              </td>
                              <td className="py-4 text-right space-x-2">
                                {bk.bookingStatus === 'pending' && (
                                  <button
                                    onClick={() => updateBookingStatus(bk.id, 'confirmed', 'completed')}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-[10px] text-white"
                                  >
                                    Approve Pay
                                  </button>
                                )}
                                {bk.bookingStatus !== 'cancelled' && (
                                  <button
                                    onClick={() => updateBookingStatus(bk.id, 'cancelled', 'refunded')}
                                    className="px-2 py-1 bg-red-950 border border-red-900 text-[10px] text-red-400 hover:bg-red-500/20 rounded"
                                  >
                                    De-auth
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Users Ledger */}
              {adminTab === 'users' && (
                <div className="space-y-4 animate-fadeIn" id="admin-tab-users flex">
                  <h3 className="text-sm font-semibold text-gold uppercase tracking-widest">Distinguished Users list</h3>
                  
                  <div className="overflow-x-auto bg-navy-950/40 border border-white/5 rounded-2xl p-6">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 font-mono text-[9px] uppercase tracking-wider">
                          <th className="py-2.5">User Identity</th>
                          <th className="py-2.5">Email Communications Address</th>
                          <th className="py-2.5">Authorized Role Privilege</th>
                          <th className="py-2.5">Ledger Inscription</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/80">
                        {allUsers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-white/40 uppercase tracking-widest text-[10px]">Retrieving member rosters...</td>
                          </tr>
                        ) : (
                          allUsers.map((u) => (
                            <tr key={u.id}>
                              <td className="py-3 font-semibold">{u.name}</td>
                              <td className="py-3 font-mono">{u.email}</td>
                              <td className="py-3 uppercase font-mono font-bold text-gold">{u.role}</td>
                              <td className="py-3 font-mono text-white/40">{new Date(u.createdAt).toLocaleString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Custom guest messages list inbox */}
              {adminTab === 'messages' && (
                <div className="space-y-4 animate-fadeIn animate-fadeIn flex flex-col" id="admin-tab-messages">
                  <h3 className="text-sm font-semibold text-gold uppercase tracking-widest">Inquiries Mailbox Feed</h3>
                  
                  <div className="space-y-4">
                    {allMessages.length === 0 ? (
                      <div className="bg-navy-950/40 border border-white/5 rounded-2xl p-8 text-center text-white/40 uppercase tracking-widest text-[10px]">Inquiries mailbox empty</div>
                    ) : (
                      allMessages.map((msg) => (
                        <div
                          key={msg.id}
                          id={`msg-${msg.id}`}
                          className="bg-navy-950/60 border border-white/5 rounded-2xl p-5 hover:border-gold/20 transition duration-300"
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/5 pb-2.5 mb-2.5">
                            <div>
                              <h4 className="text-sm font-semibold text-white">{msg.name}</h4>
                              <p className="text-[10px] font-mono text-gold">{msg.email}</p>
                            </div>
                            <span className="text-[10px] font-mono text-white/30">{new Date(msg.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-white/70 leading-relaxed font-sans">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </motion.section>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER ROW */}
      <Footer />

      {/* RAZORPAY SECURE ENCRYPTED CHECKOUT MODAL OVERLAY */}
      <AnimatePresence>
        {showRazorpay && activeBooking && selectedRoom && (
          <div
            id="razorpay-overlay-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-slate-900 border border-gold/45 shadow-2xl overflow-hidden flex flex-col text-left"
            >
              
              {/* Razorpay Banner Header */}
              <div className="p-4 bg-gradient-to-r from-blue-700 to-blue-800 flex items-center justify-between text-white border-b border-white/10">
                <div className="flex items-center space-x-1.5">
                  <div className="w-5 h-5 rounded bg-white flex items-center justify-center">
                    <span className="text-[11px] font-black text-blue-800">R</span>
                  </div>
                  <div>
                    <h3 className="text-[12px] font-mono font-bold uppercase tracking-wider">Razorpay Secure Checkout</h3>
                    <p className="text-[8px] font-mono text-white/60 tracking-wider">Secured 256-bit transactional encryption</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[9px] font-mono text-white/60">Grand Amount Pay</p>
                  <p className="text-sm font-extrabold text-gold font-sans">₹{activeBooking.totalAmount}</p>
                </div>
              </div>

              {/* Booking Info Box */}
              <div className="px-5 py-3 bg-navy-950 border-b border-white/5 flex items-center justify-between text-[11px]">
                <div>
                  <p className="text-white/50 font-medium">Suite Reserved: <strong className="text-white">{selectedRoom.roomType}</strong></p>
                  <p className="text-white/40 text-[9.5px]">Nights: {calculateDays(bookingIn, bookingOut)} | Guests Limit: {bookingGuests}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-mono font-semibold tracking-wider">Date Spot Reserved</p>
                </div>
              </div>

              {/* Payment Methods forms */}
              <div className="p-5 space-y-4 flex-grow text-xs">
                
                {/* Mode Select */}
                <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-4">
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2 px-1 rounded-lg border text-center transition-colors font-mono tracking-wider uppercase text-[9px] ${
                      paymentMethod === 'upi'
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500'
                        : 'bg-white/5 text-white/60 border-white/10'
                    }`}
                  >
                    BHIM UPI
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-1 rounded-lg border text-center transition-colors font-mono tracking-wider uppercase text-[9px] ${
                      paymentMethod === 'card'
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500'
                        : 'bg-white/5 text-white/60 border-white/10'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`py-2 px-1 rounded-lg border text-center transition-colors font-mono tracking-wider uppercase text-[9px] ${
                      paymentMethod === 'netbanking'
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500'
                        : 'bg-white/5 text-white/60 border-white/10'
                    }`}
                  >
                    Net Bank
                  </button>
                </div>

                {/* Mode 1: UPI Form */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div>
                      <label className="block text-[8.5px] font-mono text-white/40 uppercase mb-1">BHIM UPI Handler Address</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-xs font-mono"
                      />
                    </div>
                    <div className="p-3 bg-white/5 rounded border border-white/5 flex items-center space-x-2">
                      <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
                      <p className="text-[10px] text-white/60 leading-normal">
                        A virtual payload check-out dispatch will notify your mobile app instantly for secure PIN confirmation.
                      </p>
                    </div>
                  </div>
                )}

                {/* Mode 2: Card Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div>
                      <label className="block text-[8.5px] font-mono text-white/40 uppercase mb-1">Credit / Debit Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8.5px] font-mono text-white/40 uppercase mb-1">Expiry Code</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[8.5px] font-mono text-white/40 uppercase mb-1">CVV Pin</label>
                        <input
                          type="password"
                          value={cardCVV}
                          onChange={(e) => setCardCVV(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode 3: Net Banking list */}
                {paymentMethod === 'netbanking' && (
                  <div className="space-y-2 animate-fadeIn">
                    <label className="block text-[8.5px] font-mono text-white/40 uppercase mb-1">Choose Elite Banking House</label>
                    <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-xs uppercase tracking-wider focus:outline-none">
                      <option>HDFC Privilege Banking</option>
                      <option>ICICI Wealth Management</option>
                      <option>SBI Royal Accounts</option>
                      <option>Axis Burgundy Board</option>
                    </select>
                  </div>
                )}

              </div>

              {/* Control Action Buttons */}
              <div className="p-4 bg-navy-950 flex items-center justify-end space-x-2 border-t border-white/5">
                <button
                  onClick={() => setShowRazorpay(false)}
                  className="px-4 py-2 border border-white/10 hover:border-white/20 text-xs text-white/70 uppercase tracking-wild rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRazorpayVerifiedSubmit}
                  disabled={isPaying}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-extrabold text-xs uppercase tracking-wild rounded flex items-center justify-center space-x-1"
                >
                  {isPaying ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  )}
                  <span>Authorize ₹{activeBooking.totalAmount}</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN LEVEL SUITE ADD/EDIT MODAL OVERLAY */}
      <AnimatePresence>
        {showRoomModal && (
          <div
            id="admin-room-mutation-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-navy-950 border border-gold/45 shadow-2xl p-6 sm:p-8 space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-sm font-semibold text-gold uppercase tracking-widest leading-none">
                  {editingRoom ? 'Modify Suite Specifications' : 'Commission New Suite Asset'}
                </h3>
                <button
                  onClick={() => setShowRoomModal(false)}
                  className="text-white/45 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRoomFormSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8.5px] font-mono text-white/40 uppercase mb-1">Room Number *</label>
                    <input
                      type="text"
                      required
                      value={roomFormNo}
                      onChange={(e) => setRoomFormNo(e.target.value)}
                      placeholder="e.g. 302"
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[8.5px] font-mono text-white/40 uppercase mb-1">Room Category *</label>
                    <select
                      value={roomFormType}
                      onChange={(e) => setRoomFormType(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Luxury Suite">Luxury Suite</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8.5px] font-mono text-white/40 uppercase mb-1">Nightly Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={roomFormPrice}
                      onChange={(e) => setRoomFormPrice(e.target.value)}
                      placeholder="e.g. 3"
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[8.5px] font-mono text-white/40 uppercase mb-1">Capacity Limit *</label>
                    <input
                      type="number"
                      required
                      value={roomFormCap}
                      onChange={(e) => setRoomFormCap(e.target.value)}
                      placeholder="e.g. 4"
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8.5px] font-mono text-white/40 uppercase mb-1">Room Description</label>
                  <textarea
                    rows={4}
                    value={roomFormDesc}
                    onChange={(e) => setRoomFormDesc(e.target.value)}
                    placeholder="Enter visual specs of the room..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowRoomModal(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded uppercase text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gold hover:bg-white text-black font-semibold rounded uppercase text-[10px]"
                  >
                    Authorize Suite config
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIChatBot />

      <BackgroundParticles />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
