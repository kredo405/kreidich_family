import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient as createSsrClient } from '../../../../utils/supabase/server';
import { saveFullFlow } from '../../../../lib/db';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = await createSsrClient(cookieStore);
    const body = await req.json();
    const { nodes, edges, flowId } = body;
    const result = await saveFullFlow(nodes ?? [], edges ?? [], flowId, supabase);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
