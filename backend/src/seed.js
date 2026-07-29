require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Space = require('./models/Space');
const Booking = require('./models/Booking');
const SlotReservation = require('./models/SlotReservation');

async function seed() {
  await connectDB();

  await Promise.all([
    Booking.deleteMany({}),
    SlotReservation.deleteMany({}),
    Space.deleteMany({}),
  ]);

  const adminEmail = 'admin@serviots.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
    });
    console.log(`[seed] created admin user: ${adminEmail} / Admin@123`);
  } else {
    console.log(`[seed] admin user already exists: ${adminEmail}`);
  }

  const memberEmail = 'member@serviots.com';
  let member = await User.findOne({ email: memberEmail });
  if (!member) {
    member = await User.create({
      name: 'Test Member',
      email: memberEmail,
      password: 'Member@123',
      role: 'member',
    });
    console.log(`[seed] created member user: ${memberEmail} / Member@123`);
  }

  const spaces = await Space.insertMany([
    {
      name: 'Hot Desk A1',
      type: 'desk',
      capacity: 1,
      amenities: ['power outlet', 'monitor', 'ergonomic chair'],
      description: 'Quiet corner hot desk near the window.',
      location: 'Floor 1',
      pricePerHour: 5,
    },
    {
      name: 'Hot Desk A2',
      type: 'desk',
      capacity: 1,
      amenities: ['power outlet', 'monitor'],
      location: 'Floor 1',
      pricePerHour: 5,
    },
    {
      name: 'Focus Pod B1',
      type: 'desk',
      capacity: 1,
      amenities: ['power outlet', 'soundproof'],
      location: 'Floor 2',
      pricePerHour: 8,
    },
    {
      name: 'Meeting Room "Everest"',
      type: 'meeting_room',
      capacity: 8,
      amenities: ['projector', 'whiteboard', 'video conferencing'],
      location: 'Floor 3',
      pricePerHour: 40,
    },
    {
      name: 'Meeting Room "K2"',
      type: 'meeting_room',
      capacity: 4,
      amenities: ['whiteboard', 'TV screen'],
      location: 'Floor 3',
      pricePerHour: 25,
    },
    {
      name: 'Boardroom "Everest Peak"',
      type: 'meeting_room',
      capacity: 12,
      amenities: ['projector', 'video conferencing', 'catering available'],
      location: 'Floor 4',
      pricePerHour: 60,
    },
  ]);

  console.log(`[seed] created ${spaces.length} spaces`);
  console.log('[seed] done');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
