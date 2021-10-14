// Require the necessary discord.js classes
const { Client, Intents, WebhookClient, MessageEmbed } = require('discord.js');
const { token, w1url, w2url } = require('./config/config.json');
const { groupadd, groupclear, battlecommand, healthword, shieldword  } = require('./config/configmain.json');
const csv = require('fast-csv');
const fs = require('fs')

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });


// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on("messageCreate", message  => {
    if (message.author.bot) return false;
    if (message.content.startsWith(`${groupadd} `)){
        const shipname = message.content.replace(`${groupadd} `, "");
        shipnames = shipname.split(", ");
        b = 0;
        while(b <= shipnames.length-1){
            try {
                if(b != shipnames.length-1){
                    fs.appendFileSync(`./users/${message.author.id}.txt`, shipnames[b] + '\n', {flag: 'a+'})
                }
                else{
                    fs.appendFileSync(`./users/${message.author.id}.txt`, shipnames[b], {flag: 'a+'})
                }
              } catch (err) {
                console.error(err)
              }
              b+=1
        }
        message.channel.send(`Ships added to fleet.`);
    }
    if (message.content.startsWith(`${groupclear}`)){
        fs.truncate(`./users/${message.author.id}.txt`, 0, function() {
            message.channel.send(`Group has been cleared.`);
        });
    }
    if (message.content.startsWith(`!restart`)){
        restart(client, message.channel);
    }

    if (message.content.startsWith(`${battlecommand} `)){
        const channel = message.channelId;
        const P2 = message.mentions.users.first();
        const PlayerTwo = P2.username;
        const webhookp1 = new WebhookClient({ url: w1url });
        const webhookp2 = new WebhookClient({ url: w2url });
        webhookp1.edit({
            name: `${message.author.username}'s Battle Companion`,
            avatar: message.author.avatarURL()
        })
        webhookp2.edit({
            name: `${PlayerTwo}'s Battle Companion`,
            avatar: P2.avatarURL()
        })
        //webhookp2.send(`I am your companion for this battle, any information regarding your turns will be displayed through me!`);
        const p1read = fs.readFileSync(`./users/${message.author.id}.txt`, {encoding:'utf8', flag:'r'})
        p1names = p1read.split("\n")
        var hullp1 = [];
        var shieldp1 = [];
        for(b in p1names){
                const p1health = fs.readFileSync(`./stats/${p1names[b]}.csv`, {encoding:'utf8', flag:'r'})
                health = p1health.split("\r\n")
                for(c in health){
                    if(health[c].includes(healthword)){
                    hullp1.push(health[c].replaceAll(`${healthword} `, '').replaceAll(",", "").replaceAll('"', ''))
                }
                // Remove this code if the rp has no shields.
                    if(health[c].includes(shieldword)){
                        shieldp1.push(health[c].replaceAll(`${shieldword} `, '').replaceAll(",", "").replaceAll('"', ''))
                }
                // Stop removing past here.
                }
        }
            const shipembedp1 = new MessageEmbed()
	.setColor('#0099ff')
    .setDescription(`${message.author.username}'s Group`)
    a = 0;
    if(p1names.length != 0){
        while(a <= p1names.length-1){
            shipembedp1.addField(`${p1names[a]}`, `Hull: ${hullp1[a]} \n Shields: ${shieldp1[a]}`, true);
            a+=1;
        };
        webhookp1.send({ embeds: [shipembedp1] });
    }

        }
    });

function restart(client, channel){
    client.destroy();
    client.login(token);
    channel.send("Restarted!")
}



// Login to Discord with your client's token
client.login(token);