const irc = require("irc");
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

    if(message.startsWith("!tl", "!!timeplayed")){
        correctname = await getMcoAPI("getcorrectname", args[1]);
        hourslogged1 = await getMcoAPI("gettimeonline", correctname);
        hourslogged = Math.floor(hourslogged1 / 3600);
        client.say(to, args[1] + " has logged " + hourslogged + " hours on minecraftonline.com");
        return;
    }
} catch(err) {
    console.error(err);
    client.say(to, "An error occured! (Request may have timed out) Maybe try again?");
    return;
}
});
