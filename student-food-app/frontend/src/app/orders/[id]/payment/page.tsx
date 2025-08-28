'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { orderAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/ui/Layout';
import Button from '@/components/ui/Button';
import { Receipt } from '@/types';
import {
  CreditCardIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentId, setPaymentId] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<Receipt | null>(null);

  const params = useParams();
  const router = useRouter();
  const { user, userType } = useAuth();
  const orderId = params.id as string;

  // Fetch order details
  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderAPI.getOrder(orderId),
    enabled: !!orderId,
  });

  const order = orderData?.data?.data?.order;

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: (paymentData: { paymentId: string; paymentStatus: string }) =>
      orderAPI.processPayment(orderId, paymentData),
    onSuccess: (response) => {
      if (response.data.success) {
        const receipt = response.data.data.receipt;
        setReceiptData(receipt);
        setShowReceipt(true);
        toast.success('Payment successful! Your QR receipt is ready.');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Payment processing failed');
    },
  });

  if (!user || userType !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in as a student to view this page.</p>
        </div>
      </div>
    );
  }

  if (orderLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <Button onClick={() => router.push('/orders')}>
              Back to Orders
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // If payment is already completed, show receipt
  if (order.paymentStatus === 'completed' || showReceipt) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600">Your order has been confirmed</p>
            </div>

            {/* QR Code Receipt */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Your QR Receipt</h2>
                <p className="text-gray-600">Show this QR code at the pickup counter</p>
              </div>

              <div className="flex justify-center mb-6">
                {receiptData?.qrCode && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <QRCode 
                      value={receiptData.qrCode} 
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                )}
              </div>

              {/* Receipt Details */}
              <div className="bg-white rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Order #:</span>
                    <span className="ml-2 text-gray-600">{order.orderNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Date:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Student:</span>
                    <span className="ml-2 text-gray-600">{order.student.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Roll No:</span>
                    <span className="ml-2 text-gray-600">{order.student.rollNo}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">Order Items:</h3>
                  <div className="space-y-2">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="font-medium">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <p className="text-blue-600 text-sm mt-1">
                Estimated pickup time: {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => router.push('/orders')}
                variant="outline"
                className="flex-1"
              >
                View All Orders
              </Button>
              <Button
                onClick={() => router.push('/menu')}
                className="flex-1"
              >
                Order More
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Simulate UPI payment process
  const handlePayment = () => {
    // In a real application, this would integrate with actual payment gateways
    const simulatedPaymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setPaymentId(simulatedPaymentId);
    
    // Simulate payment processing
    setTimeout(() => {
      processPaymentMutation.mutate({
        paymentId: simulatedPaymentId,
        paymentStatus: 'completed',
      });
    }, 2000);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <CreditCardIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
            <p className="text-gray-600">Order #{order.orderNumber}</p>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-medium">₹{item.subtotal}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-blue-600">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'upi', name: 'UPI', description: 'Pay with UPI apps' },
                { id: 'gpay', name: 'Google Pay', description: 'Quick payment with GPay' },
                { id: 'paytm', name: 'Paytm', description: 'Pay with Paytm wallet' },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-sm font-medium text-gray-900">{method.name}</div>
                  <div className="text-xs text-gray-500">{method.description}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Button */}
          <div className="space-y-4">
            <Button
              onClick={handlePayment}
              loading={processPaymentMutation.isPending}
              className="w-full"
              size="lg"
            >
              {processPaymentMutation.isPending ? (
                'Processing Payment...'
              ) : (
                `Pay ₹${order.totalAmount} with ${paymentMethod.toUpperCase()}`
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/cart')}
              className="w-full"
            >
              Back to Cart
            </Button>
          </div>

          {/* Payment Note */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a demo payment system. In a real application, 
              this would integrate with actual payment gateways like Razorpay, Stripe, or UPI payment systems.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}