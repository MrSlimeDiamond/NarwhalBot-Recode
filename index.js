var ingameBot = false;

const mineflayer = require("mineflayer");
const irc = require("irc");
const NodeCache = require("node-cache");
const firstseen_cache = new NodeCache();
const err_cache = new NodeCache();
const request = require("request");
const cheerio = require("cheerio");
const util = require("util");
const tokens = require("./tokens.json");
const fs = require("fs");
const version = "2.1.3"
const client = new irc.Client('irc.esper.net', "NarwhalBot", {
    channels: ["#narwhalbot", "#minecraftonline"],
    userName: "narwhal",
    showErrors: true,
    realName: `NarwhalBot by SlimeDiamond | V ${version}`
});
const Discord = require("discord.js");
const discordClient = new Discord.Client();
var votes = true;
var ohai = parseInt(fs.readFileSync("ohai.txt", "utf8"));
if(ohai == NaN || ohai == undefined) {
    ohai = 0;
}

async function getMcoAPI(script, argument) { // Made by IconPippi
    let output;
    output = await new Promise((resolve, reject) => {
        request("https://minecraftonline.com/cgi-bin/" + script + "?" + argument, (error, response, html) => {
            let $ = cheerio.load(html.toString());
            if (!error)
                resolve($.text());
            else
                reject("Error occurred!");
        });

    });
    return output;
}

client.addListener('registered', function () {
    client.say('NickServ', 'identify ' + tokens.nickserv_pass);
});

