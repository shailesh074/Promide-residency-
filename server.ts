/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import * as path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db, hashPassword } from './server/db.js';
import { Room, Booking, Payment, User, ContactMessage } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// LAZY-LOAD GEMINI CONCIERGE AS PER ROBUSTNESS GUIDELINES
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return ai;
}

// SIMPLE REVENUE AUDITING HELPERS FOR ADMIN
function getStats() {
  const users = db.getUsers();
  const rooms = db.getRooms();
  const bookings = db.getBookings().filter(b => b.bookingStatus !== 'cancelled');
  const payments = db.getPayments().filter(p => p.paymentStatus === 'completed');

  const totalUsers = users.length;
  const totalBookings = db.getBookings().length;
  const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

  // Occupancy rate = booked rooms active / total rooms (dummy preview)
  const totalRooms = rooms.length || 1;
  const occupiedCount = rooms.filter(r => 
    bookings.some(b => b.roomId === r.id && new Date(b.checkOutDate) >= new Date())
  ).length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  return {
    totalUsers,
    totalBookings,
    revenue,
    occupancyRate
  };
}

// MIDDLEWARE FOR JWT SIGNATURE SIMULATION
function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    // Basic verification format: "token_[userId]_[role]"
    const parts = token.split('_');
    if (parts.length < 3 || parts[0] !== 'token') {
      res.status(401).json({ error: 'Invalid authentication token' });
      return;
    }
    const userId = parts[1];
    const user = db.findUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'User session expired' });
      return;
    }
    // inject user context
    (req as any).user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user as User;
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

// ==================== AUTH API ====================

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Please enter all fields' });
    return;
  }

  if (db.findUserByEmail(email)) {
    res.status(400).json({ error: 'Email has already been registered' });
    return;
  }

  const newUser: User = {
    id: 'u-' + Math.random().toString(36).substring(2, 9),
    name,
    email,
    password: hashPassword(password),
    role: 'user',
    createdAt: new Date().toISOString()
  };

  db.addUser(newUser);

  // Generate token: token_id_role
  const token = `token_${newUser.id}_${newUser.role}`;
  
  const { password: _, ...userSafe } = newUser;
  res.status(201).json({ user: userSafe, token });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Please enter email and password' });
    return;
  }

  const user = db.findUserByEmail(email);
  if (!user || user.password !== hashPassword(password)) {
    res.status(400).json({ error: 'Invalid login credentials' });
    return;
  }

  const token = `token_${user.id}_${user.role}`;
  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe, token });
});

// MOCK OAUTH LOGIN Flow
app.post('/api/auth/google', (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    res.status(400).json({ error: 'Provider fields incomplete' });
    return;
  }

  let user = db.findUserByEmail(email);
  if (!user) {
    user = {
      id: 'u-g-' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    db.addUser(user);
  }

  const token = `token_${user.id}_${user.role}`;
  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe, token });
});

app.get('/api/auth/user', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe });
});


// ==================== ROOMS API ====================

app.get('/api/rooms', (req, res) => {
  res.json(db.getRooms());
});

app.post('/api/rooms', authenticateUser, requireAdmin, (req, res) => {
  const { roomNumber, roomType, description, images, price, capacity } = req.body;
  
  if (!roomNumber || !roomType || !price || !capacity) {
    res.status(400).json({ error: 'Incomplete room specification data' });
    return;
  }

  const newRoom: Room = {
    id: 'r-' + Math.random().toString(36).substring(2, 9),
    roomNumber,
    roomType,
    description: description || 'A beautifully premium luxury residency room.',
    images: images && images.length ? images : ['https://images.unsplash.com/photo-1611891404938-302a60394f56?auto=format&fit=crop&q=80&w=1200'],
    price: Number(price),
    capacity: Number(capacity),
    availabilityStatus: 'available'
  };

  db.updateRoom(newRoom);
  res.status(201).json(newRoom);
});

app.put('/api/rooms/:id', authenticateUser, requireAdmin, (req, res) => {
  const { id } = req.params;
  const rooms = db.getRooms();
  const room = rooms.find(r => r.id === id);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  const updatedRoom = { ...room, ...req.body };
  db.updateRoom(updatedRoom);
  res.json(updatedRoom);
});

app.delete('/api/rooms/:id', authenticateUser, requireAdmin, (req, res) => {
  const { id } = req.params;
  const success = db.deleteRoom(id);
  if (success) {
    res.json({ message: 'Room deleted successfully' });
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});


// ==================== BOOKINGS API ====================

app.get('/api/bookings', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  const bookings = db.getBookings();
  
  if (user.role === 'admin') {
    res.json(bookings);
  } else {
    res.json(bookings.filter(b => b.userId === user.id));
  }
});

