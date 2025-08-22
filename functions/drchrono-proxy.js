const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { endpoint, accessToken } = JSON.parse(event.body);

        if (!endpoint || !accessToken) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing endpoint or access token.' }) };
        }

        const drchronoApiUrl = `https://drchrono.com${endpoint}`;

        const response = await fetch(drchronoApiUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('DrChrono API Error via Proxy:', data);
            return { statusCode: response.status, body: JSON.stringify(data) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error('Proxy function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal server error occurred.' }),
        };
    }
};
