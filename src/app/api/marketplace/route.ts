import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Marketplace logic will be implemented in later tasks
    return NextResponse.json({
      success: true,
      message: 'Marketplace API endpoint ready',
      data: [],
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
