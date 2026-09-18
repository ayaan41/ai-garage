import { NextRequest, NextResponse } from 'next/server';

const garagesData = [
  {
    id: 'haji-auto-center',
    name: 'Haji Auto Center',
    owner: 'Haji Sahib',
    phone: '07400 123456',
    rating: 4.9,
    reviews: 127,
    location: 'Glasgow G20',
    address: '120 Maryhill Road, Glasgow G20 6QS',
    distance: '0.8 miles',
    verified: true,
    isMobile: false,
    services: ['Full Service', 'MOT', 'Brake Check', 'Oil Change'],
    price_from: 79,
    image: '🔧',
    available: true,
  },
  {
    id: 'glasgow-car-care',
    name: 'Glasgow Car Care',
    owner: 'Ali Autos',
    phone: '07400 654321',
    rating: 4.7,
    reviews: 89,
    location: 'Glasgow G21',
    address: '45 Springburn Way, Glasgow G21 1BH',
    distance: '1.2 miles',
    verified: true,
    isMobile: false,
    services: ['Service', 'Tyres', 'Battery'],
    price_from: 89,
    image: '🚗',
    available: true,
  },
  {
    id: 'mobile-mechanic-pro',
    name: 'Mobile Mechanic Pro',
    owner: 'Usman Mobile',
    phone: '07400 999888',
    rating: 5.0,
    reviews: 203,
    location: 'Mobile - At Your Home',
    address: 'Mobile - Covers All Glasgow',
    distance: 'Mobile',
    verified: true,
    isMobile: true,
    services: ['Mobile Service', 'Breakdown SOS', 'Home Service'],
    price_from: 99,
    image: '🛠️',
    available: true,
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';

  let filtered = garagesData;

  if (search) {
    filtered = garagesData.filter((g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.location.toLowerCase().includes(search.toLowerCase()) ||
      g.services.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    );
  }

  return NextResponse.json(filtered, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, owner, phone, location, address, services, isMobile } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const newGarage = {
      id: name.toLowerCase().replaceAll(' ', '-').replace(/[^a-z0-9-]/g, ''),
      name,
      owner: owner || name,
      phone,
      rating: 5.0,
      reviews: 0,
      location: location || 'Glasgow',
      address: address || location || 'Glasgow',
      distance: isMobile ? 'Mobile' : '0.5 miles',
      verified: false,
      isMobile: !!isMobile,
      services: services || ['Full Service'],
      price_from: 79,
      image: isMobile ? '🛠️' : '🔧',
      available: true,
      created_at: new Date().toISOString(),
    };

    console.log('New garage registered:', newGarage);

    return NextResponse.json(
      {
        success: true,
        message: 'Garage registered successfully - Pending verification',
        garage: newGarage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Garage registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register garage' },
      { status: 500 }
    );
  }
}