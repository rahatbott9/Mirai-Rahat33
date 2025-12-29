module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "1.0.1",
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "Auto add user back if they leave (antiout system)"
};

module.exports.run = async ({ event, api, Threads, Users }) => {
  const threadData = await Threads.getData(event.threadID) || {};
  const data = threadData.data || {};

  // যদি antiout বন্ধ থাকে, তাহলে কিছু না করে রিটার্ন করবে
  if (data.antiout !== true) return;

  // বট নিজে ছাড়লে কিছু করবে না
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  // নাম খুঁজে বের করা
  const name = global.data.userName.get(event.logMessageData.leftParticipantFbId)
    || await Users.getNameUser(event.logMessageData.leftParticipantFbId);

  // নিজে ছাড়লে
  if (event.author == event.logMessageData.leftParticipantFbId) {
    api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error) => {
      if (error) {
        api.sendMessage(`${name} Sorry Rahat boss this parsion is undifind`, event.threadID);
      } else {
        api.sendMessage(`${name} Added you back।`, event.threadID);
      }
    });
  }
};
