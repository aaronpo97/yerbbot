require('colors');
const mongoose = require('mongoose');
const path = require('path');
const { licenseDisclaimer } = require('./miscUtil');

const registerGuild = require('./database/utils/registerGuild');
const unregisterGuild = require('./database/utils/unregisterGuild');

module.exports = async client => {
	licenseDisclaimer();

	try {
		client.registry
			.registerGroups([
				['moderation', 'Moderation commands'],
				['misc', 'Misc. commands'],
				['utility', 'Utility commands.'],
				['greetings', 'Greeting commands.'],
			])
			.registerDefaults()
			.registerCommandsIn(path.join(__dirname, 'commands'));

		const validStatusType = ['online', 'invisible', 'dnd', 'idle'];

		let status = process.argv[2];
		if (!validStatusType.includes(status)) status = 'online';
		client.user.setStatus(status);

		const mongoServerLink = process.argv[3] === 'dev' ? process.env.MONGO_SERVER_LINK_DEBUG : process.env.MONGO_SERVER_LINK;
		await mongoose.connect(mongoServerLink, { useNewUrlParser: true, useUnifiedTopology: true });

		console.log('MongoDB connection established. \n');
		console.log(`${client.user.tag.red} is now live. \n`);
		console.log(`Now connected to:`);
		client.guilds.cache.forEach(async guild => {
			console.log('=> ' + guild.name.yellow);

			if (process.argv[3] === 'dev') {
				// reset database connections on reboot (for debug purposes only)
				unregisterGuild(guild);
				registerGuild(guild);
				console.log(`Debug database entry for ${guild.name.red} has been reset. \n`);
			}
		});
		console.log(`\nStatus set to ${status == 'online' ? status.green : status.red}.\n`);
	} catch (error) {
		console.log('Something went wrong: ' + error.stack);
	}
};
