/***
 *** ᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁
 *** - Dev: FongsiDev
 *** - Contact: t.me/dashmodz
 *** - Gmail: fongsiapi@gmail.com & fgsidev@neko2.net
 *** - Saluran WhatsApp: whatsapp.com/channel/0029VapkSr45q08hPPPVqy26
 *** - Telegram Group: t.me/fongsidev
 *** - Github: github.com/Fgsi-APIs/RestAPIs/issues/new
 *** - Website: fgsi.koyeb.app
 *** ᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁
 ***/
// Scraper By Fgsi | Integrated into Command Format

const { cmd } = require("../command");
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const AJAX_URL = 'https://flatai.org/wp-admin/admin-ajax.php';
const PAGE_URL = 'https://flatai.org/edit-image-with-text-ai/';
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36';

// Flatai Scraper Class
class FlataiImageEditor {
  constructor() {
    this.nonce = null;
    this.http = axios.create({
      headers: {
        'User-Agent': USER_AGENT,
        'Origin': 'https://flatai.org',
        'Referer': PAGE_URL,
      },
      timeout: 120000,
    });
  }

  async refreshNonce() {
    const { data: html } = await this.http.get(PAGE_URL);
    const $ = cheerio.load(html);
    const script = $('script:contains("ai_image_editor_nonce")').first().text();
    const match = script.match(/ai_image_editor_nonce["']:\s*["']([^"']+)/);
    if (match) this.nonce = match[1];
    else throw new Error('Gagal ambil nonce dari halaman');
    return this.nonce;
  }

  async edit(imagePath, prompt) {
    if (!fs.existsSync(imagePath)) throw new Error(`File not found: ${imagePath}`);
    const stat = fs.statSync(imagePath);
    if (stat.size > 10 * 1024 * 1024) throw new Error(`Image too large. Max 10MB.`);

    await this.refreshNonce();

    const fd = new FormData();
    fd.append('action', 'ai_image_editor_image');
    fd.append('nonce', this.nonce);
    fd.append('prompt', prompt);
    fd.append('image_file', fs.createReadStream(imagePath), {
      filename: path.basename(imagePath),
      contentType: `image/${path.extname(imagePath).slice(1) || 'png'}`,
    });

    const { data } = await this.http.post(AJAX_URL, fd, {
      headers: fd.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (!data.success || !data.data?.editedImageUrl) {
      throw new Error(`API gagal: ${JSON.stringify(data)}`);
    }

    return data.data;
  }
}

// WhatsApp Bot Command
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

        // 2. Comprehensive Multi-Framework Image Detection (FIXED)
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

        // 3. Download target setup
        const targetMessage = m.quoted ? m.quoted : m;
        let mediaPath;

        if (conn.downloadAndSaveMediaMessage) {
            mediaPath = await conn.downloadAndSaveMediaMessage(targetMessage);
        } else if (targetMessage.download) {
            const buffer = await targetMessage.download();
            mediaPath = path.join(__dirname, `temp_${Date.now()}.jpg`);
            fs.writeFileSync(mediaPath, buffer);
        } else {
            return reply("❌ Error: Could not download the image. Media framework missing.");
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
