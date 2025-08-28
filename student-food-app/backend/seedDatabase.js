const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import models
const Admin = require('./models/Admin');
const MenuItem = require('./models/MenuItem');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      return;
    }

    // Create admin user
    const admin = await Admin.create({
      name: 'Food Court Admin',
      email: process.env.ADMIN_EMAIL || 'admin@studentfood.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'super-admin',
      permissions: ['view_orders', 'manage_menu', 'manage_students', 'view_analytics', 'system_settings']
    });

    console.log('✅ Admin user created successfully');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
};

const seedMenuItems = async () => {
  try {
    // Check if menu items already exist
    const existingItems = await MenuItem.countDocuments();
    
    if (existingItems > 0) {
      console.log('🍽️  Menu items already exist');
      return;
    }

    const menuItems = [
      // Breakfast
      {
        name: 'Masala Dosa',
        description: 'Crispy South Indian crepe filled with spiced potato curry, served with sambar and chutney',
        price: 45,
        category: 'breakfast',
        image: 'uploads/menu-items/masala-dosa.jpg',
        isVeg: true,
        preparationTime: 15,
        ingredients: ['Rice batter', 'Urad dal', 'Potato', 'Onion', 'Spices'],
        nutritionalInfo: { calories: 350, protein: 8, carbs: 65, fat: 8 }
      },
      {
        name: 'Poha',
        description: 'Flattened rice cooked with onions, curry leaves, and spices. Light and nutritious breakfast',
        price: 25,
        category: 'breakfast',
        image: 'uploads/menu-items/poha.jpg',
        isVeg: true,
        preparationTime: 10,
        ingredients: ['Poha', 'Onion', 'Curry leaves', 'Turmeric', 'Peanuts'],
        nutritionalInfo: { calories: 250, protein: 6, carbs: 45, fat: 6 }
      },
      {
        name: 'Upma',
        description: 'Savory semolina porridge with vegetables and South Indian tempering',
        price: 30,
        category: 'breakfast',
        image: 'uploads/menu-items/upma.jpg',
        isVeg: true,
        preparationTime: 12,
        ingredients: ['Semolina', 'Vegetables', 'Curry leaves', 'Mustard seeds'],
        nutritionalInfo: { calories: 280, protein: 7, carbs: 50, fat: 7 }
      },

      // Lunch
      {
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice cooked with tender chicken pieces and traditional spices',
        price: 120,
        category: 'lunch',
        image: 'uploads/menu-items/chicken-biryani.jpg',
        isVeg: false,
        preparationTime: 25,
        ingredients: ['Basmati rice', 'Chicken', 'Yogurt', 'Biryani spices', 'Fried onions'],
        nutritionalInfo: { calories: 650, protein: 35, carbs: 80, fat: 18 }
      },
      {
        name: 'Veg Thali',
        description: 'Complete vegetarian meal with dal, sabzi, roti, rice, pickle, and sweet',
        price: 80,
        category: 'lunch',
        image: 'uploads/menu-items/veg-thali.jpg',
        isVeg: true,
        preparationTime: 20,
        ingredients: ['Dal', 'Vegetables', 'Roti', 'Rice', 'Pickle', 'Sweet'],
        nutritionalInfo: { calories: 550, protein: 18, carbs: 85, fat: 15 }
      },
      {
        name: 'Rajma Rice',
        description: 'Red kidney beans curry served with steamed basmati rice',
        price: 65,
        category: 'lunch',
        image: 'uploads/menu-items/rajma-rice.jpg',
        isVeg: true,
        preparationTime: 15,
        ingredients: ['Rajma', 'Onion', 'Tomato', 'Spices', 'Basmati rice'],
        nutritionalInfo: { calories: 480, protein: 16, carbs: 75, fat: 12 }
      },

      // Snacks
      {
        name: 'Samosa (2 pcs)',
        description: 'Crispy triangular pastries filled with spiced potato and pea mixture',
        price: 20,
        category: 'snacks',
        image: 'uploads/menu-items/samosa.jpg',
        isVeg: true,
        preparationTime: 8,
        ingredients: ['Maida', 'Potato', 'Peas', 'Spices', 'Oil'],
        nutritionalInfo: { calories: 320, protein: 6, carbs: 40, fat: 16 }
      },
      {
        name: 'Pav Bhaji',
        description: 'Spicy mixed vegetable curry served with buttered bread rolls',
        price: 55,
        category: 'snacks',
        image: 'uploads/menu-items/pav-bhaji.jpg',
        isVeg: true,
        preparationTime: 12,
        ingredients: ['Mixed vegetables', 'Pav bread', 'Butter', 'Pav bhaji masala'],
        nutritionalInfo: { calories: 420, protein: 10, carbs: 55, fat: 18 }
      },
      {
        name: 'Vada Pav',
        description: 'Mumbai street food - spiced potato fritter in a bread bun with chutneys',
        price: 25,
        category: 'snacks',
        image: 'uploads/menu-items/vada-pav.jpg',
        isVeg: true,
        preparationTime: 10,
        ingredients: ['Potato', 'Chickpea flour', 'Pav bread', 'Green chutney', 'Tamarind chutney'],
        nutritionalInfo: { calories: 350, protein: 8, carbs: 50, fat: 14 }
      },

      // Beverages
      {
        name: 'Masala Chai',
        description: 'Traditional Indian spiced tea with milk and aromatic spices',
        price: 15,
        category: 'beverages',
        image: 'uploads/menu-items/masala-chai.jpg',
        isVeg: true,
        preparationTime: 5,
        ingredients: ['Tea leaves', 'Milk', 'Sugar', 'Cardamom', 'Ginger', 'Cloves'],
        nutritionalInfo: { calories: 120, protein: 4, carbs: 18, fat: 4 }
      },
      {
        name: 'Fresh Lime Soda',
        description: 'Refreshing drink with fresh lime juice, soda water, and mint',
        price: 25,
        category: 'beverages',
        image: 'uploads/menu-items/lime-soda.jpg',
        isVeg: true,
        preparationTime: 3,
        ingredients: ['Fresh lime', 'Soda water', 'Mint leaves', 'Salt', 'Sugar'],
        nutritionalInfo: { calories: 80, protein: 0, carbs: 20, fat: 0 }
      },
      {
        name: 'Lassi',
        description: 'Traditional yogurt-based drink, available in sweet or salted variants',
        price: 30,
        category: 'beverages',
        image: 'uploads/menu-items/lassi.jpg',
        isVeg: true,
        preparationTime: 5,
        ingredients: ['Yogurt', 'Sugar/Salt', 'Cardamom', 'Rose water'],
        nutritionalInfo: { calories: 180, protein: 8, carbs: 25, fat: 6 }
      },

      // Desserts
      {
        name: 'Gulab Jamun (2 pcs)',
        description: 'Soft milk dumplings soaked in rose-flavored sugar syrup',
        price: 35,
        category: 'desserts',
        image: 'uploads/menu-items/gulab-jamun.jpg',
        isVeg: true,
        preparationTime: 8,
        ingredients: ['Milk powder', 'Flour', 'Sugar', 'Rose water', 'Cardamom'],
        nutritionalInfo: { calories: 280, protein: 6, carbs: 45, fat: 10 }
      },
      {
        name: 'Ice Cream (1 scoop)',
        description: 'Creamy ice cream available in vanilla, chocolate, and strawberry flavors',
        price: 25,
        category: 'desserts',
        image: 'uploads/menu-items/ice-cream.jpg',
        isVeg: true,
        preparationTime: 2,
        ingredients: ['Milk', 'Cream', 'Sugar', 'Natural flavors'],
        nutritionalInfo: { calories: 200, protein: 4, carbs: 25, fat: 10 }
      }
    ];

    await MenuItem.insertMany(menuItems);
    console.log('✅ Menu items seeded successfully');
    console.log(`📝 Created ${menuItems.length} menu items`);
  } catch (error) {
    console.error('❌ Error seeding menu items:', error.message);
  }
};

const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');
  
  await connectDB();
  await seedAdmin();
  await seedMenuItems();
  
  console.log('✅ Database seeding completed!');
  console.log('\n📋 Summary:');
  console.log('- Admin user created');
  console.log('- Sample menu items added');
  console.log('\n🚀 You can now start the server with: npm run dev');
  
  process.exit(0);
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase().catch(error => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = { seedDatabase };