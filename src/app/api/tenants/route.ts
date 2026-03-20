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
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const tenants = await db.tenant.findMany({
      where,
      include: {
        property: true,
        leases: {
          where: { status: 'ACTIVE' },
          take: 1
        },
        _count: {
          select: { payments: true, maintenance: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error('Tenants GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const tenant = await db.tenant.create({
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
        status: body.status || 'ACTIVE',
        creditScore: body.creditScore,
        backgroundCheckStatus: body.backgroundCheckStatus || 'PENDING',
        propertyId: body.propertyId,
        addedById: body.addedById
      }
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: 'TENANT_CREATED',
        description: `Tenant "${tenant.firstName} ${tenant.lastName}" was created`
      }
    });

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Tenants POST error:', error);
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}
