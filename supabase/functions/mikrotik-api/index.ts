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

// Validation helpers
function isValidHost(host: string): boolean {
  // Allow only valid hostnames and IP addresses
  // Block empty strings
  if (!host || host.length === 0 || host.length > 255) return false;
  
  // Basic hostname/IP pattern (alphanumeric, dots, hyphens)
  const hostnamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$/;
  return hostnamePattern.test(host);
}

function isPrivateOrBlockedIP(host: string): boolean {
  // Check for IP address format
  const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = host.match(ipPattern);
  
  if (!match) {
    // Check for localhost variations
    const blockedHostnames = ['localhost', 'localhost.localdomain', 'ip6-localhost', 'ip6-loopback'];
    return blockedHostnames.includes(host.toLowerCase());
  }
  
  const octets = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseInt(match[4])];
  
  // Validate octets are in valid range
  if (octets.some(o => o > 255)) return true;
  
  const [a, b, c, d] = octets;
  
  // Block private IP ranges (RFC1918)
  // 10.0.0.0/8
  if (a === 10) return true;
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;
  
  // Block loopback (127.0.0.0/8)
  if (a === 127) return true;
  
  // Block link-local (169.254.0.0/16) - includes cloud metadata endpoint
  if (a === 169 && b === 254) return true;
  
  // Block multicast (224.0.0.0/4)
  if (a >= 224 && a <= 239) return true;
  
  // Block broadcast
  if (a === 255) return true;
  
  // Block 0.0.0.0/8
  if (a === 0) return true;
  
  return false;
}

function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

function isValidUsername(username: string): boolean {
  // Allow reasonable username characters, limit length
  if (!username || username.length === 0 || username.length > 100) return false;
  const usernamePattern = /^[a-zA-Z0-9._@-]+$/;
  return usernamePattern.test(username);
}

function isValidPassword(password: string): boolean {
  // Just check length limits
  return password.length <= 255;
}

function isValidScriptName(name: string): boolean {
  // Allow alphanumeric and some safe characters
  if (!name || name.length === 0 || name.length > 100) return false;
  const scriptNamePattern = /^[a-zA-Z0-9_-]+$/;
  return scriptNamePattern.test(name);
}

function isValidScriptContent(script: string): boolean {
  // Limit script size to prevent resource exhaustion (max 1MB)
  return script.length <= 1024 * 1024;
}

function validateCredentials(credentials: unknown): { valid: boolean; error?: string; data?: MikrotikCredentials } {
  if (!credentials || typeof credentials !== 'object') {
    return { valid: false, error: 'Invalid credentials format' };
  }
  
  const creds = credentials as Record<string, unknown>;
  
  if (typeof creds.host !== 'string' || !isValidHost(creds.host)) {
    return { valid: false, error: 'Invalid host format' };
  }
  
  if (isPrivateOrBlockedIP(creds.host)) {
    return { valid: false, error: 'Host address not permitted' };
  }
  
  if (typeof creds.port !== 'number' || !isValidPort(creds.port)) {
    return { valid: false, error: 'Invalid port number' };
  }
  
  if (typeof creds.username !== 'string' || !isValidUsername(creds.username)) {
    return { valid: false, error: 'Invalid username format' };
  }
  
  if (typeof creds.password !== 'string' || !isValidPassword(creds.password)) {
    return { valid: false, error: 'Invalid password format' };
  }
  
  return {
    valid: true,
    data: {
      host: creds.host,
      port: creds.port,
      username: creds.username,
      password: creds.password,
    }
  };
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

  console.log(`MikroTik API Request: ${method} ${endpoint}`);

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    // Add timeout to prevent hanging requests
    signal: AbortSignal.timeout(30000),
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
      console.log('Connection successful');
      return { success: true };
    } else {
      console.error('Connection failed:', response.status);
      return { success: false, error: 'Connection failed' };
    }
  } catch (error: unknown) {
    console.error('Connection error:', error);
    return { success: false, error: 'Connection error' };
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
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
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
        console.log('Updating existing script');
        
        const updateResponse = await mikrotikRequest(
          credentials,
          `/system/script/${scriptId}`,
          'PATCH',
          { source: scriptContent }
        );
        
        if (!updateResponse.ok) {
          console.error('Failed to update script');
          return { success: false, error: 'Failed to update script' };
        }
      } else {
        // Script doesn't exist, create it
        console.log('Creating new script');
        
        const createResponse = await mikrotikRequest(
          credentials,
          '/system/script',
          'POST',
          { name: scriptName, source: scriptContent }
        );
        
        if (!createResponse.ok) {
          console.error('Failed to create script');
          return { success: false, error: 'Failed to create script' };
        }
      }
    } else {
      return { success: false, error: 'Failed to check existing scripts' };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('Error adding/updating script:', error);
    return { success: false, error: 'Failed to add/update script' };
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
    console.log('Running script');
    
    // Run the script
    const runResponse = await mikrotikRequest(
      credentials,
      `/system/script/${scriptId}/run`,
      'POST'
    );
    
    if (!runResponse.ok) {
      console.error('Failed to run script');
      return { success: false, error: 'Failed to run script' };
    }
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Error running script:', error);
    return { success: false, error: 'Failed to run script' };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { action, credentials: rawCredentials, script, scriptName } = requestBody;

    console.log('Received action:', action);

    // Validate action
    const validActions = ['connect', 'get-users', 'add-script', 'run-script'];
    if (!action || !validActions.includes(action)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate credentials
    const credentialsValidation = validateCredentials(rawCredentials);
    if (!credentialsValidation.valid || !credentialsValidation.data) {
      return new Response(
        JSON.stringify({ success: false, error: credentialsValidation.error || 'Invalid credentials' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const credentials = credentialsValidation.data;

    let result;

    switch (action) {
      case 'connect':
        result = await testConnection(credentials);
        break;
      case 'get-users':
        result = await getUserManagerUsers(credentials);
        break;
      case 'add-script':
        // Validate script name and content
        if (typeof scriptName !== 'string' || !isValidScriptName(scriptName)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid script name' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        if (typeof script !== 'string' || !script || !isValidScriptContent(script)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid script content' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        result = await addOrUpdateScript(credentials, scriptName, script);
        break;
      case 'run-script':
        // Validate script name
        if (typeof scriptName !== 'string' || !isValidScriptName(scriptName)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid script name' }),
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
    console.error('Error in mikrotik-api:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Request failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
