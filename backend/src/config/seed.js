require('dotenv').config();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const sequelize = require('./database');
require('../models/index');
const { User, Ticket, Escalation, Notification } = require('../models');
const SlaProvider = require('../services/SlaProvider');

const seed = async () => {
  try {
    // Ensure data directory
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    await sequelize.sync(); // Don't force reset if not needed

    // Check if already seeded
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('✅ Database already contains users. Skipping seed process...');
      process.exit(0);
    }

    console.log('🗄️  Database empty. Proceeding with seed...');
    await sequelize.sync({ force: true });


    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@sets.local',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: 'ADMIN',
    });

    const agent1 = await User.create({
      name: 'Alex Singh',
      email: 'agent@sets.local',
      passwordHash: await bcrypt.hash('agent123', 12),
      role: 'SUPPORT',
    });

    const agent2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@sets.local',
      passwordHash: await bcrypt.hash('agent123', 12),
      role: 'SUPPORT',
    });

    const user1 = await User.create({
      name: 'Rahul Kumar',
      email: 'user@sets.local',
      passwordHash: await bcrypt.hash('user123', 12),
      role: 'USER',
    });

    const user2 = await User.create({
      name: 'Sneha Patel',
      email: 'sneha@sets.local',
      passwordHash: await bcrypt.hash('user123', 12),
      role: 'USER',
    });

    console.log('👥 Users seeded.');

    // Helper to create ticket with specific created_at
    const createTicket = async (data, hoursAgo = 0) => {
      const priority = SlaProvider.calculatePriority(data.category, data.impact);
      const slaDeadline = new Date(Date.now() - (hoursAgo * 3600000) + (SlaProvider.getSlaHours(priority) * 3600000));
      return Ticket.create({ ...data, priority, slaDeadline });
    };

    // Create sample tickets
    const t1 = await createTicket({
      title: 'Payment not reflecting in account',
      description: 'I made a payment 2 hours ago but my account balance has not been updated.',
      category: 'Payment',
      impact: 'HIGH',
      status: 'IN_PROGRESS',
      createdBy: user1.id,
      assignedTo: agent1.id,
      escalationLevel: 0,
    });

    const t2 = await createTicket({
      title: 'Unable to login to account',
      description: 'Login page shows error 500 when I enter correct credentials.',
      category: 'Technical',
      impact: 'HIGH',
      status: 'OPEN',
      createdBy: user2.id,
      escalationLevel: 0,
    });

    const t3 = await createTicket({
      title: 'Duplicate transaction charged twice',
      description: 'My account was debited twice for a single transaction on April 3rd.',
      category: 'Payment',
      impact: 'HIGH',
      status: 'ASSIGNED',
      createdBy: user1.id,
      assignedTo: agent2.id,
      escalationLevel: 1,
    }, 4); // 4 hours ago — breached P1 SLA

    const t4 = await createTicket({
      title: 'Password reset email not received',
      description: 'Requested password reset 30 minutes ago, no email received.',
      category: 'Account',
      impact: 'MEDIUM',
      status: 'RESOLVED',
      createdBy: user2.id,
      assignedTo: agent1.id,
      escalationLevel: 0,
    });

    const t5 = await createTicket({
      title: 'App crashes on checkout screen',
      description: 'Application closes unexpectedly when clicking the checkout button.',
      category: 'Technical',
      impact: 'MEDIUM',
      status: 'OPEN',
      createdBy: user1.id,
      escalationLevel: 0,
    });

    const t6 = await createTicket({
      title: 'Need to update billing address',
      description: 'I recently moved and need to update my registered billing address.',
      category: 'Account',
      impact: 'LOW',
      status: 'CLOSED',
      createdBy: user2.id,
      assignedTo: agent2.id,
      escalationLevel: 0,
    });

    console.log('🎫 Tickets seeded.');

    // Add an escalation record for t3
    await Escalation.create({
      ticketId: t3.id,
      level: 1,
      reason: 'SLA breached — escalated to Senior Agent (Level 1)',
    });

    console.log('📈 Escalations seeded.');

    // Add some notifications
    await Notification.bulkCreate([
      { userId: user1.id, message: `✅ Ticket #${t1.id} created with P1 priority. SLA: 2 hours.`, type: 'GENERAL', ticketId: t1.id },
      { userId: agent1.id, message: `📋 Ticket #${t1.id} assigned to you.`, type: 'ASSIGNED', ticketId: t1.id },
      { userId: agent2.id, message: `🚨 ESCALATION L1: Ticket #${t3.id} breached SLA!`, type: 'ESCALATED', ticketId: t3.id, readStatus: false },
      { userId: user2.id, message: `✅ Ticket #${t4.id} has been RESOLVED.`, type: 'RESOLVED', ticketId: t4.id },
    ]);

    console.log('🔔 Notifications seeded.');
    console.log('\n✅ Seed complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Login Credentials:');
    console.log('  Admin:   admin@sets.local  / admin123');
    console.log('  Agent:   agent@sets.local  / agent123');
    console.log('  Agent2:  priya@sets.local  / agent123');
    console.log('  User:    user@sets.local   / user123');
    console.log('  User2:   sneha@sets.local  / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
