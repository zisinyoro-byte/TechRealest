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
        { paymentNumber: { contains: search, mode: 'insensitive' } },
        { tenant: { firstName: { contains: search, mode: 'insensitive' } } },
        { tenant: { lastName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const payments = await db.payment.findMany({
      where,
      include: {
        lease: {
          include: { property: true }
        },
        tenant: true,
        processedBy: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Payments GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate payment number
    const paymentCount = await db.payment.count();
    const paymentNumber = `PAY-${String(paymentCount + 1).padStart(6, '0')}`;
    
    const payment = await db.payment.create({
      data: {
        paymentNumber,
        type: body.type,
        status: body.status || 'PENDING',
        amount: body.amount,
        lateFeeApplied: body.lateFeeApplied,
        totalAmount: body.totalAmount || body.amount,
        leaseId: body.leaseId,
        tenantId: body.tenantId,
        paymentMethod: body.paymentMethod,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
        dueDate: new Date(body.dueDate),
        transactionId: body.transactionId,
        transactionRef: body.transactionRef,
        notes: body.notes,
        processedById: body.processedById,
        processedAt: body.status === 'COMPLETED' ? new Date() : null,
        isRecurring: body.isRecurring || false
      },
      include: {
        lease: {
          include: { property: true }
        },
        tenant: true
      }
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: body.status === 'COMPLETED' ? 'PAYMENT_RECEIVED' : 'PAYMENT_FAILED',
        description: `Payment "${payment.paymentNumber}" of $${payment.amount} was ${body.status === 'COMPLETED' ? 'received' : 'recorded'}`,
        leaseId: payment.leaseId
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Payments POST error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
