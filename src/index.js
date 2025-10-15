/**
 * Cloudflare Worker for Twilio Access Token Generation
 * 
 * This worker generates Twilio access tokens for browser-based calling.
 * It uses the Twilio SDK to create tokens with Voice grant permissions.
 */


import { sign } from '@cfworker/jwt';

/**
 * Handle incoming requests
 */
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    // Only allow GET and POST requests
    if (request.method !== 'GET' && request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: getCORSHeaders()
      });
    }

    try {
      // Extract identity from query params or request body
      let identity = 'user';
      
      if (request.method === 'GET') {
        const url = new URL(request.url);
        identity = url.searchParams.get('identity') || 'user';
      } else if (request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        identity = body.identity || 'user';
      }

      // Get environment variables
      const accountSid = env.TWILIO_ACCOUNT_SID;
      const apiKey = env.TWILIO_API_KEY;
      const apiSecret = env.TWILIO_API_SECRET;
      const twimlAppSid = env.TWILIO_TWIML_APP_SID;

      // Validate required environment variables
      if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
        return new Response(JSON.stringify({
          error: 'Missing required environment variables',
          details: 'Please configure TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET, and TWILIO_TWIML_APP_SID'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...getCORSHeaders()
          }
        });
      }


      // Create Voice grant payload
      const voiceGrant = {
        outgoing: { application_sid: twimlAppSid },
        incoming: { allow: true }
      };

      // Create grants object
      const grants = {
        identity,
        voice: voiceGrant
      };

      // JWT payload
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        jti: `${apiKey}-${now}`,
        iss: apiKey,
        sub: accountSid,
        exp: now + 3600, // 1 hour expiry
        iat: now,
        grants
      };

      // Sign JWT
      const jwt = await sign(payload, apiSecret, { algorithm: 'HS256' });

      // Return the token
      return new Response(JSON.stringify({
        token: jwt,
        identity: identity
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getCORSHeaders()
        }
      });

    } catch (error) {
      console.error('Error generating token:', error);
      return new Response(JSON.stringify({
        error: 'Failed to generate token',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCORSHeaders()
        }
      });
    }
  }
};

/**
 * Get CORS headers
 */
function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

/**
 * Handle CORS preflight requests
 */
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders()
  });
}
