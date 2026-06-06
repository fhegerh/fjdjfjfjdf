const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const os = require('os');
const FormData = require('form-data');
const axios = require('axios');

// ===============================
// SETTINGS COMMAND
// ===============================
cmd({
    pattern: "settings",
    alias: ["setting", "env", "config"],
    desc: "Bot settings management",
    category: "settings",
    react: "⚙️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, prefix, userConfig }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }
    
    const formatEmojiList = (emojis) => {
        if (!emojis || !Array.isArray(emojis) || emojis.length === 0) {
            return "│   Not Set";
        }
        
        let result = "";
        for (let i = 0; i < Math.min(emojis.length, 10); i++) {
            if (i === 0) {
                result += `│   ${emojis[i]}`;
            } else {
                result += ` ${emojis[i]}`;
            }
        }
        
        if (emojis.length > 10) {
            result += ` +${emojis.length - 10} more`;
        }
        
        return result;
    };
    
    const settingsText = `
┌─⧽ *${config.BOT_NAME} Sᴇᴛᴛɪɴɢs* ⚙️
│
│ 📁 *Available Commands*
│ • statusview on/off
│ • statuslike on/off
│ • recording on/off
│ • autoreact on/off
│ • antilink on/off
│ • antidelete on/off
│ • welcome on/off
│ • adminaction on/off
│ • autotyping on/off
│ • online on/off
│ • mode public/private/inbox
│ • delpath same/inbox
│ • statusemojis ❤️,😍,🔥
│ • reactemojis 😂,❤️,🔥
│ • stickername <name>
│ • prefix <new_prefix>
│ • botname <new_name>
│ • ownername <new_name>
│ • ownernumber <new_number>
│ • description <new_desc>
│ • botdp <image_url>
│ • sudo @user
│ • delsudo @user
│ • listsudo
│ • ban @user
│ • unban @user
│ • listban
│
│ ═══════════════
│
│ 🧩 *Current Configuration*
│ 🪄 Auto View Status: ${userConfig.AUTO_VIEW_STATUS}
│ 💖 Auto Like Status: ${userConfig.AUTO_LIKE_STATUS}
│ 🎙 Auto Recording: ${userConfig.AUTO_RECORDING}
│ 🤖 Auto React: ${userConfig.AUTO_REACT}
│ 🚫 Anti-Link: ${userConfig.ANTI_LINK}
│ 🗑️ Anti-Delete: ${userConfig.ANTI_DELETE || 'false'}
│ 📍 Delete Path: ${userConfig.ANTI_DELETE_PATH || 'inbox'}
│ 🎉 Welcome: ${userConfig.WELCOME}
│ 👑 Admin Action: ${userConfig.ADMIN_ACTION}
│ ⌨️ Auto Typing: ${userConfig.AUTO_TYPING || 'false'}
│ 💚 Always Online: ${userConfig.ALWAYS_ONLINE || 'false'}
│ ⚙️ Bot Mode: ${userConfig.MODE}
│ 🪟 Prefix: ${userConfig.PREFIX}
│ 🤖 Bot Name: ${config.BOT_NAME}
│ 👑 Owner Name: ${userConfig.OWNER_NAME || config.OWNER_NAME}
│ 📞 Owner Number: ${userConfig.OWNER_NUMBER || config.OWNER_NUMBER}
│ 📝 Description: ${userConfig.DESCRIPTION || config.DESCRIPTION}
│ 🖼️ Bot Image: ${userConfig.BOT_IMAGE ? 'Set ✓' : 'Not Set'}
│
│ ══════════════════
│
│ 🎨 *Emoji & Media Settings*
│ 💌 Status Emojis: 
${formatEmojiList(userConfig.AUTO_LIKE_EMOJI)}
│
│ 🔥 React Emojis:
${formatEmojiList(userConfig.REACTXEMOJIS)}
│
│ 🏷️ Sticker Name: ${userConfig.STICKER_NAME || 'Not Set'}
│
│ ══════════════════
│
│ 👥 *Permission Lists*
│ 👑 SUDO Users: ${(userConfig.SUDO || []).length} users
│ 🚫 Banned Users: ${(userConfig.BANNED || []).length} users
│
└───────────⧽`;

    await reply(settingsText);
});

