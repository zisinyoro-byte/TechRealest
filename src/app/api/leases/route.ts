import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { leaseNumber: { contains: search, mode: 'insensitive' } },
        { property: { name: { contains: search, mode: 'insensitive' } } },
        { tenant: { firstName: { contains: search, mode: 'insensitive' } } },
        { tenant: { lastName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const leases = await db.lease.findMany({
      where,
      include: {
        property: true,
        tenant: true,
        manager: true,
        _count: {
          select: { payments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(leases);
  } catch (error) {
    console.error('Leases GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch leases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate lease number
    const leaseCount = await db.lease.count();
    const leaseNumber = `LSE-${String(leaseCount + 1).padStart(5, '0')}`;
    
    const lease = await db.lease.create({
      data: {
        leaseNumber,
        type: body.type,
        status: body.status || 'DRAFT',
        propertyId: body.propertyId,
        tenantId: body.tenantId,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        moveInDate: body.moveInDate ? new Date(body.moveInDate) : null,
        moveOutDate: body.moveOutDate ? new Date(body.moveOutDate) : null,
        monthlyRent: body.monthlyRent,
        securityDeposit: body.securityDeposit,
        petDeposit: body.petDeposit,
        lateFee: body.lateFee,
        gracePeriodDays: body.gracePeriodDays || 5,
        paymentDueDay: body.paymentDueDay || 1,
        terms: body.terms,
        specialConditions: body.specialConditions,
        renewalTerms: body.renewalTerms,
        documentUrl: body.documentUrl,
        managerId: body.managerId
      },
      include: {
        property: true,
        tenant: true
      }
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: 'LEASE_CREATED',
        description: `Lease "${lease.leaseNumber}" was created for ${lease.property.name}`,
        propertyId: lease.propertyId,
        leaseId: lease.id
      }
    });

    return NextResponse.json(lease);
  } catch (error) {
    console.error('Leases POST error:', error);
    return NextResponse.json({ error: 'Failed to create lease' }, { status: 500 });
  }
}
