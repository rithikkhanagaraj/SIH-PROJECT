const bcrypt = require('bcryptjs');
const { pool, initializeDatabase } = require('../config/database');

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize database first
    await initializeDatabase();
    
    await client.query('BEGIN');

    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Cleaning existing data...');
    await client.query('TRUNCATE logs, expenditures, assignments, transfers, purchases, assets, users, bases RESTART IDENTITY CASCADE');

    // 1. Create bases
    console.log('🏢 Creating bases...');
    const basesData = [
      { name: 'Fort Liberty', location: 'North Carolina, USA' },
      { name: 'Camp Pendleton', location: 'California, USA' },
      { name: 'Joint Base Lewis-McChord', location: 'Washington, USA' },
      { name: 'Fort Hood', location: 'Texas, USA' }
    ];

    const baseIds = [];
    for (const base of basesData) {
      const result = await client.query(
        'INSERT INTO bases (name, location) VALUES ($1, $2) RETURNING id',
        [base.name, base.location]
      );
      baseIds.push(result.rows[0].id);
    }

    // 2. Create users
    console.log('👥 Creating users...');
    const saltRounds = 12;
    const usersData = [
      {
        name: 'General James Smith',
        email: 'admin@military.gov',
        password: 'admin123',
        role: 'Admin',
        base_id: null
      },
      {
        name: 'Colonel Sarah Johnson',
        email: 'commander1@military.gov',
        password: 'commander123',
        role: 'Base Commander',
        base_id: baseIds[0]
      },
      {
        name: 'Colonel Michael Brown',
        email: 'commander2@military.gov',
        password: 'commander123',
        role: 'Base Commander',
        base_id: baseIds[1]
      },
      {
        name: 'Major Lisa Davis',
        email: 'logistics1@military.gov',
        password: 'logistics123',
        role: 'Logistics Officer',
        base_id: baseIds[0]
      },
      {
        name: 'Captain Robert Wilson',
        email: 'logistics2@military.gov',
        password: 'logistics123',
        role: 'Logistics Officer',
        base_id: baseIds[1]
      }
    ];

    const userIds = [];
    for (const user of usersData) {
      const passwordHash = await bcrypt.hash(user.password, saltRounds);
      const result = await client.query(
        'INSERT INTO users (name, email, password_hash, role, base_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [user.name, user.email, passwordHash, user.role, user.base_id]
      );
      userIds.push(result.rows[0].id);
    }

    // 3. Create assets
    console.log('🎯 Creating assets...');
    const assetsData = [
      // Fort Liberty assets
      { name: 'M4A1 Carbine', type: 'Weapon', quantity: 250, base_id: baseIds[0] },
      { name: 'M249 SAW', type: 'Weapon', quantity: 45, base_id: baseIds[0] },
      { name: 'M2 Bradley IFV', type: 'Vehicle', quantity: 12, base_id: baseIds[0] },
      { name: 'HMMWV', type: 'Vehicle', quantity: 35, base_id: baseIds[0] },
      { name: '5.56mm Ammunition', type: 'Ammunition', quantity: 50000, base_id: baseIds[0] },
      { name: '7.62mm Ammunition', type: 'Ammunition', quantity: 25000, base_id: baseIds[0] },
      { name: 'Night Vision Goggles', type: 'Equipment', quantity: 180, base_id: baseIds[0] },
      { name: 'Body Armor', type: 'Equipment', quantity: 300, base_id: baseIds[0] },

      // Camp Pendleton assets
      { name: 'M4A1 Carbine', type: 'Weapon', quantity: 180, base_id: baseIds[1] },
      { name: 'M240B Machine Gun', type: 'Weapon', quantity: 25, base_id: baseIds[1] },
      { name: 'LAV-25', type: 'Vehicle', quantity: 8, base_id: baseIds[1] },
      { name: 'M1A1 Abrams Tank', type: 'Vehicle', quantity: 6, base_id: baseIds[1] },
      { name: '5.56mm Ammunition', type: 'Ammunition', quantity: 40000, base_id: baseIds[1] },
      { name: '7.62mm Ammunition', type: 'Ammunition', quantity: 30000, base_id: baseIds[1] },
      { name: 'Combat Helmet', type: 'Equipment', quantity: 220, base_id: baseIds[1] },
      { name: 'Radio Equipment', type: 'Equipment', quantity: 75, base_id: baseIds[1] },

      // Joint Base Lewis-McChord assets
      { name: 'M4A1 Carbine', type: 'Weapon', quantity: 120, base_id: baseIds[2] },
      { name: 'M16A4', type: 'Weapon', quantity: 80, base_id: baseIds[2] },
      { name: 'UH-60 Black Hawk', type: 'Vehicle', quantity: 4, base_id: baseIds[2] },
      { name: 'MRAP Vehicle', type: 'Vehicle', quantity: 15, base_id: baseIds[2] },
      { name: '5.56mm Ammunition', type: 'Ammunition', quantity: 35000, base_id: baseIds[2] },
      { name: 'Medical Supplies', type: 'Equipment', quantity: 500, base_id: baseIds[2] },

      // Fort Hood assets
      { name: 'M4A1 Carbine', type: 'Weapon', quantity: 300, base_id: baseIds[3] },
      { name: 'M1A2 Abrams Tank', type: 'Vehicle', quantity: 20, base_id: baseIds[3] },
      { name: 'M109A6 Paladin', type: 'Vehicle', quantity: 8, base_id: baseIds[3] },
      { name: '120mm Tank Rounds', type: 'Ammunition', quantity: 800, base_id: baseIds[3] },
      { name: '155mm Artillery Shells', type: 'Ammunition', quantity: 1200, base_id: baseIds[3] }
    ];

    const assetIds = [];
    for (const asset of assetsData) {
      const result = await client.query(
        'INSERT INTO assets (name, type, quantity, base_id) VALUES ($1, $2, $3, $4) RETURNING id',
        [asset.name, asset.type, asset.quantity, asset.base_id]
      );
      assetIds.push(result.rows[0].id);
    }

    // 4. Create sample purchases
    console.log('🛒 Creating sample purchases...');
    const purchasesData = [
      {
        asset_id: assetIds[0], // M4A1 Carbine at Fort Liberty
        quantity: 50,
        date: '2024-01-15',
        base_id: baseIds[0],
        user_id: userIds[3], // Major Lisa Davis
        notes: 'Quarterly weapon procurement'
      },
      {
        asset_id: assetIds[4], // 5.56mm Ammunition at Fort Liberty
        quantity: 10000,
        date: '2024-01-20',
        base_id: baseIds[0],
        user_id: userIds[3],
        notes: 'Training ammunition resupply'
      },
      {
        asset_id: assetIds[8], // M4A1 Carbine at Camp Pendleton
        quantity: 30,
        date: '2024-01-25',
        base_id: baseIds[1],
        user_id: userIds[4], // Captain Robert Wilson
        notes: 'New unit equipment'
      }
    ];

    for (const purchase of purchasesData) {
      await client.query(
        'INSERT INTO purchases (asset_id, quantity, date, base_id, user_id, notes) VALUES ($1, $2, $3, $4, $5, $6)',
        [purchase.asset_id, purchase.quantity, purchase.date, purchase.base_id, purchase.user_id, purchase.notes]
      );
    }

    // 5. Create sample transfers
    console.log('🚚 Creating sample transfers...');
    const transfersData = [
      {
        asset_id: assetIds[6], // Night Vision Goggles
        from_base_id: baseIds[0],
        to_base_id: baseIds[2],
        quantity: 20,
        date: '2024-02-01',
        user_id: userIds[3],
        status: 'Completed',
        notes: 'Support for training exercise'
      },
      {
        asset_id: assetIds[4], // 5.56mm Ammunition
        from_base_id: baseIds[0],
        to_base_id: baseIds[1],
        quantity: 5000,
        date: '2024-02-05',
        user_id: userIds[0], // Admin
        status: 'Completed',
        notes: 'Emergency resupply'
      }
    ];

    for (const transfer of transfersData) {
      await client.query(
        'INSERT INTO transfers (asset_id, from_base_id, to_base_id, quantity, date, user_id, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [transfer.asset_id, transfer.from_base_id, transfer.to_base_id, transfer.quantity, transfer.date, transfer.user_id, transfer.status, transfer.notes]
      );
    }

    // 6. Create sample assignments
    console.log('📋 Creating sample assignments...');
    const assignmentsData = [
      {
        asset_id: assetIds[0], // M4A1 Carbine at Fort Liberty
        assigned_to: 'Alpha Company, 1st Battalion',
        quantity: 30,
        date: '2024-02-10',
        base_id: baseIds[0],
        user_id: userIds[1], // Colonel Sarah Johnson
        status: 'Active',
        notes: 'Training deployment'
      },
      {
        asset_id: assetIds[3], // HMMWV at Fort Liberty
        assigned_to: 'Bravo Company, 2nd Battalion',
        quantity: 5,
        date: '2024-02-12',
        base_id: baseIds[0],
        user_id: userIds[1],
        status: 'Active',
        notes: 'Patrol operations'
      },
      {
        asset_id: assetIds[8], // M4A1 Carbine at Camp Pendleton
        assigned_to: 'Charlie Company, 3rd Marines',
        quantity: 25,
        date: '2024-02-08',
        base_id: baseIds[1],
        user_id: userIds[2], // Colonel Michael Brown
        status: 'Returned',
        notes: 'Completed training exercise'
      }
    ];

    for (const assignment of assignmentsData) {
      await client.query(
        'INSERT INTO assignments (asset_id, assigned_to, quantity, date, base_id, user_id, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [assignment.asset_id, assignment.assigned_to, assignment.quantity, assignment.date, assignment.base_id, assignment.user_id, assignment.status, assignment.notes]
      );
    }

    // 7. Create sample expenditures
    console.log('💥 Creating sample expenditures...');
    const expendituresData = [
      {
        asset_id: assetIds[4], // 5.56mm Ammunition at Fort Liberty
        quantity: 2500,
        date: '2024-02-15',
        base_id: baseIds[0],
        user_id: userIds[3],
        reason: 'Live Fire Training',
        notes: 'Marksmanship training exercise'
      },
      {
        asset_id: assetIds[12], // 5.56mm Ammunition at Camp Pendleton
        quantity: 1800,
        date: '2024-02-18',
        base_id: baseIds[1],
        user_id: userIds[4],
        reason: 'Combat Training',
        notes: 'Squad-level combat training'
      }
    ];

    for (const expenditure of expendituresData) {
      await client.query(
        'INSERT INTO expenditures (asset_id, quantity, date, base_id, user_id, reason, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [expenditure.asset_id, expenditure.quantity, expenditure.date, expenditure.base_id, expenditure.user_id, expenditure.reason, expenditure.notes]
      );
    }

    // Update asset quantities based on transactions
    console.log('🔄 Updating asset quantities...');
    
    // Adjust for purchases (already added in asset creation)
    // Adjust for transfers (subtract from source, add to destination)
    await client.query('UPDATE assets SET quantity = quantity - 20 WHERE id = $1', [assetIds[6]]); // Night Vision Goggles at Fort Liberty
    await client.query('UPDATE assets SET quantity = quantity - 5000 WHERE id = $1', [assetIds[4]]); // 5.56mm Ammunition at Fort Liberty
    
    // Add transferred items to destination bases
    // Night Vision Goggles to Joint Base Lewis-McChord (create if doesn't exist)
    const nvgResult = await client.query('SELECT id FROM assets WHERE name = $1 AND base_id = $2', ['Night Vision Goggles', baseIds[2]]);
    if (nvgResult.rows.length === 0) {
      await client.query('INSERT INTO assets (name, type, quantity, base_id) VALUES ($1, $2, $3, $4)', ['Night Vision Goggles', 'Equipment', 20, baseIds[2]]);
    } else {
      await client.query('UPDATE assets SET quantity = quantity + 20 WHERE id = $1', [nvgResult.rows[0].id]);
    }
    
    // 5.56mm Ammunition to Camp Pendleton
    await client.query('UPDATE assets SET quantity = quantity + 5000 WHERE id = $1', [assetIds[12]]);
    
    // Adjust for expenditures (subtract from assets)
    await client.query('UPDATE assets SET quantity = quantity - 2500 WHERE id = $1', [assetIds[4]]); // 5.56mm Ammunition at Fort Liberty
    await client.query('UPDATE assets SET quantity = quantity - 1800 WHERE id = $1', [assetIds[12]]); // 5.56mm Ammunition at Camp Pendleton

    await client.query('COMMIT');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Demo Data Summary:');
    console.log(`   • ${basesData.length} military bases created`);
    console.log(`   • ${usersData.length} users created (Admin, Base Commanders, Logistics Officers)`);
    console.log(`   • ${assetsData.length} assets created across all bases`);
    console.log(`   • ${purchasesData.length} purchase transactions`);
    console.log(`   • ${transfersData.length} transfer transactions`);
    console.log(`   • ${assignmentsData.length} asset assignments`);
    console.log(`   • ${expendituresData.length} expenditure records`);
    
    console.log('\n🔐 Demo Login Credentials:');
    console.log('   Admin: admin@military.gov / admin123');
    console.log('   Base Commander (Fort Liberty): commander1@military.gov / commander123');
    console.log('   Base Commander (Camp Pendleton): commander2@military.gov / commander123');
    console.log('   Logistics Officer (Fort Liberty): logistics1@military.gov / logistics123');
    console.log('   Logistics Officer (Camp Pendleton): logistics2@military.gov / logistics123');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('🎉 Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedData };