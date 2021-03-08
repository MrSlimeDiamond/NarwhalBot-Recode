const irc = require("irc");
const NodeCache = require("node-cache");
const firstseen_cache = new NodeCache();
const request = require("request");
const cheerio = require("cheerio");
const client = new irc.Client('irc.esper.net', "NarwhalBot-recode", {
    channels: ["#narwhalbot"]
});

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


client.addListener("message", async function(from, to, message){

    const args = message.split(" ");
    try {
    if(message.startsWith("+ping")){
        client.say(to, from+": Pong!");
    }

    if(message.startsWith("!tl") || message.startsWith("!!timeplayed")){
        correctname = await getMcoAPI("getcorrectname", args[1]);
        hourslogged1 = await getMcoAPI("gettimeonline", correctname);
        hourslogged = Math.floor(hourslogged1 / 3600);
        client.say(to, args[1] + " has logged " + hourslogged + " hours on minecraftonline.com");
        return;
    }

    if(message.startsWith("!fs") || message.startsWith("!!firstseen")){
        correctname = await getMcoAPI("getcorrectname", args[1]);
        fsc = firstseen_cache.get(correctname)
        console.log("CN: "+correctname);
        console.log(args[1])
        console.log(fsc);

        if(fsc == undefined){

        var time = await getMcoAPI("getfirstseen_unix", correctname);
        console.log(time.toString());
        if(time.replace(/\n/g, '') == "INVALID" || time.replace(/\n/g, '') == "NOTFOUND"){
            client.say(to, "Unknown username.")
            return;
        } else if(time.replace(/\n/g, '') == "UNKNOWN"){
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
        var stringToSay = correctname+"first logged into minecraftonline.com on " + time1.toGMTString() + ` (${Math.floor(Difference_In_Days)} days ago)`
        client.say(to, stringToSay.replace(/\n/g, ' '));

        firstseen_cache.set(correctname, epochnum);
        client.say(to, "Caching firstseen result for "+correctname);
        return;
    }else{
        time1 = new Date(fsc * 1000);
        timenow = new Date();

        var Difference_In_Time = timenow.getTime() - time1.getTime();
   
        var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 

        ago = time1.toGMTString()

        //correctname = await getMcoAPI("getcorrectname", args);
        var stringToSay = correctname+"first logged into minecraftonline.com on " + time1.toGMTString() + ` (${Math.floor(Difference_In_Days)} days ago) (result from cache)`
        client.say(to, stringToSay.replace(/\n/g, ' '));
    }
        return;
    }
    if (message.startsWith("#+eval")) {

        if (!g.admin.includes(from)) return
        try {
            const code = args.join(" ");
            var evaled = eval(code);
            const result = eval()
            if (typeof evaled !== "string") {
                evaled = require("util").inspect(evaled);
                client.say(to, message.replace("+eval", "Input: ") + " Output: " + evaled);
            }
        } catch (err) {
            client.say(to, message.replace("+eval", "Input: ") + " Output: " + evaled);
        }

    }
} catch(err) {
    console.error(err);
    client.say(to, "An error occured! (Request may have timed out) Maybe try again?");
    return;
}
});
