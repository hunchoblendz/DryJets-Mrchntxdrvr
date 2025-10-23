'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Home', href: '/', icon: HomeIcon },
  {
    name: 'Services',
    href: '/services',
    icon: SparklesIcon,
    children: [
      { name: 'Dry Cleaning', href: '/services/dry-cleaning' },
      { name: 'Laundry', href: '/services/laundry' },
      { name: 'Alterations', href: '/services/alterations' },
      { name: 'Special Care', href: '/services/special-care' },
    ],
  },
  { name: 'How It Works', href: '/how-it-works', icon: ClipboardDocumentListIcon },
  { name: 'Pricing', href: '/pricing', icon: ShoppingBagIcon },
  {
    name: 'For Businesses',
    href: '/partners',
    icon: BuildingStorefrontIcon,
    children: [
      { name: 'Partner with Us', href: '/partners' },
      { name: 'Drive & Earn', href: '/drive' },
    ],
  },
  { name: 'Locations', href: '/locations', icon: MapPinIcon },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => pathname === href;
  const hasActiveChild = (item: NavItem) =>
    item.children?.some(child => pathname === child.href) || false;

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-lavender flex items-center justify-center shadow-soft">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-brand-primary to-brand-lavender bg-clip-text text-transparent">
                  DryJets
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  {item.children ? (
                    <div>
                      <button
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                          hasActiveChild(item)
                            ? 'text-brand-primary'
                            : 'text-gray-700 hover:text-brand-primary'
                        }`}
                      >
                        {item.name}
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>

                      {/* Dropdown menu */}
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-large border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`block px-4 py-3 text-sm font-medium transition-colors ${
                              isActive(child.href)
                                ? 'text-brand-primary bg-brand-primary/5'
                                : 'text-gray-700 hover:text-brand-primary hover:bg-gray-50'
                            }`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        isActive(item.href)
                          ? 'text-brand-primary'
                          : 'text-gray-700 hover:text-brand-primary'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/account"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:text-brand-primary font-medium transition-colors"
              >
                <UserCircleIcon className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/order"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-orange-600 text-white font-semibold shadow-medium hover:shadow-large hover:scale-105 transition-all duration-200"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span>Order Now</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-brand-navy" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-brand-navy" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 lg:hidden overflow-y-auto shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-lavender flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-brand-primary to-brand-lavender bg-clip-text text-transparent">
                      DryJets
                    </h1>
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Order CTA */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <Link
                    href="/order"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl bg-gradient-to-r from-brand-orange to-orange-600 text-white font-semibold shadow-medium hover:shadow-large transition-all"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    <span>Order Now</span>
                  </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.children ? (
                        <div>
                          <button
                            onClick={() => toggleExpanded(item.name)}
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all ${
                              hasActiveChild(item)
                                ? 'bg-brand-primary/10 text-brand-primary'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {item.icon && <item.icon className="w-5 h-5" />}
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <ChevronDownIcon
                              className={`w-4 h-4 transition-transform ${
                                expandedItems.includes(item.name) ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {expandedItems.includes(item.name) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-6 mt-2 space-y-1">
                                  {item.children.map((child) => (
                                    <Link
                                      key={child.name}
                                      href={child.href}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive(child.href)
                                          ? 'bg-brand-primary text-white'
                                          : 'hover:bg-gray-100 text-gray-600'
                                      }`}
                                    >
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            isActive(item.href)
                              ? 'bg-brand-primary text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.icon && <item.icon className="w-5 h-5" />}
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Account Section */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-all"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    <span className="font-medium">Sign In</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
