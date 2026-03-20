import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const maintenance = await db.maintenanceRequest.findUnique({
      where: { id },
      include: {
        property: true,
        tenant: true
      }
    });

    if (!maintenance) {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 });
    }

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Maintenance GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance request' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const maintenance = await db.maintenanceRequest.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: body.status,
        category: body.category,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        completedDate: body.status === 'COMPLETED' ? new Date() : body.completedDate ? new Date(body.completedDate) : null,
        assignedTo: body.assignedTo,
        assignedAt: body.assignedTo ? new Date() : null,
        estimatedCost: body.estimatedCost,
        actualCost: body.actualCost,
        laborHours: body.laborHours,
        notes: body.notes,
        resolutionNotes: body.resolutionNotes,
        afterImages: body.afterImages ? JSON.stringify(body.afterImages) : null
      },
      include: {
        property: true,
        tenant: true
      }
    });

    // Create activity log if completed
    if (body.status === 'COMPLETED') {
      await db.activity.create({
        data: {
          type: 'MAINTENANCE_COMPLETED',
          description: `Maintenance request "${maintenance.title}" was completed`,
          propertyId: maintenance.propertyId
        }
      });
    }

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Maintenance PUT error:', error);
    return NextResponse.json({ error: 'Failed to update maintenance request' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const maintenance = await db.maintenanceRequest.findUnique({
      where: { id }
    });

    if (!maintenance) {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 });
    }

    await db.maintenanceRequest.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Maintenance DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete maintenance request' }, { status: 500 });
  }
}
