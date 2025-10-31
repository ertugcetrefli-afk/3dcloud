import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key',
};

interface APIRequest {
  endpoint: string;
  method: string;
  data?: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const apiKey = req.headers.get('X-API-Key');

    if (!apiKey) {
      throw new Error('API key required');
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('id, plan')
      .eq('api_key', apiKey)
      .maybeSingle();

    if (!profile) {
      throw new Error('Invalid API key');
    }

    if (profile.plan !== 'Studio') {
      throw new Error('API access requires Studio plan');
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const endpoint = pathParts[pathParts.length - 1];

    switch (endpoint) {
      case 'projects':
        return await handleProjects(req, supabaseClient, profile.id);

      case 'convert':
        return await handleConvert(req, supabaseClient, profile.id);

      case 'analytics':
        return await handleAnalytics(req, supabaseClient, profile.id);

      default:
        throw new Error('Unknown endpoint');
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === 'API key required' || error.message === 'Invalid API key' ? 401 : 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

async function handleProjects(req: Request, supabase: any, userId: string) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, status, glb_url, poster_url, created_at, triangle_count, vertex_count')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    await supabase.from('usage_logs').insert({
      user_id: userId,
      event_type: 'api_call',
      metadata: { endpoint: 'projects', method: 'GET' },
    });

    return new Response(
      JSON.stringify({ projects: data }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  throw new Error('Method not allowed');
}

async function handleConvert(req: Request, supabase: any, userId: string) {
  if (req.method === 'POST') {
    const { file_url, name } = await req.json();

    if (!file_url || !name) {
      throw new Error('file_url and name are required');
    }

    const fileResponse = await fetch(file_url);
    if (!fileResponse.ok) {
      throw new Error('Failed to download file from URL');
    }

    const fileBlob = await fileResponse.blob();
    const fileName = file_url.split('/').pop() || 'model';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    const projectId = crypto.randomUUID();
    const uploadPath = `${userId}/${projectId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(uploadPath, fileBlob);

    if (uploadError) throw uploadError;

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        id: projectId,
        user_id: userId,
        name: name,
        original_filename: fileName,
        original_format: extension,
        file_size: fileBlob.size,
        status: 'processing',
      })
      .select()
      .single();

    if (projectError) throw projectError;

    const functionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/convert-3d-model`;

    fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: projectId,
        originalFormat: extension,
        uploadPath: uploadPath,
      }),
    }).catch(() => {});

    await supabase.from('usage_logs').insert({
      user_id: userId,
      project_id: projectId,
      event_type: 'api_call',
      metadata: { endpoint: 'convert', method: 'POST' },
    });

    return new Response(
      JSON.stringify({
        success: true,
        project_id: projectId,
        status: 'processing',
        message: 'Conversion started. Check project status using the projects endpoint.',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  throw new Error('Method not allowed');
}

async function handleAnalytics(req: Request, supabase: any, userId: string) {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('project_id');

    if (!projectId) {
      throw new Error('project_id parameter required');
    }

    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!project) {
      throw new Error('Project not found');
    }

    const { data: views, error: viewsError } = await supabase
      .from('project_views')
      .select('*')
      .eq('project_id', projectId)
      .order('viewed_at', { ascending: false });

    if (viewsError) throw viewsError;

    const totalViews = views?.length || 0;
    const uniqueIPs = new Set(views?.map(v => v.viewer_ip)).size;
    const countries = views?.reduce((acc: any, v) => {
      acc[v.country] = (acc[v.country] || 0) + 1;
      return acc;
    }, {});

    await supabase.from('usage_logs').insert({
      user_id: userId,
      project_id: projectId,
      event_type: 'api_call',
      metadata: { endpoint: 'analytics', method: 'GET' },
    });

    return new Response(
      JSON.stringify({
        project_id: projectId,
        total_views: totalViews,
        unique_visitors: uniqueIPs,
        views_by_country: countries,
        recent_views: views?.slice(0, 10),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  throw new Error('Method not allowed');
}