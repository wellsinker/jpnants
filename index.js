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
const link = s_link.main;
const fetch = require("node-fetch");

//システム起動メッセージ
client.on("ready", () => {
  console.log("起動完了");
});
//-------------コメント受信開始ここから
client.on("messageCreate", async (message) => {
    console.log(message.content);
  return;
  //BOTなら終了
  if (message.author.bot) return;
  //チャンネルキーの取得
  var result_ch = link.ch_id.ch.indexOf(message.channel.id);
  var result_del = link.ch_id.del.indexOf(message.channel.id);
  var result_hl = link.ch_id.hl.indexOf(message.channel.id);
  const page_ch = link.ch_id.ch[result_ch];
  const page_del = link.ch_id.del[result_del];
  const page_hl = link.ch_id.hl[result_hl];
  var page_type = null;
  if (result_ch >= 0) {
    page_type = "1";
    //短文を排除する
    if (message.content.length < 2) {
      console.log("短文翻訳中止");
      return;
    }
  }
  if (result_del >= 0) {
    //削除機能
    page_type = "2";
  }
  if (result_hl >= 0) {
    //HELLO機能
    page_type = "3";
  }
  if (page_type === null) {
    console.log("PAGEタイプ取得エラー");
    return;
  }
  //-------------HELLO機能ここから
  if (page_type === "3") {
    if (message.channel.id === page_hl) {
      message.channel.send(
        "参加を確認しました。ニックネームに現在のアライアンス名を追加してください。追加方法はチャンネル名（基本ルール）を見てください。権限付与までは時間がかかる可能性がありますので、暫くお待ちください。権限が付与されるまでは、閲覧が出来ませんので、ご了承ください。\n我已確認參加。請將您目前的聯盟名稱新增到您的暱稱中。新增方法請參閱頻道名稱（基本規則）。授予權限可能需要一些時間，請耐心等待。請注意，在獲得許可之前，您將無法查看網站。\nI have confirmed my participation. Please add your current alliance name to your nickname. Please see Channel Name (Basic Rules) for how to add. It may take some time to be granted permissions, so please be patient. Please note that you will not be able to view the site until permission is granted. \n<@948164670580215819>",
      );
      return;
    }
  }
  //-------------削除機能ここから
  if (page_type === "2") {
    if (message.channel.id === page_del) {
      //削除前にバックアップ
      client.channels.cache.get(link.ch_id.ter[0]).send({
        embeds: [
          {
            author: {
              name: `${message.author.displayName}`,
              icon_url: `${message.author.avatarURL()}`,
            },
            title: message.content,
            footer: {
              text: `backup`,
            },
          },
        ],
      });
      const messages = await message.channel.messages.fetch({ limit: 20 });
      // ボット以外が送信したメッセージを抽出
      const filtered = messages.filter((message) => !message.author.bot);
      setTimeout(() => {
        // それらのメッセージを一括削除
        message.channel.bulkDelete(filtered);

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
  //-------------翻訳機能ここから
  if (page_type === "1") {
    if (message.channel.id === page_ch) {
      //翻訳言語
      const target1 = "en";
      const target2 = "zh-TW";
      const target3 = "ja";
      //絵文字削除
      const regEmoji = new RegExp(
        /[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/,
        "g",
      );
      const removeEmoji = (input) =>
        // 絵文字を空文字('')に置き換える
        input.replace(regEmoji, "");
      var molding = removeEmoji(message.content);
      var molding = molding.replace(/<@[^>]*>/g, " ");
      var molding = molding.replace("@everyone", " ");
      var molding = molding.replace(":", " ");
      const msg = molding.replace(/　/g, " ");
      const linkmsg = URL.canParse(msg);
      //HTTPリンクの場合なら停止
      if (linkmsg) {
        console.log("internet HTTP構文 err");
        return;
      }
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
      }
      //出力MSGのセット
      if (lets === "0") {
        var trmsg1 = trmsg3;
        var flag1 = flag3;
      } else {
        var trmsg2 = trmsg3;
        var flag2 = flag3;
      }

      //返し値がエラーなら戻す
      if (trmsg1 === "[リンク省略]") {
        console.log("google翻訳エラーA1");
        return;
      }
      if (trmsg1 === "" || trmsg1 === "undefined") {
        console.log("google翻訳エラーA2");
        return;
      }
      if (trmsg2 === "[リンク省略]") {
        console.log("google翻訳エラーB1");
        return;
      }
      if (trmsg2 === "" || trmsg2 === "undefined") {
        console.log("google翻訳エラーB2");
        return;
      }
      //通知チャンネルの場合にメイションタグをつける
      const req_ment = message.content.indexOf("<@");
      if (req_ment === -1) {
        if (message.channel.id === link.ch_id.mems[0]) {
          message.channel.send(link.ch_id.mems[1]);
        }
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
    }
  }
});

//認証
if (process.env.DISCORD_DEF_KEY == "undefined") {
  console.log("キーが確認出来ません。");
  return;
}
client.login(disckey);
