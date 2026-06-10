const { cmd } = require("../command");
const axios = require("axios");

const API = "https://api.rifkyshre.biz.id";
const ROUTE = "/scrape/snapvideo";

async function snapvideo(url) {
    try {
        const res = await axios.post(
            `${API}${ROUTE}`,
            { url },
            {
                timeout: 45000,
                validateStatus: () => true,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const body = res.data;

        if (!body?.status) {
            return {
                status: false,
                error: body?.error || "Unknown error",
            };
        }

        return {
            status: true,
            data: body.data,
        };
    } catch (e) {
        return {
            status: false,
            error: e.message,
        };
    }
}

cmd({
    pattern: "snapvideo",
    desc: "Download video dari TikTok, Instagram, Twitter, dll",
    category: "downloader",
    react: "📥",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {
    if (!args[0]) {
        return reply("Masukkan URL.\n\nContoh:\n.snapvideo https://vt.tiktok.com/xxxxx");
    }

    const result = await snapvideo(args[0]);

    if (!result.status) {
        return reply(`❌ Error: ${result.error}`);
    }

    const data = result.data;

    let caption = `*${data.message || "Download Result"}*\n\n`;

    if (data.title) caption += `📌 *Title:* ${data.title}\n`;
    if (data.author) caption += `👤 *Author:* ${data.author}\n`;

    await conn.sendMessage(
        m.chat,
        {
            video: { url: data.url || data.video || data.download },
            caption
        },
        { quoted: mek }
    );
});
