'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/utilities/theme-toggle';

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface py-12 sm:py-16 text-body-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 pb-12 border-b border-border">
          {/* Brand Column (md: 5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block group">
              <div className="relative h-9 w-36 sm:w-40 transition-transform group-hover:scale-[1.02]">
                <Image
                  src="/kalya_logo1.png"
                  alt="Kalya Personal Finance App - Ready For Tomorrow"
                  fill
                  sizes="160px"
                  className="object-contain object-left dark:hidden"
                />
                <Image
                  src="/kalya_logo_white1.png"
                  alt="Kalya Personal Finance App - Ready For Tomorrow"
                  fill
                  sizes="160px"
                  className="object-contain object-left hidden dark:block"
                />
              </div>
            </Link>

            <div className="text-[11px] font-display font-semibold tracking-wider text-accent uppercase">
              READY FOR TOMORROW.
            </div>

            <p className="text-caption sm:text-body-sm text-text-secondary max-w-sm leading-relaxed">
              Kalya Personal Finance App — a free, private app to budget, split bills and track your
              wealth.
            </p>
          </div>

          {/* Links Columns (md: 7 cols) - Stacks neatly or 2-col on mobile */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1: Product */}
            <div className="space-y-3">
              <span className="font-display font-bold text-text-primary text-body-sm block">
                Product
              </span>
              <ul className="space-y-2.5 text-caption sm:text-body-sm text-text-secondary">
                <li>
                  <a href="#features" className="hover:text-primary transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-primary transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <Link href="/auth/sign-in" className="hover:text-primary transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/sign-up"
                    className="hover:text-primary font-semibold text-primary transition-colors"
                  >
                    Get Started Free
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Company */}
            <div className="space-y-3">
              <span className="font-display font-bold text-text-primary text-body-sm block">
                Company
              </span>
              <ul className="space-y-2.5 text-caption sm:text-body-sm text-text-secondary">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div className="space-y-3">
              <span className="font-display font-bold text-text-primary text-body-sm block">
                Legal
              </span>
              <ul className="space-y-2.5 text-caption sm:text-body-sm text-text-secondary">
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright (left) · Trust Line (centre) · Theme Toggle (right) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-caption text-text-muted">
          <div className="text-left">© 2026 Kalya Personal Finance App. All rights reserved.</div>

          <div className="text-text-secondary font-medium">No ads. Your data stays yours.</div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-muted">Theme</span>
            <ThemeToggle size="sm" variant="ghost" className="h-8 w-8 p-0" />
          </div>
        </div>
      </div>
    </footer>
  );
}
