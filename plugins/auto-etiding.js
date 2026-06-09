const { cmd } = require("../command");
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// =========================================================================
// 🔒 [KAMRAN -MD] PROTECTED AI SCRAPER LAYER (DO NOT EDIT THIS LAYER)
// =========================================================================
const _0xkmmd = ["\x68\x74\x74\x70\x73\x3a\x2f\x2f\x66\x6c\x61\x74\x61\x69\x2e\x6f\x72\x67\x2f\x77\x70\x2d\x61\x64\x6d\x69\x6e\x2f\x61\x64\x6d\x69\x6e\x2d\x61\x6a\x61\x78\x2e\x70\x68\x70", "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x66\x6c\x61\x74\x61\x69\x2e\x6f\x72\x67\x2f\x65\x64\x69\x74\x2d\x69\x6d\x61\x67\x65\x2d\x77\x69\x74\x68\x2d\x74\x65\x78\x74\x2d\x61\x69\x2f", "\x4d\x6f\x7a\x69\x6c\x6c\x61\x2f\x35\x2e\x30\x20\x28\x58\x31\x31\x3b\x20\x4c\x69\x6e\x75\x7a\x20\x78\x38\x36\x5f\x36\x34\x29\x20\x41\x70\x70\x6c\x65\x57\x65\x62\x4b\x69\x74\x2f\x35\x33\x37\x2e\x33\x36\x20\x28\x4b\x48\x54\x4d\x4c\x2c\x20\x6c\x69\x6b\x65\x20\x47\x65\x63\x6b\x6f\x29\x20\x43\x68\x72\x6f\x6d\x65\x2f\x31\x34\x35\x2e\x30\x2e\x30\x2e\x30\x20\x53\x61\x66\x61\x72\x69\x2f\x35\x33\x37\x2e\x33\x36", "\x61\x69\x5f\x69\x6d\x61\x67\x65\x5f\x65\x64\x69\x74\x6f\x72\x5f\x6e\x6f\x6e\x63\x65", "\x47\x61\x67\x61\x6c\x20\x61\x6d\x62\x69\x6c\x20\x6e\x6f\x6e\x63\x65\x20\x64\x61\x72\x69\x20\x68\x61\x6c\x61\x6d\x61\x6e", "\x61\x69\x5f\x69\x6d\x61\x67\x65\x5f\x65\x64\x69\x74\x6f\x72\x5f\x69\x6d\x61\x67\x65", "\x61\x63\x74\x69\x6f\x6e", "\x6e\x6f\x6e\x63\x65", "\x70\x72\x6f\x6d\x70", "\x69\x6d\x61\x67\x65\x5f\x66\x69\x6c\x65", "\x70\x6e\x67", "\x41\x50\x49\x20\x67\x61\x67\x61\x6c\x3a\x20", "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x66\x6c\x61\x74\x61\x69\x2e\x6f\x72\x67"];
const _0xkam = (i) => _0xkmmd[i];

