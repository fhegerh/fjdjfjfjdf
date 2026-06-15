const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "play",
    alias: ["song", "music", "s", "audio"],
    desc: "Smart YouTube music downloader",
    category: "music",
    react: "🎧",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {

    try {
        if (!args[0]) {
            return reply("✨ *Please provide a song name!*\n*Example:* `.play faded`");
        }

        let query = encodeURIComponent(args.join(" "));
        let api = `https://api-xemoz-official.my.id/api/donwloader/ytplay.php?q=${query}`;

        let { data } = await axios.get(api, { timeout: 15000 });

        if (!data?.status) {
            return reply("❌ *Song not found. Please check your spelling.*");
        }

        const result = data.result;
        if (!result?.download?.audio) {
            return reply("❌ *Failed to retrieve audio stream.*");
        }

        // Stylish Caption
        let text = `
╔══════════════════════
║ 🎧 *DR KAMRAN - MUSIC*
╚══════════════════════
┃ 🎶 *Title:* ${result.title}
┃ 👤 *Channel:* ${result.channel}
┃ ⏱ *Duration:* ${result.duration}
╚══════════════════════

*⚡ Processing Audio...*
*🚀 Sending now, stay tuned!*
`.trim();

        await conn.sendMessage(from, {
            image: { url: result.thumbnail },
            caption: text,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363418144382782@newsletter",
                    newsletterName: "KAMRAN-MD",
                    serverMessageId: 1
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(from, {
            audio: { url: result.download.audio },
            mimetype: "audio/mp4",
            ptt: false,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363418144382782@newsletter",
                    newsletterName: "KAMRAN-MD",
                    serverMessageId: 1
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply("❌ *An error occurred while processing your request.*");
    }
});