app.post('/api/bookings', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  const { roomId, checkInDate, checkOutDate, totalAmount } = req.body;

  if (!roomId || !checkInDate || !checkOutDate || totalAmount === undefined) {
    res.status(400).json({ error: 'Parameters check-in, check-out, and total amount are required' });
    return;
  }

  // Prevent double booking logic (synchronized transaction equivalent in Single-Thread Node)
  try {
    const newBooking: Booking = {
      id: 'b-' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      roomId,
      checkInDate,
      checkOutDate,
      totalAmount: Number(totalAmount),
      bookingStatus: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    const booked = db.createBooking(newBooking);
    res.status(201).json(booked);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Cancel a booking
app.post('/api/bookings/:id/cancel', authenticateUser, (req, res) => {
  const user = (req as any).user as User;
  const bookings = db.getBookings();
  const booking = bookings.find(b => b.id === req.params.id);

  if (!booking) {
    res.status(404).json({ error: 'Booking catalog entry not found' });
    return;
  }

  // Allow either the booking user, or an administrator
  if (booking.userId !== user.id && user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied: cannot cancel others reservations' });
    return;
  }

  booking.bookingStatus = 'cancelled';
  db.updateBooking(booking);
  res.json({ message: 'Reservation successfully cancelled', booking });
});

// Approve a cancellation or manage status overrides (Admin Only)
app.post('/api/bookings/:id/status', authenticateUser, requireAdmin, (req, res) => {
  const { bookingStatus, paymentStatus } = req.body;
  const bookings = db.getBookings();
  const booking = bookings.find(b => b.id === req.params.id);

  if (!booking) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }

  if (bookingStatus) booking.bookingStatus = bookingStatus;
  if (paymentStatus) booking.paymentStatus = paymentStatus;

  db.updateBooking(booking);
  res.json(booking);
});


// ==================== PAYMENTS API ====================

app.post('/api/payments/order', authenticateUser, (req, res) => {
  const { bookingId, amount } = req.body;
  if (!bookingId || !amount) {
    res.status(400).json({ error: 'Booking and Amount specifications required' });
    return;
  }

  // Razorpay simulated order object response matching Razorpay Checkout schema specifications
  const razorpayOrderId = 'order_rzp_' + crypto.randomBytes(8).toString('hex');
  res.json({
    id: razorpayOrderId,
    entity: 'order',
    amount: amount * 100, // Razorpay works in paise (amount * 100)
    currency: 'INR',
    receipt: 'rcpt_' + bookingId,
    status: 'created'
  });
});

app.post('/api/payments/complete', authenticateUser, (req, res) => {
  const { bookingId, paymentId, amount, paymentMethod } = req.body;
  
  if (!bookingId || !paymentId || amount === undefined || !paymentMethod) {
    res.status(400).json({ error: 'Payment context parameters required' });
    return;
  }

  const paymentRecord: Payment = {
    id: 'p-' + Math.random().toString(36).substring(2, 9),
    bookingId,
    paymentId,
    amount: Number(amount),
    paymentMethod,
    paymentStatus: 'completed',
    createdAt: new Date().toISOString()
  };

  db.addPayment(paymentRecord);
  res.status(201).json({ message: 'Payment successfully captured and confirmed', payment: paymentRecord });
});

app.get('/api/payments', authenticateUser, requireAdmin, (req, res) => {
  res.json(db.getPayments());
});


// ==================== EMAILS / NOTIFICATIONS (Nodemailer Logic Simulation) ====================

app.post('/api/notifications/invoice', authenticateUser, (req, res) => {
  const { bookingId } = req.body;
  const bookings = db.getBookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) {
    res.status(404).json({ error: 'Booking entry for confirmation email not found' });
    return;
  }

  const user = db.findUserById(booking.userId);
  const room = db.getRooms().find(r => r.id === booking.roomId);

  // Real-world simulated log confirming email sending
  console.log(`[NODEMAILER] Email dispatch to: ${user?.email || 'guest@promide.com'}`);
  console.log(`[NODEMAILER] Invoice subject: Promide Residency Booking Confirmation - ID: ${booking.id}`);
  console.log(`[NODEMAILER] Invoice details: Room ${room?.roomType} (${room?.roomNumber}), Price: ₹${booking.totalAmount}`);

  res.json({
    message: `A secure transactional confirmation invoice has been successfully sent to ${user?.email || 'your email'}!`,
    sentTo: user?.email || 'your email',
    subject: 'Booking Invoice Recipient Confirmation'
  });
});


// ==================== CONTACT MESSAGES API ====================

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'All fields are strictly required for contact validation' });
    return;
  }

  const newMessage: ContactMessage = {
    id: 'm-' + Math.random().toString(36).substring(2, 9),
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  };

  db.addMessage(newMessage);
  res.status(201).json({ message: 'Thank you. Your message has been safely received by our resort office.', data: newMessage });
});

