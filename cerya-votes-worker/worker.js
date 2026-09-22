// Cloudflare Worker: shared global vote counter for Cerya's page.
// Deploy this, bind a KV namespace as CERYA_VOTES, then point cerya.js VOTES_API at its URL.

const ALLOWED_ORIGIN = '*'; // tighten to 'https://celinascollection.com' once deployed if you want

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
}

async function getCounts(env) {
    const raw = await env.CERYA_VOTES.get('counts');
    const counts = raw ? JSON.parse(raw) : { cerya: 0, celina: 0 };
    counts.cerya = Number.isFinite(counts.cerya) ? counts.cerya : 0;
    counts.celina = Number.isFinite(counts.celina) ? counts.celina : 0;
    return counts;
}

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });

        const url = new URL(request.url);
        if (url.pathname !== '/votes') return json({ error: 'not found' }, 404);

        if (request.method === 'GET') {
            return json(await getCounts(env));
        }

        if (request.method === 'POST') {
            const body = await request.json().catch(() => ({}));
            const vote = body.vote;
            const previousVote = body.previousVote;
            if (vote !== 'cerya' && vote !== 'celina') return json({ error: 'invalid vote' }, 400);

            const counts = await getCounts(env);
            counts[vote] += 1;
            if ((previousVote === 'cerya' || previousVote === 'celina') && previousVote !== vote) {
                counts[previousVote] = Math.max(0, counts[previousVote] - 1);
            }
            await env.CERYA_VOTES.put('counts', JSON.stringify(counts));
            return json(counts);
        }

        return json({ error: 'method not allowed' }, 405);
    }
};
