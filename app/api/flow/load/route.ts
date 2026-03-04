import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient as createSsrClient } from '../../../../utils/supabase/server';
import { loadFullFlow } from '../../../../lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createSsrClient(cookieStore);
    const result = await loadFullFlow(supabase);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
