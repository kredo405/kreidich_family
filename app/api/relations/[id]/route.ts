import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createClient as createSsrClient } from '../../../../utils/supabase/server';
import { deleteRelation } from '../../../../lib/db';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const supabase = await createSsrClient(cookieStore);
    const routeParams = await params;
    const result = await deleteRelation(routeParams.id, supabase);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

