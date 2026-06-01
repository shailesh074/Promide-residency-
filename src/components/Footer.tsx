/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext.js';
import { Mail, Phone, MapPin, ExternalLink, Globe, Sparkles, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setView } = useApp();

  const handleWhatsApp = () => {
    const phoneNumber = '9110619177'; // Owner's WhatsApp helpline
    const message = encodeURIComponent("Hello Shailesh, I am interested in booking an elite suite at Promide Residency Coorg. Could you please check availability?");
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank', 'noreferrer,noopener');
  };

  return (
    <footer
      id="main-nav-footer"
      className="relative z-10 bg-navy-950 border-t border-gold/10 pt-16 pb-8 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Column 1: Brand Pitch */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-widest text-gold uppercase">PROMIDE GRAND</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              A friendly, peaceful place in the mountains of Coorg where you can relax, recharge, and enjoy your trip. We do our best to make every guest feel at home.
            </p>
            <div className="flex space-x-2.5">
              <span className="text-[10px] font-mono border border-gold/20 text-gold px-2 py-1 rounded bg-gold/5 uppercase tracking-wider">Stay Comfortable. Stay Promide.</span>
            </div>
          </div>

          {/* Column 2: Quick Links Switches */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-gold uppercase tracking-widest font-sans">Reservations</h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>
                <button onClick={() => setView('rooms')} className="hover:text-gold hover:underline transition">
                  Basic Room (₹1/night)
                </button>
              </li>
              <li>
                <button onClick={() => setView('rooms')} className="hover:text-gold hover:underline transition">
                  Deluxe Room (₹2/night)
                </button>
              </li>
              <li>
                <button onClick={() => setView('rooms')} className="hover:text-gold hover:underline transition">
                  Luxury Suite (₹3/night)
                </button>
              </li>
              <li>
                <button onClick={() => setView('about')} className="hover:text-gold hover:underline transition">
                  Airport Pickups & Parking
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Destination Help */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-gold uppercase tracking-widest font-sans">Inside the Resort</h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>
                <button onClick={() => setView('about')} className="hover:text-gold hover:underline transition">
                  Coffee Walks & Estate Map
                </button>
              </li>
              <li>
                <button onClick={() => setView('about')} className="hover:text-gold hover:underline transition">
                  Spa & Massage Center
                </button>
              </li>
              <li>
                <button onClick={() => setView('contact')} className="hover:text-gold hover:underline transition">
                  Meeting Rooms & Events
                </button>
              </li>
              <li>
                <button onClick={() => setView('about')} className="hover:text-gold hover:underline transition">
                  Our Multi-Cuisine Restaurant
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Concrete Address Contact details */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-gold uppercase tracking-widest font-sans">Grand Office</h4>
            <ul className="space-y-3 text-xs text-white/60">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                <span>Promide Residency Road, Coorg Highlands, Karnataka, India</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>+91 91106 19177</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>shaileshhiremath074@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal and Disclaimer */}
        <div className="border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-white/30 space-y-3 md:space-y-0">
          <p>© 2026 Promide Residency. Majestic Lodgings of Karnataka, Inc. All rights reserved.</p>
          <div className="flex space-x-4">
            <span className="hover:text-gold cursor-pointer transition">Privacy Terms</span>
            <span className="hover:text-gold cursor-pointer transition">Licensure Codes</span>
            <span className="hover:text-gold cursor-pointer transition">Security Seal</span>
          </div>
        </div>
      </div>

      {/* FLOATING WHATSAPP BUTTON WITH PULSING EMBELLISHMENT */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          id="whatsapp-trigger"
          onClick={handleWhatsApp}
          className="relative w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-xl hover:shadow-emerald-500/20 active:scale-95 transition-all duration-300 group cursor-pointer focus:outline-none"
          title="Connect with Royal Helpers via WhatsApp"
        >
          {/* Animated Gold Aura Rings */}
          <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20 group-hover:opacity-40"></span>
          
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="transition-transform group-hover:scale-105 duration-300 pointer-events-none"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.1 1.419 4.87 1.419 5.4 0 9.79-4.39 9.79-9.793 0-2.585-1.01-5.016-2.84-6.847-1.83-1.832-4.26-2.84-6.85-2.84-5.4 0-9.79 4.39-9.79 9.793 0 1.83.48 3.1 1.42 4.871l-.95 3.473 3.51-.952zm11.233-5.267s-.43-.21-.97-.481c-.55-.27-.65-.36-.88-.04l-.39.467c-.12.144-.31.144-.54.04-1.39-.77-2.31-1.48-3.08-2.79-.1-.18 0-.28.1-.38l.32-.38s.1-.14.15-.27c.05-.13-.02-.25-.09-.38L10.3 8.35c-.21-.49-.45-.4-.65-.4-.15-.01-.33-.01-.51-.01-.18 0-.48.07-.73.34-.23.27-.92.9-.92 2.2s.95 2.56 1.08 2.74c.13.18 1.87 2.85 4.54 4l1.45.6c1 .41 1.62.3 2.15.22.6-.09 1.84-.75 2.1-1.48.26-.72.26-1.35.18-1.48l-.48-.25z" />
          </svg>
        </button>
      </div>
    </footer>
  );
};
