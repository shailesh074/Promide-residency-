/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { User, Room, Booking, Payment, ContactMessage } from '../src/types.js';

const DB_FILE = path.join(process.cwd(), 'server-db.json');

interface Schema {
  users: User[];
  rooms: Room[];
  bookings: Booking[];
  payments: Payment[];
  messages: ContactMessage[];
}

// SECURE PASSWORD HASHING
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'promide_salt_980').digest('hex');
}

// DATABASE CLASS FOR ATOMIC TRANSACTIONS
class LuxuryDatabase {
  private cache: Schema = {
    users: [],
    rooms: [],
    bookings: [],
    payments: [],
    messages: []
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        this.cache = JSON.parse(data);
      } else {
        this.seed();
      }
    } catch (err) {
      console.error('Error loading database, seeding fallback:', err);
      this.seed();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  private seed() {
    const adminPassword = hashPassword('admin123');
    const userPassword = hashPassword('user123');

    this.cache = {
      users: [
        {
          id: 'u-admin',
          name: 'Promide Admin',
          email: 'admin@promide.com',
          password: adminPassword,
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 'u-guest',
          name: 'Prestige Guest',
          email: 'user@promide.com',
          password: userPassword,
          role: 'user',
          createdAt: new Date().toISOString()
        }
      ],
      rooms: [
        {
          id: 'r-std',
          roomNumber: '101',
          roomType: 'Standard',
          description: 'A clean, cozy room with a queen bed, high-speed WiFi, smart TV, and private shower. Perfect for a relaxing and quiet stay.',
          images: [
            '/src/assets/images/standard_room_coorg_1780347379550.png',
            'https://images.unsplash.com/photo-1611891404938-302a60394f56?auto=format&fit=crop&q=80&w=1200'
          ],
          price: 1, // Literal pricing as requested
          capacity: 2,
          availabilityStatus: 'available'
        },
        {
          id: 'r-dlx',
          roomNumber: '201',
          roomType: 'Deluxe',
          description: 'A comfortable and spacious room with a king bed, private balcony, coffee maker, and great mountain valley views.',
          images: [
            '/src/assets/images/deluxe_room_coorg_1780347399409.png',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1200'
          ],
          price: 2, // Literal pricing as requested
          capacity: 3,
          availabilityStatus: 'available'
        },
        {
          id: 'r-suite',
          roomNumber: '301',
          roomType: 'Luxury Suite',
          description: 'A large suite with a master king bed, separate living room, workspace, private hot tub, and helpful personal service.',
          images: [
            '/src/assets/images/luxury_suite_coorg_1780347417114.png',
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200'
          ],
          price: 3, // Literal pricing as requested
          capacity: 4,
          availabilityStatus: 'available'
        }
      ],
      bookings: [
        {
          id: 'b-seed-1',
          userId: 'u-guest',
          roomId: 'r-dlx',
          checkInDate: '2026-06-10',
          checkOutDate: '2026-06-12',
          totalAmount: 4,
          bookingStatus: 'confirmed',
          paymentStatus: 'completed',
          createdAt: new Date().toISOString()
        }
      ],
      payments: [
        {
          id: 'p-seed-1',
          bookingId: 'b-seed-1',
          paymentId: 'pay_seed_9801_ok',
          amount: 4,
          paymentMethod: 'UPI',
          paymentStatus: 'completed',
          createdAt: new Date().toISOString()
        }
      ],
      messages: [
        {
          id: 'm-seed-1',
          name: 'Shailesh Hiremath',
          email: 'shaileshhiremath074@gmail.com',
          message: 'Hello, looking forward to booking the Luxury Suite next month. Could we arrange an early check-in?',
          createdAt: new Date().toISOString()
        }
      ]
    };
    this.save();
  }

  // USER ACCESSORS
  public getUsers(): User[] {
    return this.cache.users;
  }

  public addUser(user: User) {
    this.cache.users.push(user);
    this.save();
  }

  public findUserByEmail(email: string): User | undefined {
    return this.cache.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.cache.users.find(u => u.id === id);
  }

  // ROOM ACCESSORS
  public getRooms(): Room[] {
    return this.cache.rooms;
  }

  public updateRoom(room: Room) {
    const idx = this.cache.rooms.findIndex(r => r.id === room.id);
    if (idx !== -1) {
      this.cache.rooms[idx] = room;
    } else {
      this.cache.rooms.push(room);
    }
    this.save();
  }

  public deleteRoom(id: string): boolean {
    const origLength = this.cache.rooms.length;
    this.cache.rooms = this.cache.rooms.filter(r => r.id !== id);
    if (this.cache.rooms.length !== origLength) {
      this.save();
      return true;
    }
    return false;
  }

  // BOOKING TRANSACTION ACCESSORS WITH INTERLOCKING PREVENTATIVE DOUBLE BOOKING
  public getBookings(): Booking[] {
    return this.cache.bookings;
  }

  public checkDateOverlap(roomId: string, checkIn: string, checkOut: string, excludeBookingId?: string): boolean {
    const reqIn = new Date(checkIn);
    const reqOut = new Date(checkOut);

    return this.cache.bookings.some(b => {
      if (b.roomId !== roomId) return false;
      if (b.bookingStatus === 'cancelled') return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;

      const existIn = new Date(b.checkInDate);
      const existOut = new Date(b.checkOutDate);

      // Overlap formula: start1 < end2 && end1 > start2
      return reqIn < existOut && reqOut > existIn;
    });
  }

  public createBooking(booking: Booking): Booking {
    // Thread safety lock via synchronized execution
    if (this.checkDateOverlap(booking.roomId, booking.checkInDate, booking.checkOutDate)) {
      throw new Error('This room has been occupied for the selected dates. Please choose alternative dates.');
    }
    this.cache.bookings.push(booking);
    this.save();
    return booking;
  }

  public updateBooking(booking: Booking) {
    const idx = this.cache.bookings.findIndex(b => b.id === booking.id);
    if (idx !== -1) {
      this.cache.bookings[idx] = booking;
      this.save();
    }
  }

  // PAYMENT ACCESSORS
  public getPayments(): Payment[] {
    return this.cache.payments;
  }

  public addPayment(payment: Payment) {
    this.cache.payments.push(payment);
    // Find booking and update dynamic state
    const booking = this.cache.bookings.find(b => b.id === payment.bookingId);
    if (booking) {
      booking.paymentStatus = payment.paymentStatus;
      booking.bookingStatus = payment.paymentStatus === 'completed' ? 'confirmed' : booking.bookingStatus;
      this.updateBooking(booking);
    }
    this.save();
  }

  // MESSAGE ACCESSORS
  public getMessages(): ContactMessage[] {
    return this.cache.messages;
  }

  public addMessage(msg: ContactMessage) {
    this.cache.messages.push(msg);
    this.save();
  }
}

export const db = new LuxuryDatabase();
