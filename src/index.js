const express = require("express");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { writeFileSync } = require("fs");
require("dotenv").config();

let cache = require("./cache.json");
setInterval(() => writeFileSync(__dirname + "/cache.json", JSON.stringify(cache,null,4)), 10000);

main();
async function main() {
  const app = express();
  app.listen(80, () => console.log("server is running"));
  app.use(express.json());
  app.use(express.static(__dirname + "/public", { extensions: ["html"] }));

  const stringSession = new StringSession(process.env.SESSION);

  const client = new TelegramClient(stringSession, +process.env.API_ID, process.env.API_HASH);

  await client.start();
  const info = (await client.getMe()).toJSON();
  let dialogs;
  if (cache.length != 0) {
    dialogs = cache;
  } else {
    dialogs = await client.getDialogs();
    dialogs = dialogs.map((v) => {
      let { isUser, entity, name, id, message, isGroup, isChannel } = v;
      return { isUser, entity, name, id, message, isGroup, isChannel };
    });
    cache = dialogs;
  }

  app.get("/users", async (req, res) => {
    const dms = dialogs.filter((v) => {
      if (v.isUser && !v.entity.bot && v.name != "") {
        return true;
      } else {
        return false;
      }
    });

    const users = dms.map((v) => {
      return {
        ID: v.id,
        name: v.name,
        message: v.message.text || "media",
      };
    });
    res.send(users);
  });

  app.get("/bots", async (req, res) => {
    const dms = dialogs.filter((v) => {
      if (v.entity.bot) {
        return true;
      } else {
        return false;
      }
    });
    const bots = dms.map((v) => {
      return { ID: v.id, name: v.name, message: v.message.text || "media" };
    });

    res.send(bots);
  });

  app.get("/groups", async (req, res) => {
    const dms = dialogs.filter((v) => {
      if (v.isGroup) {
        return true;
      } else {
        return false;
      }
    });

    const groups = dms.map((v) => {
      return {
        ID: v.id,
        name: v.name,
        message: v.message.text || "media",
        sender: v.message.sender.firstName,
      };
    });

    res.send(groups);
  });

  app.get("/channels", async (req, res) => {
    const dms = dialogs.filter((v) => {
      if (v.isChannel && !v.isGroup) {
        return true;
      } else {
        return false;
      }
    });

    const channels = dms.map((v) => {
      return { ID: v.id, name: v.name, message: v.message.text };
    });

    res.send(channels);
  });

  app.get("/chat/:id", async (req, res) => {
    const messages = await client.getMessages(req.params.id, { limit: 50 });
    const response = messages.map((v) => {
      return { ID: v.id, sender: v.sender.firstName, message: v.message || "media" };
    });
    res.send(response);
  });

  app.post("/send", async (req, res) => {
    const { chatID, message } = req.body;
    console.log(message);
    await client.sendMessage(chatID, { message });
    res.send("done");
  });

  app.get("/profile", (req, res) => {
    res.send(info);
  });

  console.log("started");
}
