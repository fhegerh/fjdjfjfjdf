/** 
 * ✦ Nama Plugin: NanoBanana AI Image Editor 
 * ✦ Author plugin: kyuu masih pemula 
 * ✦ Source API: https://api.kyzz.my.id 
 * ✦ Migrated to 'cmd' & 'axios' structure
**/

const { cmd } = require('../command');
const axios = require('axios');
const FormData = require('form-data'); // Pastikan sudah install form-data

const NANOBANANA_API = 'https://api.kyzz.my.id/docs/api/ai-image/nanobanana-edit.php';

async function editImage(buffer, prompt) {
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('file', Buffer.from(buffer), { filename: 'image.jpg' });

    const res = await axios.post(NANOBANANA_API, form, {
        headers: { ...form.getHeaders() }
    });

    const json = res.data;
    if (!json || !json.status || !json.result || !json.result.url) {
        throw `API gagal proses\n${JSON.stringify(json).slice(0, 300)}`;
    }
    return json.result.url;
}

cmd({
    pattern: "nano",
    alias: ["nanobanana"],
    desc: "AI Image Editor by NanoBanana",
    category: "ai",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, reply }) => {
    
    // Mengecek apakah ada gambar (reply atau kirim langsung)
    const isQuotedImage = quoted && (quoted.mtype === 'imageMessage');
    const isImage = mek.mtype === 'imageMessage';

    if (!isQuotedImage && !isImage) {
        return reply(`Reply/kirim gambar yang mau diedit dengan caption prompt-nya.\n\nContoh: .${command} ubah jadi warna merah`);
    }

    if (!q) {
        return reply(`Masukin prompt edit nya bro.\n\nContoh: .${command} ubah jadi warna merah`);
    }

    try {
        // Beri reaksi proses
        try { await conn.sendMessage(from, { react: { text: '🕒', key: mek.key } }); } catch (e) {}

        // Download gambar
        const imageBuffer = await (isQuotedImage ? quoted.download() : conn.downloadMediaMessage(mek));

        // Proses edit ke API
        const resultUrl = await editImage(imageBuffer, q);
        
        // Download hasil editan
        const resultRes = await axios.get(resultUrl, { responseType: 'arraybuffer' });
        const resultBuffer = Buffer.from(resultRes.data);

        // Kirim hasil
        await conn.sendMessage(from, { 
            image: resultBuffer, 
            caption: `🍌 *NanoBanana AI Image Editor*\n\n» Prompt : ${q}\n\n© Kyzz` 
        }, { quoted: mek });

        // Reaksi sukses
        try { await conn.sendMessage(from, { react: { text: '✅', key: mek.key } }); } catch (e) {}

    } catch (e) {
        console.error(e);
        reply(`❌ Gagal: ${e.message || e}`);
        try { await conn.sendMessage(from, { react: { text: '✖️', key: mek.key } }); } catch (e) {}
    }
});
