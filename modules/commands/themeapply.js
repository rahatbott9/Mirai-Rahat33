const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "themeapply",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "Show available themes with preview and apply by FBID",
  commandCategory: "system",
  usages: "[themeID]",
  cooldowns: 5,
  usePrefix: true
};

// Cache folder for temp images
const CACHE_DIR = path.join(__dirname, "..", "cache");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const themeID = args[0];

  try {
    // 1️⃣ If user provides a themeID → apply it
    if (themeID) {
      await api.setThreadThemeMqtt(threadID, themeID);
      return api.sendMessage(`✅ Theme applied successfully!\nTheme FBID: ${themeID}`, threadID);
    }

    // 2️⃣ Otherwise → show all available themes with preview
    const themes = await api.getTheme(threadID);

    if (!themes || themes.length === 0) {
      return api.sendMessage("❌ No themes found for this thread.", threadID);
    }

    for (const theme of themes) {
      let text =
`🎨 Theme: ${theme.name}
🆔 Theme FBID: ${theme.id}
🎨 Primary Color: ${theme.primary_color || "N/A"}
🔄 Gradient: ${Array.isArray(theme.gradient_colors) ? theme.gradient_colors.join(", ") : "N/A"}`;

      // Preview image (if exists)
      const previewUrl = theme.preview_image_urls?.light_mode || theme.background_image || null;

      if (previewUrl) {
        try {
          const res = await axios.get(previewUrl, { responseType: "arraybuffer", timeout: 15000 });
          const buffer = Buffer.from(res.data);
          const tmpPath = path.join(CACHE_DIR, `theme_${theme.id}_${Date.now()}.jpg`);
          fs.writeFileSync(tmpPath, buffer);

          await api.sendMessage({ body: text, attachment: fs.createReadStream(tmpPath) }, threadID);
          fs.unlinkSync(tmpPath);
          continue;
        } catch {}
      }

      // Fallback: just send text if preview fails
      await api.sendMessage(text, threadID);
    }

  } catch (err) {
    console.error(err);
    return api.sendMessage(`❌ Error: ${err.message || err}`, threadID);
  }
};