// ===============================
// STATUS VIEW COMMAND
// ===============================
cmd({
    pattern: "statusview",
    alias: ["autoview"],
    desc: "Toggle auto view status",
    category: "settings",
    react: "👁️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* autoview on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.AUTO_VIEW_STATUS}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.AUTO_VIEW_STATUS = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aᴜᴛᴏ Vɪᴇᴡ Sᴛᴀᴛᴜs sᴇᴛ ᴛᴏ:* ${newValue}`);
});

// ===============================
// STATUS LIKE COMMAND
// ===============================
cmd({
    pattern: "statuslike",
    alias: ["autolike"],
    desc: "Toggle auto like status",
    category: "settings",
    react: "❤️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* autolike on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.AUTO_LIKE_STATUS}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.AUTO_LIKE_STATUS = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aᴜᴛᴏ Lɪᴋᴇ Sᴛᴀᴛᴜs sᴇᴛ ᴛᴏ:* ${newValue}`);
});

// ===============================
// AUTO REACT COMMAND
// ===============================
cmd({
    pattern: "autoreact",
    alias: ["autoreaction", "reactauto"],
    desc: "Toggle auto react to messages",
    category: "settings",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* autoreact on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.AUTO_REACT}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.AUTO_REACT = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aᴜᴛᴏ Rᴇᴀᴄᴛ sᴇᴛ ᴛᴏ:* ${newValue}\n\nBot will ${newValue === 'true' ? 'now' : 'no longer'} automatically react to messages.`);
});

// ===============================
// ANTI LINK COMMAND
// ===============================
cmd({
    pattern: "antilink",
    alias: ["linkblock"],
    desc: "Toggle anti-link protection",
    category: "settings",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* antilink on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.ANTI_LINK}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.ANTI_LINK = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aɴᴛɪ Lɪɴᴋ sᴇᴛ ᴛᴏ:* ${newValue}\n\nWhen ON: Users sending links will be removed from groups.`);
});

// ===============================
// ANTI DELETE COMMAND
// ===============================
cmd({
    pattern: "antidelete",
    alias: ["antidel", "delblock"],
    desc: "Toggle anti-delete message protection",
    category: "settings",
    react: "🗑️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* antidelete on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.ANTI_DELETE || 'false'}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.ANTI_DELETE = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aɴᴛɪ Dᴇʟᴇᴛᴇ sᴇᴛ ᴛᴏ:* ${newValue}\n\nWhen ON: Bot will detect and notify when messages are deleted.`);
});

// ===============================
// RECORDING COMMAND
// ===============================
cmd({
    pattern: "recording",
    alias: ["autorecording"],
    desc: "Toggle auto recording presence",
    category: "settings",
    react: "🎙️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* autorecord on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.AUTO_RECORDING}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.AUTO_RECORDING = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aᴜᴛᴏ Rᴇᴄᴏʀᴅɪɴɢ sᴇᴛ ᴛᴏ:* ${newValue}`);
});

// ===============================
// WELCOME COMMAND
// ===============================
cmd({
    pattern: "welcome",
    alias: ["welcome"],
    desc: "Toggle welcome/goodbye messages",
    category: "settings",
    react: "🎉",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* welcome on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.WELCOME}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.WELCOME = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Wᴇʟᴄᴏᴍᴇ/Goodbye sᴇᴛ ᴛᴏ:* ${newValue}`);
});

// ===============================
// ADMIN ACTION COMMAND
// ===============================
cmd({
    pattern: "adminaction",
    alias: ["adminnotify"],
    desc: "Toggle admin action notifications",
    category: "settings",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* adminaction on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.ADMIN_ACTION}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.ADMIN_ACTION = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aᴅᴍɪɴ Aᴄᴛɪᴏɴ Nᴏᴛɪғɪᴄᴀᴛɪᴏɴs sᴇᴛ ᴛᴏ:* ${newValue}`);
});

