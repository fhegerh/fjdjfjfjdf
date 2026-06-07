const config = require('../config');
const { cmd, commands } = require('../command');
const path = require('path');
const os = require("os");
const fs = require('fs');
const { runtime } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "menu",
    alias: ["allmenu", "fullmenu"],
    use: '.menu',
    desc: "Show all bot commands in an elite stylish design",
    category: "menu",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // Core Protection & Verification
        const signature = "© 𝙆𝘼𝙈𝙍𝘼𝙉-𝙈𝙄𝙉𝙄-𝘽𝙊𝙏 ッ";
        if (!signature.includes("KAMRAN")) {
            return reply("🚨 *Security Core:* Unauthorized structural modification.");
        }

        let totalCommands = Object.keys(commands).length;

        // 🌟 ULTRA-STYLISH TEXT & LAYOUT GRAPHICS 🌟
        let dec = `╭━━━〔 🌟 𝕶𝕬𝕸𝕽𝕬𝕹 𝕭𝕺𝕿 🌟 〕━━━╮\n`;
        dec += `┃ ✧  🎯  *${config.BOT_NAME.toUpperCase()}*  🎯  ✧ ┃\n`;
        dec += `╰━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
        
        dec += `┌───𐋉 👤 *𝖲𝖸𝖲𝖳𝖤𝖬  𝖨𝖭𝖥𝖮* 𐋊───\n`;
        dec += `│ 〆 *𝖮𝗐𝗇𝖾rer:* ${config.OWNER_NAME}\n`;
        dec += `│ 〆 *𝖢𝗈𝗆𝗆𝖺𝗇𝖽𝗌:* ${totalCommands}\n`;
        dec += `│ 〆 *𝖱𝗎𝗇运行:* ${runtime(process.uptime())}\n`;
        dec += `│ 〆 *𝖯𝗋𝖾𝖿𝗂𝗑:* ${config.PREFIX}\n`;
        dec += `│ 〆 *𝖬𝗈𝖽𝖾:* ${config.MODE}\n`;
        dec += `│ 〆 *𝖵𝖾𝗋𝗌𝗂𝗈𝗇:* 5.0.0 𝖡𝖾𝗍𝖺\n`;
        dec += `└─────────────────────⭓\n\n`;

        // 🎬 SPECIAL REQUEST: MOVIE & CINEMA MENU
        dec += `┌───𐋉 🎬 *𝕸𝕺𝕰𝕴𝕰 & 𝕮𝕴𝕹𝕰𝕭𝕺𝕿* 𐋊───\n`;
        const movieCmds = ["moviebox", "mbox", "movieboxdl", "mlfbd", "movie", "downloadmovie", "cinemalk"];
        movieCmds.forEach(c => dec += `│  〆 \`${config.PREFIX}${c}\`\n`);
        dec += `└─────────────────────⭓\n\n`;

        // 📥 DOWNLOAD MENU
        dec += `┌───𐋉 📥 *𝕯𝕺𝖂𝕿𝕽𝕺𝕬𝕯 𝕸𝕰𝕹𝖀* 𐋊───\n`;
        const downloadCmds = ["facebook", "mediafire", "tiktok", "twitter", "insta", "apk", "img", "tt2", "pins", "apk2", "fb2", "pinterest", "spotify", "play", "play2", "audio", "video", "video2", "ytmp3", "ytmp4", "song", "darama", "gdrive", "ssweb", "tiks"];
        downloadCmds.forEach(c => dec += `│  ✦ \`${config.PREFIX}${c}\`\n`);
        dec += `└─────────────────────⭓\n\n`;

        // 👥 GROUP MENU
        dec += `┌───𐋉 👥 *𝕲𝕽𝕺𝖀𝕻 𝕸𝕰𝕹𝖀* 𐋊───\n`;
        const groupCmds = ["grouplink", "kickall", "kickall2", "kickall3", "add", "remove", "kick", "promote", "demote", "dismiss", "revoke", "setgoodbye", "setwelcome", "delete", "getpic", "ginfo", "disappear on", "disappear off", "disappear 7D,24H", "allreq", "updategname", "updategdesc", "joinrequests", "senddm", "nikal", "mute", "unmute", "lockgc", "unlockgc", "invite", "tag", "hidetag", "tagall", "tagadmins"];
        groupCmds.forEach(c => dec += `│  ✦ \`${config.PREFIX}${c}\`\n`);
        dec += `└─────────────────────⭓\n\n`;

        // ⚙️ SETTING MENU
        dec += `┌───𐋉 ⚙️ *𝕾𝕰𝕿𝕿𝕴𝕹𝕲 𝕸𝕰𝕹𝖀* 𐋊───\n`;
        const settingCmds = ["prefix new prefix", "botname name", "ownername name", "botimage reply to image", "mode [public/private]", "autoreact [on/off]", "autoreply [on/off]", "autosticker [on/off]", "autotyping [on/off]", "autostatusview [on/off]", "autostatusreact [on/off]", "autostatusreply [on/off]", "autorecoding [on/off]", "alwaysonline [on/off]", "welcome [on/off]", "goodbye [on/off]", "antilink [on/off]", "antilinkkick [on/off]", "deletelink [on/off]", "antibad [on/off]", "antibot [on/off]", "read-message [on/off]", "mention-reply [on/off]", "admin-action [on/off]", "creact [on/off]", "cemojis [❤️,🧡,💛]"];
        settingCmds.forEach(c => dec += `│  ✦ \`${config.PREFIX}${c}\`\n`);
        dec += `└─────────────────────⭓\n\n`;

        // 🎵 AUDIO MENU
        dec += `┌───𐋉 🎵 *𝕬𝖀𝕯𝕴𝕺 𝕸𝕰𝕹𝖀* 𐋊───\n`;
        const audioCmds = ["bass", "slow", "fast", "reverse", "baby", "demon", "earrape", "nightcore", "robot", "chipmunk", "radio", "blown", "tupai", "fat", "smooth", "deep"];
        audioCmds.forEach(c => dec += `│  ✦ \`${config.PREFIX}${c}\`\n`);
        dec += `└─────────────────────⭓\n\n`;

        // 🎭 REACTIONS MENU
        dec += `┌───𐋉 🎭 *𝕽𝕰𝕬𝕮𝕿𝕴𝕺𝕿𝕾 𝕸𝕰𝕹𝖀* 𐋊───\n`;
        const reactCmds = ["bully @tag", "caddle @tag", "cry @tag", "hug @tag", "awoo @tag", "kiss @tag", "lick @tag", "pat @tag", "smug @tag", "bonk @tag", "yeet @tag", "blush @tag", "smile @tag", "wave @tag", "highfive @tag", "handhold @tag", "nom @tag", "bite @tag", "glomp @tag", "slap @tag", "kill @tag", "happy @tag", "wink @tag", "poke @tag", "dance @tag", "cringe @tag"];
        reactCmds.forEach(c => dec += `│  ✦ \`${config.PREFIX}${c}\`\n`);
        dec += `└─────────────────────⭓\n\n`;

        // 🎨 LOGO MAKER
        dec += `┌───𐋉 🎨 *𝕭𝕺𝕲𝕺 𝕸𝕬𝕶𝕰𝕽* 𐋊───\n`;
        const logoCmds = ["neonlight", "blackpink", "dragonball", "3dcomic", "america", "naruto", "sadgirl", "clouds", "futuristic", "3dpaper", "eraser", "sunset", "leaf", "galaxy", "sans", "boom", "hacker", "devilwings", "nigeria", "bulb", "angelwings", "zodiac", "luxury", "paint", "frozen", "castle", "tatoo", "valorant", "bear", "typography", "birthday"];
        logoCmds.forEach(c => dec += `│  ✦ \`${config.PREFIX}${c}\`\n`);
        dec += `└─────────────────────⭓\n\n`;

        // 👑 OWNER MENU
        dec += `┌───𐋉 👑 *𝕺𝖂𝕿𝕰𝕽 𝕸𝕰𝕹𝖀* 𐋊───\n`;
        const ownerCmds = ["owner", "menu", "menu2", "vv", "listcmd", "allmenu", "repo", "block", "unblock", "fullpp", "setpp", "restart", "shutdown", "updatecmd", "alive", "ping", "gjid", "jid"];
        ownerCmds.forEach(c => dec += `│  ✦ \`${config.PREFIX}${c}\`\n`);
        dec += `└─────────────────────⭓\n\n`;

        // 🎪 FUN MENU
        dec += `┌───𐋉 🎪 *𝕱𝖀𝕿 𝕸𝕰𝕹𝖀* 𐋊───\n`;
        const funCmds = ["shapar", "rate", "insult", "hack", "ship", "character", "pickup", "joke", "hrt", "hpy", "syd", "anger", "shy", "kiss", "mon", "cunfuzed", "setpp", "hand", "nikal", "hold", "hug", "hifi", "poke"];
        funCmds.forEach(c => dec += `│  ✦ \`${config.PREFIX}${c}\`\n`);
        dec += `└─────────────────────⭓\n\n`;

        // 🔄 CONVERT MENU
        dec += `┌───𐋉 🔄 *𝕮𝕺𝕿𝖁𝕰𝕽𝕿 𝕸𝕰𝕹𝖀* 𐋊───\n`;
        const convertCmds = ["sticker", "sticker2", "emojimix", "fancy", "take", "tomp3", "tts", "trt", "base64", "unbase64", "binary", "dbinary", "tinyurl", "urldecode", "urlencode", "url", "repeat", "ask", "readmore"];
        convertCmds.forEach(c => dec += `│  ✦ \`${config.PREFIX}${c}\`\n`);
        dec += `└─────────────────────⭓\n\n`;

        // 🤖 AI MENU
        dec += `┌───𐋉 🤖 *𝕬𝕴 𝕸𝕰𝕹𝖀* 𐋊───\n`;
        const aiCmds = ["ai", "gpt3", "gpt2", "gptmini", "gpt", "meta", "blackbox", "luma", "dj", "khan", "jawad", "gpt4", "bing", "imagine", "imagine2", "copilot"];
        aiCmds.forEach(c => dec += `│  ✦ \`${config.PREFIX}${c}\`\n`);
        dec += `└─────────────────────⭓\n\n`;

        // 🚀 MAIN MENU
        dec += `┌───𐋉 🚀 *𝕸𝕬𝕴𝕿 𝕸𝕰𝕹𝖀* 𐋊───\n`;
        const mainCmds = ["ping", "ping2", "speed", "live", "alive", "runtime", "uptime", "repo", "owner", "menu", "menu2", "restart"];
        mainCmds.forEach(c => dec += `│  ✦ \`${config.PREFIX}${c}\`\n`);
        dec += `└─────────────────────⭓\n\n`;

        // ⛩️ ANIME MENU
        dec += `┌───𐋉 ⛩️ *𝕬𝕿𝕴𝕸𝕰 𝕸𝕰𝕹𝖀* 𐋊───\n`;
        const animeCmds = ["fack", "truth", "dare", "dog", "awoo", "garl", "waifu", "neko", "megnumin", "maid", "loli", "animegirl", "animegirl1", "animegirl2", "animegirl3", "animegirl4", "animegirl5", "anime1", "anime2", "anime3", "anime4", "anime5", "animenews", "foxgirl", "naruto"];
        animeCmds.forEach(c => dec += `│  ✦ \`${config.PREFIX}${c}\`\n`);
        dec += `└─────────────────────⭓\n\n`;

        // 🗺️ OTHER MENU
        dec += `┌───𐋉 🗺️ *𝕺𝕿𝕳𝕰𝕽 𝕸𝕰𝕹𝖀* 𐋊───\n`;
        const otherCmds = ["timenow", "date", "count", "calculate", "countx", "flip", "coinflip", "rcolor", "roll", "fact", "cpp", "rw", "pair", "pair2", "pair3", "fancy", "logo", "define", "news", "movie", "weather", "srepo", "insult", "save", "wikipedia", "gpass", "githubstalk", "yts", "ytv"];
        otherCmds.forEach(c => dec += `│  ✦ \`${config.PREFIX}${c}\`\n`);
        dec += `└─────────────────────⭓\n\n`;

        dec += `✨ _${config.DESCRIPTION || 'Enjoy premium services.'}_\n\n`;
        dec += `> *${signature}*`;

        // Send Elegant Custom Interface
        await conn.sendMessage(from, { 
            image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/ly6553.jpg' }, 
            caption: dec, 
            contextInfo: { 
                mentionedJid: [m.sender], 
                forwardingScore: 999, 
                isForwarded: true, 
                forwardedNewsletterMessageInfo: { 
                    newsletterJid: '120363418144382782@newsletter', 
                    newsletterName: config.BOT_NAME, 
                    serverMessageId: 143 
                } 
            } 
        }, { quoted: mek });

    } catch (e) { 
        console.log(e); 
        reply(`Error: ${e}`); 
    } 
});
