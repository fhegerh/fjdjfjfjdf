const { cmd } = require('../command');
const config = require('../config');
const axios = require("axios");
const sharp = require("sharp");

// 🔒 ENTERPRISE-GRADE SCRAMBLED DATA MATRIX (MUKAMMAL HIDDEN CORE)
const _0xKMRPool = [
    "6178696f73", "6172726179627566666572", "726573697a65", "6a706567", "746f427566666572",
    "6d6f766965626f78", "6d626f78", "6d6f766965626f78646c73", "646f776e6c6f61646572",
    "76616a6972612d3233696b7373696735312d31373830363531383733373637",
    "68747470733a2f2f76616a6972612d6f6666696369616c2d617069732e76657263656c2e6170702f6170692f6d6f766965626f7873",
    "68747470733a2f2f76616a6972612d6f6666696369616c2d617069732e76657263656c2e6170702f6170692f6d6f766965626f78646c73",
    "c2a9204b414d52414e2d4d494e492d424f5420e383bb", "73656e644d657373616765", "6d657373616765732e757073657274",
    "657874656e646564546578744d657373616765", "636f6e766572736174696f6e", "7374616e7a614964"
];

const _0xG = (idx) => Buffer.from(_0xKMRPool[idx], 'hex').toString('utf-8');

// 🛡️ ANTI-TAMPER SELF-DEFENDING CORE
(() => {
    const _sig = _0xG(12);
    if (!_sig.includes("KAMRAN") || !_sig.includes("MINI-BOT") || _0xKMRPool.length !== 18) {
        console.error("FATAL: Source integrity compromised! Anti-Piracy system activated.");
        process.exit(1);
    }
})();

async function getThumbnailBuffer(url) {
    if (!url) return null;
    try {
        const { data } = await axios.get(url, { responseType: _0xG(1) });
        return await sharp(data)[_0xG(2)](300, 300)[_0xG(3)]({ quality: 80 })[_0xG(4)]();
    } catch (err) {
        return null;
    }
}

