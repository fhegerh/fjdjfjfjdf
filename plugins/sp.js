const { cmd } = require("../command");

cmd({
    pattern: "spotify",
    alias: ["spdl"],
    desc: "Download audio from Spotify URL.",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
  try {
    // 1. Check if Spotify URL is provided
    if (!args[0]) {
        return reply(`*Example :* .spotify http://open.spotify.com/track/...`);
    }

    // Loading notification
    await reply("⏳ Fetching Spotify media... Please wait.");

    // 2. Fetch data from Spotify Downloader API
    const res = await fetch(`https://fgsi.dpdns.org/api/downloader/spotify?apikey=APIKEY_KAMU&url=${encodeURIComponent(args[0])}`);
    const json = await res.json();

    if (!json.status) throw new Error(json.message || "Gagal mendownload lagu");

    const data = json.data;

    // 3. Send Track Album/Image Cover with Details
    await conn.sendMessage(from, { 
        image: { url: data.image }, 
        caption: `*${data.title}*\n\n*Type :* ${data.type}\n*Artist :* ${data.artis}\n*Duration :* ${Math.floor(data.durasi / 60000)}:${String(Math.floor((data.durasi % 60000) / 1000)).padStart(2, '0')}\n\n> Sending Audio...` 
    }, { quoted: mek });

    // 4. Send the Audio File
    await conn.sendMessage(from, { 
        audio: { url: data.download }, 
        mimetype: 'audio/mpeg'
    }, { quoted: mek });

  } catch (e) {
    reply("❌ Error: " + e.message);
  }
});
