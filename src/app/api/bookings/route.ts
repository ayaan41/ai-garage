import { NextRequest, NextResponse } from 'next/server';

type Booking = {
  id: string;
  ref: string;
  garage_id: string;
  booking_date: string;
  time_slot: string;
  car_reg: string;
  service_type: string;
  service_types: string[];
  extra_notes?: string;
  customer_name: string;
  phone: string;
  status: string;
  quote_price?: number;
  quote_notes?: string;
  created_at: string;
};

// In-memory store - Persists until server restart
let bookingsStore: Booking[] = (global as any).bookingsStore || [];
(global as any).bookingsStore = bookingsStore;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ref = `HAJI-${(body.car_reg || 'XXX').slice(-3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const id = `bk_${Date.now()}`;

    const booking: Booking = {
      id,
      ref,
      garage_id: body.garage_id || "haji-auto-center",
      booking_date: body.booking_date,
      time_slot: body.time_slot,
      car_reg: (body.car_reg || '').toUpperCase(),
      service_type: body.service_types?.[0] || body.service_type || "Full Service",
      service_types: body.service_types || (body.service_type? [body.service_type] : ["Full Service"]),
      extra_notes: body.extra_notes || '',
      customer_name: body.customer_name,
      phone: body.phone,
      status: 'pending_quote', // Always start with pending_quote
      created_at: new Date().toISOString(),
    };

    bookingsStore.unshift(booking);
    (global as any).bookingsStore = bookingsStore;

    console.log('BOOKING CREATED:', ref, booking.service_types);

    return NextResponse.json({ success: true, id, ref, booking }, { status: 201 });
  } catch (e) {
    console.error('Booking create error:', e);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const id = params.get('id') || params.get('ref') || '';
  const garageId = params.get('garage_id');
  const search = params.get('search');

  if (search === 'all') {
    return NextResponse.json(bookingsStore);
  }

  if (garageId) {
    const list = bookingsStore.filter((b) => b.garage_id === garageId);
    return NextResponse.json(list);
  }

  if (id) {
    const found = bookingsStore.find(
      (b) => b.id === id || b.ref === id || b.ref.toLowerCase() === id.toLowerCase()
    );
    if (found) return NextResponse.json(found);

    const byGarage = bookingsStore.filter((b) => b.garage_id === id);
    if (byGarage.length > 0) return NextResponse.json(byGarage[0]);

    return NextResponse.json({ error: 'Booking not found', searched: id }, { status: 404 });
  }

  return NextResponse.json(bookingsStore);
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ref, status, quote_price, quote_notes } = body;

    const index = bookingsStore.findIndex((b) => b.ref === ref || b.id === ref);
    if (index === -1) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (status) bookingsStore[index].status = status;
    if (quote_price!== undefined) bookingsStore[index].quote_price = Number(quote_price);
    if (quote_notes!== undefined) bookingsStore[index].quote_notes = quote_notes;

    (global as any).bookingsStore = bookingsStore;

    console.log(`BOOKING UPDATED: ${ref} -> ${status} £${quote_price}`);

    return NextResponse.json({ success: true, booking: bookingsStore[index] });
  } catch (e) {
    console.error('Update error:', e);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}