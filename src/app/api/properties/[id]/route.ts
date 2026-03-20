import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const property = await db.property.findUnique({
      where: { id },
      include: {
        manager: true,
        tenants: {
          include: {
            leases: true
          }
        },
        leases: {
          include: {
            tenant: true
          }
        },
        maintenance: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        documents: true
      }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Property GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const property = await db.property.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        status: body.status,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country,
        units: body.units,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        squareFeet: body.squareFeet,
        yearBuilt: body.yearBuilt,
        lotSize: body.lotSize,
        purchasePrice: body.purchasePrice,
        currentValue: body.currentValue,
        monthlyMortgage: body.monthlyMortgage,
        propertyTax: body.propertyTax,
        insurance: body.insurance,
        amenities: body.amenities ? JSON.stringify(body.amenities) : undefined,
        images: body.images ? JSON.stringify(body.images) : undefined,
        managerId: body.managerId
      }
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: 'PROPERTY_UPDATED',
        description: `Property "${property.name}" was updated`,
        propertyId: property.id
      }
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Property PUT error:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const property = await db.property.findUnique({
      where: { id }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    await db.property.delete({
      where: { id }
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: 'PROPERTY_DELETED',
        description: `Property "${property.name}" was deleted`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Property DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
