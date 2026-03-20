import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Clear existing data (in reverse order of dependencies)
    await db.activity.deleteMany({});
    await db.notification.deleteMany({});
    await db.document.deleteMany({});
    await db.payment.deleteMany({});
    await db.maintenanceRequest.deleteMany({});
    await db.lease.deleteMany({});
    await db.tenant.deleteMany({});
    await db.property.deleteMany({});
    await db.user.deleteMany({});
    await db.dashboardSettings.deleteMany({});

    // Create a demo user
    const user = await db.user.create({
      data: {
        email: 'admin@techrealest.com',
        name: 'John Manager',
        password: 'demo123', // In real app, this would be hashed
        role: 'ADMIN',
        phone: '+1 (555) 123-4567',
        isActive: true,
        lastLoginAt: new Date()
      }
    });

    // Create properties
    const properties = await Promise.all([
      db.property.create({
        data: {
          name: 'Sunset Villa',
          description: 'Beautiful single-family home with pool and garden',
          type: 'SINGLE_FAMILY',
          status: 'OCCUPIED',
          address: '123 Sunset Boulevard',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90028',
          units: 1,
          bedrooms: 4,
          bathrooms: 3,
          squareFeet: 2800,
          yearBuilt: 2015,
          lotSize: 0.5,
          purchasePrice: 850000,
          currentValue: 920000,
          monthlyMortgage: 3200,
          propertyTax: 850,
          insurance: 180,
          amenities: JSON.stringify(['Pool', 'Garage', 'Garden', 'Central AC']),
          managerId: user.id
        }
      }),
      db.property.create({
        data: {
          name: 'Downtown Lofts',
          description: 'Modern apartment complex in the heart of downtown',
          type: 'APARTMENT',
          status: 'OCCUPIED',
          address: '456 Main Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          units: 12,
          bedrooms: 2,
          bathrooms: 2,
          squareFeet: 1200,
          yearBuilt: 2020,
          purchasePrice: 4500000,
          currentValue: 5200000,
          monthlyMortgage: 18000,
          propertyTax: 4500,
          insurance: 1200,
          amenities: JSON.stringify(['Gym', 'Rooftop', 'Concierge', 'Parking']),
          managerId: user.id
        }
      }),
      db.property.create({
        data: {
          name: 'Oak Park Residence',
          description: 'Charming condo in quiet neighborhood',
          type: 'CONDO',
          status: 'AVAILABLE',
          address: '789 Oak Avenue',
          city: 'Palo Alto',
          state: 'CA',
          zipCode: '94301',
          units: 1,
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1650,
          yearBuilt: 2018,
          purchasePrice: 1200000,
          currentValue: 1350000,
          monthlyMortgage: 4500,
          propertyTax: 1100,
          insurance: 250,
          amenities: JSON.stringify(['Balcony', 'Gym Access', 'Pet Friendly']),
          managerId: user.id
        }
      }),
      db.property.create({
        data: {
          name: 'Harbor View Complex',
          description: 'Multi-family property with ocean views',
          type: 'MULTI_FAMILY',
          status: 'OCCUPIED',
          address: '321 Harbor Drive',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92101',
          units: 6,
          bedrooms: 2,
          bathrooms: 1.5,
          squareFeet: 950,
          yearBuilt: 2010,
          purchasePrice: 2800000,
          currentValue: 3200000,
          monthlyMortgage: 12000,
          propertyTax: 2800,
          insurance: 800,
          amenities: JSON.stringify(['Ocean View', 'BBQ Area', 'Laundry']),
          managerId: user.id
        }
      }),
      db.property.create({
        data: {
          name: 'Mountain Retreat',
          description: 'Peaceful townhouse near hiking trails',
          type: 'TOWNHOUSE',
          status: 'FOR_RENT',
          address: '555 Mountain Road',
          city: 'Pasadena',
          state: 'CA',
          zipCode: '91101',
          units: 1,
          bedrooms: 3,
          bathrooms: 2.5,
          squareFeet: 2000,
          yearBuilt: 2019,
          purchasePrice: 750000,
          currentValue: 820000,
          monthlyMortgage: 2800,
          propertyTax: 720,
          insurance: 200,
          amenities: JSON.stringify(['Garage', 'Patio', 'Mountain View']),
          managerId: user.id
        }
      }),
      db.property.create({
        data: {
          name: 'Tech Hub Office',
          description: 'Modern commercial space in tech district',
          type: 'COMMERCIAL',
          status: 'OCCUPIED',
          address: '100 Innovation Way',
          city: 'San Jose',
          state: 'CA',
          zipCode: '95110',
          units: 1,
          bedrooms: 0,
          bathrooms: 4,
          squareFeet: 5000,
          yearBuilt: 2021,
          purchasePrice: 3500000,
          currentValue: 4000000,
          monthlyMortgage: 15000,
          propertyTax: 3800,
          insurance: 600,
          amenities: JSON.stringify(['Conference Rooms', 'Parking', 'Security System']),
          managerId: user.id
        }
      }),
      db.property.create({
        data: {
          name: 'Garden Apartments',
          description: 'Affordable apartments with community garden',
          type: 'APARTMENT',
          status: 'UNDER_MAINTENANCE',
          address: '222 Garden Lane',
          city: 'Sacramento',
          state: 'CA',
          zipCode: '95814',
          units: 8,
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 700,
          yearBuilt: 2005,
          purchasePrice: 1600000,
          currentValue: 1900000,
          monthlyMortgage: 7000,
          propertyTax: 1600,
          insurance: 500,
          amenities: JSON.stringify(['Community Garden', 'Laundry', 'Playground']),
          managerId: user.id
        }
      }),
      db.property.create({
        data: {
          name: 'Bayfront Luxury',
          description: 'Premium waterfront condo with stunning views',
          type: 'CONDO',
          status: 'FOR_SALE',
          address: '999 Bay Shore Drive',
          city: 'Newport Beach',
          state: 'CA',
          zipCode: '92660',
          units: 1,
          bedrooms: 4,
          bathrooms: 3.5,
          squareFeet: 3200,
          yearBuilt: 2022,
          purchasePrice: 2500000,
          currentValue: 2800000,
          monthlyMortgage: 9500,
          propertyTax: 2400,
          insurance: 450,
          amenities: JSON.stringify(['Waterfront', 'Pool', 'Spa', 'Valet Parking']),
          managerId: user.id
        }
      })
    ]);

    // Create tenants
    const tenants = await Promise.all([
      db.tenant.create({
        data: {
          firstName: 'Michael',
          lastName: 'Johnson',
          email: 'michael.johnson@email.com',
          phone: '+1 (555) 234-5678',
          dateOfBirth: new Date('1985-03-15'),
          employer: 'Tech Corp Inc.',
          jobTitle: 'Software Engineer',
          monthlyIncome: 12000,
          emergencyContactName: 'Sarah Johnson',
          emergencyContactPhone: '+1 (555) 234-5679',
          emergencyContactRelation: 'Spouse',
          status: 'ACTIVE',
          creditScore: 750,
          backgroundCheckStatus: 'PASSED',
          propertyId: properties[0].id,
          addedById: user.id
        }
      }),
      db.tenant.create({
        data: {
          firstName: 'Emily',
          lastName: 'Chen',
          email: 'emily.chen@email.com',
          phone: '+1 (555) 345-6789',
          dateOfBirth: new Date('1990-07-22'),
          employer: 'Design Studio',
          jobTitle: 'UX Designer',
          monthlyIncome: 8500,
          emergencyContactName: 'David Chen',
          emergencyContactPhone: '+1 (555) 345-6790',
          emergencyContactRelation: 'Brother',
          status: 'ACTIVE',
          creditScore: 720,
          backgroundCheckStatus: 'PASSED',
          propertyId: properties[1].id,
          addedById: user.id
        }
      }),
      db.tenant.create({
        data: {
          firstName: 'Robert',
          lastName: 'Williams',
          email: 'robert.williams@email.com',
          phone: '+1 (555) 456-7890',
          dateOfBirth: new Date('1978-11-08'),
          employer: 'Finance Partners',
          jobTitle: 'Financial Analyst',
          monthlyIncome: 9500,
          emergencyContactName: 'Mary Williams',
          emergencyContactPhone: '+1 (555) 456-7891',
          emergencyContactRelation: 'Spouse',
          status: 'ACTIVE',
          creditScore: 780,
          backgroundCheckStatus: 'PASSED',
          propertyId: properties[3].id,
          addedById: user.id
        }
      }),
      db.tenant.create({
        data: {
          firstName: 'Jessica',
          lastName: 'Martinez',
          email: 'jessica.martinez@email.com',
          phone: '+1 (555) 567-8901',
          dateOfBirth: new Date('1992-04-30'),
          employer: 'Marketing Pro',
          jobTitle: 'Marketing Manager',
          monthlyIncome: 10000,
          emergencyContactName: 'Carlos Martinez',
          emergencyContactPhone: '+1 (555) 567-8902',
          emergencyContactRelation: 'Father',
          status: 'ACTIVE',
          creditScore: 710,
          backgroundCheckStatus: 'PASSED',
          propertyId: properties[3].id,
          addedById: user.id
        }
      }),
      db.tenant.create({
        data: {
          firstName: 'David',
          lastName: 'Brown',
          email: 'david.brown@email.com',
          phone: '+1 (555) 678-9012',
          dateOfBirth: new Date('1988-09-12'),
          employer: 'Startup XYZ',
          jobTitle: 'Product Manager',
          monthlyIncome: 11000,
          emergencyContactName: 'Linda Brown',
          emergencyContactPhone: '+1 (555) 678-9013',
          emergencyContactRelation: 'Mother',
          status: 'ACTIVE',
          creditScore: 735,
          backgroundCheckStatus: 'PASSED',
          propertyId: properties[1].id,
          addedById: user.id
        }
      }),
      db.tenant.create({
        data: {
          firstName: 'Amanda',
          lastName: 'Taylor',
          email: 'amanda.taylor@email.com',
          phone: '+1 (555) 789-0123',
          dateOfBirth: new Date('1995-01-25'),
          employer: 'Healthcare Plus',
          jobTitle: 'Nurse',
          monthlyIncome: 6500,
          emergencyContactName: 'James Taylor',
          emergencyContactPhone: '+1 (555) 789-0124',
          emergencyContactRelation: 'Brother',
          status: 'ACTIVE',
          creditScore: 690,
          backgroundCheckStatus: 'PASSED',
          propertyId: properties[6].id,
          addedById: user.id
        }
      }),
      db.tenant.create({
        data: {
          firstName: 'Christopher',
          lastName: 'Anderson',
          email: 'chris.anderson@email.com',
          phone: '+1 (555) 890-1234',
          dateOfBirth: new Date('1982-06-18'),
          employer: 'Legal Associates',
          jobTitle: 'Attorney',
          monthlyIncome: 15000,
          emergencyContactName: 'Patricia Anderson',
          emergencyContactPhone: '+1 (555) 890-1235',
          emergencyContactRelation: 'Spouse',
          status: 'ACTIVE',
          creditScore: 790,
          backgroundCheckStatus: 'PASSED',
          propertyId: properties[1].id,
          addedById: user.id
        }
      }),
      db.tenant.create({
        data: {
          firstName: 'Sarah',
          lastName: 'Thomas',
          email: 'sarah.thomas@email.com',
          phone: '+1 (555) 901-2345',
          dateOfBirth: new Date('1993-12-05'),
          employer: 'Education First',
          jobTitle: 'Teacher',
          monthlyIncome: 5500,
          emergencyContactName: 'John Thomas',
          emergencyContactPhone: '+1 (555) 901-2346',
          emergencyContactRelation: 'Father',
          status: 'PENDING',
          creditScore: 680,
          backgroundCheckStatus: 'PENDING',
          addedById: user.id
        }
      }),
      db.tenant.create({
        data: {
          firstName: 'Daniel',
          lastName: 'Jackson',
          email: 'daniel.jackson@email.com',
          phone: '+1 (555) 012-3456',
          dateOfBirth: new Date('1987-08-20'),
          employer: 'Construction Co.',
          jobTitle: 'Project Manager',
          monthlyIncome: 8000,
          emergencyContactName: 'Karen Jackson',
          emergencyContactPhone: '+1 (555) 012-3457',
          emergencyContactRelation: 'Spouse',
          status: 'ACTIVE',
          creditScore: 700,
          backgroundCheckStatus: 'PASSED',
          propertyId: properties[3].id,
          addedById: user.id
        }
      }),
      db.tenant.create({
        data: {
          firstName: 'Michelle',
          lastName: 'White',
          email: 'michelle.white@email.com',
          phone: '+1 (555) 123-4568',
          dateOfBirth: new Date('1991-02-14'),
          employer: 'Real Estate Solutions',
          jobTitle: 'Real Estate Agent',
          monthlyIncome: 9000,
          emergencyContactName: 'Thomas White',
          emergencyContactPhone: '+1 (555) 123-4569',
          emergencyContactRelation: 'Brother',
          status: 'ACTIVE',
          creditScore: 740,
          backgroundCheckStatus: 'PASSED',
          propertyId: properties[5].id,
          addedById: user.id
        }
      }),
      db.tenant.create({
        data: {
          firstName: 'Kevin',
          lastName: 'Harris',
          email: 'kevin.harris@email.com',
          phone: '+1 (555) 234-5680',
          dateOfBirth: new Date('1984-10-03'),
          employer: 'Accounting Firm LLC',
          jobTitle: 'CPA',
          monthlyIncome: 13000,
          emergencyContactName: 'Nancy Harris',
          emergencyContactPhone: '+1 (555) 234-5681',
          emergencyContactRelation: 'Spouse',
          status: 'INACTIVE',
          creditScore: 760,
          backgroundCheckStatus: 'PASSED',
          addedById: user.id
        }
      }),
      db.tenant.create({
        data: {
          firstName: 'Lisa',
          lastName: 'Clark',
          email: 'lisa.clark@email.com',
          phone: '+1 (555) 345-6791',
          dateOfBirth: new Date('1989-05-28'),
          employer: 'Media Group',
          jobTitle: 'Journalist',
          monthlyIncome: 7500,
          emergencyContactName: 'Mark Clark',
          emergencyContactPhone: '+1 (555) 345-6792',
          emergencyContactRelation: 'Brother',
          status: 'ACTIVE',
          creditScore: 715,
          backgroundCheckStatus: 'PASSED',
          propertyId: properties[1].id,
          addedById: user.id
        }
      }),
      db.tenant.create({
        data: {
          firstName: 'Jennifer',
          lastName: 'Lewis',
          email: 'jennifer.lewis@email.com',
          phone: '+1 (555) 456-7892',
          dateOfBirth: new Date('1994-07-11'),
          employer: 'Non-Profit Org',
          jobTitle: 'Program Coordinator',
          monthlyIncome: 5000,
          emergencyContactName: 'Robert Lewis',
          emergencyContactPhone: '+1 (555) 456-7893',
          emergencyContactRelation: 'Father',
          status: 'FORMER',
          creditScore: 670,
          backgroundCheckStatus: 'EXPIRED',
          addedById: user.id
        }
      }),
      db.tenant.create({
        data: {
          firstName: 'Anthony',
          lastName: 'Walker',
          email: 'anthony.walker@email.com',
          phone: '+1 (555) 567-8903',
          dateOfBirth: new Date('1986-03-09'),
          employer: 'Engineering Solutions',
          jobTitle: 'Civil Engineer',
          monthlyIncome: 9500,
          emergencyContactName: 'Diana Walker',
          emergencyContactPhone: '+1 (555) 567-8904',
          emergencyContactRelation: 'Spouse',
          status: 'ACTIVE',
          creditScore: 745,
          backgroundCheckStatus: 'PASSED',
          propertyId: properties[3].id,
          addedById: user.id
        }
      }),
      db.tenant.create({
        data: {
          firstName: 'Rachel',
          lastName: 'Hall',
          email: 'rachel.hall@email.com',
          phone: '+1 (555) 678-9014',
          dateOfBirth: new Date('1996-11-22'),
          employer: 'Tech Startup',
          jobTitle: 'Data Analyst',
          monthlyIncome: 7800,
          emergencyContactName: 'Steven Hall',
          emergencyContactPhone: '+1 (555) 678-9015',
          emergencyContactRelation: 'Brother',
          status: 'ACTIVE',
          creditScore: 725,
          backgroundCheckStatus: 'PASSED',
          propertyId: properties[6].id,
          addedById: user.id
        }
      })
    ]);

    // Create leases
    const now = new Date();
    const leases = await Promise.all([
      db.lease.create({
        data: {
          type: 'FIXED_TERM',
          status: 'ACTIVE',
          propertyId: properties[0].id,
          tenantId: tenants[0].id,
          startDate: new Date(now.getFullYear() - 1, 0, 1),
          endDate: new Date(now.getFullYear() + 1, 11, 31),
          monthlyRent: 3500,
          securityDeposit: 7000,
          petDeposit: 500,
          lateFee: 150,
          gracePeriodDays: 5,
          paymentDueDay: 1,
          managerId: user.id,
          tenantSignedAt: new Date(now.getFullYear() - 1, 0, 1),
          managerSignedAt: new Date(now.getFullYear() - 1, 0, 2)
        }
      }),
      db.lease.create({
        data: {
          type: 'MONTH_TO_MONTH',
          status: 'ACTIVE',
          propertyId: properties[1].id,
          tenantId: tenants[1].id,
          startDate: new Date(now.getFullYear(), 5, 1),
          endDate: null,
          monthlyRent: 2800,
          securityDeposit: 5600,
          lateFee: 100,
          gracePeriodDays: 5,
          paymentDueDay: 1,
          managerId: user.id
        }
      }),
      db.lease.create({
        data: {
          type: 'FIXED_TERM',
          status: 'ACTIVE',
          propertyId: properties[3].id,
          tenantId: tenants[2].id,
          startDate: new Date(now.getFullYear() - 1, 6, 1),
          endDate: new Date(now.getFullYear() + 1, 5, 30),
          monthlyRent: 2200,
          securityDeposit: 4400,
          lateFee: 75,
          gracePeriodDays: 5,
          paymentDueDay: 1,
          managerId: user.id
        }
      }),
      db.lease.create({
        data: {
          type: 'FIXED_TERM',
          status: 'ACTIVE',
          propertyId: properties[3].id,
          tenantId: tenants[3].id,
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: new Date(now.getFullYear() + 1, 11, 31),
          monthlyRent: 2200,
          securityDeposit: 4400,
          lateFee: 75,
          gracePeriodDays: 5,
          paymentDueDay: 1,
          managerId: user.id
        }
      }),
      db.lease.create({
        data: {
          type: 'MONTH_TO_MONTH',
          status: 'ACTIVE',
          propertyId: properties[1].id,
          tenantId: tenants[4].id,
          startDate: new Date(now.getFullYear() - 1, 2, 1),
          endDate: null,
          monthlyRent: 3000,
          securityDeposit: 6000,
          lateFee: 100,
          gracePeriodDays: 5,
          paymentDueDay: 1,
          managerId: user.id
        }
      }),
      db.lease.create({
        data: {
          type: 'FIXED_TERM',
          status: 'ACTIVE',
          propertyId: properties[6].id,
          tenantId: tenants[5].id,
          startDate: new Date(now.getFullYear(), 3, 1),
          endDate: new Date(now.getFullYear() + 1, 2, 31),
          monthlyRent: 1500,
          securityDeposit: 3000,
          lateFee: 50,
          gracePeriodDays: 5,
          paymentDueDay: 1,
          managerId: user.id
        }
      }),
      db.lease.create({
        data: {
          type: 'FIXED_TERM',
          status: 'ACTIVE',
          propertyId: properties[1].id,
          tenantId: tenants[6].id,
          startDate: new Date(now.getFullYear() - 1, 9, 1),
          endDate: new Date(now.getFullYear() + 1, 8, 30),
          monthlyRent: 3200,
          securityDeposit: 6400,
          lateFee: 120,
          gracePeriodDays: 5,
          paymentDueDay: 1,
          managerId: user.id
        }
      }),
      db.lease.create({
        data: {
          type: 'FIXED_TERM',
          status: 'ACTIVE',
          propertyId: properties[3].id,
          tenantId: tenants[8].id,
          startDate: new Date(now.getFullYear(), 1, 1),
          endDate: new Date(now.getFullYear() + 2, 0, 31),
          monthlyRent: 2300,
          securityDeposit: 4600,
          lateFee: 80,
          gracePeriodDays: 5,
          paymentDueDay: 1,
          managerId: user.id
        }
      }),
      db.lease.create({
        data: {
          type: 'FIXED_TERM',
          status: 'ACTIVE',
          propertyId: properties[5].id,
          tenantId: tenants[9].id,
          startDate: new Date(now.getFullYear(), 4, 1),
          endDate: new Date(now.getFullYear() + 3, 3, 30),
          monthlyRent: 8500,
          securityDeposit: 17000,
          lateFee: 300,
          gracePeriodDays: 10,
          paymentDueDay: 1,
          managerId: user.id
        }
      }),
      db.lease.create({
        data: {
          type: 'MONTH_TO_MONTH',
          status: 'ACTIVE',
          propertyId: properties[1].id,
          tenantId: tenants[11].id,
          startDate: new Date(now.getFullYear() - 1, 11, 1),
          endDate: null,
          monthlyRent: 2900,
          securityDeposit: 5800,
          lateFee: 100,
          gracePeriodDays: 5,
          paymentDueDay: 1,
          managerId: user.id
        }
      }),
      db.lease.create({
        data: {
          type: 'FIXED_TERM',
          status: 'ACTIVE',
          propertyId: properties[3].id,
          tenantId: tenants[13].id,
          startDate: new Date(now.getFullYear(), 6, 1),
          endDate: new Date(now.getFullYear() + 1, 5, 31),
          monthlyRent: 2400,
          securityDeposit: 4800,
          lateFee: 85,
          gracePeriodDays: 5,
          paymentDueDay: 1,
          managerId: user.id
        }
      }),
      db.lease.create({
        data: {
          type: 'FIXED_TERM',
          status: 'ACTIVE',
          propertyId: properties[6].id,
          tenantId: tenants[14].id,
          startDate: new Date(now.getFullYear(), 8, 1),
          endDate: new Date(now.getFullYear() + 1, 7, 31),
          monthlyRent: 1600,
          securityDeposit: 3200,
          lateFee: 55,
          gracePeriodDays: 5,
          paymentDueDay: 1,
          managerId: user.id
        }
      })
    ]);

    // Create payments
    const payments = [];
    const paymentStatuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING', 'FAILED'];
    
    for (let i = 0; i < 20; i++) {
      const leaseIndex = i % leases.length;
      const lease = leases[leaseIndex];
      const tenant = tenants.find(t => t.id === lease.tenantId);
      
      const monthOffset = Math.floor(i / leases.length);
      const paymentDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const status = paymentStatuses[i % paymentStatuses.length];
      
      const payment = await db.payment.create({
        data: {
          type: 'RENT',
          status: status,
          amount: lease.monthlyRent,
          totalAmount: lease.monthlyRent,
          leaseId: lease.id,
          tenantId: tenant!.id,
          paymentMethod: ['BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'ONLINE_PAYMENT'][i % 4],
          paymentDate: status === 'COMPLETED' ? paymentDate : null,
          dueDate: paymentDate,
          isRecurring: true
        }
      });
      payments.push(payment);
    }

    // Create maintenance requests
    const maintenanceRequests = await Promise.all([
      db.maintenanceRequest.create({
        data: {
          title: 'Leaky Faucet in Kitchen',
          description: 'The kitchen faucet has been dripping constantly for the past week. It seems to be getting worse.',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          category: 'PLUMBING',
          propertyId: properties[0].id,
          tenantId: tenants[0].id,
          scheduledDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
          assignedTo: 'ABC Plumbing Services',
          estimatedCost: 150,
          notes: 'Tenant will be home after 5 PM on weekdays'
        }
      }),
      db.maintenanceRequest.create({
        data: {
          title: 'HVAC Not Cooling',
          description: 'Air conditioning unit is not cooling properly. Temperature remains above 80F even when set to 72F.',
          priority: 'HIGH',
          status: 'PENDING',
          category: 'HVAC',
          propertyId: properties[1].id,
          tenantId: tenants[1].id,
          estimatedCost: 350,
          notes: 'Unit is on the roof - will need ladder access'
        }
      }),
      db.maintenanceRequest.create({
        data: {
          title: 'Broken Window Lock',
          description: 'The lock on the bedroom window is broken and window cannot be secured properly.',
          priority: 'HIGH',
          status: 'APPROVED',
          category: 'GENERAL_REPAIR',
          propertyId: properties[3].id,
          tenantId: tenants[2].id,
          scheduledDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          estimatedCost: 75
        }
      }),
      db.maintenanceRequest.create({
        data: {
          title: 'Garage Door Malfunction',
          description: 'Garage door opener stopped working. Makes clicking sound but door does not move.',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          category: 'APPLIANCE',
          propertyId: properties[0].id,
          completedDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
          estimatedCost: 200,
          actualCost: 185,
          resolutionNotes: 'Replaced worn gear in opener mechanism. Tested multiple cycles successfully.'
        }
      }),
      db.maintenanceRequest.create({
        data: {
          title: 'Electrical Outlet Not Working',
          description: 'Multiple outlets in the living room have stopped working. Circuit breaker was checked and is fine.',
          priority: 'EMERGENCY',
          status: 'IN_PROGRESS',
          category: 'ELECTRICAL',
          propertyId: properties[1].id,
          tenantId: tenants[4].id,
          scheduledDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          assignedTo: 'ElectriPro Services',
          estimatedCost: 200,
          notes: 'Tenant reports sparking from one outlet before it stopped working'
        }
      }),
      db.maintenanceRequest.create({
        data: {
          title: 'Pest Control Needed',
          description: 'Tenant reports seeing ants in the kitchen area. Requesting professional pest control service.',
          priority: 'LOW',
          status: 'PENDING',
          category: 'PEST_CONTROL',
          propertyId: properties[3].id,
          tenantId: tenants[3].id,
          estimatedCost: 120
        }
      }),
      db.maintenanceRequest.create({
        data: {
          title: 'Water Heater Leak',
          description: 'Small puddle forming under water heater. Appears to be coming from bottom of tank.',
          priority: 'HIGH',
          status: 'APPROVED',
          category: 'PLUMBING',
          propertyId: properties[6].id,
          tenantId: tenants[5].id,
          scheduledDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          estimatedCost: 500,
          notes: 'Water heater is 8 years old - may need replacement'
        }
      }),
      db.maintenanceRequest.create({
        data: {
          title: 'Dryer Vent Cleaning',
          description: 'Dryer taking longer to dry clothes. Suspect vent needs cleaning.',
          priority: 'LOW',
          status: 'ON_HOLD',
          category: 'APPLIANCE',
          propertyId: properties[1].id,
          tenantId: tenants[6].id,
          estimatedCost: 150,
          notes: 'Waiting for tenant to schedule time for service'
        }
      }),
      db.maintenanceRequest.create({
        data: {
          title: 'Exterior Paint Touch-up',
          description: 'Paint peeling on exterior walls near the entrance. Needs touch-up before HOA inspection.',
          priority: 'MEDIUM',
          status: 'PENDING',
          category: 'PAINTING',
          propertyId: properties[3].id,
          estimatedCost: 400
        }
      }),
      db.maintenanceRequest.create({
        data: {
          title: 'Pool Pump Noise',
          description: 'Pool pump making loud grinding noise. Still operational but concerning.',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          category: 'APPLIANCE',
          propertyId: properties[0].id,
          completedDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10),
          estimatedCost: 300,
          actualCost: 275,
          resolutionNotes: 'Bearing replacement resolved the noise issue. Pump running quietly now.'
        }
      })
    ]);

    // Create activities
    await Promise.all([
      db.activity.create({
        data: {
          type: 'PROPERTY_CREATED',
          description: 'Initial property data imported',
          userId: user.id
        }
      }),
      db.activity.create({
        data: {
          type: 'TENANT_CREATED',
          description: 'Tenant Michael Johnson added to Sunset Villa',
          propertyId: properties[0].id,
          userId: user.id
        }
      }),
      db.activity.create({
        data: {
          type: 'LEASE_SIGNED',
          description: 'Lease LSE-00001 signed by Michael Johnson',
          propertyId: properties[0].id,
          leaseId: leases[0].id,
          userId: user.id
        }
      }),
      db.activity.create({
        data: {
          type: 'PAYMENT_RECEIVED',
          description: 'Payment of $3,500 received from Michael Johnson',
          leaseId: leases[0].id,
          userId: user.id
        }
      }),
      db.activity.create({
        data: {
          type: 'MAINTENANCE_REQUESTED',
          description: 'Maintenance request created for Leaky Faucet',
          propertyId: properties[0].id,
          userId: user.id
        }
      }),
      db.activity.create({
        data: {
          type: 'DOCUMENT_UPLOADED',
          description: 'Lease agreement uploaded for Sunset Villa',
          userId: user.id
        }
      }),
      db.activity.create({
        data: {
          type: 'USER_LOGIN',
          description: 'User John Manager logged in',
          userId: user.id
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Seed data created successfully',
      stats: {
        properties: properties.length,
        tenants: tenants.length,
        leases: leases.length,
        payments: payments.length,
        maintenanceRequests: maintenanceRequests.length
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 });
  }
}
