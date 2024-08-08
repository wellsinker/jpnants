require('dotenv').config();

const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

//認証キー
const disckey = process.env.DISCORD_MAIN_KEY;
const s_link = require("./s_links.json");
const link = s_link.main;
const fetch = require("node-fetch");

//システム起動メッセージ
client.on("ready", () => {
  console.log("起動完了");
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    //チャンネルキーの取得
    const ch_id_ch = link.ch_id.ch;
    const ch_id_del = link.ch_id.del;

    var result_ch = ch_id_ch.indexOf(message.channel.id);
    var page_type = "1";

    if (result_ch === -1) {
      var result_del = ch_id_del.indexOf(message.channel.id);
      var page_type = "2";
      if (result_del === -1) {
        return;
      }

    }
    const access_page = ch_id_ch[result_ch];
    const access_page_del = ch_id_del[result_del];

  //文字整形
  let repargs0 = message.content.replace(/<[^>]*>/g, " ");
  let repargs = repargs0.replace(/　/g, " ");
  let repargs2 = repargs.split(" ");
  const args = repargs2.filter((string) => {
    return string !== "";
  });

  //削除
  if(page_type === "2"){
    if (message.channel.id === access_page_del) {
      const messages = await message.channel.messages.fetch({ limit: 20 });
      // ボット以外が送信したメッセージを抽出
      const filtered = messages.filter((message) => !message.author.bot);
      setTimeout(() => {
        // それらのメッセージを一括削除
        message.channel.bulkDelete(filtered);
        //message.channel.send("(*´•nn•`*)ﾋﾐﾂ");
        message.channel.send({
          embeds: [
            {
              author: {
                name: `from : ${message.author.displayName}`,
              },
              title: "(*´•nn•`*)ﾋﾐﾂ",
              footer: {
                text: `to : 内緒です♪`,
              },
            },
          ],
        });
      }, 5000);
      return;
    }
  }
  if(page_type === "1"){
    if(message.channel.id === access_page){
      //翻訳言語
      const target = "en";
      const target2 = "zh-TW";
      //原文
      var msg = args[0];
      //HTTPリンクの場合なら停止
      const linkmsg = URL.canParse(msg);
      if (linkmsg) {
        //message.channel.send("URLでした");
        return;
      }
      var trmsg1 = await fetch(
        `https://script.google.com/macros/s/AKfycbwMyBX2bsQk_b6KBzlTpspC_78DdZAkkeeLIblLUF192HAVRd3-s0XPQXkFcO30LbXWwQ/exec?text=${msg}&source=&target=${target}`,
      ).then((res) => res.text());
      var trmsg2 = await fetch(
        `https://script.google.com/macros/s/AKfycbwMyBX2bsQk_b6KBzlTpspC_78DdZAkkeeLIblLUF192HAVRd3-s0XPQXkFcO30LbXWwQ/exec?text=${msg}&source=&target=${target2}`,
      ).then((res) => res.text());
      //返し値がエラーなら戻す
      if (trmsg1 === "[リンク省略]") {
        return;
      }
      if (trmsg1 === "") {
        return;
      }
      if (trmsg2 === "[リンク省略]") {
        return;
      }
      if (trmsg2 === "") {
        return;
      }
      //メッセージ送信
      message.channel.send({
        embeds: [
          {
            author: {
              name: `from : ${message.author.displayName}`,
            },

            title: msg,
            footer: {
              text: `to : ${trmsg1}\nto : ${trmsg2}`,
            },
          },
        ],
      });
    };
  }
});

//認証
if(process.env.DISCORD_DEF_KEY == 'undefined'){
  console.log("キーが確認出来ません。");
  return;
}
client.login(disckey);
