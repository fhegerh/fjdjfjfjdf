const { cmd } = require('../command');
const axios = require('axios');
const { load } = require('cheerio');

const BASE = 'https://movieku.rest';
const api = axios.create({ timeout: 20000 });

// Global cache for current results to prevent data loss
global.ongoing_data = global.ongoing_data || {};

async function fetchHtml(url) {
    const { data } = await api.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' } });
    return data;
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
                link: new URL(href, BASE).href
            });
        }
    });
    return items;
}

cmd({
    pattern: "ongoing",
    category: "downloader",
    description: "Fetch ongoing series",
}, async (conn, mek, m, { args, from, reply }) => {
    try {
        const page = args[0] || "1";
        const html = await fetchHtml(`${BASE}/ongoing/page/${page}/`);
        const results = parseArticles(html);

        if (results.length === 0) return reply("❌ No results found.");

        let txt = `📺 *ONGOING SERIES (Page ${page})*\n\n`;
        results.forEach((v, i) => { txt += `*${i + 1}.* ${v.title}\n`; });
        txt += `\n> *Reply with the number (1-${results.length}) to get links.*`;

        // Save data to global cache
        global.ongoing_data[from] = results;

        await conn.sendMessage(from, { text: txt }, { quoted: mek });

        // Logic for handling reply
        const handler = async (update) => {
            const msg = update.messages[0];
            if (!msg.message || msg.key.remoteJid !== from) return;

            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
            const num = parseInt(text);

            if (!isNaN(num) && global.ongoing_data[from] && num > 0 && num <= global.ongoing_data[from].length) {
                conn.ev.off("messages.upsert", handler); // Stop listening
                
                const selected = global.ongoing_data[from][num - 1];
                await conn.sendMessage(from, { react: { text: "⏳", key: msg.key } });

                const detailHtml = await fetchHtml(selected.link);
                const $ = load(detailHtml);
                
                let links = "";
                $('a').each((i, el) => {
                    const href = $(el).attr('href');
                    if (href && (href.includes('acefile') || href.includes('mega') || href.includes('drive'))) {
                        links += `🔗 *${$(el).text().trim()}*: ${href}\n`;
                    }
                });

                await reply(`🎬 *${selected.title}*\n\n` + (links || "❌ No download links found.") + `\n> © KAMRAN-MINI-BOT ッ`);
                delete global.ongoing_data[from]; // Clear cache
            }
        };

        conn.ev.on("messages.upsert", handler);
        
        // Auto-clear listener after 2 minutes
        setTimeout(() => { conn.ev.off("messages.upsert", handler); }, 120000);

    } catch (e) {
        reply("❌ Error: " + e.message);
    }
});
