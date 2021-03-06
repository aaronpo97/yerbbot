const collectMessageContent = require('../../../utilities/collectMessageContent.js');
const getFilterPhrase = require('../utilities/getFilterPhrase');
const timeoutAbortMessage = require('../../../utilities/timeoutAbortMessage');

module.exports = async (message, queriedServerInfo) => {
	try {
		let ctr = 0;
		let max = 5;
		let exitLoop = false;

		let filterChannel = '';

		const questionConfirm = 'You selected: **[2]** Assign filter channel. Is that what you wanted? (yes/no)';
		const confirmFirstChoice = await collectMessageContent(message, questionConfirm);
		if (!confirmFirstChoice) return true; //abort function and bypass previous loop
		if (!(confirmFirstChoice === 'yes' || confirmFirstChoice === 'y')) return false; // return to menu and go back to original loop

		while (!exitLoop) {
			// QUESTION ONE
			const questionOne = 'Please choose a channel to be used for the filter chat.';
			filterChannel = await collectMessageContent(message, questionOne);
			if (!filterChannel) {
				message.channel.send('Command aborted.');
				return true;
			}

			// QUESTION TWO
			const questionTwo = `You chose: ${filterChannel}. Is that correct? (yes/no)`;
			const confirmation = await collectMessageContent(message, questionTwo);
			if (!confirmation) {
				message.channel.send('Command aborted.');
				return true;
			}
			if (confirmation === 'yes' || confirmation === 'y') {
				exitLoop = true;
			}
			if (ctr === max) {
				message.channel.send('Command aborted.');
				return true;
			}
			ctr++;
		}

		const filterPhrase = await getFilterPhrase(message);
		if (!filterPhrase) return true; // abort the command, bypass previous loop
		const filterChannelID = filterChannel.slice(2, -1);

		message.channel.send(`Great! The filter channel will be ${filterChannel}, with the filter phrase \`${filterPhrase}\``);
		queriedServerInfo.filterChannel = { filterChannelID, filterPhrase };
		await queriedServerInfo.save();
		return true;
	} catch (error) {
		message.channel.send('Error: ' + (error.message || 'Command aborted.'));
	}
};
