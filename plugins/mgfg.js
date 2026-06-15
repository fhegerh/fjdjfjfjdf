const axios = require("axios");
const config = require('../config');
const { cmd } = require('../command'); // یہاں صحیح پاتھ دیں
const sharp = require("sharp");

// Helper function to process high-compatibility jpeg thumbnails
async function getThumbnailBuffer(url) {
  if (!url) return null;
  try {
    const { data } = await axios.get(url, { responseType: "arraybuffer" });
    return await sharp(data)
      .resize(300, 300)
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (err) {
    console.error("Error processing thumbnail:", err.message || err);
    return null;
  }
}

cmd({
    pattern: "movie",
    alias: ["mlfbd", "downloadmovie", "cinemalk"],
    category: "downloader",
    description: "Search and download movies from MLFBD via API",
    react: "🎬"
}, async (context) => {
    const { reply, react, q, socket, sock, conn, from, mek } = context;
    const client = socket || sock || conn;

    const apiKey = "vajira-VajiraOfficial2003";
    const searchApiUrl = `https://vajira-official-apis.vercel.app/api/mlfbds`;
    const downloadApiUrl = `https://vajira-official-apis.vercel.app/api/mlfbddl`;

    try {
        if (!q) {
            return reply("❌ *Opps! Movie Name Missing*\n\nPlease provide a movie name to search!\n📌 *Example:* `.movie From Season 4`");
        }

        await reply(`🔍 _Searching for *"${q}"* on MLFBD servers..._`);

        const response = await axios.get(searchApiUrl, {
            params: { apikey: apiKey, text: q },
            timeout: 30000
        });

        if (!response.data?.result || response.data.result.length === 0) {
            return reply("🛸 *No Results Found!*");
        }

        const results = response.data.result;

        // Search List Layout
        let listText = `┏━━━━━━━━━━━━━━━━━━━━━━━━┓\n┃ 🎬  *MLFBD MOVIE SEARCH*  🎬 ┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        results.forEach((v, i) => {
            listText += `🍿 *[${i + 1}]* _${v.title}_ (📅 ${v.year || 'N/A'})\n`;
        });
        listText += `\n⚡ *Reply with the item number* to view options.`;

        const sentSearch = await client.sendMessage(from, { image: { url: results[0].image }, caption: listText }, { quoted: mek });
        const searchMsgId = sentSearch.key.id;

        // Interaction Handler (Simplified structure)
        const msgHandler = async (update) => {
            const msg = update.messages[0];
            if (!msg?.message || msg.key.remoteJid !== from) return;
            
            const quotedId = msg.message.extendedTextMessage?.contextInfo?.stanzaId;
            if (quotedId !== searchMsgId) return;

            const choice = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
            const num = parseInt(choice);
            
            if (!isNaN(num) && num >= 1 && num <= results.length) {
                client.ev.off("messages.upsert", msgHandler);
                await react("⏳");
                
                // یوزر کا انتخاب مل گیا، اب ڈاؤن لوڈ لنک نکالیں
                const selected = results[num - 1];
                const detailResponse = await axios.get(downloadApiUrl, { params: { apikey: apiKey, url: selected.link } });
                const movieDetails = detailResponse.data.result;
                
                // یہاں آپ کا ڈاؤن لوڈ کا باقی لاجک آئے گا (جو پہلے سے موجود تھا)
                await reply(`✅ *Selected:* ${movieDetails.title}. (Logic continues...)`);
            }
        };

        client.ev.on("messages.upsert", msgHandler);
        setTimeout(() => client.ev.off("messages.upsert", msgHandler), 300000);

    } catch (e) {
        console.error(e);
        reply(`❌ *Error:* ${e.message}`);
    }
});