client.addListener("message", async function (from, to, text, message) {

    const args = text.split(" ");
    try {
        if (text.startsWith("!randomplayer")) {
            let raw = await getMcoAPI("getplayerlist.sh");
            let list_commaless = raw.replace(/,/g, "");
            let list = list_commaless.split(" ");
            let random = Math.floor(Math.random() * list.length);
            let player = list[random];
            client.say(to, `A random player on minecraftonline.com is ${player}`);
        }
        if (text.startsWith("+ping")) {
            client.say(to, from + ": Pong!");
        }
        if (text.startsWith("+err")) {
            let latesterror = err_cache.get("latest");
            if (latesterror !== undefined) {
                output = latesterror.toString().split("\n")
                client.say(to, latesterror);
                return;
            } else {
                client.say(to, "No errors in cache for this session");
                return;
            }
        }
        if (text == "+version") {
            fs.readFile("./.git/refs/heads/master", "utf8", function read(error, data){
                let git_ver = data.replace(/\n/g, "");
                client.say(to, `NB version ${version} (git: ${git_ver})`);
            });
        }
        if (text.startsWith("!bansuntil")) {
            var bansraw = await getMcoAPI("getbancount.sh");
            var bans = parseInt(bansraw) - 1;
            var arg = parseInt(args[1]);
            if (arg < bans) {
                client.say(to, "Already surpassed that number.");
                return;
            } else {
                var num = arg - bans;
                client.say(to, "There are " + num + " bans until " + args[1] + " bans (currently " + bans + " bans)");
            }
        }

        if (text.startsWith("!tl") || text.startsWith("!!timeplayed") || text.startsWith("#!tl") || text.startsWith("#!!timeplayed") || text.startsWith("#!tp") || text.startsWith("!tp")) {
                if (text.startsWith("!tps")) return;
                if (text.startsWith("#")) {
                correctname = await getMcoAPI("getcorrectname", args[1]);
                hourslogged1 = await getMcoAPI("gettimeonline", correctname);
                hourslogged = Math.floor(hourslogged1 / 3600);
                client.say(to, "# " + args[1] + " has logged " + hourslogged + " hours on minecraftonline.com");
                return;
            }
            correctname = await getMcoAPI("getcorrectname", args[1]);
            hourslogged1 = await getMcoAPI("gettimeonline", correctname);
            hourslogged = Math.floor(hourslogged1 / 3600);
            client.say(to, args[1] + " has logged " + hourslogged + " hours on minecraftonline.com");
            return;
        }
        if (text.startsWith("!ls") || text.startsWith("!!lastseen") || text.startsWith("#!ls") || text.startsWith("#!!lastseen")) {
            correctname = await getMcoAPI("getcorrectname", args[1]);
            var time = await getMcoAPI("getlastseen_unix", correctname);
            console.log(time.toString());
            if (time.replace(/\n/g, '') == "INVALID" || time.replace(/\n/g, '') == "NOTFOUND") {
                client.say(to, "Unknown username.")
                return;
            } else if (time.replace(/\n/g, '') == "UNKNOWN") {
                client.say(to, "User's last seen date is unknown");
                return;
            }

            epochnum = parseInt(time);
            time1 = new Date(epochnum * 1000);
            timenow = new Date();

            var Difference_In_Time = timenow.getTime() - time1.getTime();

            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);


            ago = time1.toGMTString()
            if (text.startsWith("#")) {
                var stringToSay = "# " + correctname + "last logged into minecraftonline.com on " + time1.toGMTString() + ` (${Math.floor(Difference_In_Days)} days ago)`
                client.say(to, stringToSay.replace(/\n/g, ' '));
                return;
            }
            var stringToSay = correctname + "last logged into minecraftonline.com on " + time1.toGMTString() + ` (${Math.floor(Difference_In_Days)} days ago)`
            client.say(to, stringToSay.replace(/\n/g, ' '));
            return;
        }
        if (text.startsWith("!fs") || text.startsWith("!!firstseen") || text.startsWith("#!!firstseen") || text.startsWith("#!fs")) {
            correctname = await getMcoAPI("getcorrectname", args[1]);
            fsc = firstseen_cache.get(correctname)
            // console.log("CN: "+correctname);
            console.log(args[1])
            console.log(fsc);

            if (fsc == undefined) {

                var time = await getMcoAPI("getfirstseen_unix", correctname);
                console.log(time.toString());
                if (time.replace(/\n/g, '') == "INVALID" || time.replace(/\n/g, '') == "NOTFOUND") {
                    client.say(to, "Unknown username.")
                    return;
                } else if (time.replace(/\n/g, '') == "UNKNOWN") {
                    client.say(to, "User's first seen date is unknown");
                    return;
                }

                epochnum = parseInt(time);
                time1 = new Date(epochnum * 1000);
                timenow = new Date();

                var Difference_In_Time = timenow.getTime() - time1.getTime();

                var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

                ago = time1.toGMTString()

                //correctname = await getMcoAPI("getcorrectname", args);
                if (text.startsWith("#")) {
                    var stringToSay = "# " + correctname + "first logged into minecraftonline.com on " + time1.toGMTString() + ` (${Math.floor(Difference_In_Days)} days ago)`
                    client.say(to, stringToSay.replace(/\n/g, ' '));

                    firstseen_cache.set(correctname, epochnum);
                    client.say(to, "# Caching firstseen result for " + correctname);
                    return;
                }
                var stringToSay = correctname + "first logged into minecraftonline.com on " + time1.toGMTString() + ` (${Math.floor(Difference_In_Days)} days ago)`
                client.say(to, stringToSay.replace(/\n/g, ' '));

                firstseen_cache.set(correctname, epochnum);
                client.say(to, "Caching firstseen result for " + correctname);
                return;
            } else {
                time1 = new Date(fsc * 1000);
                timenow = new Date();

                var Difference_In_Time = timenow.getTime() - time1.getTime();

                var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

                ago = time1.toGMTString()

                //correctname = await getMcoAPI("getcorrectname", args);
                if (text.startsWith("#")) {
                    var stringToSay = "# " + correctname + "first logged into minecraftonline.com on " + time1.toGMTString() + ` (${Math.floor(Difference_In_Days)} days ago) (result from cache)`
                    client.say(to, stringToSay.replace(/\n/g, ' '));
                    return;
                }
                var stringToSay = correctname + "first logged into minecraftonline.com on " + time1.toGMTString() + ` (${Math.floor(Difference_In_Days)} days ago) (result from cache)`
                client.say(to, stringToSay.replace(/\n/g, ' '));
            }
            return;
        }
        if (text.toLowerCase().includes("ohai")) {
            if (from == "NarwhalBot") return;
            ohai++;
        }
        if (text == "!king") {
            client.say(to, "TheDemetri is the king of MCO!");
        }
        if (text == "!bancount" || text == "!bc") {
            var bancount = await getMcoAPI("getbancount.sh");
            str="MinecraftOnline.com has " + bancount + " bans!"
            client.say(to, str.replace(/\n/g, ""));
        }
        if (text == "!ohai") {
            client.say(to, "Ohai has been said " + ohai + " times")
        }
        if (text.startsWith("#+eval")) {

            if (!from == "SlimeDiamond") return;
            try {
                a = args.slice(1);
                const code = a.join(" ");
                // console.log(a);
                // console.log(code);
                var evaled = eval(code);
                const result = eval()
                if (typeof evaled !== "string") {
                    evaled = require("util").inspect(evaled);
                    client.say(to, "Input: " + code);
                    client.say("Output: " + evaled);
                    return;
                }
            } catch (err) {
                client.say(to, "# Input: " + a);
                client.say("Output(Error): " + evaled);
                return;
            }

        }

        if (text == "+giberror") {
            ok
        }
    } catch (err) {
        console.error(err);
        client.say(to, "An error occured! (Request may have timed out) Maybe try again?");
        err_cache.set("latest", err.toString());
        return;
    }
});

