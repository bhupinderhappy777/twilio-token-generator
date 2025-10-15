     // src/index.js (ES module)
    function base64url(source) {
      let bytes;
      if (typeof source === 'string') {
        bytes = new TextEncoder().encode(source);
      } else if (source instanceof ArrayBuffer) {
        bytes = new Uint8Array(source);
      } else if (ArrayBuffer.isView(source)) {
        bytes = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
      } else {
        throw new TypeError('Unsupported input type for base64url');
      }
      let encodedSource = btoa(String.fromCharCode(...bytes));
      encodedSource = encodedSource.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
      return encodedSource;
    }

     async function createJWT(payload, secret) {
       const header = { alg: 'HS256', typ: 'JWT' };
       const encodedHeader = base64url(JSON.stringify(header));
       const encodedPayload = base64url(JSON.stringify(payload));
       const data = `${encodedHeader}.${encodedPayload}`;
       const encoder = new TextEncoder();
       const cryptoKey = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
       const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
       const encodedSignature = base64url(signature);
       return `${data}.${encodedSignature}`;
     }

     export default {
       async fetch(request, env, ctx) {
         const corsHeaders = {
           'Access-Control-Allow-Origin': '*',
           'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
           'Access-Control-Allow-Headers': 'Content-Type',
         };

         if (request.method === 'OPTIONS') {
           return new Response(null, { headers: corsHeaders });
         }

         const url = new URL(request.url);

         // Debug endpoint
         if (url.pathname === '/debug') {
           return new Response(JSON.stringify({
             timestamp: new Date().toISOString(),
             env_check: {
               TWILIO_ACCOUNT_SID: env.TWILIO_ACCOUNT_SID ? 'Present' : 'MISSING',
               TWILIO_API_KEY: env.TWILIO_API_KEY ? 'Present' : 'MISSING',
               TWILIO_API_SECRET: env.TWILIO_API_SECRET ? 'Present' : 'MISSING',
               TWILIO_TWIML_APP_SID: env.TWILIO_TWIML_APP_SID ? 'Present' : 'MISSING'
             }
           }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
         }

         // Voice webhook (TwiML for calls)
         if (url.pathname === '/voice' && request.method === 'POST') {
           try {
             const formData = await request.formData();
             const toNumber = formData.get('To') || '+12362392121'; // Default to your number
             const twiml = `<?xml version="1.0" encoding="UTF-8"?>
             <Response>
               <Dial callerId="${env.TWILIO_PHONE_NUMBER || '+12362392121'}">${toNumber}</Dial>
             </Response>`;
             return new Response(twiml, { headers: { 'Content-Type': 'text/xml', ...corsHeaders } });
           } catch (error) {
             return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, call failed.</Say></Response>`, {
               headers: { 'Content-Type': 'text/xml', ...corsHeaders }
             });
           }
         }

         // Token generation (GET /)
         try {
           if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_API_KEY || !env.TWILIO_API_SECRET || !env.TWILIO_TWIML_APP_SID) {
             throw new Error('Missing env vars');
           }

           const now = Math.floor(Date.now() / 1000);
           const payload = {
             iss: env.TWILIO_API_KEY,
             sub: env.TWILIO_ACCOUNT_SID,
             exp: now + 3600,
             iat: now,
             grants: {
               identity: 'browser_user',
               voice: 'true',
               outgoing: {
                 application_sid: env.TWILIO_TWIML_APP_SID,
                 enabled: true
               }
             }
           };

           const token = await createJWT(payload, env.TWILIO_API_SECRET);
           return new Response(JSON.stringify({ token }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
         } catch (error) {
           return new Response(JSON.stringify({ error: error.message }), {
             status: 500,
             headers: { 'Content-Type': 'application/json', ...corsHeaders }
           });
         }
       },
     };