// ===============================
// AUTO TYPING COMMAND
// ===============================
cmd({
    pattern: "autotyping",
    alias: ["typing"],
    desc: "Toggle auto typing in chats",
    category: "settings",
    react: "⌨️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* autotyping on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.AUTO_TYPING || 'false'}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.AUTO_TYPING = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aᴜᴛᴏ Tʏᴘɪɴɢ sᴇᴛ ᴛᴏ:* ${newValue}\n\nWhen ON: Bot will show typing indicator in chats.`);
});

// ===============================
// ONLINE COMMAND
// ===============================
cmd({
    pattern: "online",
    alias: ["alwaysonline", "alwayson"],
    desc: "Toggle always online status",
    category: "settings",
    react: "💚",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* online on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.ALWAYS_ONLINE || 'false'}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.ALWAYS_ONLINE = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aʟᴡᴀʏs Oɴʟɪɴᴇ sᴇᴛ ᴛᴏ:* ${newValue}\n\nWhen ON: Bot will always show online status.`);
});

// ===============================
// MODE COMMAND
// ===============================
cmd({
    pattern: "mode",
    alias: ["mod"],
    desc: "Change bot mode (public/private/inbox)",
    category: "settings",
    react: "🌐",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* mode public/private/inbox\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.MODE}`);
    }

    const mode = args[0].toLowerCase();
    if (!['public', 'private', 'inbox'].includes(mode)) {
        return reply('❌ *Aᴠᴀɪʟᴀʙʟᴇ ᴍᴏᴅᴇs:* public, private, inbox');
    }

    userConfig.MODE = mode;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    const modeDescriptions = {
        public: 'Cᴏᴍᴍᴀɴᴅs ᴡᴏʀᴋ ᴇᴠᴇʀʏᴡʜᴇʀᴇ',
        private: 'Oɴʟʏ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅs ᴡᴏʀᴋ',
        inbox: 'Cᴏᴍᴍᴀɴᴅs ᴡᴏʀᴋ ᴏɴʟʏ ɪɴ ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛs'
    };
    
    await reply(`✅ *Bᴏᴛ ᴍᴏᴅᴇ sᴇᴛ ᴛᴏ:* ${mode}\n📝 *Dᴇsᴄʀɪᴘᴛɪᴏɴ:* ${modeDescriptions[mode]}`);
});

// ===============================
// PREFIX COMMAND
// ===============================
cmd({
    pattern: "prefix",
    desc: "Change command prefix",
    category: "settings",
    react: "🪟",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* prefix <new_prefix>\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.PREFIX}`);
    }

    const newPrefix = args[0];
    if (newPrefix.length > 2) {
        return reply('❌ *Pʀᴇғɪx ᴍᴜsᴛ ʙᴇ 1-2 ᴄʜᴀʀᴀᴄᴛᴇʀs ᴍᴀx*');
    }

    userConfig.PREFIX = newPrefix;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Pʀᴇғɪx ᴄʜᴀɴɢᴇᴅ ᴛᴏ:* ${newPrefix}\n\n*Exᴀᴍᴘʟᴇ:* ${newPrefix}menu`);
});

// ===============================
// BOT NAME COMMAND
// ===============================
cmd({
    pattern: "botname",
    alias: ["name"],
    desc: "Change bot name",
    category: "settings",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* botname <new_name>\n*Cᴜʀʀᴇɴᴛ:* ${config.BOT_NAME}`);
    }

    const newName = args.join(' ');
    if (newName.length > 30) {
        return reply('❌ *Bᴏᴛ ɴᴀᴍᴇ ᴍᴜsᴛ ʙᴇ ᴜɴᴅᴇʀ 30 ᴄʜᴀʀᴀᴄᴛᴇʀs*');
    }

    userConfig.BOT_NAME = newName;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Bᴏᴛ ɴᴀᴍᴇ sᴇᴛ ᴛᴏ:* ${newName}`);
});

