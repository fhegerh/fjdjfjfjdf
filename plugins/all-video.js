const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

cmd({
    pattern: "jadwalbola",
    alias: ["bola", "football", "sepakbola"],
    desc: "Fetch live football match schedules from JadwalTV.",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        await reply("⏳ Fetching latest football match schedules, please wait...");

        const baseUrl = 'https://www.jadwaltv.net';
        const path = '/jadwal-sepakbola';

        // Fetching HTML from JadwalTV website
        const response = await axios.get(`${baseUrl}${path}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            },
            timeout: 15000
        });

        const $ = cheerio.load(response.data);
        const jadwal = [];
        const seenKeys = new Set(); // To handle deduplication statelessly

        // Parsing HTML table structure matching your script logic
        $('table').each((tableIdx, table) => {
            const rows = $(table).find('tr');

            rows.each((rowIdx, row) => {
                const cols = $(row).find('td');
                
                if (cols.length === 4) {
                    const tanggal = $(cols[0]).text().trim();
                    const jam = $(cols[1]).text().trim();
                    const pertandingan = $(cols[2]).text().trim();
                    const kompetisi = $(cols[3]).text().trim();

                    if (tanggal && jam && pertandingan && kompetisi && !tanggal.includes('Tanggal')) {
                        const key = `${tanggal}|${jam}|${pertandingan}`;
                        
                        if (!seenKeys.has(key)) {
                            seenKeys.add(key);
                            jadwal.push({
                                tanggal,
                                jam,
                                pertandingan,
                                kompetisi
                            });
                        }
                    }
                }
            });
        });

        if (jadwal.length === 0) {
            return reply("❌ Tidak dapat menemukan jadwal pertandingan. Mungkin struktur website berubah.");
        }

        // Grouping the matches by date for clean readability
        const grouped = {};
        jadwal.forEach(item => {
            if (!grouped[item.tanggal]) grouped[item.tanggal] = [];
            grouped[item.tanggal].push({
                jam: item.jam,
                pertandingan: item.pertandingan,
                kompetisi: item.kompetisi
            });
        });

        // Constructing beautiful text output for WhatsApp
        let txt = `⚽ *JADWAL LIVE SEPAKBOLA TV* ⚽\n\n`;
        txt += `📊 *Total Matches Found:* ${jadwal.length}\n`;
        txt += `🌐 *Source:* jadwaltv.net (WIB)\n`;
        txt += `───────────────────\n\n`;

        // Showing maximum 5 dates to prevent text payload size limit on WhatsApp
        const dates = Object.keys(grouped).slice(0, 5);

        dates.forEach(tanggal => {
            txt += `📅 *${tanggal.toUpperCase()}*\n`;
            txt += `───────────────────\n`;

            grouped[tanggal].forEach(match => {
                txt += `⏰ *${match.jam}* - ${match.pertandingan}\n`;
                txt += `🏆 _League: ${match.kompetisi}_\n\n`;
            });
            txt += `\n`;
        });

        txt += `*Powered by DR KAMRAN*`;

        return await reply(txt);

    } catch (error) {
        console.error(error);
        return reply(`❌ Error parsing football schedule: ${error.message}`);
    }
});

