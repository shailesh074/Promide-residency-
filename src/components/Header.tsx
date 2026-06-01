/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { Shield, Home, Key, LogOut, Menu, X, Calendar, User, FileText, Sparkles, MessageSquare, Palette, ChevronDown, Check } from 'lucide-react';

export const Header: React.FC = () => {
  const { state, setView, logout, theme, setTheme } = useApp();
  const { currentUser, currentView } = state;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const navItems = [
    { label: 'Home', view: 'home', icon: Home },
    { label: 'Rooms & Rates', view: 'rooms', icon: Key },
    { label: 'Our Story', view: 'about', icon: FileText },
    { label: 'Connect', view: 'contact', icon: MessageSquare }
  ];

  const themesPool = [
    { id: 'charcoal', label: 'Royal Charcoal', desc: 'Luxury Dark & Gold', badge: '👑' },
    { id: 'pine', label: 'Highland Pine', desc: 'Deep Forest Spruce', badge: '🌿' },
    { id: 'light', label: 'Sandalwood Light', desc: 'Ivory Royal Heritage', badge: '🏺' }
  ];

  const handleNav = (view: string) => {
    setView(view);
    setMobileOpen(false);
  };

  return (
    <header
      id="main-nav-header"
      className="sticky top-0 left-0 w-full z-45 transition-all duration-300 bg-navy-950/85 backdrop-blur-md border-b border-gold/15"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Resort Brand */}
          <div
            id="brand-logo"
            onClick={() => handleNav('home')}
            className="flex items-center space-x-3.5 cursor-pointer group select-none animate-fadeIn"
          >
            <div className="serif italic text-3xl font-light tracking-tighter text-gold gold-glow pr-2 transition-transform duration-500 group-hover:scale-105">
              PG.
            </div>
            <div className="border-l border-gold/15 pl-3.5">
              <span className="text-text-sand font-serif text-base sm:text-lg font-light tracking-wider block transition-all group-hover:text-gold uppercase">
                Promide Grand
              </span>
              <span className="text-gold font-mono text-[8.5px] tracking-[0.22em] block uppercase opacity-70">
                Coorg Highlands &bull; Karnataka
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => handleNav(item.view)}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs tracking-wider uppercase font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-gold bg-gold/10 font-semibold border border-gold/20'
                      : 'text-text-sand/75 hover:text-gold hover:bg-gold/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Section / Authentication / Theme Trigger */}
          <div className="hidden md:flex items-center space-x-3">
            
            {/* Elegant Dynamic Theme Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-gold/15 bg-navy-900/60 hover:bg-navy-900 text-gold text-xs font-mono tracking-wider transition-all"
                title="Change Imperial Theme"
              >
                <Palette className="w-3.5 h-3.5 animate-pulse" />
                <span className="uppercase text-[9.5px]">
                  {themesPool.find(t => t.id === theme)?.label.split(' ')[1]}
                </span>
                <ChevronDown className="w-3 h-3 text-gold/60" />
              </button>

              {themeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setThemeDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2.5 w-60 z-50 glass rounded-xl p-2.5 border border-gold/25 space-y-1 shadow-2xl animate-fadeIn text-left">
                    <p className="text-[9.5px] font-mono text-gold uppercase tracking-[0.2em] px-2 pb-1.5 border-b border-gold/10">
                      Imperial Theme Space
                    </p>
                    {themesPool.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between text-left px-2.5 py-2 rounded-lg transition ${
                          theme === t.id
                            ? 'bg-gold/10 text-gold font-semibold'
                            : 'text-text-sand/70 hover:bg-white/5 hover:text-text-sand'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs uppercase tracking-wider block">
                            {t.badge} {t.label}
                          </span>
                          <span className="text-[10px] text-text-sand/40 font-light block">
                            {t.desc}
                          </span>
                        </div>
                        {theme === t.id && <Check className="w-3.5 h-3.5 text-gold" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {currentUser ? (
              <div id="user-head-menu" className="flex items-center space-x-2">
                
                {/* Role badges */}
                {currentUser.role === 'admin' ? (
                  <button
                    onClick={() => handleNav('admin')}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNav('dashboard')}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>My Bookings</span>
                  </button>
                )}

                {/* Profile pill container */}
                <span className="text-xs text-text-sand/80 font-medium px-2.5">
                  Welcome, <strong className="text-gold">{currentUser.name.split(' ')[0]}</strong>
                </span>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-full text-text-sand/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNav('login')}
                  className="px-4 py-2 text-xs font-medium text-text-sand/85 hover:text-gold uppercase tracking-wider transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-5 py-2 text-xs font-semibold text-[#000] bg-gold rounded-full hover:bg-text-sand hover:shadow-gold/10 active:scale-95 transition-all duration-300 uppercase tracking-wild shadow-md"
                >
                  Join Elite
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburguer Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            
            {/* Inline Quick Cycle Theme Button for mobile */}
            <button
              onClick={() => {
                const nextTheme = theme === 'charcoal' ? 'pine' : theme === 'pine' ? 'light' : 'charcoal';
                setTheme(nextTheme);
              }}
              className="p-2.5 rounded-full bg-navy-900/60 border border-gold/15 text-gold"
              title="Toggle Theme Mode"
            >
              <Palette className="w-4 h-4 animate-pulse" />
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-full bg-navy-900/60 border border-gold/15 text-text-sand focus:outline-none focus:ring-1 focus:ring-gold"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div id="mobile-nav-panel" className="md:hidden border-t border-gold/10 bg-navy-950/95 backdrop-blur-lg px-4 pt-4 pb-6 space-y-4">
          
          {/* Theme Quick Switcher Panel for Mobile */}
          <div className="bg-navy-900/60 p-3 rounded-xl border border-gold/10 text-left space-y-2">
            <span className="text-[9px] font-mono text-gold uppercase tracking-[0.2em] block">
              ⚜️ Select Theme Experience
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {themesPool.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`py-2 text-[10px] font-semibold rounded uppercase tracking-wider transition ${
                    theme === t.id
                      ? 'bg-gold/15 text-gold border border-gold/30'
                      : 'bg-white/5 text-text-sand/60 border border-transparent'
                  }`}
                >
                  <span className="block text-xs">{t.badge}</span>
                  {t.label.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => handleNav(item.view)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm uppercase tracking-wider font-medium transition-all ${
                    isActive ? 'text-gold bg-gold/10 border border-gold/20' : 'text-text-sand/80 hover:text-gold hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gold/10 space-y-3">
            {currentUser ? (
              <div className="space-y-3 text-left">
                <div className="px-4 py-2 bg-white/5 rounded-lg border border-gold/10">
                  <p className="text-[10px] text-text-sand/50 tracking-wider font-mono">AUTHENTICATING GUEST</p>
                  <p className="text-sm text-gold font-semibold">{currentUser.name}</p>
                </div>
                {currentUser.role === 'admin' ? (
                  <button
                    onClick={() => handleNav('admin')}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/20 text-sm font-semibold uppercase tracking-wider"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNav('dashboard')}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gold/10 text-gold border border-gold/20 text-sm font-semibold uppercase tracking-wider"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>My Bookings</span>
                  </button>
                )}
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-red-400 bg-red-950/10 border border-red-950/30 text-sm font-semibold uppercase tracking-wider"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="w-full px-4 py-3 rounded-lg text-center text-sm font-medium border border-gold/10 text-text-sand hover:bg-white/5 transition-all uppercase tracking-wider"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="w-full px-4 py-3 rounded-lg text-center text-sm font-semibold bg-gold text-navy-955 hover:bg-text-sand transition-all uppercase tracking-wider"
                >
                  Join Elite
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
