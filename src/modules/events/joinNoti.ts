import * as fs from "fs";
import { join } from "path";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import { IPangolinEvent } from "src/types/type.pangolin-handle";

export default class NotiCommand {
  static config = {
    name: "joinNoti",
    version: "1.0.2",
    author: "Lợi",
    createdAt: "",
    description: {
      vi: "Thông báo khi có thành viên mới vào nhóm.",
      en: "Notify when someone joins the group.",
    },
    guide: {},
  };

  static message = {
    vi: {
      join: `Chào mừng $0 đã đến với $1 $2 là thành viên thứ $3 của nhóm.`,
      addBot: `Cảm ơn bạn đã thêm bot vào nhóm.\nSử dụng $0help để xem tất cả các lệnh!`,
    },
    en: {
      join: `Welcome $0 to $1 $2 are the $3 member of the group.`,
      addBot: `Thank you for add bot to this group.\nUse $0help to see all command!`,
    },
  };
  constructor(private client) {}
  run({
    api,
    event,
    client,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
  }: IPangolinEvent) {
    const GifPath = join(process.cwd(), "/src/db/data/join/join.gif");
    if (event.logMessageType != "log:subscribe") return;
    api.getThreadInfo(event.threadID, async (err, info) => {
      if (err) {
        console.error("Error fetching thread info:", err);
        return;
      }
      const arrPersonJoin = await event.logMessageData.addedParticipants.map(
        (item) => {
          return {
            tag: item.fullName,
            id: item.userFbId,
          };
        },
      );
      if (arrPersonJoin.some((item) => item.id == process.env.UID_BOT)) {
        return api.sendMessage(
          getLang("addBot", process.env.PREFIX),
          event.threadID,
        );
      } else {
        const nameUsers = arrPersonJoin.map((item) => {
          return item.tag;
        });
        function getNumberRank(number) {
          if (number == 1) return "first";
          if (number == 2) return "second";
          if (number == 3) return "third";
          if (number >= 4) return `${number}th`;
        }
        const msgBody = getLang(
          "join",
          nameUsers.length > 1
            ? process.env.LANGUAGE_CODE == "vi"
              ? nameUsers.join(" và ")
              : nameUsers.join(" and ")
            : nameUsers[0],
          info.threadName,
          nameUsers.length > 1
            ? process.env.LANGUAGE_CODE == "vi"
              ? nameUsers.length + "bạn"
              : "you"
            : process.env.LANGUAGE_CODE == "vi"
              ? " Bạn"
              : "You",
          getNumberRank(info.participantIDs.length),
        );
        api.sendMessage(
          {
            body: msgBody,
            mentions: arrPersonJoin,
            attachment: fs.createReadStream(GifPath),
          },
          event.threadID,
        );
      }
    });
  }
}
