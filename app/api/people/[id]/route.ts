import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createClient as createSsrClient } from '../../../../utils/supabase/server';
import { updatePerson, deletePerson } from '../../../../lib/db';

// GET single person by id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const supabase = await createSsrClient(cookieStore);
    const routeParams = await params;
    const { data, error } = await supabase.from('people').select('*').eq('id', routeParams.id).maybeSingle();
    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ person: data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const supabase = await createSsrClient(cookieStore);
    const body = await req.json();
    const routeParams = await params;
    const result = await updatePerson(routeParams.id, body, supabase);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ person: result.data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const supabase = await createSsrClient(cookieStore);
    const routeParams = await params;
    const result = await deletePerson(routeParams.id, supabase);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
