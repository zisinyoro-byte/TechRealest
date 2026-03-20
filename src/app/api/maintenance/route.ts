import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }
    
    if (category && category !== 'ALL') {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { requestNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { property: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const maintenance = await db.maintenanceRequest.findMany({
      where,
      include: {
        property: true,
        tenant: true
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Maintenance GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate request number
    const requestCount = await db.maintenanceRequest.count();
    const requestNumber = `MNT-${String(requestCount + 1).padStart(5, '0')}`;
    
    const maintenance = await db.maintenanceRequest.create({
      data: {
        requestNumber,
        title: body.title,
        description: body.description,
        priority: body.priority || 'MEDIUM',
        status: body.status || 'PENDING',
        category: body.category,
        propertyId: body.propertyId,
        tenantId: body.tenantId,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        assignedTo: body.assignedTo,
        assignedAt: body.assignedTo ? new Date() : null,
        estimatedCost: body.estimatedCost,
        notes: body.notes,
        beforeImages: body.beforeImages ? JSON.stringify(body.beforeImages) : null
      },
      include: {
        property: true,
        tenant: true
      }
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: 'MAINTENANCE_REQUESTED',
        description: `Maintenance request "${maintenance.title}" was created for ${maintenance.property.name}`,
        propertyId: maintenance.propertyId
      }
    });

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Maintenance POST error:', error);
    return NextResponse.json({ error: 'Failed to create maintenance request' }, { status: 500 });
  }
}
