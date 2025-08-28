'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { studentAPI, orderAPI } from '@/lib/api';
import Layout from '@/components/ui/Layout';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, userType } = useAuth();
  const router = useRouter();

  // Fetch student statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['student-stats'],
    queryFn: () => studentAPI.getStats(),
    enabled: !!user && userType === 'student',
  });

  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['student-orders', { limit: 5 }],
    queryFn: () => studentAPI.getOrders({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!user && userType === 'student',
  });

  if (!user || userType !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in as a student to view the dashboard.</p>
        </div>
      </div>
    );
  }

  const stats = statsData?.data?.data?.stats;
  const orders = ordersData?.data?.data?.orders || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'preparing':
        return 'text-yellow-600 bg-yellow-100';
      case 'ready':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Ready to order some delicious food?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/menu">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-colors cursor-pointer">
              <div className="flex items-center">
                <ShoppingBagIcon className="h-8 w-8 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold">Browse Menu</h3>
                  <p className="text-blue-100">Discover delicious food</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/orders">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white hover:from-green-600 hover:to-green-700 transition-colors cursor-pointer">
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-8 w-8 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold">My Orders</h3>
                  <p className="text-green-100">Track your orders</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/profile">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-colors cursor-pointer">
              <div className="flex items-center">
                <TrophyIcon className="h-8 w-8 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold">My Profile</h3>
                  <p className="text-purple-100">View your details</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Statistics */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Stats</h2>
              
              {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {stats?.orders?.totalOrders || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CurrencyRupeeIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{stats?.orders?.totalSpent || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <TrophyIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{stats?.orders?.averageOrderValue || 0}
                    </div>
                    <div className="text-sm text-gray-600">Avg Order Value</div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <Link href="/orders">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>

              {ordersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link href="/menu">
                    <Button className="mt-4">Place Your First Order</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-900">
                              #{order.orderNumber}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {order.items.length} items • ₹{order.totalAmount}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {order.status === 'delivered' && (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          )}
                          {order.status === 'preparing' && (
                            <ClockIcon className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verification</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.isVerified 
                      ? 'text-green-600 bg-green-100' 
                      : 'text-yellow-600 bg-yellow-100'
                  }`}>
                    {user.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Roll Number</span>
                  <span className="text-sm font-medium text-gray-900">{user.rollNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Save your QR receipt for pickup</li>
                <li>• Check preparation times before ordering</li>
                <li>• Rate items to help other students</li>
                <li>• Add special instructions if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}