import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type { LedgerEntry } from '@/types/finance';

// In-memory storage for development (replace with database in production)
export let entries: LedgerEntry[] = [];

// Helper to parse query parameters
function parseQueryParams(url: string) {
  const { searchParams } = new URL(url);
  const from = searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
  const q = searchParams.get('q') || '';
  const storeId = searchParams.get('storeId') || undefined;
  
  return { from, to, q, storeId };
}

export async function GET(request: NextRequest) {
  try {
    const { from, to, q, storeId } = parseQueryParams(request.url);
    
    // Filter entries based on query parameters
    let filteredEntries = entries.filter(entry => {
      const matchesDate = entry.date >= from && entry.date <= to;
      const matchesStore = !storeId || entry.storeId === storeId;
      const matchesSearch = !q || 
        entry.title.toLowerCase().includes(q.toLowerCase()) ||
        (entry.category && entry.category.toLowerCase().includes(q.toLowerCase()));
      
      return matchesDate && matchesStore && matchesSearch;
    });
    
    return NextResponse.json(filteredEntries);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const newEntry: LedgerEntry = {
      id: uuidv4(),
      storeId: data.storeId || 'default',
      type: data.type,
      title: data.title,
      amount: data.amount,
      category: data.category,
      method: data.method,
      date: data.date || new Date().toISOString().split('T')[0],
      note: data.note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    entries.push(newEntry);
    
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}
