require("dotenv").config();

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
const fnc = require("./fnc.js");
const link = s_link.main;
const fetch = require("node-fetch");

//システム起動メッセージ
client.on("ready", () => {
  console.log("起動完了");
});

client.on("messageCreate", async (message) => {
  //BOTなら終了
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

  //削除
  if (page_type === "2") {
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
                name: `${message.author.displayName}`,
                icon_url: `${message.author.avatarURL()}`,
              },
              title: "(*´•nn•`*)ﾋﾐﾂ",
              footer: {
                text: `byロバの耳`,
              },
            },
          ],
        });
      }, 5000);
      return;
    }
  }
  // 翻訳機能開始
  if (page_type === "1") {
    if (message.channel.id === access_page) {
      //絵文字削除
      const regEmoji = new RegExp(
        /[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/,
        "g",
      );
      const removeEmoji = (input) =>
        // 絵文字を空文字('')に置き換える
        input.replace(regEmoji, "");
      var molding = removeEmoji(message.content);
      //文字整形
      var molding = molding.replace(/<[^>]*>/g, " ");
      const msg = molding.replace(/　/g, " ");
      const linkmsg = URL.canParse(msg);
      //HTTPリンクの場合なら停止
      if (linkmsg) {
        return;
      }
      //翻訳言語
      const target1 = "en";
      const target2 = "zh-TW";
      const target3 = "ja";

      //短文を排除する
      const len_msg = msg.length;
      if (len_msg >= 2) {
        //ひらがな、カタカナが含まれているかの判定 true false req_font
        var reg_hira = /[\u{3041}-\u{3093}\u{30A1}-\u{30F6}]/mu;
        var req_font = reg_hira.test(msg);
        var lets = "0";
        if (req_font === false) {
          var trmsg1 = await fetch(
            `https://script.google.com/macros/s/AKfycbwMyBX2bsQk_b6KBzlTpspC_78DdZAkkeeLIblLUF192HAVRd3-s0XPQXkFcO30LbXWwQ/exec?text=${msg}&source=&target=${target3}`,
          ).then((res) => res.text());
          var flag1 = ":flag_jp:";
          var lets = "1";
        }
        var trmsg2 = await fetch(
          `https://script.google.com/macros/s/AKfycbwMyBX2bsQk_b6KBzlTpspC_78DdZAkkeeLIblLUF192HAVRd3-s0XPQXkFcO30LbXWwQ/exec?text=${msg}&source=&target=${target1}`,
        ).then((res) => res.text());
        var flag2 = ":flag_um:";
        if (trmsg2 === msg || req_font === true) {
          var trmsg3 = await fetch(
            `https://script.google.com/macros/s/AKfycbwMyBX2bsQk_b6KBzlTpspC_78DdZAkkeeLIblLUF192HAVRd3-s0XPQXkFcO30LbXWwQ/exec?text=${msg}&source=&target=${target2}`,
          ).then((res) => res.text());
          var flag3 = ":flag_tw:";
          if (lets === "0") {
            var trmsg1 = trmsg3;
            var flag1 = flag3;
          } else {
            var trmsg2 = trmsg3;
            var flag2 = flag3;
          }
        }

        //返し値がエラーなら戻す
        if (trmsg1 === "[リンク省略]") {
          return;
        }
        if (trmsg1 === "" || trmsg1 === "undefined") {
          return;
        }
        if (trmsg2 === "[リンク省略]") {
          return;
        }
        if (trmsg2 === "" || trmsg2 === "undefined") {
          return;
        }
        //メッセージ送信構成
        message.channel.send({
          embeds: [
            {
              author: {
                name: `${message.author.displayName}`,
                icon_url: `${message.author.avatarURL()}`,
              },
              fields: [
                {
                  name: `${flag1}`,
                  value: `${trmsg1}`,
                },
                {
                  name: `${flag2}`,
                  value: `${trmsg2}`,
                },
              ],
            },
          ],
        });
      } else {
        ///message.channel.send("文字数が短すぎて翻訳出来ませんでした。");
      }
    }
  }
});

//認証
if (process.env.DISCORD_DEF_KEY == "undefined") {
  console.log("キーが確認出来ません。");
  return;
}
client.login(disckey);