// ===============================
// OWNER NAME COMMAND
// ===============================
cmd({
    pattern: "ownername",
    alias: ["owner"],
    desc: "Change owner name",
    category: "settings",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* ownername <new_name>\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.OWNER_NAME || config.OWNER_NAME}`);
    }

    const newName = args.join(' ');
    if (newName.length > 30) {
        return reply('❌ *Oᴡɴᴇʀ ɴᴀᴍᴇ ᴍᴜsᴛ ʙᴇ ᴜɴᴅᴇʀ 30 ᴄʜᴀʀᴀᴄᴛᴇʀs*');
    }

    userConfig.OWNER_NAME = newName;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Oᴡɴᴇʀ ɴᴀᴍᴇ sᴇᴛ ᴛᴏ:* ${newName}`);
});

// ===============================
// OWNER NUMBER COMMAND
// ===============================
cmd({
    pattern: "ownernumber",
    alias: ["ownernum", "ownerphone"],
    desc: "Change owner number",
    category: "settings",
    react: "📞",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* ownernumber <new_number>\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.OWNER_NUMBER || config.OWNER_NUMBER}`);
    }

    const newNumber = args[0];
    if (!newNumber.match(/^\d{10,15}$/)) {
        return reply('❌ *Pʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴀ ᴠᴀʟɪᴅ ᴘʜᴏɴᴇ ɴᴜᴍʙᴇʀ (10-15 ᴅɪɢɪᴛs)*');
    }

    userConfig.OWNER_NUMBER = newNumber;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Oᴡɴᴇʀ ɴᴜᴍʙᴇʀ sᴇᴛ ᴛᴏ:* ${newNumber}`);
});

// ===============================
// DESCRIPTION COMMAND
// ===============================
cmd({
    pattern: "description",
    alias: ["desc", "about"],
    desc: "Change bot description",
    category: "settings",
    react: "📝",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* description <new_description>\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.DESCRIPTION || config.DESCRIPTION}`);
    }

    const newDesc = args.join(' ');
    if (newDesc.length > 200) {
        return reply('❌ *Dᴇsᴄʀɪᴘᴛɪᴏɴ ᴍᴜsᴛ ʙᴇ ᴜɴᴅᴇʀ 200 ᴄʜᴀʀᴀᴄᴛᴇʀs*');
    }

    userConfig.DESCRIPTION = newDesc;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Bᴏᴛ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ sᴇᴛ ᴛᴏ:* ${newDesc}`);
});

// ===============================
// BOT DP COMMAND
// ===============================
cmd({
    pattern: "botdp",
    alias: ["botimage", "botpic", "botphoto"],
    desc: "Set bot display picture",
    category: "settings",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    let imageUrl = args[0];

    if (!imageUrl && m.quoted) {
        const quotedMsg = m.quoted;
        const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
        if (!mimeType.startsWith("image")) return reply("❌ Please reply to an image.");

        const mediaBuffer = await quotedMsg.download();
        const extension = mimeType.includes("jpeg") ? ".jpg" : ".png";
        const tempFilePath = path.join(os.tmpdir(), `botimg_${Date.now()}${extension}`);
        fs.writeFileSync(tempFilePath, mediaBuffer);

        const form = new FormData();
        form.append("fileToUpload", fs.createReadStream(tempFilePath), `botimage${extension}`);
        form.append("reqtype", "fileupload");

        const response = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders()
        });

        fs.unlinkSync(tempFilePath);

        if (typeof response.data !== 'string' || !response.data.startsWith('https://')) {
            throw new Error(`Catbox upload failed: ${response.data}`);
        }

        imageUrl = response.data;
    }

    if (!imageUrl || !imageUrl.startsWith("http")) {
        return reply("❌ Provide a valid image URL or reply to an image.");
    }

    userConfig.BOT_IMAGE = imageUrl;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await conn.sendMessage(from, {
        image: { url: imageUrl },
        caption: `✅ *Bᴏᴛ Dɪsᴘʟᴀʏ Pɪᴄᴛᴜʀᴇ ᴜᴘᴅᴀᴛᴇᴅ!*\n\n📁 *Image URL:* ${imageUrl}\n\nImage will be used as bot's profile picture.`
    }, { quoted: mek });
});

