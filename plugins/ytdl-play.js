const { cmd } = require('../command'); // Const ko small 'const' kar diya
const axios = require('axios');
const yts = require('yt-search');

cmd({
    pattern: "song",
    alias: ["play", "ytmp3"],
    desc: "Download songs via name or link.",
    category: "download",
    react: "🎧",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a song name or YouTube link!");

        // Search Reaction
        await conn.sendMessage(from, { react: { text: "🔎", key: mek.key } });

        let videoUrl = q;
        let vid;

        // Check agar input link hai ya name
        const isUrl = q.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g);

        if (isUrl) {
            // Agar link hai to details fetch karo
            const search = await yts({ videoId: q.split('v=')[1] || q.split('/').pop() });
            vid = search;
            videoUrl = q;
        } else {
            // Agar naam hai to search karo
            const search = await yts(q);
            if (!search || !search.videos.length) return reply("❌ No results found.");
            vid = search.videos[0];
            videoUrl = vid.url;
        }

        // Preview Message (YouTube Link aur Channel Info hata di gayi hai)
        await conn.sendMessage(from, {
            image: { url: vid.thumbnail || vid.image },
            caption: `╭━━〔 🎵 𝗠𝗨𝗦𝗜𝗖 𝗙𝗢𝗨𝗡𝗗 〕━━━╮\n┃ 🎧 *Title* : ${vid.title}\n┃ ⏱️ *Duration* : ${vid.timestamp || 'N/A'}\n╰━━━━━━━━━━━━━━━━━╯\n\n⏳ *Downloading audio...*`
        }, { quoted: mek });

        // API Download
        let api = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(videoUrl)}`;
        let { data } = await axios.get(api);

        if (!data || !data.status || !data.audio) {
            return reply("❌ API error! Try again later.");
        }

        // Sending Audio (Sirf MP3 format me bina kisi channel credit/forward ke)
        await conn.sendMessage(from, {
            audio: { url: data.audio },
            mimetype: "audio/mpeg"
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});
