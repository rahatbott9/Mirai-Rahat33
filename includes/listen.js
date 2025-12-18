module.exports = function ({ api, models }) {
  const fs = require("fs");
  const moment = require("moment-timezone");
  const axios = require("axios");

  const Users = require("./controllers/users")({ models, api });
  const Threads = require("./controllers/threads")({ models, api });
  const Currencies = require("./controllers/currencies")({ models });
  const logger = require("../utils/log.js");
  const config = require("./../config.json");

  ////////////////////////////////////////////
  //=== LOAD DATABASE ENVIRONMENT =========//
  (async function () {
    try {
      logger("[DATABASE] Loading environment...");
      let threads = await Threads.getAll(),
          users = await Users.getAll(['userID', 'name', 'data']),
          currencies = await Currencies.getAll(['userID']);

      for (const data of threads) {
        const idThread = String(data.threadID);
        global.data.allThreadID.push(idThread);
        global.data.threadData.set(idThread, data.data || {});
        global.data.threadInfo.set(idThread, data.threadInfo || {});
      }

      for (const dataU of users) {
        const idUsers = String(dataU.userID);
        global.data.allUserID.push(idUsers);
        if (dataU.name) global.data.userName.set(idUsers, dataU.name);
      }

      for (const dataC of currencies) global.data.allCurrenciesID.push(String(dataC.userID));

      logger("[DATABASE] Loaded successfully.");
    } catch (error) {
      logger("[DATABASE] Failed to load environment: " + error, "error");
    }
  })();

  ////////////////////////////////////////////
  //=== TOP TƯƠNG TÁC NGÀY/ TUẦN =========//
  const checkttDataPath = __dirname + '/../modules/commands/tt/';
  let day = moment.tz("Asia/Ho_Chi_Minh").day();

  setInterval(async () => {
    const day_now = moment.tz("Asia/Ho_Chi_Minh").day();
    if (day !== day_now) {
      day = day_now;
      const checkttData = fs.readdirSync(checkttDataPath);
      for (const checkttFile of checkttData) {
        const checktt = JSON.parse(fs.readFileSync(checkttDataPath + checkttFile));
        let storage = [];

        for (const item of checktt.day) {
          const userName = await Users.getNameUser(item.id) || 'Facebook User';
          storage.push({ ...item, name: userName });
        }

        storage.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
        const timechecktt = moment.tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY || HH:mm:ss');

        let checkttBody = '[ TOP TƯƠNG TÁC NGÀY ]\n────────────────────\n📝 Top 10 người tương tác nhiều nhất hôm qua:\n\n';
        storage.slice(0, 10).forEach((item, idx) => {
          checkttBody += `${idx + 1}. ${item.name} - 💬 ${item.count} tin nhắn\n`;
        });

        checkttBody += `────────────────────\n💬 Tổng tin nhắn: ${storage.reduce((a, b) => a + b.count, 0)}\n⏰ Time: ${timechecktt}\n`;

        api.sendMessage(checkttBody, checkttFile.replace('.json', ''), err => err && console.log(err));

        // Reset count
        checktt.day.forEach(e => e.count = 0);
        checktt.time = day_now;
        fs.writeFileSync(checkttDataPath + checkttFile, JSON.stringify(checktt, null, 4));

        // Nếu là thứ 2, reset tuần
        if (day_now === 1) {
          let weekStorage = [];
          for (const item of checktt.week) {
            const userName = await Users.getNameUser(item.id) || 'Facebook User';
            weekStorage.push({ ...item, name: userName });
          }
          weekStorage.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

          let weekBody = '[ TOP TƯƠNG TÁC TUẦN ]\n────────────────────\n📝 Top 10 người tương tác nhiều nhất tuần qua:\n\n';
          weekStorage.slice(0, 10).forEach((item, idx) => {
            weekBody += `${idx + 1}. ${item.name} - 💬 ${item.count} tin nhắn\n`;
          });

          const tctt = moment.tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY || HH:mm:ss');
          weekBody += `────────────────────\n⏰ Time: ${tctt}\n`;
          api.sendMessage(weekBody, checkttFile.replace('.json', ''), err => err && console.log(err));

          checktt.week.forEach(e => e.count = 0);
          fs.writeFileSync(checkttDataPath + checkttFile, JSON.stringify(checktt, null, 4));
        }
      }
    }
  }, 1000 * 10);

  ////////////////////////////////////////////
  //=== CHECK DATLICH EVENTS =========//
  const datlichPath = __dirname + "/../modules/commands/data/datlich.json";
  const tenMinutes = 10 * 60 * 1000;

  const checkTime = async (time) => {
    time = time.map(t => parseInt(String(t).trim()));
    let yr = time[2] - 1970;
    let yearToMS = yr * 365 * 24 * 60 * 60 * 1000;
    yearToMS += Math.floor((yr - 2) / 4) * 24 * 60 * 60 * 1000;

    const monthToMSObj = {1:31,2:28,3:31,4:30,5:31,6:30,7:31,8:31,9:30,10:31,11:30,12:31};
    let monthToMS = 0;
    for (let i = 1; i < time[1]; i++) monthToMS += monthToMSObj[i] * 24*60*60*1000;
    if (time[2] % 4 === 0) monthToMS += 24*60*60*1000;

    const dayToMS = time[0] * 24*60*60*1000;
    const hourToMS = time[3] * 60*60*1000;
    const minuteToMS = time[4] * 60*1000;
    const secondToMS = time[5] * 1000;
    return yearToMS + monthToMS + dayToMS + hourToMS + minuteToMS + secondToMS - 24*60*60*1000;
  };

  const checkAndExecuteEvent = async () => {
    if (!fs.existsSync(datlichPath)) fs.writeFileSync(datlichPath, JSON.stringify({}, null, 4));
    const data = JSON.parse(fs.readFileSync(datlichPath));
    const timeVN = moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY_HH:mm:ss').split(/[/_:]/);

    const vnMS = await checkTime(timeVN);

    for (const boxID in data) {
      for (const e of Object.keys(data[boxID])) {
        let getTimeMS = await checkTime(data[boxID][e].split("_"));
        if (getTimeMS < vnMS) {
          // Xử lý sự kiện
          // ... (giữ nguyên xử lý gửi message, attachment)
        }
      }
    }
  };

  setInterval(checkAndExecuteEvent, tenMinutes / 10);

  ////////////////////////////////////////////
  //=== MAIN EVENT HANDLER =========//
  return async (event) => {
    const { type, threadID, author } = event;

    // Chỉ giữ lại xử lý command, reply, reaction, event
    switch(type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        require("./handle/handleCreateDatabase")({ event, Users, Threads, Currencies });
        require("./handle/handleCommand")({ event });
        require("./handle/handleReply")({ event });
        require("./handle/handleCommandEvent")({ event });
        break;

      case "message_reaction":
        require("./handle/handleReaction")({ event });
        break;

      default:
        require("./handle/handleEvent")({ event });
        require("./handle/handleRefresh")({ event });
        break;
    }
  };
};
