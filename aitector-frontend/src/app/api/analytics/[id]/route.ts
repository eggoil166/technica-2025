import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

async function getUserFromToken(admin: any, token: string | null) {
  if (!token || !admin) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error) return null;
  return data.user;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminClient();
  if (!admin) {
    // eslint-disable-next-line no-console
    console.error('Supabase env vars missing');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  const user = await getUserFromToken(admin, token || null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const keyId = id;

  // verify ownership
  const { data: keyRows, error: kerr } = await admin.from('api_usage').select('*').eq('api_key_id', keyId);

  if (kerr) {
    console.error("error fetching usage data", kerr);
    return NextResponse.json({error: 'failed to fetch usage data'}, {status: 500});
  }

  if (!keyRows || keyRows.length === 0) {
    return NextResponse.json({
        detect: {
            total: 0,
            flagged: 0,
            latency: 0,
            risk: 0,
        },
        replace: {
            total: 0,
            success: 0,
            latency: 0,
            iterations: 0,
        }
    })
  }

  const { data: detRows, error: derr } = await admin.from('api_usage').select('*').eq('api_key_id', keyId).eq('action', 'detect');
  const { data: reRows, error: rerr } = await admin.from('api_usage').select('*').eq('api_key_id', keyId).eq('action', 'rewrite');
  const detAggs = detRows?.reduce((acc, row) => {
    acc.total_requests += 1;
    acc.total_latency += row.elapsed_time;
    acc.total_risk += row.risk;
    if (row.flagged) {
        acc.flags += 1
    }
    return acc;
  },{
    total_requests: 0,
    total_latency: 0,
    total_risk: 0,
    flags: 0
  })

  const avg_lat_det = detAggs.total_requests > 0 ? detAggs.total_latency / detAggs.total_requests : 0;
  const avg_risk_det = detAggs.total_requests > 0 ? detAggs.total_risk / detAggs.total_requests : 0;

  const reAggs = reRows?.reduce((acc, row) => {
    acc.total_requests += 1;
    acc.total_latency += row.elapsed_time;
    acc.total_iterations += row.iterations;
    if (row.success) {
        acc.successes += 1
    }
    return acc;
  },{
    total_requests: 0,
    total_latency: 0,
    total_iterations: 0,
    successes: 0
  })

  const avg_lat_re = reAggs.total_requests > 0 ? reAggs.total_latency / reAggs.total_requests : 0;
  const avg_it_re = reAggs.total_requests > 0 ? reAggs.total_iterations / reAggs.total_requests : 0;

  return NextResponse.json({
    detect: {
        total: detAggs.total_requests,
        flagged: detAggs.flags,
        latency: avg_lat_det,
        risk: avg_risk_det,
    },
    replace: {
        total: reAggs.total_requests,
        success: reAggs.successes,
        latency: avg_lat_re,
        iterations: avg_it_re,
    }
  })
}