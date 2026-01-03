module.exports.config = {
 name: "kickall",
 version: "1.0.0",
 hasPermssion: 2,
 credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
 description: "Remove all group members.",
 commandCategory: "box chat",
 usages: "",
 cooldowns: 5
};
module.exports.run = async function({ api, event, getText,args }) {
 const { participantIDs } = await api.getThreadInfo(event.threadID)
 function delay(ms) {
 return new Promise(resolve => setTimeout(resolve, ms));
 };
 const botID = api.getCurrentUserID();
 const listUserID = participantIDs.filter(ID => ID != botID);
 return api.getThreadInfo(event.threadID, (err, info) => {
 if (err) return api.sendMessage("» An error occurred.", event.threadID);
 if (!info.adminIDs.some(item => item.id == api.getCurrentUserID()))
 return api.sendMessage(`❌𝗡𝗲𝗲𝗱 𝗴𝗿𝗼𝘂𝗽 𝗮𝗱𝗺𝗶𝗻 𝗿𝗶𝗴𝗵𝘁𝘀.\n𝗣𝗹𝗲𝗮𝘀𝗲 𝗮𝗱𝗱 𝗮𝗻𝗱 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻.`, event.threadID, event.messageID);
 if (info.adminIDs.some(item => item.id == event.senderID)) {
 setTimeout(function() { api.removeUserFromGroup(botID, event.threadID) }, 300000);
 return api.sendMessage(`✅𝗦𝘁𝗮𝗿𝘁 𝗱𝗲𝗹𝗲𝘁𝗶𝗻𝗴 𝗮𝗹𝗹 𝗺𝗲𝗺𝗯𝗲𝗿𝘀. 𝗕𝘆𝗲 𝗲𝘃𝗲𝗿𝘆𝗼𝗻𝗲.`, event.threadID, async (error, info) => {
 for (let id in listUserID) {
 await new Promise(resolve => setTimeout(resolve, 1000));
 api.removeUserFromGroup(listUserID[id], event.threadID)
 }
 })
 } else return api.sendMessage('» Only group admins can use this command.', event.threadID, event.messageID);
 })
}
