import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { User, Room, Complaint, MessMenu, Notice } from './models/index.js';

import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables (supports root and server working directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

/**
 * Seed MongoDB with realistic StayMate AI demo data
 */
export const seedData = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('[Seeder] Could not connect to MongoDB. Aborting seed operation.');
      process.exit(1);
    }

    console.log('[Seeder] Clearing existing database collections...');
    await User.deleteMany();
    await Room.deleteMany();
    await Complaint.deleteMany();
    await MessMenu.deleteMany();
    await Notice.deleteMany();
    console.log('[Seeder] Collections wiped clean.');

    // 1. Seed Users (Admin & Students)
    console.log('[Seeder] Creating User accounts...');
    const admin = await User.create({
      name: 'Dr. Kanchan Warden',
      email: 'admin@campus.edu',
      password: 'password123',
      role: 'admin',
      contactNumber: '9876500001',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    });

    const student1 = await User.create({
      name: 'Tejasvi Raghuvanshi',
      email: 'student@campus.edu',
      password: 'password123',
      role: 'student',
      rollNumber: '2401530100155',
      contactNumber: '9876543210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    });

    const student2 = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav@campus.edu',
      password: 'password123',
      role: 'student',
      rollNumber: '2401530100101',
      contactNumber: '9812345678',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    });

    const student3 = await User.create({
      name: 'Rohan Verma',
      email: 'rohan@campus.edu',
      password: 'password123',
      role: 'student',
      rollNumber: '2401530100112',
      contactNumber: '9823456789',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    });

    const student4 = await User.create({
      name: 'Priya Patel',
      email: 'priya@campus.edu',
      password: 'password123',
      role: 'student',
      rollNumber: '2401530100140',
      contactNumber: '9834567890',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    });

    console.log(`[Seeder] Created 5 users (1 Admin, 4 Students).`);

    // 2. Seed Hostel Rooms
    console.log('[Seeder] Creating Hostel Rooms and assigning residents...');
    const roomA101 = await Room.create({
      roomNumber: 'A-101',
      block: 'A-Wing',
      floor: 1,
      capacity: 2,
      currentOccupancy: 2,
      status: 'full',
      residents: [student1._id, student2._id],
    });

    const roomA102 = await Room.create({
      roomNumber: 'A-102',
      block: 'A-Wing',
      floor: 1,
      capacity: 2,
      currentOccupancy: 1,
      status: 'available',
      residents: [student3._id],
    });

    const roomB201 = await Room.create({
      roomNumber: 'B-201',
      block: 'B-Wing',
      floor: 2,
      capacity: 3,
      currentOccupancy: 1,
      status: 'available',
      residents: [student4._id],
    });

    const roomB202 = await Room.create({
      roomNumber: 'B-202',
      block: 'B-Wing',
      floor: 2,
      capacity: 2,
      currentOccupancy: 0,
      status: 'maintenance',
      residents: [],
    });

    // Link rooms back to students
    await User.findByIdAndUpdate(student1._id, { room: roomA101._id });
    await User.findByIdAndUpdate(student2._id, { room: roomA101._id });
    await User.findByIdAndUpdate(student3._id, { room: roomA102._id });
    await User.findByIdAndUpdate(student4._id, { room: roomB201._id });

    console.log(`[Seeder] Created 4 Rooms with bed allocations linked.`);

    // 3. Seed Weekly Mess Menus (All 7 Days x 4 Slots = 28 Entries)
    console.log('[Seeder] Populating weekly rotating mess timetables...');
    const weeklyMenuData = [
      // Monday
      {
        dayOfWeek: 'Monday',
        mealType: 'Breakfast',
        items: ['Poha with Sev', 'Boiled Eggs / Sprouts', 'Mint Chutney', 'Tea & Coffee'],
        timings: { start: '7:30 AM', end: '9:30 AM' },
        expectedHeadcount: 210,
      },
      {
        dayOfWeek: 'Monday',
        mealType: 'Lunch',
        items: ['Rajma Masala', 'Steamed Basmati Rice', 'Boondi Raita', 'Tawa Roti', 'Green Salad'],
        timings: { start: '12:30 PM', end: '2:30 PM' },
        expectedHeadcount: 330,
      },
      {
        dayOfWeek: 'Monday',
        mealType: 'Snacks',
        items: ['Veg Cutlet', 'Tomato Chutney', 'Masala Chai'],
        timings: { start: '4:30 PM', end: '5:30 PM' },
        expectedHeadcount: 195,
      },
      {
        dayOfWeek: 'Monday',
        mealType: 'Dinner',
        items: ['Palak Paneer', 'Yellow Dal Tadka', 'Jeera Rice', 'Phulka Roti', 'Rice Kheer'],
        timings: { start: '7:30 PM', end: '9:30 PM' },
        expectedHeadcount: 340,
      },

      // Tuesday
      {
        dayOfWeek: 'Tuesday',
        mealType: 'Breakfast',
        items: ['Idli Sambar', 'Coconut Chutney', 'Medu Vada', 'Filter Coffee'],
        timings: { start: '7:30 AM', end: '9:30 AM' },
        expectedHeadcount: 220,
      },
      {
        dayOfWeek: 'Tuesday',
        mealType: 'Lunch',
        items: ['Chole Masala', 'Bhature & Poori', 'Steamed Rice', 'Cucumber Onion Salad'],
        timings: { start: '12:30 PM', end: '2:30 PM' },
        expectedHeadcount: 350,
      },
      {
        dayOfWeek: 'Tuesday',
        mealType: 'Snacks',
        items: ['Samosa with Sweet Chutney', 'Masala Tea', 'Biscuits'],
        timings: { start: '4:30 PM', end: '5:30 PM' },
        expectedHeadcount: 230,
      },
      {
        dayOfWeek: 'Tuesday',
        mealType: 'Dinner',
        items: ['Aloo Gobi Masala', 'Dal Makhani', 'Steamed Rice', 'Chapati', 'Gulab Jamun'],
        timings: { start: '7:30 PM', end: '9:30 PM' },
        expectedHeadcount: 325,
      },

      // Wednesday
      {
        dayOfWeek: 'Wednesday',
        mealType: 'Breakfast',
        items: ['Aloo Paratha with Amul Butter', 'Fresh Curd', 'Mixed Pickle', 'Hot Tea'],
        timings: { start: '7:30 AM', end: '9:30 AM' },
        expectedHeadcount: 240,
      },
      {
        dayOfWeek: 'Wednesday',
        mealType: 'Lunch',
        items: ['Kadhi Pakora', 'Steamed Basmati Rice', 'Bhindi Masala', 'Tawa Roti', 'Papad'],
        timings: { start: '12:30 PM', end: '2:30 PM' },
        expectedHeadcount: 315,
      },
      {
        dayOfWeek: 'Wednesday',
        mealType: 'Snacks',
        items: ['Bread Pakora', 'Mint Coriander Dip', 'Tea'],
        timings: { start: '4:30 PM', end: '5:30 PM' },
        expectedHeadcount: 210,
      },
      {
        dayOfWeek: 'Wednesday',
        mealType: 'Dinner',
        items: ['Butter Chicken / Shahi Paneer', 'Peas Pulao', 'Dal Fry', 'Butter Roti', 'Vanilla Ice Cream'],
        timings: { start: '7:30 PM', end: '9:30 PM' },
        expectedHeadcount: 360,
      },

      // Thursday
      {
        dayOfWeek: 'Thursday',
        mealType: 'Breakfast',
        items: ['Crispy Masala Dosa', 'Veg Sambar', 'Coconut & Tomato Chutney', 'Coffee'],
        timings: { start: '7:30 AM', end: '9:30 AM' },
        expectedHeadcount: 225,
      },
      {
        dayOfWeek: 'Thursday',
        mealType: 'Lunch',
        items: ['Mix Veg Handi', 'Arhar Dal Tadka', 'Jeera Rice', 'Phulka Roti', 'Mixed Salad'],
        timings: { start: '12:30 PM', end: '2:30 PM' },
        expectedHeadcount: 305,
      },
      {
        dayOfWeek: 'Thursday',
        mealType: 'Snacks',
        items: ['Veg Grilled Sandwich', 'Potato Wafers', 'Adrak Chai'],
        timings: { start: '4:30 PM', end: '5:30 PM' },
        expectedHeadcount: 200,
      },
      {
        dayOfWeek: 'Thursday',
        mealType: 'Dinner',
        items: ['Egg Curry / Kashmiri Dum Aloo', 'Steamed Rice', 'Moong Dal', 'Roti', 'Fruit Custard'],
        timings: { start: '7:30 PM', end: '9:30 PM' },
        expectedHeadcount: 330,
      },

      // Friday
      {
        dayOfWeek: 'Friday',
        mealType: 'Breakfast',
        items: ['Onion Tomato Uttapam', 'Sambar', 'Coconut Chutney', 'Boiled Eggs', 'Tea'],
        timings: { start: '7:30 AM', end: '9:30 AM' },
        expectedHeadcount: 205,
      },
      {
        dayOfWeek: 'Friday',
        mealType: 'Lunch',
        items: ['Paneer Butter Masala', 'Kashmiri Pulao', 'Dal Fry', 'Tawa Roti', 'Cucumber Raita'],
        timings: { start: '12:30 PM', end: '2:30 PM' },
        expectedHeadcount: 340,
      },
      {
        dayOfWeek: 'Friday',
        mealType: 'Snacks',
        items: ['Bhel Puri with Sev & Peanuts', 'Sweet Chutney', 'Masala Chai'],
        timings: { start: '4:30 PM', end: '5:30 PM' },
        expectedHeadcount: 225,
      },
      {
        dayOfWeek: 'Friday',
        mealType: 'Dinner',
        items: ['Hyderabadi Veg/Chicken Biryani', 'Mirchi Ka Salan', 'Burani Raita', 'Bengali Rasgulla'],
        timings: { start: '7:30 PM', end: '9:30 PM' },
        expectedHeadcount: 355,
      },

      // Saturday
      {
        dayOfWeek: 'Saturday',
        mealType: 'Breakfast',
        items: ['Poori Bhaji', 'Sooji Halwa', 'Pickle', 'Hot Milk & Tea'],
        timings: { start: '7:30 AM', end: '9:30 AM' },
        expectedHeadcount: 230,
      },
      {
        dayOfWeek: 'Saturday',
        mealType: 'Lunch',
        items: ['Dal Makhani', 'Jeera Rice', 'Aloo Capsicum Dry', 'Phulka Roti', 'Onion Rings'],
        timings: { start: '12:30 PM', end: '2:30 PM' },
        expectedHeadcount: 290,
      },
      {
        dayOfWeek: 'Saturday',
        mealType: 'Snacks',
        items: ['Mumbai Pav Bhaji with Butter Pav', 'Chopped Onions & Lemon', 'Tea'],
        timings: { start: '4:30 PM', end: '5:30 PM' },
        expectedHeadcount: 260,
      },
      {
        dayOfWeek: 'Saturday',
        mealType: 'Dinner',
        items: ['Paneer Do Pyaza', 'Panchmel Dal', 'Steamed Rice', 'Tawa Paratha', 'Moong Dal Halwa'],
        timings: { start: '7:30 PM', end: '9:30 PM' },
        expectedHeadcount: 280,
      },

      // Sunday
      {
        dayOfWeek: 'Sunday',
        mealType: 'Breakfast',
        items: ['Masala Omelette / Paneer Bhurji', 'Toasted Bread with Butter & Jam', 'Banana', 'Tea / Coffee'],
        timings: { start: '8:00 AM', end: '10:00 AM' },
        expectedHeadcount: 140, // Late sleepers
      },
      {
        dayOfWeek: 'Sunday',
        mealType: 'Lunch',
        items: ['Special Sunday Thali (Paneer Lababdar, Dal Tadka, Veg Pulao, Poori, Sweet Lassi, Roasted Papad)'],
        timings: { start: '12:30 PM', end: '2:30 PM' },
        expectedHeadcount: 360,
      },
      {
        dayOfWeek: 'Sunday',
        mealType: 'Snacks',
        items: ['Crispy Veg Spring Rolls', 'Hot Garlic Sauce', 'Masala Tea'],
        timings: { start: '4:30 PM', end: '5:30 PM' },
        expectedHeadcount: 180,
      },
      {
        dayOfWeek: 'Sunday',
        mealType: 'Dinner',
        items: ['Chef Special Handi Biryani', 'Cucumber Mint Raita', 'Butter Naan', 'Royal Shahi Tukda'],
        timings: { start: '7:30 PM', end: '9:30 PM' },
        expectedHeadcount: 275, // Outside dining
      },
    ];

    await MessMenu.insertMany(weeklyMenuData);
    console.log(`[Seeder] Inserted ${weeklyMenuData.length} weekly meal timetable slots.`);

    // 4. Seed Complaints with Gemini AI Analysis
    console.log('[Seeder] Creating sample student maintenance complaints...');
    await Complaint.create([
      {
        student: student1._id,
        category: 'Plumbing',
        title: 'Severe water leakage in washroom',
        priority: 'Urgent',
        status: 'Pending',
        description:
          'Continuous water pipe leakage beneath the second sink on the 1st floor corridor. Water is seeping into the hallway and posing an immediate slip hazard.',
        aiAnalysis: {
          suggestedCategory: 'Plumbing',
          urgencyScore: 9,
          summary: 'Severe water pipe leakage beneath sink actively flooding the hallway corridor.',
          actionRecommendation: 'Immediately isolate main floor water valve and dispatch emergency plumbing squad.',
        },
      },
      {
        student: student2._id,
        category: 'Internet/WiFi',
        title: 'Wi-Fi access point drops every 10 minutes',
        priority: 'Medium',
        status: 'In Progress',
        description:
          'The Wi-Fi access point near Room A-101 is repeatedly dropping signal during evening hours, disconnecting students during online lecture submissions.',
        aiAnalysis: {
          suggestedCategory: 'Internet/WiFi',
          urgencyScore: 6,
          summary: 'Unstable Wi-Fi connectivity and frequent packet drops in A-Wing corridor.',
          actionRecommendation: 'Check access point firmware, signal interference, and DHCP lease pool in A-Wing.',
        },
        adminRemarks: 'Campus IT team ticket #4092 logged. Router firmware update scheduled tonight at 11:30 PM.',
      },
      {
        student: student3._id,
        category: 'Electrical',
        title: 'Tube light replacement needed',
        priority: 'Low',
        status: 'Resolved',
        description: 'Study desk tube light flickering and turned off completely in Room A-102.',
        aiAnalysis: {
          suggestedCategory: 'Electrical',
          urgencyScore: 3,
          summary: 'Burnt study desk tube light fixture in room A-102.',
          actionRecommendation: 'Replace defective tube light bulb with 20W LED fixture during morning rounds.',
        },
        adminRemarks: 'Replaced with 20W LED tube light by hostel electrician.',
        resolvedAt: new Date(Date.now() - 3600000 * 24),
      },
    ]);
    console.log(`[Seeder] Created 3 sample complaints with Gemini AI urgency analysis.`);

    // 5. Seed Campus Notices
    console.log('[Seeder] Broadcasting sample campus notices...');
    await Notice.create([
      {
        title: 'Scheduled Power Maintenance',
        content:
          'Routine electrical substation maintenance will be carried out this Saturday between 10:00 AM and 1:00 PM. Generator backup will be operational for emergency hallway lighting. Please keep laptops and essential mobile devices charged in advance.',
        category: 'Maintenance',
        targetAudience: 'All',
        isPinned: true,
        postedBy: admin._id,
      },
      {
        title: 'Special Sunday Feast Menu',
        content:
          "In celebration of Campus Founder's Week, the hostel dining hall will serve a Special Royal Thali featuring Paneer Lababdar, Dum Biryani, and Gulab Jamun this Sunday afternoon. Please confirm attendance via your Meal RSVP dashboard.",
        category: 'Mess',
        targetAudience: 'All',
        isPinned: false,
        postedBy: admin._id,
      },
      {
        title: 'Late Entry Protocol & Gate Curfew Reminder',
        content:
          'All campus residents are reminded that the hostel main gate closes strictly at 9:30 PM. Late entries up to 10:00 PM require biometric roll number verification at Gate 1. Any entry past 10:00 PM strictly requires prior written approval from Chief Warden Dr. Kanchan.',
        category: 'Urgent',
        targetAudience: 'Students',
        isPinned: true,
        postedBy: admin._id,
      },
    ]);
    console.log(`[Seeder] Published 3 official campus bulletins.`);

    console.log('\n======================================================');
    console.log('✅ StayMate AI Database Seeded Successfully!');
    console.log('======================================================');
    console.log('Admin Login:   admin@campus.edu    / password123');
    console.log('Student Login: student@campus.edu  / password123');
    console.log('Additional:    aarav@campus.edu, rohan@campus.edu, priya@campus.edu');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error] Failed to seed database:', error);
    process.exit(1);
  }
};

/**
 * Destroy/Clear all database data
 */
export const destroyData = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('[Seeder] Could not connect to MongoDB. Aborting destroy operation.');
      process.exit(1);
    }

    console.log('[Seeder] Wiping all StayMate AI database collections...');
    await User.deleteMany();
    await Room.deleteMany();
    await Complaint.deleteMany();
    await MessMenu.deleteMany();
    await Notice.deleteMany();

    console.log('🗑️  All database records destroyed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error] Failed to destroy data:', error);
    process.exit(1);
  }
};

// Command line execution handling
if (process.argv[2] === '-d' || process.argv[2] === '--destroy') {
  destroyData();
} else {
  seedData();
}
