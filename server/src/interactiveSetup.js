import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

import User from './models/User.js';
import Campus from './models/Campus.js';
import Room from './models/Room.js';
import Complaint from './models/Complaint.js';
import MessMenu from './models/MessMenu.js';
import Notice from './models/Notice.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Helper to ask a question with an optional default value
const ask = async (rl, question, defaultValue = '') => {
  const promptText = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
  const answer = await rl.question(promptText);
  return answer.trim() || defaultValue;
};

// Helper for yes/no questions
const askYesNo = async (rl, question, defaultYes = true) => {
  const hint = defaultYes ? '(Y/n)' : '(y/N)';
  const answer = await ask(rl, `${question} ${hint}`, defaultYes ? 'y' : 'n');
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
};

const runSetupWizard = async () => {
  console.clear();
  console.log('================================================================');
  console.log('   🏫 StayMate AI – Interactive Real Campus Setup Wizard        ');
  console.log('================================================================');
  console.log('This wizard will guide you step-by-step through setting up your');
  console.log('real Campus infrastructure, Staff, Rooms, and Resident Students.\n');

  // Connect to Database
  await connectDB();

  const isNonInteractive = !process.stdin.isTTY || process.argv.includes('--yes') || process.argv.includes('-y');
  let rl;
  if (!isNonInteractive) {
    rl = readline.createInterface({ input, output });
  }

  const promptUser = async (question, fallback = '') => {
    if (isNonInteractive || !rl) {
      console.log(`${question} -> ${fallback}`);
      return fallback;
    }
    return await ask(rl, question, fallback);
  };

  const promptBool = async (question, defaultYes = true) => {
    if (isNonInteractive || !rl) {
      console.log(`${question} -> ${defaultYes ? 'yes' : 'no'}`);
      return defaultYes;
    }
    return await askYesNo(rl, question, defaultYes);
  };

  try {
    // -------------------------------------------------------------
    // Step 1: Database Reset
    // -------------------------------------------------------------
    console.log('\n--- 1. Database Initialization ---');
    const wipe = await promptBool(
      'Do you want to wipe existing dummy records from Campus, User, Room, Complaint, Mess, & Notice collections?',
      true
    );

    if (wipe) {
      process.stdout.write('🧹 Resetting collections... ');
      await Promise.all([
        User.deleteMany({}),
        Campus.deleteMany({}),
        Room.deleteMany({}),
        Complaint.deleteMany({}),
        MessMenu.deleteMany({}),
        Notice.deleteMany({}),
      ]);
      console.log('Done! Database is clean.\n');
    } else {
      console.log('Keeping existing database records.\n');
    }

    // -------------------------------------------------------------
    // Step 2: Step A - Manager Setup
    // -------------------------------------------------------------
    console.log('================================================================');
    console.log('   STEP A: Central Campus Manager Setup                         ');
    console.log('================================================================');
    const mgrName = await promptUser('Manager Full Name', 'Nitin Sharma');
    const mgrEmail = await promptUser('Manager Email Address', 'manager@campus.edu');
    const mgrPassword = await promptUser('Manager Password', 'password123');
    const mgrContact = await promptUser('Manager Contact Number', '+91 98765 43210');

    let manager = await User.findOne({ email: mgrEmail.toLowerCase().trim() });
    if (!manager) {
      manager = await User.create({
        name: mgrName,
        email: mgrEmail.toLowerCase().trim(),
        password: mgrPassword,
        role: 'manager',
        contactNumber: mgrContact,
      });
      console.log(`✅ Manager account created: ${manager.name} (${manager.email})\n`);
    } else {
      console.log(`ℹ️  Manager account already exists: ${manager.email}\n`);
    }

    // -------------------------------------------------------------
    // Step 3: Step B - Campus Creation
    // -------------------------------------------------------------
    console.log('================================================================');
    console.log('   STEP B: Campus Entity Creation                               ');
    console.log('================================================================');
    const campusName = await promptUser('Campus Branch Name', 'LIET Greater Noida Campus');
    const campusAddress = await promptUser(
      'Campus Address',
      'Plot 46, Knowledge Park III, Greater Noida, UP - 201306'
    );
    const blocksInput = await promptUser('Hostel Blocks / Wings (comma-separated)', 'A-Block, B-Block');
    const blocks = blocksInput.split(',').map((b) => b.trim()).filter(Boolean);

    let campus = await Campus.findOne({ name: campusName.trim() });
    if (!campus) {
      campus = await Campus.create({
        name: campusName.trim(),
        address: campusAddress.trim(),
        blocks: blocks.length > 0 ? blocks : ['A-Block', 'B-Block'],
        activeStaff: [],
        totalRooms: 0,
      });
      console.log(`✅ Campus document created: "${campus.name}"\n`);
    } else {
      console.log(`ℹ️  Campus already exists: "${campus.name}"\n`);
    }

    // Link Campus to Manager
    manager.campus = campus._id;
    await manager.save();

    // -------------------------------------------------------------
    // Step 4: Step C - Warden & Accountant Setup
    // -------------------------------------------------------------
    console.log('================================================================');
    console.log('   STEP C: Campus Warden & Accountant Setup                     ');
    console.log('================================================================');

    // Warden
    console.log('[Warden Credentials]');
    const wardenName = await promptUser('Hostel Warden Name', 'Dr. Kanchan Warden');
    const wardenEmail = await promptUser('Warden Email Address', 'warden@campus.edu');
    const wardenPassword = await promptUser('Warden Password', 'password123');
    const wardenContact = await promptUser('Warden Contact Number', '+91 98111 22334');

    let warden = await User.findOne({ email: wardenEmail.toLowerCase().trim() });
    if (!warden) {
      warden = await User.create({
        name: wardenName,
        email: wardenEmail.toLowerCase().trim(),
        password: wardenPassword,
        role: 'warden',
        campus: campus._id,
        contactNumber: wardenContact,
      });
      console.log(`✅ Warden account created: ${warden.name} (${warden.email})`);
    }

    // Assign warden to campus
    campus.warden = warden._id;
    await campus.save();

    // Accountant
    console.log('\n[Accountant Credentials]');
    const acctName = await promptUser('Accountant / CFO Name', 'Rajesh Gupta');
    const acctEmail = await promptUser('Accountant Email Address', 'accountant@campus.edu');
    const acctPassword = await promptUser('Accountant Password', 'password123');
    const acctContact = await promptUser('Accountant Contact Number', '+91 98333 44556');

    let accountant = await User.findOne({ email: acctEmail.toLowerCase().trim() });
    if (!accountant) {
      accountant = await User.create({
        name: acctName,
        email: acctEmail.toLowerCase().trim(),
        password: acctPassword,
        role: 'accountant',
        campus: campus._id,
        contactNumber: acctContact,
      });
      console.log(`✅ Accountant account created: ${accountant.name} (${accountant.email})\n`);
    }

    // -------------------------------------------------------------
    // Step 5: Step D - On-Duty Staff Setup (Loop)
    // -------------------------------------------------------------
    console.log('================================================================');
    console.log('   STEP D: On-Duty Campus Staff Roster Setup                    ');
    console.log('================================================================');

    const defaultStaff = [
      { name: 'Virendra Singh', designation: 'Hostel Caretaker', shift: 'Morning (6 AM - 2 PM)', contact: '+91 98222 11001' },
      { name: 'Sunil Kumar', designation: 'Security & Curfew Incharge', shift: 'Night (10 PM - 6 AM)', contact: '+91 98222 11002' },
      { name: 'Manoj Verma', designation: 'Electrician & Maintenance', shift: 'Day (2 PM - 10 PM)', contact: '+91 98222 11003' },
    ];

    const customizeStaff = await promptBool('Do you want to enter custom staff members manually? (y: custom, n: load 3 real staff defaults)', false);

    if (customizeStaff) {
      let addStaff = true;
      while (addStaff) {
        console.log('\n[New Staff Member]');
        const sName = await promptUser('Staff Name');
        const sDesig = await promptUser('Designation (e.g. Caretaker, Electrician, Security Guard)', 'Hostel Caretaker');
        const sShift = await promptUser('Shift (Morning / Day / Night / General)', 'Day (2 PM - 10 PM)');
        const sContact = await promptUser('Staff Contact Number', '+91 98000 00000');

        campus.activeStaff.push({
          name: sName,
          designation: sDesig,
          shift: sShift.includes('(') ? sShift : `${sShift} Shift`,
          contact: sContact,
        });
        console.log(`✅ Added ${sName} (${sDesig}) to roster.`);

        addStaff = await promptBool('Add another staff member?', false);
      }
    } else {
      campus.activeStaff = defaultStaff;
      console.log(`✅ Loaded ${defaultStaff.length} staff members to roster.`);
    }

    await campus.save();
    console.log(`✅ Campus staff roster updated with ${campus.activeStaff.length} staff members.\n`);

    // -------------------------------------------------------------
    // Step 6: Step E - Rooms & Real Student Data Feed (Loop)
    // -------------------------------------------------------------
    console.log('================================================================');
    console.log('   STEP E: Rooms & Resident Student Data Entry                  ');
    console.log('================================================================');

    const createdRooms = [];
    const createdStudents = [];

    const enterCustomRooms = await promptBool(
      'Do you want to enter Rooms & Students interactively one-by-one? (y: interactive loop, n: setup initial 4 rooms with 2 resident students)',
      false
    );

    if (enterCustomRooms) {
      let addMoreRooms = true;
      while (addMoreRooms) {
        console.log('\n--- New Room Setup ---');
        const rNum = await promptUser('Room Number (e.g. 101, 102, 201)', '101');
        const rBlock = await promptUser(`Block / Wing (${blocks.join(' / ')})`, blocks[0] || 'A-Block');
        const rFloor = await promptUser('Floor Number (e.g. 1, 2)', '1');
        const rCap = await promptUser('Bed Capacity', '2');

        const room = await Room.create({
          roomNumber: rNum.toUpperCase().trim(),
          campus: campus._id,
          block: rBlock,
          floor: Number(rFloor) || 1,
          capacity: Number(rCap) || 2,
          currentOccupancy: 0,
          status: 'available',
          residents: [],
        });
        createdRooms.push(room);
        console.log(`✅ Created Room ${room.roomNumber} in ${room.block}.`);

        // Check if student lives in this room
        const hasStudents = await promptBool(`Does any student live in Room ${room.roomNumber}?`, true);
        if (hasStudents) {
          let addMoreResidents = true;
          while (addMoreResidents && room.currentOccupancy < room.capacity) {
            console.log(`\n[Resident Student ${room.currentOccupancy + 1} of ${room.capacity} for Room ${room.roomNumber}]`);
            const sName = await promptUser('Student Full Name', 'Aarav Sharma');
            const sEmail = await promptUser('Student Email Address', `student${room.currentOccupancy + 1}@campus.edu`);
            const sRoll = await promptUser('Roll Number (e.g. 2401530100101)', `240153010010${room.currentOccupancy + 1}`);
            const sContact = await promptUser('Student Contact Number', '+91 97111 88990');
            const sPassword = await promptUser('Student Password', 'password123');
            const sTotalFee = await promptUser('Total Semester Fee (INR)', '65000');
            const sPaidFee = await promptUser('Amount Paid So Far (INR)', '45000');

            const tot = Number(sTotalFee) || 65000;
            const paid = Number(sPaidFee) || 0;
            const feeStatus = paid >= tot ? 'Paid' : paid > 0 ? 'Partial' : 'Pending';

            const student = await User.create({
              name: sName,
              email: sEmail.toLowerCase().trim(),
              password: sPassword,
              role: 'student',
              rollNumber: sRoll.toUpperCase().trim(),
              contactNumber: sContact,
              campus: campus._id,
              room: room._id,
              totalFee: tot,
              paidFee: paid,
              feeStatus,
            });

            room.residents.push(student._id);
            room.currentOccupancy = room.residents.length;
            room.status = room.currentOccupancy >= room.capacity ? 'full' : 'available';
            await room.save();

            createdStudents.push(student);
            console.log(`✅ Assigned ${student.name} (Roll: ${student.rollNumber}, Fee: ${student.feeStatus}) to Room ${room.roomNumber}.`);

            if (room.currentOccupancy < room.capacity) {
              addMoreResidents = await promptBool(`Does another roommate live in Room ${room.roomNumber}?`, false);
            }
          }
        }

        addMoreRooms = await promptBool('Add another room?', false);
      }
    } else {
      // Default: 4 Rooms & 2 Sample Students
      console.log('Generating initial room inventory (101, 102, 201, 202)...');
      const defaultRoomNumbers = ['101', '102', '201', '202'];

      for (const rNum of defaultRoomNumbers) {
        const floor = rNum.startsWith('2') ? 2 : 1;
        const block = rNum.startsWith('2') ? (blocks[1] || 'B-Block') : (blocks[0] || 'A-Block');
        const room = await Room.create({
          roomNumber: rNum,
          campus: campus._id,
          block,
          floor,
          capacity: 2,
          currentOccupancy: 0,
          status: 'available',
        });
        createdRooms.push(room);
      }

      // Add 2 students to Room 101
      const firstRoom = createdRooms[0];
      const s1 = await User.create({
        name: 'Aarav Sharma',
        email: 'student@campus.edu',
        password: 'password123',
        role: 'student',
        rollNumber: '2401530100101',
        contactNumber: '+91 97111 88990',
        campus: campus._id,
        room: firstRoom._id,
        totalFee: 65000,
        paidFee: 45000,
        feeStatus: 'Partial',
      });

      const s2 = await User.create({
        name: 'Rohan Verma',
        email: 'rohan@campus.edu',
        password: 'password123',
        role: 'student',
        rollNumber: '2401530100102',
        contactNumber: '+91 97111 88991',
        campus: campus._id,
        room: firstRoom._id,
        totalFee: 65000,
        paidFee: 65000,
        feeStatus: 'Paid',
      });

      firstRoom.residents = [s1._id, s2._id];
      firstRoom.currentOccupancy = 2;
      firstRoom.status = 'full';
      await firstRoom.save();

      createdStudents.push(s1, s2);
      console.log(`✅ Created 4 rooms and assigned Aarav Sharma & Rohan Verma to Room 101.`);
    }

    campus.totalRooms = createdRooms.length;
    await campus.save();

    // -------------------------------------------------------------
    // Step 7: Step F - Mess Menu Setup
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log('   STEP F: Campus Dining Hall / Mess Menu Setup                 ');
    console.log('================================================================');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const todayDay = days[(new Date().getDay() + 6) % 7];

    const customizeMess = await promptBool(
      `Do you want to customize today's (${todayDay}) meal dishes? (y: custom, n: keep chef defaults)`,
      false
    );

    let bItems = ['Masala Dosa', 'Sambar', 'Coconut Chutney', 'Fresh Milk & Tea'];
    let lItems = ['Paneer Butter Masala', 'Dal Tadka', 'Jeera Rice', 'Tandoori Roti', 'Gulab Jamun'];
    let sItems = ['Samosa with Mint Chutney', 'Adrak Masala Chai'];
    let dItems = ['Mixed Veg Curry', 'Yellow Dal', 'Steamed Rice', 'Phulka', 'Ice Cream'];

    if (customizeMess) {
      const bInput = await promptUser('Breakfast dishes (comma-separated)', bItems.join(', '));
      const lInput = await promptUser('Lunch dishes (comma-separated)', lItems.join(', '));
      const sInput = await promptUser('Evening Snacks (comma-separated)', sItems.join(', '));
      const dInput = await promptUser('Dinner dishes (comma-separated)', dItems.join(', '));

      bItems = bInput.split(',').map((i) => i.trim());
      lItems = lInput.split(',').map((i) => i.trim());
      sItems = sInput.split(',').map((i) => i.trim());
      dItems = dInput.split(',').map((i) => i.trim());
    }

    await MessMenu.create([
      {
        campus: campus._id,
        dayOfWeek: todayDay,
        mealType: 'Breakfast',
        items: bItems,
        timings: { start: '07:30 AM', end: '09:30 AM' },
        expectedHeadcount: 140,
      },
      {
        campus: campus._id,
        dayOfWeek: todayDay,
        mealType: 'Lunch',
        items: lItems,
        timings: { start: '12:30 PM', end: '02:30 PM' },
        expectedHeadcount: 180,
      },
      {
        campus: campus._id,
        dayOfWeek: todayDay,
        mealType: 'Snacks',
        items: sItems,
        timings: { start: '05:00 PM', end: '06:00 PM' },
        expectedHeadcount: 120,
      },
      {
        campus: campus._id,
        dayOfWeek: todayDay,
        mealType: 'Dinner',
        items: dItems,
        timings: { start: '07:30 PM', end: '09:30 PM' },
        expectedHeadcount: 165,
      },
    ]);
    console.log(`✅ Loaded dining hall meal schedule for ${todayDay}.\n`);

    // Create Initial Notice
    await Notice.create({
      title: `Welcome to ${campus.name}`,
      content: 'Hostel gate curfew is strictly 10:00 PM. Please register your biometric fingerprint at the Warden office.',
      category: 'General',
      targetAudience: 'All',
      postedBy: warden._id,
      campus: campus._id,
      isPinned: true,
    });

    // -------------------------------------------------------------
    // Wizard Summary
    // -------------------------------------------------------------
    console.log('================================================================');
    console.log('   🎉 LIVE DATA SETUP COMPLETE FOR STAYMATE AI!                 ');
    console.log('================================================================\n');
    console.log(`Campus:    ${campus.name}`);
    console.log(`Address:   ${campus.address}`);
    console.log(`Blocks:    ${campus.blocks.join(', ')}`);
    console.log(`Total Rooms Configured: ${createdRooms.length}`);
    console.log(`Active Staff Members:   ${campus.activeStaff.length}\n`);

    console.log('🔑 ACCOUNTS CREATED FOR TESTING & DAILY OPERATIONS:');
    console.log('----------------------------------------------------------------');
    console.log(`👔 MANAGER:     ${manager.email} | Pass: password123`);
    console.log(`🛡️  WARDEN:      ${warden.email}  | Pass: password123`);
    console.log(`💰 ACCOUNTANT:  ${accountant.email} | Pass: password123`);
    if (createdStudents.length > 0) {
      console.log(`🎓 STUDENTS:`);
      createdStudents.forEach((st) => {
        console.log(`   • ${st.name.padEnd(16)} | Email: ${st.email.padEnd(22)} | Roll: ${st.rollNumber} | Due: ₹${(st.totalFee - st.paidFee).toLocaleString()}`);
      });
    }
    console.log('----------------------------------------------------------------\n');
    console.log('🌐 Frontend: http://localhost:5173/login');
    console.log('🚀 Login directly using either Email or Roll Number!\n');
  } catch (error) {
    console.error('❌ Error during interactive setup:', error);
  } finally {
    if (rl) rl.close();
    await mongoose.connection.close();
    process.exit(0);
  }
};

runSetupWizard();
