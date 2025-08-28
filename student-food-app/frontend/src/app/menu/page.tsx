'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuAPI } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/ui/Layout';
import Button from '@/components/ui/Button';
import { MenuItem } from '@/types';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ClockIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { user, userType } = useAuth();
  const { addToCart } = useCart();

  // Fetch menu items
  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ['menu', { category: selectedCategory, search: searchTerm, isVeg: isVegOnly, sortBy }],
    queryFn: () => menuAPI.getMenuItems({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchTerm || undefined,
      isVeg: isVegOnly || undefined,
      sortBy,
      sortOrder: 'asc',
    }),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => menuAPI.getCategories(),
  });

  const menuItems = menuData?.data?.data?.menuItems || [];
  const categories = categoriesData?.data?.data?.categories || [];

  const handleQuantityChange = (itemId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }));
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item._id] || 1;
    addToCart(item, quantity);
    setQuantities(prev => ({ ...prev, [item._id]: 0 }));
  };

  const getItemQuantity = (itemId: string) => quantities[itemId] || 0;

  if (!user || userType !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in as a student to view the menu.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Menu</h1>
          <p className="text-gray-600">Delicious food from your campus food court</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Veg Filter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="vegOnly"
                checked={isVegOnly}
                onChange={(e) => setIsVegOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="vegOnly" className="ml-2 text-sm text-gray-700">
                Vegetarian Only
              </label>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="rating">Sort by Rating</option>
              <option value="preparationTime">Sort by Prep Time</option>
            </select>
          </div>
        </div>

        {/* Menu Items */}
        {menuLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="bg-gray-300 h-48 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-4"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item: MenuItem) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Item Image */}
                <div className="relative h-48 bg-gray-200">
                  {item.image ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${item.image}`}
                      alt={item.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-food.jpg';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  
                  {/* Veg/Non-veg indicator */}
                  <div className="absolute top-2 left-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      item.isVeg ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100'
                    }`}>
                      <div className={`w-2 h-2 rounded-full m-0.5 ${
                        item.isVeg ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  </div>

                  {/* Availability */}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium">Not Available</span>
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <span className="text-lg font-bold text-blue-600">₹{item.price}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                  {/* Rating and prep time */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {item.rating.toFixed(1)} ({item.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 ml-1">{item.preparationTime} min</span>
                    </div>
                  </div>

                  {/* Add to cart */}
                  {item.isAvailable && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item._id, -1)}
                          disabled={getItemQuantity(item._id) === 0}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {getItemQuantity(item._id)}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, 1)}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <Button
                        onClick={() => handleAddToCart(item)}
                        disabled={getItemQuantity(item._id) === 0}
                        size="sm"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}