import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory storage (import from the entries route)
import { entries } from '../route';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entry = entries.find(e => e.id === params.id);
    
    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const index = entries.findIndex(e => e.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }
    
    // Update the entry
    entries[index] = {
      ...entries[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(entries[index]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const index = entries.findIndex(e => e.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }
    
    // Soft delete
    entries[index].deletedAt = new Date().toISOString();
    
    return new Response(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