discordClient.on("message", function (message) {
    if (message.channel.id == "619518988237537310" && message.attachments.size > 0 && votes == true) {

        message.react("????");
        message.react("????");
        message.react("??????");
        return;
    }
    const args = message.content.split(' ').slice(1);

    if (message.content == "+react") {
        if (message.member.roles.cache.get("288051490772221954") || message.member.roles.cache.get("288053389835894788") || message.author.id == "323292144309633024") {
            if (votes == false) {
                votes = true
                message.channel.send("Turned #mco-memes voting system on!");
                return;
            }
            if (votes == true) {
                votes = false
                message.channel.send("Turned #mco-memes voting system off!");
                return;

            }
        } else {
            message.channel.send("You can't do that!");
            return;
        }
    }

});

if (ingameBot == true) {

const igb = mineflayer.createBot({
    host: tokens.serverip,
    username: tokens.mcname,
    password: tokens.mcpass,
    // port: 25565,                // only set if you need a port that isn't 25565
    // version: false,             // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
    // auth: 'mojang'              // only set if you need microsoft auth, then set this to 'microsoft'
  });
  igb.on("message", function(username, message) {
    console.log(message);
    if (username == igb.username) return;
    if (message.content = "!nbping") {
        igb.chat("Pong!");
    }
  });
}
process.once("SIGINT", function(SIGINT) {
    console.log("SIGINT");
    client.disconnect("recieved sigint");
    discordClient.destroy();
    let data = ohai.toString();
    fs.writeFile("ohai.txt", data, (err) => {
        if (err)
          console.log(err);
        else {
          console.log(fs.readFileSync("ohai.txt", "utf8"));
        }
    });
});
process.once("SIGTERM", function(SIGINT) {
    console.log("SIGTERM!!!");
    client.disconnect("caught sigterm, bot terminating...");
    discordClient.destroy();
    let data = ohai.toString();
    fs.writeFile("ohai.txt", data, (err) => {
        if (err)
          console.log(err);
        else {
          console.log(fs.readFileSync("ohai.txt", "utf8"));
        }
    });
});
discordClient.login(tokens.discordToken);
