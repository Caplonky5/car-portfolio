import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/db';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params;
  const formData = await request.formData();

  // Convert form data to session updates
  const updates: Partial<Omit<import('@/lib/db').Session, 'id' | 'created_at'>> = {
    title: formData.get('title')?.toString(),
    car_name: formData.get('car_name')?.toString() || null,
    description: formData.get('description')?.toString() || null,
    cover_asset_id: formData.get('cover_asset_id')?.toString() || null,
  };

  try {
    const updatedSession = await updateSession(sessionId, updates);
    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}