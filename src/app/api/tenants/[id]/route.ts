import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const tenant = await db.tenant.findUnique({
      where: { id },
      include: {
        property: true,
        leases: {
          include: {
            property: true
          },
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          include: {
            lease: {
              include: { property: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        maintenance: {
          include: { property: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        documents: true
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Tenant GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const tenant = await db.tenant.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        alternatePhone: body.alternatePhone,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        employer: body.employer,
        jobTitle: body.jobTitle,
        monthlyIncome: body.monthlyIncome,
        employmentStartDate: body.employmentStartDate ? new Date(body.employmentStartDate) : null,
        emergencyContactName: body.emergencyContactName,
        emergencyContactPhone: body.emergencyContactPhone,
        emergencyContactRelation: body.emergencyContactRelation,
        idType: body.idType,
        idNumber: body.idNumber,
        notes: body.notes,
        status: body.status,
        creditScore: body.creditScore,
        backgroundCheckStatus: body.backgroundCheckStatus,
        propertyId: body.propertyId
      }
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: 'TENANT_UPDATED',
        description: `Tenant "${tenant.firstName} ${tenant.lastName}" was updated`
      }
    });

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Tenant PUT error:', error);
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const tenant = await db.tenant.findUnique({
      where: { id }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    await db.tenant.delete({
      where: { id }
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: 'TENANT_DELETED',
        description: `Tenant "${tenant.firstName} ${tenant.lastName}" was deleted`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tenant DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 });
  }
}
