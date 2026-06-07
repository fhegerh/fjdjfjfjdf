const axios = require("axios");
const config = require("../config");
const sharp = require("sharp");
const { cmd } = require("../command");

// Security Dictionary & Decoder Layer
const _0xkmr = ["bWxmYmQy", "bW92aWUy", "ZG93bmxvYWRtb3ZpZTI=", "Y2luZW1hbGsy", "ZG93bmxvYWRlcg==", "YXJyYXlidWZmZXI=", "cmVzaXpl", "anBlZw==", "dG9CdWZmZXI=", "bWVzc2FnZXMudXBzZXJ0", "ZXh0ZW5kZWRUZXh0TWVzc2FnZQ==", "Y29udGV4dEluZm8=", "Y29udmVyc2F0aW9u", "dmlkZW8vbXA0", "dmFqaXJhLTIzaWtzc2lnNTEtMTc4MDY1MTg3Mzc2Nw==", "aHR0cHM6Ly92YWppcmEtb2ZmaWNpYWwtYXBpcy52ZXJjZWwuYXBwL2FwaS9tbGZiZHM=", "aHR0cHM6Ly92YWppcmEtb2ZmaWNpYWwtYXBpcy52ZXJjZWwuYXBwL2FwaS9tbGZiZGRs"];
const _0x5a2b = (i) => Buffer.from(_0xkmr[i], "base64").toString("utf-8");

async function getThumbnailBuffer(url) {
    if (!url) return null;
    try {
        const { data } = await axios.get(url, { responseType: _0x5a2b(5) });
        return await sharp(data)[_0x5a2b(6)](300, 300)[_0x5a2b(7)]({ quality: 80 })[_0x5a2b(8)]();
    } catch (e) { return null; }
}

