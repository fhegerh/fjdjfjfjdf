const { cmd } = require('../command');
const axios = require('axios');
const FormData = require('form-data');

cmd({
    pattern: "tourl",
    alias: ["uguu", "upload", "up"],
    desc: "Upload any media to uguu.se with absolute zero-trust deep scanning.",
    category: "utility",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, q, reply }) => {
    try {
        // -------------------------------------------------------------------
        // 🚀 ULTRA-ROBUST ZERO-TRUST MEDIA SCANNER
        // -------------------------------------------------------------------
        let targetMessage = null;
        let mimeType = "";
        
        const scanMessageTree = (obj) => {
            if (!obj) return null;
            
            // Extract raw layer pointers
            const rawMessage = obj.message || obj.msg || obj;
            const mediaKeys = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];
            
            // Check direct properties first
            if (obj.mimetype) return { mime: obj.mimetype, msgObj: obj, type: 'direct' };
            if (obj.msg?.mimetype) return { mime: obj.msg.mimetype, msgObj: obj, type: 'msg' };
            
            // Standard media key traversal
            for (const key of mediaKeys) {
                if (rawMessage[key]?.mimetype) return { mime: rawMessage[key].mimetype, msgObj: obj, type: key };
                if (obj[key]?.mimetype) return { mime: obj[key].mimetype, msgObj: obj, type: key };
            }
            
            // Deep scan nested structural wrappers (ViewOnce, Ephemeral, etc.)
            const wrappers = ['viewOnceMessage', 'viewOnceMessageV2', 'ephemeralMessage'];
            for (const wrap of wrappers) {
                const inner = rawMessage[wrap]?.message || obj[wrap]?.message;
                if (inner) {
                    for (const key of mediaKeys) {
                        if (inner[key]?.mimetype) return { mime: inner[key].mimetype, msgObj: obj, type: key };
                    }
                }
            }
            return null;
        };

        // Step 1: Priority scan on quoted message structure
        let scanResult = scanMessageTree(quoted);
        
        // Step 2: Fallback scan on main message structure (captions trigger here)
        if (!scanResult) {
            scanResult = scanMessageTree(m);
        }

        // Cut-off guardrail validation
        if (!scanResult || !scanResult.mime) {
            return reply("❌ Please reply to an image, video, audio, or document, or send media with the caption *.tourl*");
        }

        mimeType = scanResult.mime;
        targetMessage = scanResult.msgObj;

        // -------------------------------------------------------------------
        // 🛠️ BAILEYS PROTOCOL RE-CONSTRUCTION & NORMALIZATION
        // -------------------------------------------------------------------
        // Re-align message tree structure so the Baileys downloader doesn't crash
        if (!targetMessage.message) {
            targetMessage.message = {};
        }
        if (scanResult.type && !['direct', 'msg'].includes(scanResult.type)) {
            const source = targetMessage.message || targetMessage.msg || targetMessage;
            targetMessage.message[scanResult.type] = source[scanResult.type] || targetMessage[scanResult.type];
        }

        await reply("📥 Downloading media from WhatsApp servers... Please wait.");

        // Safe dynamic buffer extractor
        let buffer;
        try {
            if (typeof conn.downloadMediaMessage === 'function') {
                buffer = await conn.downloadMediaMessage(targetMessage);
            } else if (typeof conn.downloadAndSaveMediaMessage === 'function') {
                const pathFile = await conn.downloadAndSaveMediaMessage(targetMessage);
                const fs = require('fs');
                buffer = fs.readFileSync(pathFile);
                fs.unlinkSync(pathFile); // Immediate memory clearance
            } else {
                const { downloadMediaMessage } = require('@whiskeysockets/baileys');
                buffer = await downloadMediaMessage(targetMessage, 'buffer', {}, { logger: console });
            }
        } catch (downloadError) {
            console.error(downloadError);
            return reply("❌ Failed to download file from WhatsApp storage.");
        }

        if (!buffer) return reply("❌ Extraction failed. Media stream buffer is empty.");

        await reply("📤 Uploading payload to Uguu cloud storage...");

        // Parse explicit clean file extension parameters
        let ext = 'bin';
        if (mimeType.includes('/')) {
            ext = mimeType.split('/')[1].split(';')[0];
        }
        if (ext === 'jpeg') ext = 'jpg';

        // Pack stream binary directly into FormData container
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
