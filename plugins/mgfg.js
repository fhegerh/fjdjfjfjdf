const axios = require("axios");
const config = require('../config');
const { cmd } = require('../command'); // اپنی فائل کا پاتھ چیک کر لیں
const sharp = require("sharp");

async function getThumbnailBuffer(url) {
    if (!url) return null;
    try {
        const { data } = await axios.get(url, { responseType: "arraybuffer" });
        return await sharp(data).resize(300, 300).jpeg({ quality: 80 }).toBuffer();
    } catch (err) { return null; }
}

cmd({
    pattern: "movie",
    alias: ["mlfbd", "downloadmovie", "cinemalk"],
    category: "downloader",
    description: "Search and download movies from MLFBD",
    react: "🎬"
}, async (conn, mek, m, { from, q, reply, react }) => {
    
    // اگر reply یا react فنکشن نہیں مل رہے تو یہاں متبادل کوڈ ہے
    const sendReply = async (text) => await conn.sendMessage(from, { text: text }, { quoted: mek });
    const sendReact = async (emoji) => await conn.sendMessage(from, { react: { text: emoji, key: mek.key } });

    const apiKey = "vajira-23ikssig51-1780651873767";
    const searchApiUrl = `https://vajira-official-apis.vercel.app/api/mlfbds`;
    const downloadApiUrl = `https://vajira-official-apis.vercel.app/api/mlfbddl`;

    try {
        if (!q) return await sendReply("❌ *Opps! Movie Name Missing*\n\nPlease provide a movie name to search!\n📌 *Example:* `.movie Avengers`");

        await sendReact("🔍");
        await sendReply(`🔍 _Searching for *"${q}"* on MLFBD servers..._`);

        const response = await axios.get(searchApiUrl, { params: { apikey: apiKey, text: q }, timeout: 30000 });
        if (!response.data?.result || response.data.result.length === 0) return await sendReply("🛸 *No Results Found!*");

        const results = response.data.result;
        let listText = `┏━━━━━━━━━━━━━━━━━━━━━━━━┓\n┃ 🎬  *MLFBD MOVIE SEARCH*  🎬 ┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        results.forEach((v, i) => {
            listText += `🍿 *[${i + 1}]* _${v.title}_ (📅 ${v.year || 'N/A'})\n`;
        });
        listText += `\n⚡ *Reply with the item number* to view details.`;

        const sentSearch = await conn.sendMessage(from, { image: { url: results[0].image || "https://placehold.co/600x400?text=No+Poster" }, caption: listText }, { quoted: mek });
        const searchMsgId = sentSearch.key.id;

        // Message Handler (سیشن کے اندر)
        const msgHandler = async (update) => {
            const msg = update.messages[0];
            if (!msg?.message || msg.key.remoteJid !== from) return;
            
            const quotedId = msg.message.extendedTextMessage?.contextInfo?.stanzaId;
            if (quotedId !== searchMsgId) return;

            const choice = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
            const num = parseInt(choice);
            
            if (!isNaN(num) && num >= 1 && num <= results.length) {
                conn.ev.off("messages.upsert", msgHandler);
                await sendReact("⏳");
                
                const selected = results[num - 1];
                const detailResponse = await axios.get(downloadApiUrl, { params: { apikey: apiKey, url: selected.link } });
                const movieDetails = detailResponse.data.result;
                
                let cap = `🎥 *${movieDetails.title}*\n\n📝 *Desc:* ${movieDetails.description}\n\n⚡ *Reply with mirror number for download.*`;
                const sentDetail = await conn.sendMessage(from, { image: { url: movieDetails.image }, caption: cap }, { quoted: msg });
                
                // یہاں آپ اپنی ڈاؤن لوڈنگ لاجک مزید بڑھا سکتے ہیں
            }
        };

        conn.ev.on("messages.upsert", msgHandler);
        setTimeout(() => conn.ev.off("messages.upsert", msgHandler), 300000);

    } catch (e) {
        console.log(e);
        await sendReply(`❌ *Error:* ${e.message}`);
    }
});
