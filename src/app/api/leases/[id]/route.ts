import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const lease = await db.lease.findUnique({
      where: { id },
      include: {
        property: true,
        tenant: {
          include: {
            property: true
          }
        },
        manager: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
    }

    return NextResponse.json(lease);
  } catch (error) {
    console.error('Lease GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch lease' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const lease = await db.lease.update({
      where: { id },
      data: {
        type: body.type,
        status: body.status,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : null,
        moveInDate: body.moveInDate ? new Date(body.moveInDate) : null,
        moveOutDate: body.moveOutDate ? new Date(body.moveOutDate) : null,
        monthlyRent: body.monthlyRent,
        securityDeposit: body.securityDeposit,
        petDeposit: body.petDeposit,
        lateFee: body.lateFee,
        gracePeriodDays: body.gracePeriodDays,
        paymentDueDay: body.paymentDueDay,
        terms: body.terms,
        specialConditions: body.specialConditions,
        renewalTerms: body.renewalTerms,
        documentUrl: body.documentUrl,
        managerId: body.managerId,
        tenantSignedAt: body.tenantSignedAt ? new Date(body.tenantSignedAt) : null,
        managerSignedAt: body.managerSignedAt ? new Date(body.managerSignedAt) : null
      },
      include: {
        property: true,
        tenant: true
      }
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: 'LEASE_SIGNED',
        description: `Lease "${lease.leaseNumber}" was updated`,
        propertyId: lease.propertyId,
        leaseId: lease.id
      }
    });

    return NextResponse.json(lease);
  } catch (error) {
    console.error('Lease PUT error:', error);
    return NextResponse.json({ error: 'Failed to update lease' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const lease = await db.lease.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
    }

    await db.lease.delete({
      where: { id }
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: 'LEASE_TERMINATED',
        description: `Lease "${lease.leaseNumber}" was terminated`,
        propertyId: lease.propertyId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lease DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete lease' }, { status: 500 });
  }
}
