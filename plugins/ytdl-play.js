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
            return reply("❌ Song likho\nExample: .play faded");
        }

        let query = encodeURIComponent(args.join(" "));
        let api = `https://api-xemoz-official.my.id/api/donwloader/ytplay.php?q=${query}`;

        let { data } = await axios.get(api, { timeout: 15000 });

        if (!data?.status) {
            return reply("❌ Song not found");
        }

        const result = data.result;

        if (!result?.download?.audio) {
            return reply("❌ Audio not found");
        }

        let title = result.title;
        let channel = result.channel;
        let duration = result.duration;
        let thumb = result.thumbnail;
        let audioUrl = result.download.audio;

        // ⭐ ONLY STYLE CHANGE (STAR DECORATION)
        let text = `
✦✦✦✦✦✦✦✦✦✦
DR KAMRAN
✦✦✦✦✦✦✦✦✦✦

🎶 ${title}
👤 ${channel}
⏱ ${duration}

━━━━━━━━━━━━━━
⚡ Processing Audio...
🚀 Sending Now
`.trim();

        await conn.sendMessage(from, {
            image: { url: thumb },
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
            audio: { url: audioUrl },
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
        console.log(e);
        reply("❌ Error in play command");
    }

});
