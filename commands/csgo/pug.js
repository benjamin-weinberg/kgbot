const discord = require ('discord.js');
const settings = require('../../settings.json');   										// THIS FILE NEEDS TO BE IN THE COMMANDS FOLDER!!!!!!!

const maxPlayers = 10;

module.exports = {
	name: 'pug',                  	 									        		// Command name (same as the file.js name)
	description: 'All commands related commands',										// info that gets pulled by the help command for a description
	aliases: [''],  							                        				// Optional saiases for the command
	usage: '<command> [perams]',                										// For help command or if command was sent wrong
	requiredRoles: [''],																// an array of role names that are required to run the command or (false || ['']) to disable
	cooldown: 0.1,                            											// Optional Cooldown Between Uses (defaults to 3 seconds if none set)
    args: true,                               											// true/false are there any args for this command?
	guildOnly: true,                           											// true/false should it only be used in guild channels and not in PM's
	ownerOnly: false,																	// should this command be only used by the bot owner (3pic_Ozone)
    hidden: false,                                                                      // should this command be hidden from the help menu
	disabled: false,																	// should this command be available to be used
	async execute(message, args, connection)         									// Function Goes Here
	{
        if (message.channel.name != "mute-me-bot-spam" && message.channel.name != "mute-me-bot-commands" &&
            message.channel.name != "mute-bot-testing" && message.channel.name != "csgo-pug-coordinators-room" &&
            message.channel.name != "mute-me-bot-spam" && message.channel.name != "csgo-mod-room" && 
            message.channel.name != "looking-for-pug")
                return message.reply("Please use a proper channel for `" + settings.prefix + "pug` commands");
        if (args[0] == "join" || args[0] == "add")
        {
            var target = message.author;
            if ((message.member.roles.exists("name", "CSGO PUG Coordinator") || message.member.roles.exists("name", "Moderator") || message.member.roles.exists("name", "Mod Leader") || message.member.roles.exists("name", "Officer") || message.member.roles.exists("name", "Clan Leader") || message.member.roles.exists("name", "Technician")))
            {
                if (message.mentions.users.first())
                {
                    target = message.mentions.users.first();
                }    
            }

            if(message.client.pug.find("id", target.id)) message.channel.send( target + " has already been added to the PUG queue!");
            else 
            {
                message.client.pug.set(target.id, target);
                message.channel.send(target + " has been added to the PUG queue!");
                if (message.channel.name != "csgo-pug-coordinator-room") message.guild.channels.find("name", "csgo-pug-coordinator-room" ).send(target + " has joined the PUG queue!");
            }

            listPUGUsers(message,true);
        }
        else if(args[0] == "leave")
        { 
            var players = new discord.Collection();
            for (player of message.client.pug.values())
            {
                if (player != message.author)
                {
                    players.set(player.id, player);
                } 
            } 
            delete message.client.pug;
            message.client.pug = players;
            delete players;
            message.channel.send("Removed " + message.author + " from the PUG queue!");
            if (message.channel.name != "csgo-pug-coordinator-room") message.guild.channels.find("name", "csgo-pug-coordinator-room" ).send(message.author + " left the PUG queue!");

            listPUGUsers(message, false);
        }
        else if(args[0] == "remove" && (message.member.roles.exists("name", "CSGO PUG Coordinator") || message.member.roles.exists("name", "Moderator") || message.member.roles.exists("name", "Mod Leader") || message.member.roles.exists("name", "Officer") || message.member.roles.exists("name", "Clan Leader") || message.member.roles.exists("name", "Technician")))
        {
            if (args[1] == "all")
            {
                delete message.client.pug;
                message.client.pug = new discord.Collection();
                message.reply("Removed all users from the queue!"); 
                message.guild.channels.find("name", "csgo-pug-coordinator-room" ).send("Removed ALL from the PUG queue!");
            }
            else if (message.mentions.users.first())
            {
                var players = new discord.Collection();
                for (user of message.client.pug.values())
                {
                    if (user != message.mentions.users.first())
                    {
                        players.set(user.id, user);
                    } 
                } 
                delete message.client.pug;
                message.client.pug = players;
                delete players;
                message.reply("Removed " + message.mentions.users.first() + " from the PUG queue!")
                if (message.channel.name != "csgo-pug-coordinator-room") message.guild.channels.find("name", "csgo-pug-coordinator-room" ).send("Removed " + message.mentions.users.first() + " from the PUG queue!");

                listPUGUsers(message, true);
            }
        }
        else if(args[0] == "queue" || args[0] == "q" || args[0] == "list")
        {
            listPUGUsers(message, false);
        }
        else if(args[0] == "ip")
        {
            message.channel.send("KG Server 1: \n ```IP: 185.140.120.48:27015 \nPassword: 'kgpug1' ```");
        }
        else if(args[0] == "start" && (message.member.roles.exists("name", "CSGO PUG Coordinator") || message.member.roles.exists("name", "Moderator") || message.member.roles.exists("name", "Mod Leader") || message.member.roles.exists("name", "Officer") || message.member.roles.exists("name", "Clan Leader") || message.member.roles.exists("name", "Technician")))
        {   
            for (user of message.client.pug.values())
            {
                var num = 0;
                if (num < maxPlayers)
                {
                        user.send("A PUG is ready to play! Please join the looking for PUG voice room to start! \n \n Server info for KG Server 1 \n ```IP: 185.140.120.48:27015 \nPassword: 'kgpug1' ```")
                            .catch(error => {});
                        num++;
                }
            }
            message.guild.channels.find("name", "looking-for-pug").send("A game has been started! Check your PM's for more information!")
            listPUGUsers(message, false);
        }
        else return;
	},
};


async function listPUGUsers(message, alert)
{
    var users = 0;        
    var messageToSend = ""
    for (user of message.client.pug.values())
    {
        if(users == maxPlayers)
        {
            messageToSend += "------------- Wait list --------------\n";
        }
        users++;
        messageToSend += (user + "\n");
    }
    const embed = new discord.RichEmbed()
        .setColor('#FF0000')
        .setTitle('__Users in PUG queue:__  ' + users + "/" + maxPlayers)
        .setAuthor(message.guild.name, message.guild.iconURL)
        .setTimestamp()
        .setFooter('If you would like to join a PUG, type  ' + settings.prefix + 'pug join ')
        .setDescription(messageToSend);
    message.channel.send(embed);

    if(users >= maxPlayers && alert)
    {
        message.guild.channels.find("name", "csgo-pug-coordinator-room" ).send("There are at least "+ maxPlayers +" people ready for a PUG! " + message.guild.roles.find("name", "CSGO PUG Coordinator"),embed);
    }

    return users;
}