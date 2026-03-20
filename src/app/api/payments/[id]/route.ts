import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        lease: {
          include: { 
            property: true,
            tenant: true
          }
        },
        tenant: true,
        processedBy: true
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Payment GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const payment = await db.payment.update({
      where: { id },
      data: {
        type: body.type,
        status: body.status,
        amount: body.amount,
        lateFeeApplied: body.lateFeeApplied,
        totalAmount: body.totalAmount,
        paymentMethod: body.paymentMethod,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        transactionId: body.transactionId,
        transactionRef: body.transactionRef,
        notes: body.notes,
        processedById: body.processedById,
        processedAt: body.status === 'COMPLETED' && !body.processedAt ? new Date() : body.processedAt ? new Date(body.processedAt) : null,
        isRecurring: body.isRecurring
      },
      include: {
        lease: {
          include: { property: true }
        },
        tenant: true
      }
    });

    // Create activity log if payment completed
    if (body.status === 'COMPLETED') {
      await db.activity.create({
        data: {
          type: 'PAYMENT_RECEIVED',
          description: `Payment "${payment.paymentNumber}" of $${payment.amount} was marked as completed`,
          leaseId: payment.leaseId
        }
      });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Payment PUT error:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const payment = await db.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    await db.payment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}
