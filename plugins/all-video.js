const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "dl",
    alias: ["download"],
    desc: "Download media via AIO API",
    category: "downloader",
    filename: __filename
}, async (conn, m, { text }) => {
    
    // 1. Fixing the 'reply' function error
    // Hum 'm.reply' ya direct 'conn.sendMessage' ka use karenge
    const reply = async (teks) => {
        return await conn.sendMessage(m.chat, { text: teks }, { quoted: m });
    };

    if (!text) return reply('❌ Link ka link bhejen!\nContoh: .dl https://www.youtube.com/watch?v=...');

    await reply('⏳ Sedang memproses media, mohon tunggu...');

    try {
        // 2. API Call
        const api = `https://api.mifinfinity.my.id/api/downloader/aio-v2?url=${encodeURIComponent(text)}`;
        const { data } = await axios.get(api);

        if (!data.status || !data.result) {
            return reply('❌ Gagal mengambil data. Pastikan link valid.');
        }

        const res = data.result;

        // 3. Sending the Media
        if (res.type === 'video') {
            await conn.sendMessage(m.chat, { 
                video: { url: res.download }, 
                caption: `✅ *Download Berhasil*\n\n◦ Title: ${res.title}` 
            }, { quoted: m });
        } else if (res.type === 'audio') {
            await conn.sendMessage(m.chat, { 
                audio: { url: res.download }, 
                mimetype: 'audio/mpeg' 
            }, { quoted: m });
        }

    } catch (e) {
        console.error(e);
        reply('❌ Terjadi kesalahan saat mendownload.');
    }
});