// ===============================
// STICKER NAME COMMAND
// ===============================
cmd({
    pattern: "stickername",
    alias: ["stickertext", "stname"],
    desc: "Set sticker pack name",
    category: "settings",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        const currentName = userConfig.STICKER_NAME || 'Sticker Pack';
        return reply(`📌 *Usᴀɢᴇ:* .stickername Your Pack Name\n*Cᴜʀʀᴇɴᴛ:* ${currentName}`);
    }

    const stickerName = args.join(' ');
    
    userConfig.STICKER_NAME = stickerName;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Sᴛɪᴄᴋᴇʀ ᴘᴀᴄᴋ ɴᴀᴍᴇ sᴇᴛ ᴛᴏ:* ${stickerName}`);
});

// ===============================
// DELPATH COMMAND
// ===============================
cmd({
    pattern: "delpath",
    alias: ["deletepath", "antidelete"],
    desc: "Set anti-delete path (same/inbox)",
    category: "settings",
    react: "🗑️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* .delpath same/inbox\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.ANTI_DELETE_PATH || 'inbox'}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'same' && value !== 'inbox') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* same ᴏʀ inbox\n- *same*: Delete from same chat\n- *inbox*: Delete only from inbox');
    }

    userConfig.ANTI_DELETE_PATH = value;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴘᴀᴛʜ sᴇᴛ ᴛᴏ:* ${value}`);
});

