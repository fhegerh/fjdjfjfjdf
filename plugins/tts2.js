const { cmd } = require('../command');
const axios = require('axios');

// Menyimpan histori video yang sudah dikirim agar tidak duplikat
const shownCache = {};

async function searchTikTok(keyword, count = 20, cursor = 0) {
  const url = `https://tikwm.com/api/feed/search?keywords=${encodeURIComponent(keyword)}&count=${count}&cursor=${cursor}&HD=1`;

  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
      'Referer':    'https://tikwm.com/',
      'Accept':     'application/json',
    },
    timeout: 15000
  });

  if (res.data.code !== 0) throw new Error(`TikWM API error: ${res.data.msg}`);
  return res.data.data;
}

async function getUnseenVideo(keyword) {
  if (!shownCache[keyword]) shownCache[keyword] = new Set();

  let cursor = 0;
  let attempts = 0;

  while (attempts < 3) {
    const data = await searchTikTok(keyword, 20, cursor);
    const videos = data.videos ?? [];
    const unseen = videos.filter(v => !shownCache[keyword].has(v.video_id));

    if (unseen.length > 0) {
      const picked = unseen[Math.floor(Math.random() * unseen.length)];
      shownCache[keyword].add(picked.video_id);
      return picked;
    }

    if (!data.hasMore) {
      shownCache[keyword].clear();
      const fresh = videos[Math.floor(Math.random() * videos.length)];
      if (fresh) shownCache[keyword].add(fresh.video_id);
      return fresh ?? null;
    }

    cursor = data.cursor;
    attempts++;
  }

  return null;
}

function fmtNum(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

cmd({
    pattern: "tts4",
    alias: ["ttsearch", "tiktoksearch"],
    desc: "Mencari dan mendownload video dari TikTok",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }) => {
    try {
        const keyword = q?.trim().toLowerCase();

        if (!keyword) {
            return reply(`Contoh penggunaan: .${command} jedag jedug`);
        }

        // Beri reaksi emoji (opsional, jika bot mendukung)
        try {
            await conn.sendMessage(from, { react: { text: '👍', key: mek.key } });
        } catch (e) {}

        // Cari video yang belum pernah dilihat
        const video = await getUnseenVideo(keyword);

        if (!video) {
            return reply(`Video dengan kata kunci *${keyword}* tidak ditemukan.`);
        }

        const videoUrl = video.wmplay || video.play;

        // Download video menggunakan axios ke dalam bentuk Buffer
        const downloadRes = await axios.get(videoUrl, {
            headers: { 'Referer': 'https://www.tiktok.com/' },
            responseType: 'arraybuffer',
            timeout: 30000
        });
        const buffer = Buffer.from(downloadRes.data);

        // Susun caption hasil pencarian
        const caption = [
            `*TikTok Search Results*`,
            video.title ? `*Title:* ${video.title.slice(0, 100)}` : '',
            `*Creator:* @${video.author?.unique_id ?? '?'} (${video.author?.nickname ?? ''})`,
            `\n> ❤️ ${fmtNum(video.digg_count)}\n> 💬 ${fmtNum(video.comment_count)}\n> ▶️ ${fmtNum(video.play_count)}`,
        ].filter(Boolean).join('\n');

        // Kirim video ke user
        await conn.sendMessage(from, {
            video: buffer,
            caption: caption
        }, { quoted: mek });

    } catch (err) {
        console.error('[TTS Error]:', err.message);
        reply(`❌ Terjadi kesalahan: ${err.message}`);
        try {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        } catch (e) {}
    }
});
