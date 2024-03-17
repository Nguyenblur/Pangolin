export default class CheckttCommand {
  static config = {
    name: "checktt",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
    description: "",
  };

  constructor(private client) {}
  async run(api, event, client, args, UserData, ThreadData) {
    api.getThreadInfo(event.threadID, async (err, res) => {
      const users = res.participantIDs;
      const smg = await Promise.all(
        users.map(async (item) => {
          const res = await UserData.get(item);
          return { name: res.name, exp: res.exp };
        })
      );
      smg.sort((a, b) => b.exp - a.exp);
      let smgSorted = "Danh sách tương tác trong nhóm: \n";
      let i = 1;
      smg.forEach((user) => {
        smgSorted += `[${i}] ${user.name}: ${user.exp}\n`;
        i++;
      });
      api.sendMessage(`${smgSorted}`, event.threadID);
    });
  }
}