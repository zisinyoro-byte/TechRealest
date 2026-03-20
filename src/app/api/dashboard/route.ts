import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get total properties
    const totalProperties = await db.property.count();
    
    // Get total tenants
    const totalTenants = await db.tenant.count();
    
    // Get active leases
    const activeLeases = await db.lease.count({
      where: { status: 'ACTIVE' }
    });
    
    // Get monthly revenue (sum of completed payments this month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthlyPayments = await db.payment.aggregate({
      where: {
        status: 'COMPLETED',
        paymentDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });
    
    const monthlyRevenue = monthlyPayments._sum.amount || 0;
    
    // Get pending payments
    const pendingPayments = await db.payment.count({
      where: { status: 'PENDING' }
    });
    
    // Get open maintenance requests
    const openMaintenance = await db.maintenanceRequest.count({
      where: {
        status: { in: ['PENDING', 'APPROVED', 'IN_PROGRESS'] }
      }
    });
    
    // Get occupancy rate
    const occupiedProperties = await db.property.count({
      where: { status: 'OCCUPIED' }
    });
    const occupancyRate = totalProperties > 0 
      ? Math.round((occupiedProperties / totalProperties) * 100) 
      : 0;
    
    // Get revenue trend for last 6 months
    const revenueTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthPayments = await db.payment.aggregate({
        where: {
          status: 'COMPLETED',
          paymentDate: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          amount: true
        }
      });
      
      revenueTrend.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        revenue: monthPayments._sum.amount || 0
      });
    }
    
    // Get upcoming lease expirations (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingExpirations = await db.lease.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: thirtyDaysFromNow
        }
      },
      include: {
        property: true,
        tenant: true
      },
      take: 5
    });
    
    // Get recent activities
    const recentActivities = await db.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        property: true,
        user: true
      }
    });
    
    // Get payment status overview
    const completedPayments = await db.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    });
    
    const pendingPaymentsAmount = await db.payment.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true }
    });
    
    const overduePayments = await db.payment.aggregate({
      where: {
        status: 'PENDING',
        dueDate: { lt: now }
      },
      _sum: { amount: true }
    });
    
    // Property type distribution
    const propertyByType = await db.property.groupBy({
      by: ['type'],
      _count: { id: true }
    });

    return NextResponse.json({
      metrics: {
        totalProperties,
        totalTenants,
        activeLeases,
        monthlyRevenue,
        pendingPayments,
        openMaintenance,
        occupancyRate
      },
      revenueTrend,
      upcomingExpirations: upcomingExpirations.map(lease => ({
        id: lease.id,
        leaseNumber: lease.leaseNumber,
        endDate: lease.endDate,
        property: {
          name: lease.property.name,
          address: lease.property.address
        },
        tenant: {
          firstName: lease.tenant.firstName,
          lastName: lease.tenant.lastName
        }
      })),
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        createdAt: activity.createdAt,
        property: activity.property ? { name: activity.property.name } : null
      })),
      paymentOverview: {
        collected: completedPayments._sum.amount || 0,
        pending: pendingPaymentsAmount._sum.amount || 0,
        overdue: overduePayments._sum.amount || 0
      },
      propertyByType: propertyByType.map(p => ({
        type: p.type,
        count: p._count.id
      }))
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
