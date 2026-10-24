'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/libs/utils';

export function LandingHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-200 border-b border-border/70',
        scrolled
          ? 'bg-surface/85 backdrop-blur-md shadow-xs h-15 py-0'
          : 'bg-surface/60 backdrop-blur-sm h-18'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center group">
            <div className="relative h-9 w-36 sm:w-40 transition-transform group-hover:scale-[1.02]">
              <Image
                src="/kalya_logo1.png"
                alt="Kalya - Ready For Tomorrow"
                fill
                sizes="160px"
                className="object-contain object-left dark:hidden"
                priority
              />
              <Image
                src="/kalya_logo_white1.png"
                alt="Kalya - Ready For Tomorrow"
                fill
                sizes="160px"
                className="object-contain object-left hidden dark:block"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Centre: Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-body-sm font-medium text-text-secondary">
          {navLinks.map((link) => {
            const isAboutOrContact = link.href.startsWith('/');
            const isActive = isAboutOrContact && pathname === link.href;

            return (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  'relative py-1 text-text-secondary hover:text-text-primary transition-colors group cursor-pointer',
                  isActive && 'text-text-primary font-semibold'
                )}
              >
                <span>{link.label}</span>
                {/* Gold underline growing on hover or active */}
                <span
                  className={cn(
                    'absolute left-0 bottom-0 h-0.5 bg-accent transition-all duration-200',
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                />
              </a>
            );
          })}
        </nav>

        {/* Right: Actions (Desktop) */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/auth/sign-in"
            className="text-body-sm font-semibold text-text-secondary hover:text-text-primary transition-colors px-2 py-1.5"
          >
            Sign In
          </Link>

          {/* Primary CTA - The only filled button (enhanced with premium gradient, specular border, and sheen) */}
          <Link
            href="/auth/sign-up"
            className="group relative inline-flex items-center gap-2 rounded-xl bg-linear-to-b from-[#145334] via-[#0d3e26] to-[#072617] px-5 py-2.5 text-body-sm font-bold text-white shadow-[0_2px_8px_rgba(13,62,38,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-emerald-700/50 hover:from-[#175f3c] hover:to-[#0a331f] hover:shadow-[0_6px_20px_rgba(13,62,38,0.4),0_0_14px_rgba(184,145,46,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden dark:from-[#2e7d55] dark:via-[#1e583c] dark:to-[#133d28] dark:border-white/20 dark:shadow-[0_2px_12px_rgba(46,125,85,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)]"
          >
            {/* Subtle light sheen sweep across on hover */}
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-linear-to-r from-transparent via-white/15 to-transparent pointer-events-none"
              aria-hidden="true"
            />

            <span className="relative z-10 tracking-tight">Get Started Free</span>
            <span className="relative z-10 flex items-center justify-center h-5 w-5 rounded-lg bg-white/10 group-hover:bg-accent/25 transition-colors duration-200">
              <ArrowRight className="h-3.5 w-3.5 text-accent group-hover:text-white transition-all duration-200 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>

        {/* Mobile: Short "Start free" button and menu icon */}
        <div className="flex sm:hidden items-center gap-2.5">
          <Link
            href="/auth/sign-up"
            className="rounded-lg bg-linear-to-b from-[#145334] to-[#072617] px-3.5 py-1.5 text-caption font-bold text-white shadow-xs border border-emerald-700/50 hover:from-[#175f3c] hover:to-[#0a331f] active:scale-95 transition-all dark:from-[#2e7d55] dark:to-[#174b31]"
          >
            Start free
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-text-secondary hover:bg-surface-raised transition-colors min-h-11 min-w-11 flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="sm:hidden border-b border-border bg-surface px-5 py-6 space-y-4 shadow-xl"
          >
            <div className="flex flex-col gap-1 text-body-md font-medium text-text-secondary">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg hover:bg-surface-raised hover:text-text-primary transition-colors min-h-11 flex items-center"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/auth/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-surface-raised hover:text-text-primary transition-colors min-h-11 flex items-center"
              >
                Sign In
              </Link>
            </div>

            <div className="pt-3 border-t border-border">
              <Link
                href="/auth/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-xl bg-linear-to-b from-[#145334] via-[#0d3e26] to-[#072617] py-3.5 text-body-sm font-bold text-white shadow-sm min-h-11 flex items-center justify-center gap-2 border border-emerald-700/50"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4 text-accent" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
