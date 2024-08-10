//翻訳文章の返り値の確認
function* check_trans(msg) {
    if (msg) {
      //message.channel.send("URLでした");
      return "1";
    }
    if (msg === "[リンク省略]") {
      return "1";
    }
    if (msg === "") {
      return "1";
    }
    return "2";
  }