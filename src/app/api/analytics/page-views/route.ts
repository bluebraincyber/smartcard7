import { NextResponse } from 'next/server';

export async function GET() {
  const pageViews = [
    { name: 'Home', views: 500 },
    { name: 'Dashboard', views: 800 },
    { name: 'Settings', views: 350 },
    { name: 'Reports', views: 200 },
  ];

  return NextResponse.json({ pageViews });
}