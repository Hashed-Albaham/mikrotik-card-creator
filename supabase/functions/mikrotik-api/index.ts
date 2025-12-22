import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MikrotikCredentials {
  host: string;
  port: number;
  username: string;
  password: string;
}

interface MikrotikRequest {
  action: 'connect' | 'get-users' | 'add-script' | 'run-script';
  credentials: MikrotikCredentials;
  script?: string;
  scriptName?: string;
}

async function mikrotikRequest(
  credentials: MikrotikCredentials,
  endpoint: string,
  method: string = 'GET',
  body?: object
): Promise<Response> {
  const { host, port, username, password } = credentials;
  const auth = btoa(`${username}:${password}`);
  const url = `http://${host}:${port}/rest${endpoint}`;

  console.log(`MikroTik API Request: ${method} ${url}`);

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  return await fetch(url, options);
}

async function testConnection(credentials: MikrotikCredentials): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await mikrotikRequest(credentials, '/system/identity');
    if (response.ok) {
      const data = await response.json();
      console.log('Connection successful, identity:', data);
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error('Connection failed:', response.status, errorText);
      return { success: false, error: `Connection failed: ${response.status} - ${errorText}` };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Connection error:', error);
    return { success: false, error: `Connection error: ${errorMessage}` };
  }
}

async function getUserManagerUsers(credentials: MikrotikCredentials): Promise<{ success: boolean; users?: string[]; error?: string }> {
  try {
    // Try User Manager API first (for ROS 7)
    let response = await mikrotikRequest(credentials, '/user-manager/user');
    
    if (!response.ok) {
      // Try alternative endpoint for older versions
      response = await mikrotikRequest(credentials, '/tool/user-manager/user');
    }

    if (response.ok) {
      const users = await response.json();
      console.log('Users fetched:', users.length);
      const usernames = users.map((u: { name?: string; username?: string }) => u.name || u.username).filter(Boolean);
      return { success: true, users: usernames };
    } else {
      // If User Manager not available, return empty array
      console.log('User Manager not available, returning empty list');
      return { success: true, users: [] };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching users:', error);
    return { success: false, error: `Error fetching users: ${errorMessage}` };
  }
}

async function addOrUpdateScript(
  credentials: MikrotikCredentials,
  scriptName: string,
  scriptContent: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if script exists
    const checkResponse = await mikrotikRequest(credentials, `/system/script?name=${encodeURIComponent(scriptName)}`);
    
    if (checkResponse.ok) {
      const scripts = await checkResponse.json();
      
      if (scripts.length > 0) {
        // Script exists, update it
        const scriptId = scripts[0]['.id'];
        console.log('Script exists, updating:', scriptId);
        
        const updateResponse = await mikrotikRequest(
          credentials,
          `/system/script/${scriptId}`,
          'PATCH',
          { source: scriptContent }
        );
        
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          return { success: false, error: `Failed to update script: ${errorText}` };
        }
      } else {
        // Script doesn't exist, create it
        console.log('Creating new script:', scriptName);
        
        const createResponse = await mikrotikRequest(
          credentials,
          '/system/script',
          'POST',
          { name: scriptName, source: scriptContent }
        );
        
        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          return { success: false, error: `Failed to create script: ${errorText}` };
        }
      }
    } else {
      return { success: false, error: 'Failed to check existing scripts' };
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error adding/updating script:', error);
    return { success: false, error: `Error adding/updating script: ${errorMessage}` };
  }
}

async function runScript(
  credentials: MikrotikCredentials,
  scriptName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get script ID
    const checkResponse = await mikrotikRequest(credentials, `/system/script?name=${encodeURIComponent(scriptName)}`);
    
    if (!checkResponse.ok) {
      return { success: false, error: 'Failed to find script' };
    }
    
    const scripts = await checkResponse.json();
    
    if (scripts.length === 0) {
      return { success: false, error: 'Script not found' };
    }
    
    const scriptId = scripts[0]['.id'];
    console.log('Running script:', scriptName, scriptId);
    
    // Run the script
    const runResponse = await mikrotikRequest(
      credentials,
      `/system/script/${scriptId}/run`,
      'POST'
    );
    
    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      return { success: false, error: `Failed to run script: ${errorText}` };
    }
    
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error running script:', error);
    return { success: false, error: `Error running script: ${errorMessage}` };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: MikrotikRequest = await req.json();
    const { action, credentials, script, scriptName } = request;

    console.log('Received action:', action);

    let result;

    switch (action) {
      case 'connect':
        result = await testConnection(credentials);
        break;
      case 'get-users':
        result = await getUserManagerUsers(credentials);
        break;
      case 'add-script':
        if (!script || !scriptName) {
          return new Response(
            JSON.stringify({ success: false, error: 'Script name and content required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        result = await addOrUpdateScript(credentials, scriptName, script);
        break;
      case 'run-script':
        if (!scriptName) {
          return new Response(
            JSON.stringify({ success: false, error: 'Script name required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        result = await runScript(credentials, scriptName);
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in mikrotik-api:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
