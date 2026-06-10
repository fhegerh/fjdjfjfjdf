const { cmd } = require('../command');
const axios = require('axios');
const FormData = require('form-data');

cmd({
    pattern: "tourl",
    alias: ["uguu", "upload", "up"],
    desc: "Upload any media (image, video, audio, doc) to uguu.se and get a direct link.",
    category: "utility",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        // Defining target container dynamically
        const targetMessage = quoted ? quoted : m;

        // Ultra-robust deep nested mime-type lookup across all possible Baileys shapes
        let mimeType = targetMessage.msg?.mimetype || 
                       targetMessage.mimetype || 
                       targetMessage.message?.imageMessage?.mimetype || 
                       targetMessage.message?.videoMessage?.mimetype || 
                       targetMessage.message?.audioMessage?.mimetype || 
                       targetMessage.message?.documentMessage?.mimetype || 
                       targetMessage.msg?.imageMessage?.mimetype ||
                       targetMessage.msg?.videoMessage?.mimetype ||
                       targetMessage.viewOnceMessage?.message?.imageMessage?.mimetype ||
                       targetMessage.viewOnceMessage?.message?.videoMessage?.mimetype || '';

        // Emergency fallback check if object tree exists but string is blank
        if (!mimeType) {
            if (targetMessage.message?.imageMessage || targetMessage.msg?.imageMessage) mimeType = 'image/jpeg';
            else if (targetMessage.message?.videoMessage || targetMessage.msg?.videoMessage) mimeType = 'video/mp4';
            else if (targetMessage.message?.audioMessage || targetMessage.msg?.audioMessage) mimeType = 'audio/mp4';
            else if (targetMessage.message?.documentMessage || targetMessage.msg?.documentMessage) mimeType = 'application/octet-stream';
        }

        // Ultimate validation cutoff
        if (!mimeType) {
            return reply("❌ Please reply to an image, video, audio, or document, or send media with the caption *.tourl*");
        }

        await reply("📥 Downloading media from WhatsApp servers... Please wait.");

        // Safe buffer extraction block
        let buffer;
        try {
            if (typeof conn.downloadMediaMessage === 'function') {
                buffer = await conn.downloadMediaMessage(targetMessage);
            } else if (typeof conn.downloadAndSaveMediaMessage === 'function') {
                const pathFile = await conn.downloadAndSaveMediaMessage(targetMessage);
                const fs = require('fs');
                buffer = fs.readFileSync(pathFile);
                fs.unlinkSync(pathFile); // Disk cleanup
            } else {
                const { downloadMediaMessage } = require('@whiskeysockets/baileys');
                buffer = await downloadMediaMessage(targetMessage, 'buffer', {}, { logger: console });
            }
        } catch (downloadError) {
            console.error(downloadError);
            return reply("❌ Failed to download file from WhatsApp storage.");
        }

        if (!buffer) return reply("❌ Extraction failed. Buffer is empty.");

        await reply("📤 Uploading payload to Uguu cloud storage...");

        // Parse clean file extension mapping
        let ext = 'bin';
        if (mimeType.includes('/')) {
            ext = mimeType.split('/')[1].split(';')[0];
        }
        if (ext === 'jpeg') ext = 'jpg';

        // Initializing dynamic multipart object stream
        const form = new FormData();
        form.append("files[]", buffer, {
            filename: `kamran_media_${Date.now()}.${ext}`,
            contentType: mimeType
        });

        const USER_AGENT = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

        const response = await axios.post("https://uguu.se/upload.php", form, {
            timeout: 120000,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            headers: {
                ...form.getHeaders(),
                accept: "*/*",
                origin: "https://uguu.se",
                referer: "https://uguu.se/",
                "user-agent": USER_AGENT
            }
        });

        let data = response.data;
        if (typeof data === 'string') data = JSON.parse(data);

        const urlFinal = data?.files?.[0]?.url || null;
        const nameFinal = data?.files?.[0]?.name || 'Unknown File';
        const sizeFinal = data?.files?.[0]?.size ? (data.files[0].size / (1024 * 1024)).toFixed(2) + " MB" : 'Unknown';

        if (response.status === 200 && data?.success === true && urlFinal) {
            let txt = `🚀 *UGUU FILE UPLOADER* 🚀\n\n`;
            txt += `📄 *File Name:* ${nameFinal}\n`;
            txt += `⚖️ *File Size:* ${sizeFinal}\n`;
            txt += `🔗 *Direct Link:* ${urlFinal}\n\n`;
            txt += `_Note: Uguu temporary server holds files for up to 24-72 hours only._\n\n`;
            txt += `*POWERED BY DR KAMRAN*`;

            return await reply(txt);
        } else {
            return reply(`❌ Upload rejected by Uguu endpoints.`);
        }

    } catch (error) {
        console.error(error);
        return reply(`❌ Uploader System Error: ${error.message}`);
    }
});
