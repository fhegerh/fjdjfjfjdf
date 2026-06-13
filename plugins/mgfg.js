const { cmd } = require('../command');
const axios = require('axios');
const { load } = require('cheerio');

const BASE = 'https://movieku.rest';
const api = axios.create({ timeout: 15000 });

// Global object trackers ko store karne ke liye taaki duplicate execution na ho
global.activeMoviekuOngoing = global.activeMoviekuOngoing || {};

async function fetchHtml(url) {
    const res = await api.get(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' } 
    });
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

function parseSeriesDetail(html) {
    const $ = load(html);
    const title = $('title').text().replace(/ - Movieku.*/, '').trim();
    const synopsis = $('.entry-content').text().trim().substring(0, 400) || 'No description available';
    
    const downloads = [];
    $('a[href*="acefile.co"], a[href*="mega.nz"], a[href*="drive.google.com"], a[href*="zippy"], a[href*="mediafire"]').each((i, a) => {
        const label = $(a).text().trim();
        const url = $(a).attr('href');
        if (label && url) {
            downloads.push({ label, url });
        }
    });
    return { title, synopsis, download_links: downloads };
}

// ================= THE MAIN COMMAND =================
cmd({
    pattern: "ongoing",
    category: "downloader",
    description: "Fetch ongoing series and download from Movieku",
    use: '.ongoing [page_number]',
}, async (conn, mek, m, { args, from, reply }) => {
    try {
        // Purane kisi listener ko safely clear karo takki clash na ho
        if (global.activeMoviekuOngoing[from]) {
            conn.ev.off("messages.upsert", global.activeMoviekuOngoing[from]);
            delete global.activeMoviekuOngoing[from];
        }

        const page = args[0] && !isNaN(args[0]) ? args[0] : "1";
        await conn.sendMessage(from, { react: { text: "📺", key: mek.key } });
        
        let targetUrl = `${BASE}/ongoing/`;
        if (page !== "1") targetUrl = `${BASE}/ongoing/page/${page}/`;

        const html = await fetchHtml(targetUrl);
        const results = parseArticles(html);

        if (results.length === 0) return reply(`❌ Page ${page} par koi ongoing series nahi mili.`);

        let txt = `📺 *MOVIEKU ONGOING SERIES (Page ${page})*\n\n`;
        results.forEach((v, i) => {
            txt += `*${i + 1}.* ${v.title}\n`;
        });
        txt += `\n*🔢 Reply with a number to select and get download links.*\n\n> © KAMRAN-MINI-BOT ッ`;

        // Image ke sath list bhej rahe hain (pehli item ki image use kar rahe hain default)
        const firstImg = results[0]?.image || "https://placehold.co/600x400?text=No+Poster";
        await conn.sendMessage(from, { image: { url: firstImg }, caption: txt }, { quoted: mek });

        // ================= INTERACTIVE LISTENER FOR NUMBER SELECTION =================
        const ongoingSelectionHandler = async (update) => {
            const msg = update.messages[0];
            if (!msg?.message || msg.key.remoteJid !== from || msg.key.fromMe) return;

            const choice = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
            const num = parseInt(choice);

            // Agar user ne list number ke alawa kuch aur type kiya toh ignore karo
            if (isNaN(num) || num < 1 || num > results.length) return;

            // Sahi input milne par listener ko fauran off karo taaki loop na bane
            conn.ev.off("messages.upsert", ongoingSelectionHandler);
            delete global.activeMoviekuOngoing[from];

            await conn.sendMessage(from, { react: { text: "⏳", key: msg.key } });
            const selectedItem = results[num - 1];

            try {
                // Specific movie/series ka page link fetch karo download links ke liye
                const detailHtml = await fetchHtml(selectedItem.link);
                const details = parseSeriesDetail(detailHtml);

                let cap = `🎬 *${details.title}*\n\n`;
                cap += `ℹ️ *Synopsis:* ${details.synopsis}...\n\n`;
                cap += `┌───────────────────\n`;
                cap += `│ 📂 *Available Download Links:*\n`;

                if (details.download_links.length === 0) {
                    cap += `│ ❌ No direct download mirrors found.\n`;
                } else {
                    details.download_links.forEach((dl, index) => {
                        cap += `│ *[${index + 1}]* ☛ ${dl.label}\n│ 🔗 Link: ${dl.url}\n│\n`;
                    });
                }
                cap += `└───────────────────\n\n> © KAMRAN-MINI-BOT ッ`;

                // Response send karein text and link mirrors ke sath
                await conn.sendMessage(from, { text: cap }, { quoted: msg });
                await conn.sendMessage(from, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                console.error(err);
                reply("❌ Error parsing download properties for this selection.");
            }
        };

        // Active listener ko memory me register karo
        global.activeMoviekuOngoing[from] = ongoingSelectionHandler;
        conn.ev.on("messages.upsert", ongoingSelectionHandler);

        // 3 minute ka safe timeout
        setTimeout(() => {
            if (global.activeMoviekuOngoing[from]) {
                conn.ev.off("messages.upsert", ongoingSelectionHandler);
                delete global.activeMoviekuOngoing[from];
            }
        }, 180000);

    } catch (e) {
        console.error("Ongoing command error:", e.message);
        reply("❌ System Error loading ongoing series list.");
    }
});
