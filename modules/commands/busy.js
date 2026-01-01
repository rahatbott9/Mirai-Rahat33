module.exports.config = {
	name: "busy",
	version: "1.0.0",
	permissions: 1,
	credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
	description: "Turn on or off busy mode",
  	usages: "[reason]",
  	commandCategory: "utility",
  	cooldowns: 5
};

const busyPath = __dirname + '/bot/busy.json';
const fs = require('fs');

module.exports.onLoad = () => {
  if (!fs.existsSync(busyPath)) fs.writeFileSync(busyPath, JSON.stringify({}));
}

module.exports.handleEvent = async function({ api, event, Users }) {
    let busyData = JSON.parse(fs.readFileSync(busyPath));
    var { senderID, threadID, messageID, mentions } = event;
    if (senderID in busyData) {
        var info = busyData[senderID];
        delete busyData[senderID];
        fs.writeFileSync(busyPath, JSON.stringify(busyData, null, 4));
        return api.sendMessage(`『𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻』- বস অনলাইনে এসেছে🥰`, threadID, () => {
            if (info.tag.length == 0) api.sendMessage("『𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻』- বস অফলাইনে গেছে🫠", threadID);
            else {
                var msg = "";
                for (var i of info.tag) {
                    msg += `${i}\n`
                }
                api.sendMessage("『 𝐌𝐀𝐑𝐈𝐀 』 - Here’s the list of people who mentioned you while you were away 🎀:\n\n" + msg, threadID)
            }
        }, messageID);
    }

    if (!mentions || Object.keys(mentions).length == 0) return;
    
    for (const [ID, name] of Object.entries(mentions)) {
        if (ID in busyData) {
            var infoBusy = busyData[ID], mentioner = await Users.getNameUser(senderID), replaceName = event.body.replace(`${name}`, "");
            infoBusy.tag.push(`${mentioner}: ${replaceName == "" ? "just mentioned Master once" : replaceName}`)
            busyData[ID] = infoBusy;
            fs.writeFileSync(busyPath, JSON.stringify(busyData, null, 4));
            return api.sendMessage(`🎀─── [NOTICE] ───🎀\n\n${name.replace("@", "")} is currently busy${infoBusy.lido ? ` with reason: ${infoBusy.lido}.\n\n🎀───── •🌸• ─────🎀` : "."}`, threadID, messageID);
        }
    }
}

module.exports.run = async function({ api, event, args, Users }) {
	await new Promise(resolve => setTimeout(resolve, 1000));
    let busyData = JSON.parse(fs.readFileSync(busyPath));
    const { threadID, senderID, messageID, body } = event;
    var content = args.join(" ") || "";
    if (!(senderID in busyData)) {
        busyData[senderID] = {
            lido: content,
            tag: []
        }
        fs.writeFileSync(busyPath, JSON.stringify(busyData, null, 4));
        var msg = (content.length == 0) ? '[BOT CUTE] - Master just enabled busy mode without giving a reason 🐧' : `[BOT CUTE] - Master just enabled busy mode with reason 🐧: ${content}`;
        return api.sendMessage(msg, threadID, messageID);
    }
}