cmd({
    name: _0x5a2b(0),
    alias: [_0x5a2b(1), _0x5a2b(2), _0x5a2b(3)],
    category: _0x5a2b(4),
    desc: "Fully Protected Movie Engine Engine",
    filename: __filename
},
async (conn, mek, m, _0xobf) => {
    const { from, reply, q } = _0xobf;
    const _0xcl = conn;
    const _0xreact = async (em) => { await _0xcl.sendMessage(from, { react: { text: em, key: mek.key } }); };
    
    try {
        await _0xreact("🎬");
        if (!q) return reply("❌ *Opps! Movie Name Missing* ❌\n\nPlease provide a movie name to search!\n📌 *Example:* `.mlfbd From Season 4`");
        await reply(`🔍 _Searching for *"${q}"* on MLFBD servers..._`);

        const _0xr1 = await axios.get(_0x5a2b(15), { params: { apikey: _0x5a2b(14), text: q }, timeout: 30000 });
        if (_0xr1.status !== 200 || !_0xr1.data || !_0xr1.data.result || _0xr1.data.result.length === 0) {
            await _0xreact("❌"); return reply("🛸 *No Results Found!* \nWe couldn't find anything matching your query.");
        }

        const _0xdata = _0xr1.data.result;
        let _0xlist = `┏━━━━━━━━━━━━━━━━━━━━━━━━┓\n┃ 🎬  *MLFBD MOVIE SEARCH*  🎬 ┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n🔎 *Query:* \`${q.toUpperCase()}\`\n✨ *Results Found:* ${_0xdata.length}\n\n┌─────────────────────────┐\n`;
        _0xdata.forEach((v, i) => {
            _0xlist += `│ 🍿 *[${i + 1}]* _${v.title}_\n│ ├─ ⭐ *Rating:* ${v.rate || "N/A"}\n│ └─ 📅 *Year:* ${v.year || "N/A"}\n`;
            if (i !== _0xdata.length - 1) _0xlist += `├─────────────────────────┤\n`;
        });
        _0xlist += `└─────────────────────────┘\n\n⚡ *Reply with the item number* to view options.\n\n> *© KAMRAN-MINI-BOT ッ*`;

        const _0xSmsg = await _0xcl.sendMessage(from, { image: { url: _0xdata[0].image || "https://placehold.co/600x400?text=No+Poster" }, caption: _0xlist }, { quoted: mek });
        let _0xt1, _0xt2;

        const _0xdetH = async (_up) => {
            try {
                const _msg = _up.messages[0]; if (!_msg?.message || _msg.key.remoteJid !== from) return;
                const _ctx = _msg.message[_0x5a2b(10)]?.[_0x5a2b(11)] || _msg.message[_0x5a2b(12)]?.[_0x5a2b(11)];
                if (_ctx?.stanzaId !== _0xSmsg.key.id) return;

                const _txt = (_msg.message[_0x5a2b(12)] || _msg.message[_0x5a2b(10)]?.text || "").trim();
                const _num = parseInt(_txt); if (isNaN(_num) || _num < 1 || _num > _0xdata.length) return;

                const _sel = _0xdata[_num - 1]; if (!_sel) return;
                _0xcl.ev.off(_0x5a2b(9), _0xdetH); clearTimeout(_0xt1);
                await _0xreact("⏳");

                const _0xr2 = await axios.get(_0x5a2b(16), { params: { apikey: _0x5a2b(14), url: _sel.link }, timeout: 30000 });
                if (_0xr2.status !== 200 || !_0xr2.data || !_0xr2.data.result) { await _0xreact("❌"); return reply("❌ *Error:* Failed to load properties."); }

                const _det = _0xr2.data.result; const _dl = _det.downloads || [];
                if (_dl.length === 0) { await _0xreact("❌"); return reply("❌ *Sorry:* No downloadable files located."); }

                let _cap = `╭──────────────◆\n│ 🎥 *${_det.title || _sel.title}*\n╰──────────────◆\n\n🎭 *Genres:* \`${_det.genres || "N/A"}\`\n📅 *Release:* ${_det.release || "N/A"}\n🌟 *Rating:* ${_det.rating || _sel.rate}\n\n📝 *Description:* \n_${_det.description || "No description available."}_\n\n┏───────────────────────┓\n│   💾  AVAILABLE MIRRORS   │\n┗───────────────────────┛\n`;
                _dl.forEach((d, i) => { _cap += `╭─ 📥 *[${i + 1}]* Mirror ${i + 1}\n├─ 🌟 *Quality:* \`${d.quality || "720p"}\`\n╰─ ⚖️ *Size:* \`${d.size || "Unknown"}\`\n\n`; });
                _cap += `⚡ *Reply with a mirror number* to start downloading.\n\n> *© KAMRAN-MINI-BOT ッ*`;

                const _0xDmsg = await _0xcl.sendMessage(from, { image: { url: _det.image || _sel.image || "https://placehold.co/600x400?text=No+Poster" }, caption: _cap }, { quoted: _msg });

                const _0xdlH = async (_up2) => {
                    try {
                        const _dlmsg = _up2.messages[0]; if (!_dlmsg?.message || _dlmsg.key.remoteJid !== from) return;
                        const _dlctx = _dlmsg.message[_0x5a2b(10)]?.[_0x5a2b(11)] || _dlmsg.message[_0x5a2b(12)]?.[_0x5a2b(11)];
                        if (_dlctx?.stanzaId !== _0xDmsg.key.id) return;

                        const _pk = (_dlmsg.message[_0x5a2b(12)] || _dlmsg.message[_0x5a2b(10)]?.text || "").trim();
                        const _dln = parseInt(_pk); if (isNaN(_dln) || _dln < 1 || _dln > _dl.length) return;

                        const _seldl = _dl[_dln - 1]; if (!_seldl) return;
                        _0xcl.ev.off(_0x5a2b(9), _0xdlH); clearTimeout(_0xt2);

                        await _0xcl.sendMessage(from, { react: { text: "📥", key: _dlmsg.key } });
                        const _turl = _seldl.direct;
                        const _cfn = `${(_det.title || _sel.title).replace(/[^a-zA-Z0-9 ]/g, "_")}_${_seldl.quality || "720p"}.mp4`;

                        await reply(`🚀 *Processing Request...* \nUploading your movie as a Document. Please hold tight!`);
                        let _fcap = `╭───────────────────◆\n│ 🎬 *${_det.title || _sel.title}*\n├───────────────────◆\n│ 🌟 *Quality:* ${_seldl.quality || "720p"}\n│ ⚖️ *Size:* ${_seldl.size || "N/A"}\n╰───────────────────◆\n\n> *© KAMRAN-MINI-BOT ッ*`;

                        await _0xcl.sendMessage(from, { document: { url: _turl }, mimetype: _0x5a2b(13), fileName: _cfn, jpegThumbnail: await getThumbnailBuffer(_det.image || _sel.image), caption: _fcap }, { quoted: _dlmsg });
                        await _0xcl.sendMessage(from, { react: { text: "✅", key: _dlmsg.key } });
                    } catch (e) { reply(`❌ Error: ${e.message}`); }
                };
                _0xcl.ev.on(_0x5a2b(9), _0xdlH); _0xt2 = setTimeout(() => { _0xcl.ev.off(_0x5a2b(9), _0xdlH); }, 300000);
            } catch (e) { reply(`❌ Error: ${e.message}`); }
        };
        _0xcl.ev.on(_0x5a2b(9), _0xdetH); _0xt1 = setTimeout(() => { _0xcl.ev.off(_0x5a2b(9), _0xdetH); }, 300000);
    } catch (e) { await _0xreact("❌"); return reply(`❌ Error: ${e.message}`); }
});
