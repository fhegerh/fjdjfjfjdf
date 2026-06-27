/** 
 * ✦ Nama Plugin: YouTube Play (Audio) 
 * ✦ Author plugin: kyuu masih pemula 
 * ✦ Source API: https://api.cuki.biz.id 
 * ✦ Migrated to 'cmd' & 'axios' structure
**/

const { cmd } = require('../command');
const axios = require('axios');

const YT_API = 'https://api.cuki.biz.id/api/search/playyt?apikey=cuki-x&query=';

async function searchYoutube(query) {
    const res = await axios.get(`${YT_API}${encodeURIComponent(query)}`);
    if (!res.data || !res.data.success || !res.data.data) return null;
    return res.data.data;
}

async function getThumbBase64(url) {
    try {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(res.data).toString('base64');
    } catch (e) {
        return null;
    }
}

cmd({
    pattern: "play7",
    alias: ["ytmp3", "ytplay4"],
    desc: "Mencari dan mendownload audio dari YouTube",
    category: "downloader",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, reply }) => {
    
    if (!q) {
        return reply(`Masukin judul lagu nya bro\n\nContoh: .${command} Masalah masa depan - Hindia`);
    }

    // Memberi reaksi proses jika bot mendukung
    try { await conn.sendMessage(from, { react: { text: '🕒', key: mek.key } }); } catch (e) {}

    try {
        const data = await searchYoutube(q);
        
        if (!data || !data.video || !data.download || !data.download.success) {
            try { await conn.sendMessage(from, { react: { text: '✖️', key: mek.key } }); } catch (e) {}
            return reply(`Lagu *${q}* gak ketemu`);
        }

        const { video, download } = data;
        const audio = download.audio;
        const thumbBase64 = await getThumbBase64(video.thumbnail.default);

        // Mengirim info link preview menggunakan relayMessage manual
        await conn.relayMessage(
            from, 
            { 
                extendedTextMessage: { 
                    text: `🎵 *${video.title}*\n\n» Channel : ${video.author.name}\n» Durasi : ${video.duration.timestamp}\n» Views : ${video.views}\n» Link : ${video.url}`, 
                    matchedText: video.url, 
                    description: '© kyzz', 
                    title: video.title, 
                    previewType: 'NONE', 
                    jpegThumbnail: thumbBase64 
                } 
            }, 
            {}
        );

        // Mengirim berkas Audio mp3
        await conn.sendMessage(from, { 
            audio: { url: audio.url }, 
            mimetype: 'audio/mpeg', 
            fileName: audio.filename, 
            ptt: false 
        }, { quoted: mek });

        // Reaksi sukses
        try { await conn.sendMessage(from, { react: { text: '✅', key: mek.key } }); } catch (e) {}

    } catch (e) {
        console.error(e);
        reply(`❌ Gagal: ${e.message || e}`);
        try { await conn.sendMessage(from, { react: { text: '✖️', key: mek.key } }); } catch (e) {}
    }
});
