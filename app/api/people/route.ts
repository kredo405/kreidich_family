import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient as createSsrClient } from '../../../utils/supabase/server';
import { getPeople, createPerson } from '../../../lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createSsrClient(cookieStore);
    const result = await getPeople(supabase);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ people: result.data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = await createSsrClient(cookieStore);
    const body = await req.json();
    const result = await createPerson(body, supabase);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ person: result.data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
