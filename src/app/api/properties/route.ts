import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (type && type !== 'ALL') {
      where.type = type;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }

    const properties = await db.property.findMany({
      where,
      include: {
        manager: true,
        _count: {
          select: { tenants: true, leases: true, maintenance: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Properties GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const property = await db.property.create({
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        status: body.status || 'AVAILABLE',
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country || 'USA',
        units: body.units || 1,
        bedrooms: body.bedrooms || 0,
        bathrooms: body.bathrooms || 0,
        squareFeet: body.squareFeet,
        yearBuilt: body.yearBuilt,
        lotSize: body.lotSize,
        purchasePrice: body.purchasePrice,
        currentValue: body.currentValue,
        monthlyMortgage: body.monthlyMortgage,
        propertyTax: body.propertyTax,
        insurance: body.insurance,
        amenities: body.amenities ? JSON.stringify(body.amenities) : null,
        images: body.images ? JSON.stringify(body.images) : null,
        managerId: body.managerId
      }
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: 'PROPERTY_CREATED',
        description: `Property "${property.name}" was created`,
        propertyId: property.id
      }
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Properties POST error:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
