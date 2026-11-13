import { supabaseAdmin } from '@/lib/supabase-admin';


export async function GET() {
    const { data: cards, error } = await supabaseAdmin
    .from('cards')
    .select('*')
    .eq('status', 'missing');

    if (error) {
        return Response.json({ error: error.message} , {status: 500})
    }

    return Response.json({ checked: cards.length});
}

