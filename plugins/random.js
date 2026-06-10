const { cmd } = require("../command");
const { basename, extname } = require("path");
const crypto = require("crypto");

// Constants aur configurations
const AGENT = 'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36';
const SALT = 'hackers_become_a_little_stinkier_every_time_they_hack';

const md5 = s => crypto.createHash('md5').update(s).digest('hex');
const reverse = s => s.split('').reverse().join('');
const generateRandomIP = () => Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 254)).join('.');

const mime = ext => ({
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
}[ext.toLowerCase()] || 'application/octet-stream');

// DeepAI Key Generator Function
function genKEY() {
  const r = String(Math.floor(Math.random() * 1e11));
  const h1 = reverse(md5(AGENT + r + SALT));
  const h2 = reverse(md5(AGENT + h1));
  const h3 = reverse(md5(AGENT + h2));
  return `tryit-${r}-${h3}`;
}

// DeepAI Image Scraper Function
async function editImage(buffer, filename, prompt) {
  let last = 'request failed';

  for (let i = 0; i < 6; i++) {
    try {
      const form = new FormData();

      form.append(
        'image',
        new Blob([buffer], { type: mime(extname(filename)) }),
        basename(filename)
      );

      form.append('text', prompt);
      form.append('image_generator_version', 'standard');

      const res = await fetch('https://api.deepai.org/api/image-editor', {
        method: 'POST',
        headers: {
          accept: '*/*',
          origin: 'https://deepai.org',
          referer: 'https://deepai.org/',
          'user-agent': AGENT,
          'api-key': genKEY(),
          'x-forwarded-for': generateRandomIP()
        },
        body: form
      });

      const json = await res.json().catch(() => null);

      if (json?.output_url) {
        return Buffer.from(
          await (await fetch(json.output_url)).arrayBuffer()
        );
      }

      last = json?.status || `http ${res.status}`;
    } catch (e) {
      last = e.message;
    }
  }

  throw new Error(last);
}

// Main Bot Command
cmd({
    pattern: "rimage",
    alias: ["deepedit"],
    desc: "Edit images using DeepAI Chatbot.",
    category: "ai",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, reply }) => {
    try {
        // 1. Check agar user ne prompt nahi diya
        if (!q) {
            return await reply("📸 *DEEPAI IMAGE EDITOR*\n\n*Cara pakai:*\n.editimg <prompt>\n\n*Contoh:*\n.editimg make it cinematic\n.editimg turn into anime\n.editimg add neon lights\n\nReply atau kirim gambar dengan caption .editimg");
        }

        // 2. Media handle karne ke liye context nikalna
        const mediaMsg = m.quoted ? m.quoted : m;
        const mimeType = (mediaMsg.msg || mediaMsg).mimetype || '';

        // 3. Check agar image valid format me hai ya nahi
        if (!/image\/(jpe?g|png|webp)/i.test(mimeType)) {
            return await reply("📸 *DEEPAI IMAGE EDITOR*\n\n*Cara pakai:*\n.editimg <prompt>\n\n*Contoh:*\n.editimg make it cinematic\n.editimg turn into anime\n.editimg add neon lights\n\nReply atau kirim gambar dengan caption .editimg");
        }

        await reply("⏳ Sedang memproses gambar, mohon tunggu...");

        // 4. Image download karna (Dono tarike safe-side ke liye add kiye hain)
        let buffer;
        if (typeof mediaMsg.download === 'function') {
            buffer = await mediaMsg.download();
        } else {
            buffer = await conn.downloadMediaMessage(mediaMsg);
        }

        // 5. Image ko API ke zariye edit karna
        const result = await editImage(buffer, 'image.jpg', q);

        // 6. Edited image wapas send karna
        await conn.sendMessage(from, {
            image: result,
            caption: `✅ *Berhasil mengedit gambar*\n\n📝 *Prompt:* ${q}`
        }, { quoted: m });

    } catch (e) {
        console.log(e);
        return await reply(`❌ Error occurred: ${e.message}`);
    }
});
