const axios = require("axios");

module.exports.config = {
  name: "comment",
  version: "2.0.0",
  permission: 2,
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "Comment on a Facebook post (supports share links)",
  commandCategory: "facebook",
  usages: "!comment <post link or postID> <text>",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {

  if (!args[0])
    return api.sendMessage("⚠️ Give Post Link or Post ID.\nExample: !𝗰𝗼𝗺𝗺𝗲𝗻𝘁 <𝗹𝗶𝗻𝗸> 𝗥𝗮𝗵𝗮𝘁 𝗮𝗺𝗮𝗿 𝗷𝗮𝗺𝗮𝗶", event.threadID, event.messageID);

  const input = args[0];
  let postID = input;

  // ================================
  // 🔰 AUTO EXTRACT POST ID SYSTEM 🔰
  // ================================
  async function extractPostID(url) {
    try {
      const { request } = await axios.get(url, { maxRedirects: 5 });

      // Final redirected URL
      const finalURL = request.res.responseUrl;

      // Case 1: fb.com/story.php?story_fbid=xxx&id=yyy
      let match = finalURL.match(/story_fbid=(\d+)/);
      if (match) return match[1];

      // Case 2: posts/<id>
      match = finalURL.match(/posts\/(\d+)/);
      if (match) return match[1];

      // Case 3: videos/<id>
      match = finalURL.match(/videos\/(\d+)/);
      if (match) return match[1];

      // Case 4: permalink/<id>
      match = finalURL.match(/permalink\/(\d+)/);
      if (match) return match[1];

      // Case 5: fbid=<id>
      match = finalURL.match(/fbid=(\d+)/);
      if (match) return match[1];

      // Case 6: photo.php?fbid=<id>
      match = finalURL.match(/\/(\d{10,})/);
      if (match) return match[1];

      return null;
    } catch (e) {
      console.log("Extract Error:", e);
      return null;
    }
  }

  // If input is URL → extract postID
  if (input.startsWith("http")) {
    postID = await extractPostID(input);

    if (!postID)
      return api.sendMessage("❌ 𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗲𝘅𝘁𝗿𝗮𝗰𝘁 𝗽𝗼𝘀𝘁 𝗜𝗗 𝗳𝗿𝗼𝗺 𝗹𝗶𝗻𝗸!", event.threadID, event.messageID);
  }

  const messageText = args.slice(1).join(" ") || "Hello!";

  const messageObj = {
    body: messageText,
    attachments: [],
    mentions: [],
    sticker: null,
    url: null
  };

  try {
    const result = await api.createCommentPost(messageObj, postID);

    return api.sendMessage(
      `✅𝐂𝐨𝐦𝐦𝐞𝐧𝐭 𝐩𝐨𝐬𝐭𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!\n🆔 𝐂𝐨𝐦𝐦𝐞𝐧𝐭 𝐈𝐃: ${result?.id}\n🔗𝐋𝐢𝐧𝐤: ${result?.url}`,
      event.threadID,
      event.messageID
    );

  } catch (err) {
    console.log(err);
    return api.sendMessage("❌𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗰𝗼𝗺𝗺𝗲𝗻𝘁!\n" + err, event.threadID, event.messageID);
  }
};