// ===============================
// STATUS EMOJIS COMMAND
// ===============================
cmd({
    pattern: "statusemojis",
    alias: ["statusreacts", "statemojis"],
    desc: "Set auto like status emojis",
    category: "settings",
    react: "❤️",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        const currentEmojis = userConfig.AUTO_LIKE_EMOJI || ['❤️', '💚', '🌚', '😍', '💀', '🧡', '💛', '💙', '👻', '🖤', '🤍', '🥀'];
        return reply(`📌 *Usᴀɢᴇ:* .statusemojis ❤️,💚,🌚,😍,💀\n*Cᴜʀʀᴇɴᴛ:* ${currentEmojis.join(', ')}`);
    }

    const input = args.join(' ');
    
    const consecutiveEmojisRegex = /[\p{Emoji}\u200d]+(?![,])[\p{Emoji}\u200d]+/gu;
    
    if (consecutiveEmojisRegex.test(input)) {
        return reply('❌ *Iɴᴠᴀʟɪᴅ ғᴏʀᴍᴀᴛ! Pʟᴇᴀsᴇ sᴇᴘᴀʀᴀᴛᴇ ᴀʟʟ ᴇᴍᴏᴊɪs ᴡɪᴛʜ ᴄᴏᴍᴍᴀs*\n*Exᴀᴍᴘʟᴇ:* .statusemojis 💗,😍,😄,😃');
    }
    
    const emojis = input.split(',').map(e => e.trim()).filter(e => e);
    
    const invalidEntries = emojis.filter(emoji => {
        const hasMultipleEmojis = Array.from(emoji).some((c, i, arr) => {
            if (i === 0) return false;
            const prev = arr[i-1];
            const regex = /\p{Emoji}/u;
            return regex.test(c) && regex.test(prev) && c !== '\u200d' && prev !== '\u200d';
        });
        
        return hasMultipleEmojis;
    });
    
    if (invalidEntries.length > 0) {
        return reply('❌ *Iɴᴠᴀʟɪᴅ ғᴏʀᴍᴀᴛ! Dᴏɴ\'ᴛ ᴜsᴇ ᴍᴜʟᴛɪᴘʟᴇ ᴇᴍᴏᴊɪs ᴡɪᴛʜᴏᴜᴛ ᴄᴏᴍᴍᴀs*\n*Exᴀᴍᴘʟᴇ:* .statusemojis 💗,😍,😄,😃');
    }
    
    if (emojis.length === 0) {
        return reply('❌ *Pʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴠᴀʟɪᴅ ᴇᴍᴏᴊɪs*');
    }

    userConfig.AUTO_LIKE_EMOJI = emojis;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Sᴛᴀᴛᴜs ᴀᴜᴛᴏ-ʟɪᴋᴇ ᴇᴍᴏᴊɪs sᴇᴛ:*\n${emojis.join(', ')}`);
});

// ===============================
// REACT EMOJIS COMMAND
// ===============================
cmd({
    pattern: "reactemojis",
    alias: ["reacts", "reactset"],
    desc: "Set auto react emojis",
    category: "settings",
    react: "😂",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        const currentEmojis = userConfig.REACTXEMOJIS || ['😂', '❤️', '🔥', '👏', '😮', '😢', '🤣', '👍', '🎉', '🤔', '🙏', '😍', '😊', '🥰', '💕', '🤩', '✨', '😎', '🥳', '🙌'];
        return reply(`📌 *Usᴀɢᴇ:* .reactemojis 😂,❤️,🔥,👏,😮\n*Cᴜʀʀᴇɴᴛ:* ${currentEmojis.join(', ')}`);
    }

    const input = args.join(' ');
    
    const consecutiveEmojisRegex = /[\p{Emoji}\u200d]+(?![,])[\p{Emoji}\u200d]+/gu;
    
    if (consecutiveEmojisRegex.test(input)) {
        return reply('❌ *Iɴᴠᴀʟɪᴅ ғᴏʀᴍᴀᴛ! Pʟᴇᴀsᴇ sᴇᴘᴀʀᴀᴛᴇ ᴀʟʟ ᴇᴍᴏᴊɪs ᴡɪᴛʜ ᴄᴏᴍᴍᴀs*\n*Exᴀᴍᴘʟᴇ:* .reactemojis 😂,❤️,🔥,👏,😮');
    }
    
    const emojis = input.split(',').map(e => e.trim()).filter(e => e);
    
    const invalidEntries = emojis.filter(emoji => {
        const hasMultipleEmojis = Array.from(emoji).some((c, i, arr) => {
            if (i === 0) return false;
            const prev = arr[i-1];
            const regex = /\p{Emoji}/u;
            return regex.test(c) && regex.test(prev) && c !== '\u200d' && prev !== '\u200d';
        });
        
        return hasMultipleEmojis;
    });
    
    if (invalidEntries.length > 0) {
        return reply('❌ *Iɴᴠᴀʟɪᴅ ғᴏʀᴍᴀᴛ! Dᴏɴ\'ᴛ ᴜsᴇ ᴍᴜʟᴛɪᴘʟᴇ ᴇᴍᴏᴊɪs ᴡɪᴛʜᴏᴜᴛ ᴄᴏᴍᴍᴀs*\n*Exᴀᴍᴘʟᴇ:* .reactemojis 😂,❤️,🔥,👏,😮');
    }
    
    if (emojis.length === 0) {
        return reply('❌ *Pʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴠᴀʟɪᴅ ᴇᴍᴏᴊɪs*');
    }

    userConfig.REACTXEMOJIS = emojis;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aᴜᴛᴏ ʀᴇᴀᴄᴛ ᴇᴍᴏᴊɪs sᴇᴛ:*\n${emojis.join(', ')}`);
});