cmd({
    pattern: _0xG(5),
    alias: [_0xG(6), _0xG(7)],
    category: _0xG(8),
    desc: "Search and download movies/series from MovieBox via API",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    const _0xAuth = _0xG(12);
    if (!_0xAuth.includes("KAMRAN")) return reply("🚨 Security Lockout: Illegal alteration.");

    const _apiKey = _0xG(9);
    const _sUrl = _0xG(10);
    const _dUrl = _0xG(11);
    const _foot = `> *${_0xAuth}*`;

    const react = async (emo) => {
        try { await conn.sendMessage(from, { react: { text: emo, key: mek.key } }); } catch (e) {}
    };

    try {
        await react("🎬");
        if (!q) return reply("❌ *Opps! Title Missing* ❌\n\nPlease provide a movie name!\n📌 *Example:* `.moviebox Interstellar`");

        await reply(`🔍 _Searching for *"${q}"* on MovieBox servers..._`);
        const res = await axios.get(_sUrl, { params: { apikey: _apiKey, query: q, text: q }, timeout: 30000 });

        if (res.status !== 200 || !res.data) { await react("❌"); return reply("🛸 *API Error:* Invalid server response."); }

        let dataArr = null;
        if (res.data) {
            if (Array.isArray(res.data.data)) dataArr = res.data.data;
            else if (typeof res.data.data === 'object' && res.data.data !== null) {
                for (let k in res.data.data) { if (Array.isArray(res.data.data[k])) { dataArr = res.data.data[k]; break; } }
            }
            if (!dataArr) dataArr = res.data.result || res.data.results || res.data.list || (Array.isArray(res.data) ? res.data : null);
        }

        if (dataArr && Array.isArray(dataArr) && dataArr.length === 0) { await react("❌"); return reply(`🛸 *No Results Found!*\nMovieBox par *"${q}"* nahi mila.`); }
        if (!dataArr || !Array.isArray(dataArr)) { await react("❌"); return reply("🛸 *Parsing Error:* Contact developer."); }

        let listTxt = `┏━━━━━━━━━━━━━━━━━━━━━━━━┓\n┃ 🎬 *MOVIEBOX SEARCH* 🎬 ┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n🔎 *Query:* \`${q.toUpperCase()}\`\n✨ *Results:* ${dataArr.length}\n\n┌─────────────────────────┐\n`;
        dataArr.forEach((v, i) => {
            listTxt += `│ 🍿 *[${i + 1}]* _${v.title || v.name || 'Unknown Title'}_\n│ └─ 📅 *Type/Year:* ${v.type || 'Movie'} | ${v.year || 'N/A'}\n`;
            if (i !== dataArr.length - 1) listTxt += `├─────────────────────────┤\n`;
        });
        listTxt += `└─────────────────────────┘\n\n⚡ *Reply with the item number* to view options.\n\n${_foot}`;

        const poster = dataArr[0].image || dataArr[0].poster || dataArr[0].thumb || "https://placehold.co/600x400?text=No+Poster";
        const sSearch = await conn[_0xG(13)](from, { image: { url: poster }, caption: listTxt }, { quoted: mek });
        
        const sMsgId = sSearch.key.id;
        let dTimeout, dlTimeout;

        const detailsHandler = async (up) => {
            try {
                const msg = up.messages[0];
                if (!msg?.message || msg.key.remoteJid !== from) return;

                const ctx = msg.message[_0xG(15)]?.contextInfo || msg.message[_0xG(16)]?.contextInfo;
                if (ctx?.stanzaId !== sMsgId) return;

                const choice = (msg.message.conversation || msg.message[_0xG(15)]?.text || "").trim();
                const num = parseInt(choice);
                if (isNaN(num) || num < 1 || num > dataArr.length) return;

                const selected = dataArr[num - 1];
                if (!selected) return;

                conn.ev.off(_0xG(14), detailsHandler);
                clearTimeout(dTimeout);
                await react("⏳");

                const detRes = await axios.get(_dUrl, {
                    params: { apikey: _apiKey, subjectId: selected.subjectId || selected.id || selected.subject_id, detailPath: selected.detailPath || selected.path || selected.detail_path, season: 0, episode: 0 },
                    timeout: 30000
                });

                if (detRes.status !== 200 || !detRes.data) { await react("❌"); return reply("❌ *Error:* Failed to pull download properties."); }
                const mDetails = detRes.data.data || detRes.data.result || detRes.data;

                let dlLinks = [];
                if (mDetails) {
                    if (Array.isArray(mDetails.downloads)) dlLinks = mDetails.downloads;
                    else if (Array.isArray(mDetails.streams)) dlLinks = mDetails.streams;
                    else if (Array.isArray(mDetails.links)) dlLinks = mDetails.links;
                }

                if (dlLinks.length === 0) { await react("❌"); return reply("❌ *Sorry:* No mirrors located."); }

                let cap = `╭──────────────◆\n│ 🎥 *${mDetails.title || selected.title || selected.name}*\n╰──────────────◆\n\n🎭 *Type:* \`${mDetails.type || 'Movie'}\`\n📅 *Year:* ${mDetails.year || 'N/A'}\n\n`;
                if (mDetails.description) cap += `📝 *Description:* \n_${mDetails.description}_\n\n`;
                cap += `┏───────────────────────┓\n│ 💾 AVAILABLE MIRRORS │\n┗───────────────────────┛\n`;

                dlLinks.forEach((dl, i) => {
                    cap += `╭─ 📥 *[${i + 1}]* Mirror ${i + 1}\n├─ 🌟 *Quality:* \`${dl.quality || 'HD'}\`\n╰─ ⚖️ *Size:* \`${dl.size || 'Unknown'}\`\n\n`;
                });
                cap += `⚡ *Reply with a mirror number* to start download.\n\n${_foot}`;

                const dImg = mDetails.image || mDetails.poster || selected.image || "https://placehold.co/600x400?text=No+Poster";
                const sDetail = await conn[_0xG(13)](from, { image: { url: dImg }, caption: cap }, { quoted: msg });
                const dMsgId = sDetail.key.id;

                const downloadHandler = async (dup) => {
                    try {
                        const dlMsg = dup.messages[0];
                        if (!dlMsg?.message || dlMsg.key.remoteJid !== from) return;

                        const dlCtx = dlMsg.message[_0xG(15)]?.contextInfo || dlMsg.message[_0xG(16)]?.contextInfo;
                        if (dlCtx?.stanzaId !== dMsgId) return;

                        const pick = (dlMsg.message.conversation || dlMsg.message[_0xG(15)]?.text || "").trim();
                        const dlNum = parseInt(pick);
                        if (isNaN(dlNum) || dlNum < 1 || dlNum > dlLinks.length) return;

                        const sDl = dlLinks[dlNum - 1];
                        if (!sDl) return;

                        conn.ev.off(_0xG(14), downloadHandler);
                        clearTimeout(dlTimeout);
                        await conn[_0xG(13)](from, { react: { text: "📥", key: dlMsg.key } });

                        let fUrl = sDl.direct || sDl.url || sDl.link || sDl.download || sDl.file;
                        if (!fUrl && typeof sDl === 'object') {
                            for (let key in sDl) {
                                if (typeof sDl[key] === 'string' && (sDl[key].startsWith('http://') || sDl[key].startsWith('https://'))) { fUrl = sDl[key]; break; }
                            }
                        }

                        if (!fUrl) { await react("❌"); return reply("❌ *Error:* Direct link not resolved."); }
                        const cleanName = `${(mDetails.title || selected.title || selected.name || "Movie").replace(/[^a-zA-Z0-9 ]/g, "_")}_${sDl.quality || 'HD'}.mp4`;

                        await reply(`🚀 *Processing MovieBox File...* \nUploading document. Please wait!`);
                        let finalCap = `╭───────────────────◆\n│ 🎬 *${mDetails.title || selected.title || selected.name}*\n├───────────────────◆\n│ 🌟 *Quality:* ${sDl.quality || 'HD'}\n│ ⚖️ *Size:* ${sDl.size || 'N/A'}\n╰───────────────────◆\n\n${_foot}`;

                        const tBuf = await getThumbnailBuffer(mDetails.image || mDetails.poster || selected.image);
                        let docPayload = { document: { url: fUrl }, mimetype: "video/mp4", fileName: cleanName, caption: finalCap };
                        if (tBuf && Buffer.isBuffer(tBuf)) docPayload.jpegThumbnail = tBuf;

                        await conn[_0xG(13)](from, docPayload, { quoted: dlMsg });
                        await conn[_0xG(13)](from, { react: { text: "✅", key: dlMsg.key } });
                    } catch (de) { conn.ev.off(_0xG(14), downloadHandler); }
                };

                conn.ev.on(_0xG(14), downloadHandler);
                dlTimeout = setTimeout(() => conn.ev.off(_0xG(14), downloadHandler), 300000);
            } catch (ee) { conn.ev.off(_0xG(14), detailsHandler); }
        };

        conn.ev.on(_0xG(14), detailsHandler);
        dTimeout = setTimeout(() => conn.ev.off(_0xG(14), detailsHandler), 300000);

    } catch (e) { await react("❌"); return reply(`❌ *Error:* ${e.message}`); }
});
