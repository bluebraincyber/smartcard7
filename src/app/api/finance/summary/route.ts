import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Import the in-memory storage from entries route
import { entries } from '../entries/route';

export const dynamic = 'force-dynamic'; // Disable static generation

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
    const storeId = searchParams.get('storeId') || undefined;
    
    // Filter entries based on date range and storeId
    const filteredEntries = entries.filter(entry => {
      const matchesDate = entry.date >= from && entry.date <= to;
      const matchesStore = !storeId || entry.storeId === storeId;
      return matchesDate && matchesStore && !entry.deletedAt;
    });
    
    // Calculate summary values (in a real app, this would be done in the database)
    const openingBalance = 0; // Would normally calculate from previous period
    
    const inflow = filteredEntries
      .filter(entry => entry.type === 'IN')
      .reduce((sum, entry) => sum + entry.amount, 0);
      
    const outflow = filteredEntries
      .filter(entry => entry.type === 'OUT')
      .reduce((sum, entry) => sum + entry.amount, 0);
      
    const result = inflow - outflow;
    const closingBalance = openingBalance + result;
    
    const summary = {
      opening: openingBalance,
      inflow,
      outflow,
      result,
      closing: closingBalance,
    };
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