// ===============================
// BAN COMMAND
// ===============================
cmd({
    pattern: "ban1",
    alias: ["block1"],
    desc: "Ban a user from using the bot",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    // Consistent user extraction logic
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0) && !args[0]) {
        return reply(`❌ Usage: .ban @user or reply to a message`);
    }

    // Identify the target user
    let target = m.mentionedJid?.[0] 
        || (m.quoted?.sender ?? null)
        || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

    if (!target) return reply("❌ Please provide a number or tag/reply a user.");

    // Ensure target has proper format (can be @s.whatsapp.net or @lid)
    if (!target.includes('@')) {
        target = target + "@s.whatsapp.net";
    }

    const banList = userConfig.BANNED || [];
    
    if (banList.includes(target)) {
        return reply('❌ This user is already banned.');
    }
    
    banList.push(target);
    userConfig.BANNED = banList;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *User Banned*\n\n📱 User: ${target}\n🔰 Status: Cannot use bot commands anymore.`);
});

// ===============================
// UNBAN COMMAND
// ===============================
cmd({
    pattern: "unban1",
    alias: ["removeban"],
    desc: "Unban a user",
    category: "owner",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    // Consistent user extraction logic
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0) && !args[0]) {
        return reply(`❌ Usage: .unban @user or reply to a message`);
    }

    // Identify the target user
    let target = m.mentionedJid?.[0] 
        || (m.quoted?.sender ?? null)
        || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

    if (!target) return reply("❌ Please provide a number or tag/reply a user.");

    // Ensure target has proper format (can be @s.whatsapp.net or @lid)
    if (!target.includes('@')) {
        target = target + "@s.whatsapp.net";
    }

    const banList = userConfig.BANNED || [];
    const index = banList.indexOf(target);
    
    if (index === -1) {
        return reply('❌ This user is not in ban list.');
    }
    
    banList.splice(index, 1);
    userConfig.BANNED = banList;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *User Unbanned*\n\n📱 User: ${target}\n🔰 Status: Can now use bot commands.`);
});

// ===============================
// SUDO COMMAND
// ===============================
cmd({
    pattern: "sudo",
    alias: ["addsudo"],
    desc: "Add a user to sudo list",
    category: "owner",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    // Consistent user extraction logic
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0) && !args[0]) {
        return reply(`❌ Usage: .sudo @user or reply to a message`);
    }

    // Identify the target user
    let target = m.mentionedJid?.[0] 
        || (m.quoted?.sender ?? null)
        || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

    if (!target) return reply("❌ Please provide a number or tag/reply a user.");

    // Ensure target has proper format (can be @s.whatsapp.net or @lid)
    if (!target.includes('@')) {
        target = target + "@s.whatsapp.net";
    }

    const sudoList = userConfig.SUDO || [];
    
    if (sudoList.includes(target)) {
        return reply('❌ This user is already a sudo user.');
    }
    
    sudoList.push(target);
    userConfig.SUDO = sudoList;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Added to SUDO List*\n\n👑 User: ${target}\n⚡ Has owner-level permissions.`);
});

// ===============================
// DELSUDO COMMAND
// ===============================
cmd({
    pattern: "delsudo",
    alias: ["removesudo"],
    desc: "Remove a user from sudo list",
    category: "owner",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    // Consistent user extraction logic
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0) && !args[0]) {
        return reply(`❌ Usage: .delsudo @user or reply to a message`);
    }

    // Identify the target user
    let target = m.mentionedJid?.[0] 
        || (m.quoted?.sender ?? null)
        || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

    if (!target) return reply("❌ Please provide a number or tag/reply a user.");

    // Ensure target has proper format (can be @s.whatsapp.net or @lid)
    if (!target.includes('@')) {
        target = target + "@s.whatsapp.net";
    }

    const sudoList = userConfig.SUDO || [];
    const index = sudoList.indexOf(target);
    
    if (index === -1) {
        return reply('❌ This user is not in sudo list.');
    }
    
    sudoList.splice(index, 1);
    userConfig.SUDO = sudoList;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Removed from SUDO List*\n\n👑 User: ${target}\n⚡ Owner permissions revoked.`);
});

