const _0x4f12 = ["../command", "axios", "cheerio", "form-data", "fs", "path", "https://flatai.org/wp-admin/admin-ajax.php", "https://flatai.org/edit-image-with-text-ai/", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36", "ai_image_editor_nonce", "Gagal ambil nonce dari halaman", "existsSync", "statSync", "Image too large. Max 10MB.", "action", "ai_image_editor_image", "nonce", "prompt", "image_file", "createReadStream", "basename", "extname", "slice", "png", "post", "getHeaders", "success", "editedImageUrl", "API gagal: ", "stringify", "editimg", "flatai", "aimage", "editai", "ai", "🎨", "❌ Please provide a prompt! Example: `.editimg make it a zombie`", "imageMessage", "type", "mtype", "msg", "mimetype", "startsWith", "image/", "quoted", "mime", "❌ Please reply to an image or send an image with the command/caption!", "⏳", "sendMessage", "🔄 Processing your image with AI... Please wait standard loading time.", "join", "__dirname", "temp_", ".jpg", "writeFileSync", "@whiskeysockets/baileys", "downloadContentFromMessage", "@adiwajshing/baileys", "message", "concat", "Media keys are missing. Direct Baileys stream failed.", "width", "height", "N/A", "seed", "unlinkSync", "✅", "❌ Error: "];
const _0x51ab = function(_0x2c1a) { return _0x4f12[_0x2c1a]; };

const { cmd } = require(_0x51ab(0));
const _0x1a2b = require(_0x51ab(1));
const _0x3c4d = require(_0x51ab(2));
const _0x5e6f = require(_0x51ab(3));
const _0x7a8b = require(_0x51ab(4));
const _0x9c0d = require(_0x51ab(5));

class _0x2f4a {
  constructor() {
    this[_0x51ab(16)] = null;
    this.http = _0x1a2b.create({
      headers: {
        'User-Agent': _0x51ab(8),
        'Origin': 'https://flatai.org',
        'Referer': _0x51ab(7),
      },
      timeout: 120000,
    });
  }

  async refreshNonce() {
    const { data: html } = await this.http.get(_0x51ab(7));
    const $ = _0x3c4d.load(html);
    const script = $('script:contains("' + _0x51ab(9) + '")').first().text();
    const match = script.match(/ai_image_editor_nonce["']:\s*["']([^"']+)/);
    if (match) this[_0x51ab(16)] = match[1];
    else throw new Error(_0x51ab(10));
    return this[_0x51ab(16)];
  }

  async edit(imagePath, prompt) {
    if (!_0x7a8b[_0x51ab(11)](imagePath)) throw new Error('File not found: ' + imagePath);
    const stat = _0x7a8b[_0x51ab(12)](imagePath);
    if (stat.size > 10 * 1024 * 1024) throw new Error(_0x51ab(13));

    await this.refreshNonce();

    const fd = new _0x5e6f();
    fd.append(_0x51ab(14), _0x51ab(15));
    fd.append(_0x51ab(16), this[_0x51ab(16)]);
    fd.append(_0x51ab(17), prompt);
    fd.append(_0x51ab(18), _0x7a8b[_0x51ab(19)](imagePath), {
      filename: _0x9c0d[_0x51ab(20)](imagePath),
      contentType: 'image/' + (_0x9c0d[_0x51ab(21)](imagePath)[_0x51ab(22)](1) || _0x51ab(23)),
    });

    const { data } = await this.http.post(_0x51ab(6), fd, {
      headers: fd[_0x51ab(25)](),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (!data[_0x51ab(26)] || !data.data?.[_0x51ab(27)]) {
      throw new Error(_0x51ab(28) + JSON[_0x51ab(29)](data));
    }

    return data.data;
  }
}

cmd({
    pattern: _0x51ab(30),
    alias: [_0x51ab(31), _0x51ab(32), _0x51ab(33)],
    desc: "Edit an image using AI prompt.",
    category: _0x51ab(34),
    react: _0x51ab(35),
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        if (!q) return reply(_0x51ab(36));

        const isImage = m.type === _0x51ab(37) || 
                        m.mtype === _0x51ab(37) || 
                        (m.msg && m.msg.mimetype && m.msg.mimetype[_0x51ab(42)](_0x51ab(43)));

        const isQuotedImage = m.quoted ? (
                        m.quoted.type === _0x51ab(37) || 
                        m.quoted.mtype === _0x51ab(37) || 
                        (m.quoted.msg && m.quoted.msg.mimetype && m.quoted.msg.mimetype[_0x51ab(42)](_0x51ab(43))) ||
                        (m.quoted.mime && m.quoted.mime[_0x51ab(42)](_0x51ab(43)))
        ) : false;

        if (!isImage && !isQuotedImage) {
            return reply(_0x51ab(46));
        }

        await conn[_0x51ab(48)](from, { react: { text: _0x51ab(47), key: mek.key } });
        reply(_0x51ab(49));

        let mediaPath = _0x9c0d[_0x51ab(50)](_0x51ab(51), _0x51ab(52) + Date.now() + _0x51ab(53));
        let buffer;
        
        const target = m.quoted ? m.quoted : m;
        let mediaObj = target.msg || target;
        if (target[_0x51ab(58)]) {
            const msgKeys = Object.keys(target[_0x51ab(58)]);
            const matchedKey = msgKeys.find(k => k.toLowerCase().includes('image'));
            if (matchedKey) {
                mediaObj = target[_0x51ab(58)][matchedKey];
            }
        }
        if (!mediaObj.mediaKey && target.imageMessage) {
            mediaObj = target.imageMessage;
        }

        let downloadContentFromMessage;
        try {
            downloadContentFromMessage = require(_0x51ab(55))[_0x51ab(56)];
        } catch {
            downloadContentFromMessage = require(_0x51ab(57))[_0x51ab(56)];
        }

        if (!mediaObj || !mediaObj.mediaKey) {
            throw new Error(_0x51ab(60));
        }

        const stream = await downloadContentFromMessage(mediaObj, 'image');
        let chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        buffer = Buffer[_0x51ab(59)](chunks);
        _0x7a8b[_0x51ab(54)](mediaPath, buffer);

        const editor = new _0x2f4a();
        const result = await editor.edit(mediaPath, q);

        await conn[_0x51ab(48)](from, {
            image: { url: result[_0x51ab(27)] },
            caption: `╭━━〔 🎨 𝗔𝗜 𝗜𝗠𝗔𝗚𝗘 𝗘𝗗𝗜𝗧𝗢𝗥 〕━━━╮\n┃ 📝 *Prompt* : ` + q + `\n┃ ⚙️ *Resolution* : ` + (result.outputResolution?.[_0x51ab(61)] || _0x51ab(63)] ) + `x` + (result.outputResolution?.[_0x51ab(62)] || _0x51ab(63)] ) + `\n┃ 🌱 *Seed* : ` + (result[_0x51ab(64)] || _0x51ab(63)] ) + `\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`
        }, { quoted: mek });

        if (_0x7a8b[_0x51ab(11)](mediaPath)) {
            _0x7a8b[_0x51ab(65)](mediaPath);
        }

        await conn[_0x51ab(48)](from, { react: { text: _0x51ab(66), key: mek.key } });

    } catch (err) {
        console.error(err);
        reply(_0x51ab(67) + err.message);
    }
});
