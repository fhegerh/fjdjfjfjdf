const { cmd } = require('../command');
const axios = require('axios');
const { load } = require('cheerio');

// --- Scraper Engine ---
const BASE = 'https://movieku.rest';
const api = axios.create({ timeout: 15000, headers: { 'Accept': 'text/html' } });

async function fetchHtml(url) {
    const res = await api.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' } });
    return res.data;
}

function parseArticles(html) {
    const $ = load(html);
    const items = [];
    $('article').each((i, el) => {
        const a = $(el).find('a[href]').first();
        const href = a.attr('href');
        if (href && (href.includes('/series/') || href.includes('/movie/'))) {
            items.push({
                title: $(el).find('.entry-title').text().trim() || a.text().trim(),
                link: new URL(href, BASE).href,
                image: $(el).find('img').first().attr('src')
            });
        }
    });
    return items;
}

// --- Command Implementation ---
cmd({
    pattern: "movieku",
    alias: ["mku", "msearch"],
    category: "downloader",
    description: "Search movies from Movieku.rest",
    use: '.movieku <query>',
}, async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("❌ Movie ka naam likho search karne ke liye!");
    
    await conn.sendMessage(m.chat, { react: { text: "🔍", key: mek.key } });

    try {
        const html = await fetchHtml(`${BASE}/?s=${encodeURIComponent(q)}`);
        const results = parseArticles(html);

        if (results.length === 0) return reply("❌ No results found.");

        let txt = `🎬 *MOVIEKU SEARCH RESULTS*\n\n`;
        results.forEach((v, i) => {
            txt += `*${i + 1}.* ${v.title}\n🔗 ${v.link}\n\n`;
        });
        
        await reply(txt);
    } catch (e) {
        reply("❌ Error: " + e.message);
    }
});

cmd({
    pattern: "ongoing",
    category: "downloader",
    description: "Fetch ongoing series from Movieku",
    use: '.ongoing',
}, async (conn, mek, m, { reply }) => {
    try {
        const html = await fetchHtml(`${BASE}/ongoing/`);
        const results = parseArticles(html);
        
        let txt = `📺 *ONGOING SERIES*\n\n`;
        results.slice(0, 5).forEach((v, i) => {
            txt += `*${i + 1}.* ${v.title}\n`;
        });
        
        await reply(txt);
    } catch (e) {
        reply("❌ Error fetching ongoing.");
    }
});