app.get('/api/messages', authenticateUser, requireAdmin, (req, res) => {
  res.json(db.getMessages());
});


// ==================== ADMIN METRICS ====================

app.get('/api/admin/stats', authenticateUser, requireAdmin, (req, res) => {
  res.json(getStats());
});


// ==================== AI GRAND CONCIERGE CHAT API (GEMINI) ====================

app.post('/api/gemini/chat', async (req, res) => {
  const { history, message } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Prompt message is required' });
    return;
  }

  const client = getGeminiClient();
  const roomsStr = JSON.stringify(db.getRooms(), null, 2);

  const systemInstruction = `You are "Sovereign Concierge", the elite AI Grand Hospitality Representative at Promide Residency in Scenic Karnataka, India. 
Your character is highly elegant, incredibly welcoming, and deeply knowledgeable about the resort. 

Resort Information:
- Name: Promide Residency (also known as Promide Grand)
- Location: The picturesque lush landscapes of Karnataka, offering mountain views, misty mornings, nearby coffee estate trails, and authentic luxury.
- Features: Infinity pool with glass edge, ayurvedic spa, glass balconies, star-lit luxury dining, butler service, personalized plantation tours, and a private helicopter pad.

Rooms Available:
${roomsStr}

Booking Guidelines:
- Standard Room is ₹1 per night. (Includes AC, WiFi, TV) - Room 101.
- Deluxe Room is ₹2 per night. (AC, WiFi, TV, Balcony with estate view) - Room 201.
- Luxury Suite is ₹3 per night. (AC, WiFi, TV, Balcony, independent Living Area, private butler, luxury welcome box) - Room 301.

Your role:
1. Help guests explore standard room options, recommend the Deluxe Room or Luxury Suite based on their budget and capacity desires.
2. Maintain a friendly and highly elegant tone. Mention that rates are incredibly premium starting at ₹1-3 per night.
3. Keep answers concise, helpful, and luxury hospitality-focused.
4. If they ask about local landmarks in Karnataka structural settings, mention Abbey Falls, Jog Falls, Western Ghats hiking trails, or ancient Hoysala architecture tours we organize.
5. Emphasize that check-in can be processed instantly through our Reservation Board.

Answer the guest warmly.`;

  if (!client) {
    // If API Key is missing, provide a beautifully crafted placeholder elite response that explains reservation features
    const fallbackAnswers = [
      `Welcome to Promide Residency, where Karnataka's natural royalty meets modern comfort. I am operating in elegance standby. For your comfort, we offer our beautiful Standard Room (Room 101, ₹1/night), the beautiful glass-balcony Deluxe Room (Room 201, ₹2/night), and our majestic Crown Luxury Suite (Room 301, ₹3/night) which features butler treatment. You can book them immediately through our Reservations widget above!`,
      `Greetings. It is a pleasure to welcome you to Promide Residency. Whether you are looking to explore our Standard Room, experience the majestic mountain breeze from our Deluxe scenic balcony, or experience the ultimate indulgence in our Luxury Suite, we are pleased to assist. Please select any room from our elite suite and book with instant confirmation.`,
      `Welcome back. As your Promide Grand concierge representative, I recommend our private-butler Luxury Suite at ₹3 per night for a magnificent family holiday in Karnataka. Would you like me to guide you to the Booking panel?`
    ];
    const chosenFallback = fallbackAnswers[Math.floor(Math.random() * fallbackAnswers.length)];
    res.json({ text: chosenFallback });
    return;
  }

  try {
    const formattedHistory = (history || []).map((ch: any) => ({
      role: ch.sender === 'user' ? 'user' : 'model',
      parts: [{ text: ch.text }]
    }));

    // Generate content using official standard SDK
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    });

    const responseText = response.text || "I am at your absolute service. How may I prepare your check-in layout?";
    res.json({ text: responseText });
  } catch (err: any) {
    console.error('Error in Gemini Concierge service:', err);
    res.status(500).json({ error: 'Our grand concierge service experienced a small setback. Please retry shortly.' });
  }
});


// ==================== APP BOOTING AND VITE MIDDLEWARE ====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Promide Residency is live on http://0.0.0.0:${PORT}`);
  });
}

startServer();