// ===============================
// LISTSUDO COMMAND
// ===============================
cmd({
    pattern: "listsudo",
    alias: ["sudos", "sudolist"],
    desc: "List all sudo users",
    category: "owner",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, prefix, userConfig }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    const sudoList = userConfig.SUDO || [];
    
    let listText = `*👑 SUDO Users List*\n\n`;
    listText += `*Total:* ${sudoList.length}\n`;
    listText += `━━━━━━━━━━━━━━\n\n`;
    
    if (sudoList.length === 0) {
        listText += `No sudo users added yet.\n`;
        listText += `Use .sudo @user to add.`;
    } else {
        sudoList.forEach((jid, index) => {
            const shortJid = jid.split('@')[0];
            const type = jid.includes('@lid') ? '🆔 LID' : '📱 WA';
            listText += `${index + 1}. ${shortJid}\n`;
            listText += `   ${type}\n\n`;
        });
    }
    
    await reply(listText);
});

// ===============================
// LISTBAN COMMAND
// ===============================
cmd({
    pattern: "listban",
    alias: ["bans", "banlist"],
    desc: "List all banned users",
    category: "owner",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, prefix, userConfig }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    const banList = userConfig.BANNED || [];
    
    let listText = `*🚫 Banned Users List*\n\n`;
    listText += `*Total:* ${banList.length}\n`;
    listText += `━━━━━━━━━━━━━━\n\n`;
    
    if (banList.length === 0) {
        listText += `No banned users.\n`;
        listText += `All users can use the bot.`;
    } else {
        banList.forEach((jid, index) => {
            const shortJid = jid.split('@')[0];
            const type = jid.includes('@lid') ? '🆔 LID' : '📱 WA';
            listText += `${index + 1}. ${shortJid}\n`;
            listText += `   ${type}\n\n`;
        });
    }
    
    await reply(listText);
});


// ===============================
// ANTI CALL COMMAND
// ===============================
cmd({
    pattern: "anticall",
    alias: ["antcall", "callblock"],
    desc: "Toggle anti-call protection",
    category: "settings",
    react: "📵",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        return reply(`📌 *Usᴀɢᴇ:* anticall on/off\n*Cᴜʀʀᴇɴᴛ:* ${userConfig.ANTI_CALL || 'false'}`);
    }

    const value = args[0].toLowerCase();
    if (value !== 'on' && value !== 'off') {
        return reply('❌ *Pʟᴇᴀsᴇ ᴜsᴇ:* on ᴏʀ off');
    }

    const newValue = value === 'on' ? 'true' : 'false';
    userConfig.ANTI_CALL = newValue;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aɴᴛɪ-Cᴀʟʟ sᴇᴛ ᴛᴏ:* ${newValue}\n\nWhen ON: Bot will automatically reject incoming calls and send a rejection message.`);
});

// ===============================
// ANTI CALL MESSAGE COMMAND
// ===============================
cmd({
    pattern: "anticallmsg",
    alias: ["callmsg", "rejectmsg"],
    desc: "Set custom anti-call rejection message",
    category: "settings",
    react: "📝",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, args, prefix, updateUserConfig, userConfig, sanitizedNumber }) => {
    if (!isCreator) {
        return reply("*📛 ᴛʜɪs ɪs ᴀɴ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅ.*");
    }

    if (!args[0]) {
        const currentMsg = userConfig.REJECT_MSG || config.REJECT_MSG || "*📞 ᴄαℓℓ ɴσт αℓℓσωє∂ ιɴ тнιѕ ɴᴜмвєʀ уσυ ∂σɴт нανє ᴘєʀмιѕѕισɴ 📵*";
        return reply(`📌 *Cᴜʀʀᴇɴᴛ Rᴇᴊᴇᴄᴛ Mᴇssᴀɢᴇ:*\n${currentMsg}\n\n*Usᴀɢᴇ:* anticallmsg <your message>\n\nExᴀᴍᴘʟᴇ: anticallmsg Calls are not allowed on this number`);
    }

    const newMsg = args.join(' ');
    
    userConfig.REJECT_MSG = newMsg;
    await updateUserConfig(sanitizedNumber, userConfig);
    
    await reply(`✅ *Aɴᴛɪ-Cᴀʟʟ Rᴇᴊᴇᴄᴛ Mᴇssᴀɢᴇ sᴇᴛ ᴛᴏ:*\n${newMsg}`);
});
