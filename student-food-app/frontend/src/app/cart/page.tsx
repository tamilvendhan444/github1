'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { orderAPI } from '@/lib/api';
import Layout from '@/components/ui/Layout';
import Button from '@/components/ui/Button';
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function CartPage() {
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, userType } = useAuth();
  const router = useRouter();

  const createOrderMutation = useMutation({
    mutationFn: orderAPI.createOrder,
    onSuccess: (response) => {
      if (response.data.success) {
        const orderId = response.data.data.order._id;
        clearCart();
        toast.success('Order created successfully!');
        router.push(`/orders/${orderId}/payment`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    },
  });

  if (!user || userType !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in as a student to view your cart.</p>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const orderData = {
      items: cart.items.map(item => ({
        menuItemId: item.menuItem._id,
        quantity: item.quantity,
      })),
      specialInstructions: specialInstructions || undefined,
      paymentMethod,
    };

    createOrderMutation.mutate(orderData);
  };

  if (cart.items.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some delicious items from our menu</p>
            <Button onClick={() => router.push('/menu')}>
              Browse Menu
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items before checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart Items ({cart.totalItems} items)
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.menuItem._id} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Item Image */}
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                        {item.menuItem.image ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${item.menuItem.image}`}
                            alt={item.menuItem.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-food.jpg';
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-xs text-gray-400">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {item.menuItem.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              ₹{item.menuItem.price} each
                            </p>
                          </div>
                          
                          {/* Veg/Non-veg indicator */}
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            item.menuItem.isVeg ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100'
                          }`}>
                            <div className={`w-2 h-2 rounded-full m-0.5 ${
                              item.menuItem.isVeg ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.menuItem._id, item.quantity - 1)}
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.menuItem._id, item.quantity + 1)}
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Subtotal and Remove */}
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-semibold text-gray-900">
                              ₹{item.subtotal}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.menuItem._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{cart.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold">₹{cart.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="mb-6">
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  id="instructions"
                  rows={3}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special requests for your order..."
                />
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {['upi', 'gpay', 'paytm'].map((method) => (
                    <label key={method} className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {method === 'upi' ? 'UPI' : method === 'gpay' ? 'Google Pay' : 'Paytm'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                loading={createOrderMutation.isPending}
                className="w-full"
                size="lg"
              >
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Proceed to Payment
              </Button>

              {/* Continue Shopping */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/menu')}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}