class FlataiImageEditor {
  constructor() {
    this[_0xkam(7)] = null;
    this.http = axios.create({
      headers: {
        'User-Agent': _0xkam(2),
        'Origin': _0xkam(12),
        'Referer': _0xkam(1),
      },
      timeout: 120000,
    });
  }
  async refreshNonce() {
    const { data: html } = await this.http.get(_0xkam(1));
    const $ = cheerio.load(html);
    const script = $('script:contains("' + _0xkam(3) + '")').first().text();
    const match = script.match(/ai_image_editor_nonce["']:\s*["']([^"']+)/);
    if (match) this[_0xkam(7)] = match[1];
    else throw new Error(_0xkam(4));
    return this[_0xkam(7)];
  }
  async edit(imagePath, prompt) {
    if (!fs.existsSync(imagePath)) throw new Error(`File not found: ${imagePath}`);
    const stat = fs.statSync(imagePath);
    if (stat.size > 10 * 1024 * 1024) throw new Error(`Image too large. Max 10MB.`);
    await this.refreshNonce();
    const fd = new FormData();
    fd.append(_0xkam(6), _0xkam(5));
    fd.append(_0xkam(7), this[_0xkam(7)]);
    fd.append(_0xkam(8), prompt);
    fd.append(_0xkam(9), fs.createReadStream(imagePath), {
      filename: path.basename(imagePath),
      contentType: `image/${path.extname(imagePath).slice(1) || _0xkam(10)}`,
    });
    const { data } = await this.http.post(_0xkam(0), fd, {
      headers: fd.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    if (!data.success || !data.data?.editedImageUrl) {
      throw new Error(_0xkam(11) + JSON.stringify(data));
    }
    return data.data;
  }
}
// =========================================================================

// WhatsApp Bot Command (Aapki Yeh Saari Settings Waisi Ki Waisi Hain)
cmd({
    pattern: "editimg",
    alias: ["flatai", "aimage", "editai"],
    desc: "Edit an image using AI prompt.",
    category: "ai",
    react: "🎨",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        // 1. Check if prompt is given
        if (!q) return reply("❌ Please provide a prompt! Example: `.editimg make it a zombie`");

        // 2. Image Detection Logic
        const isImage = m.type === 'imageMessage' || 
                        m.mtype === 'imageMessage' || 
                        (m.msg && m.msg.mimetype && m.msg.mimetype.startsWith('image/'));

        const isQuotedImage = m.quoted ? (
                        m.quoted.type === 'imageMessage' || 
                        m.quoted.mtype === 'imageMessage' || 
                        (m.quoted.msg && m.quoted.msg.mimetype && m.quoted.msg.mimetype.startsWith('image/')) ||
                        (m.quoted.mime && m.quoted.mime.startsWith('image/'))
        ) : false;

        if (!isImage && !isQuotedImage) {
            return reply("❌ Please reply to an image or send an image with the command/caption!");
        }

        // Processing Reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        reply("🔄 Processing your image with AI... Please wait standard loading time.");

        // 3. MANUAL DOWNLAODER (Bypassing the broken obfuscated function)
        let mediaPath = path.join(__dirname, `temp_${Date.now()}.jpg`);
        let buffer;
        
        try {
            // Dynamic Baileys import to extract stream directly
            let downloadContentFromMessage;
            try {
                downloadContentFromMessage = require('@whiskeysockets/baileys').downloadContentFromMessage;
            } catch {
                downloadContentFromMessage = require('@adiwajshing/baileys').downloadContentFromMessage;
            }

            const target = m.quoted ? m.quoted : m;
            const imageMessage = target.msg || target.message?.imageMessage || target;

            if (!imageMessage || !downloadContentFromMessage) throw new Error("Fallback required");

            const stream = await downloadContentFromMessage(imageMessage, 'image');
            let chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            buffer = Buffer.concat(chunks);
            fs.writeFileSync(mediaPath, buffer);

        } catch (manualError) {
            // Framework Fallback if manual method fails
            const targetMessage = m.quoted ? m.quoted : m;
            if (conn.downloadAndSaveMediaMessage) {
                mediaPath = await conn.downloadAndSaveMediaMessage(targetMessage);
            } else if (targetMessage.download) {
                const buf = await targetMessage.download();
                fs.writeFileSync(mediaPath, buf);
            } else {
                return reply("❌ Error: Could not download the image.");
            }
        }

        // 4. Run the Flatai Scraper Logic
        const editor = new FlataiImageEditor();
        const result = await editor.edit(mediaPath, q);

        // 5. Send Edited Image back to WhatsApp
        await conn.sendMessage(from, {
            image: { url: result.editedImageUrl },
            caption: `╭━━〔 🎨 𝗔𝗜 𝗜𝗠𝗔𝗚𝗘 𝗘𝗗𝗜𝗧𝗢𝗥 〕━━━╮\n┃ 📝 *Prompt* : ${q}\n┃ ⚙️ *Resolution* : ${result.outputResolution?.width || 'N/A'}x${result.outputResolution?.height || 'N/A'}\n┃ 🌱 *Seed* : ${result.seed || 'N/A'}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`
        }, { quoted: mek });

        // 6. Cleanup
        if (fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});
