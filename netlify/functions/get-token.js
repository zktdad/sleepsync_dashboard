// This is a serverless function that will run on Netlify.
// It securely exchanges the authorization code for an access token.

// We need to use a library to make HTTP requests from the backend.
// 'node-fetch' is a common choice. Netlify will install it for us.
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { code, clientId, redirectUri } = JSON.parse(event.body);

        // Get the Client Secret from Netlify's secure environment variables
        const clientSecret = process.env.DRCHRONO_CLIENT_SECRET;

        if (!code || !clientId || !redirectUri || !clientSecret) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required parameters.' }),
            };
        }

        const tokenUrl = 'https://drchrono.com/o/token/';
        const params = new URLSearchParams({
            'grant_type': 'authorization_code',
            'client_id': clientId,
            'client_secret': clientSecret,
            'redirect_uri': redirectUri,
            'code': code,
        });

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
        });

        const data = await response.json();

        if (!response.ok) {
            // Forward the error from DrChrono to the frontend for better debugging
            console.error('DrChrono API Error:', data);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: data.error_description || 'Failed to get access token from DrChrono.' }),
            };
        }

        // Success! Send the access token back to the frontend.
        return {
            statusCode: 200,
            body: JSON.stringify({ access_token: data.access_token }),
        };

    } catch (error) {
        console.error('Serverless function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal server error occurred.' }),
        };
    }
};
