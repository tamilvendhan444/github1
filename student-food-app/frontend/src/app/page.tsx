'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { 
  ShoppingBagIcon, 
  QrCodeIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  StarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { user, userType, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (userType === 'student') {
        router.push('/dashboard');
      } else if (userType === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, userType, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ShoppingBagIcon className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Student Food App</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Order Food from Your
            <span className="text-blue-600"> Campus </span>
            Food Court
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Skip the queues, order online, and get your food with secure QR code receipts. 
            Fast, convenient, and designed specifically for students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Order Now
              </Button>
            </Link>
            <Link href="/menu">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Student Food App?
            </h2>
            <p className="text-lg text-gray-600">
              Built specifically for students with features that make ordering food quick and secure
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCodeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">QR Code Receipts</h3>
              <p className="text-gray-600">
                Get unique, one-time QR codes with your receipts. No duplicates, completely secure.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Skip the Queue</h3>
              <p className="text-gray-600">
                Order ahead and pick up your food without waiting in long lines.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Pay securely with UPI, GPay, or other digital payment methods.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rate & Review</h3>
              <p className="text-gray-600">
                Help other students by rating and reviewing your favorite dishes.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Student-Friendly</h3>
              <p className="text-gray-600">
                Designed with students in mind - affordable prices and quick service.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBagIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Order Tracking</h3>
              <p className="text-gray-600">
                Track your order status from preparation to ready for pickup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to get your favorite food
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse & Order</h3>
              <p className="text-gray-600">
                Browse the menu, select your favorite items, and place your order online.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Pay & Get QR</h3>
              <p className="text-gray-600">
                Complete payment and receive a unique QR code receipt on your phone.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Pickup & Enjoy</h3>
              <p className="text-gray-600">
                Show your QR code at the counter and enjoy your freshly prepared meal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Skip the Queue?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who are already enjoying hassle-free food ordering.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Create Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <ShoppingBagIcon className="h-6 w-6 mr-2" />
                <span className="text-lg font-bold">Student Food App</span>
              </div>
              <p className="text-gray-400">
                Making campus food ordering simple, secure, and convenient for students.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/menu" className="hover:text-white">Menu</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/auth/register" className="hover:text-white">Register</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Students</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/orders" className="hover:text-white">My Orders</Link></li>
                <li><Link href="/profile" className="hover:text-white">Profile</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Student Food App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}