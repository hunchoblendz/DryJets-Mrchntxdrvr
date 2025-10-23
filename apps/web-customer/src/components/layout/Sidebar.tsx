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
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Home', href: '/', icon: HomeIcon },
  {
    name: 'Services',
    href: '/services',
    icon: SparklesIcon,
    children: [
      { name: 'Dry Cleaning', href: '/services/dry-cleaning', icon: SparklesIcon },
      { name: 'Laundry', href: '/services/laundry', icon: SparklesIcon },
      { name: 'Alterations', href: '/services/alterations', icon: SparklesIcon },
      { name: 'Special Care', href: '/services/special-care', icon: SparklesIcon },
    ],
  },
  { name: 'How It Works', href: '/how-it-works', icon: ClipboardDocumentListIcon },
  { name: 'Pricing', href: '/pricing', icon: ShoppingBagIcon },
  { name: 'Locations', href: '/locations', icon: MapPinIcon },
];

const accountNav: NavItem[] = [
  { name: 'My Orders', href: '/orders', icon: ClipboardDocumentListIcon },
  { name: 'Account', href: '/account', icon: UserCircleIcon },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
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
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-3 rounded-full bg-white shadow-medium hover:shadow-large transition-shadow"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 text-brand-navy" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-brand-navy" />
        )}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200 z-50 lg:translate-x-0 lg:z-30 overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 px-6 py-6 border-b border-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-lavender flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-brand-primary to-brand-lavender bg-clip-text text-transparent">
                DryJets
              </h1>
              <p className="text-xs text-gray-500">Effortless Elegance</p>
            </div>
          </Link>

          {/* Order CTA */}
          <div className="px-4 py-4">
            <Link
              href="/order"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-orange to-orange-600 text-white font-semibold shadow-medium hover:shadow-large hover:scale-105 transition-all duration-200"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              <span>Order Now</span>
            </Link>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                        hasActiveChild(item)
                          ? 'bg-brand-primary/10 text-brand-primary'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform duration-200 ${
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
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-6 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                                  isActive(child.href)
                                    ? 'bg-brand-primary text-white'
                                    : 'hover:bg-gray-100 text-gray-600'
                                }`}
                              >
                                <span className="text-sm font-medium">{child.name}</span>
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
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-brand-primary text-white shadow-soft'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-brand-orange text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Account Section */}
          <div className="px-4 py-4 border-t border-gray-100">
            <div className="space-y-1">
              {accountNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 px-4 py-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
              <p className="text-xs text-gray-600">Logged in as</p>
              <p className="font-semibold text-gray-900">Guest User</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content spacer for desktop */}
      <div className="hidden lg:block lg:w-72" />
    </>
  );
}
