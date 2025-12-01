import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

   
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

   
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });


    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { count: activeToday } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', yesterday.toISOString());

    return NextResponse.json({
      totalUsers,
      totalPosts,
      activeToday,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}