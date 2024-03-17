import { Message } from 'whatsapp-web.js';

import helpHandler from '../handlers/help';
import stickerHandler from '../handlers/sticker';
import goErrorHandler from '../utils/goErrHandler';
import parseOptions from '../utils/parseOptions';

const messageListener = async (message: Message) => {
  // get contact info
  const { data: contact, error } = await goErrorHandler(() =>
    message.getContact()
  );
  if (!contact) {
    message.reply('Terjadi kesalahan pada saat mendapatkan info kontak');
    return console.error('Error when getting contact.', error);
  }

  // stop the listener if message is from a status or from a group
  if (message.isStatus || contact.isGroup) return;

  // parse command and options
  const [command, ...rest] = message.body.split(' ').map((cmd) => cmd.trim());
  const options = rest
    .join(' ')
    .replaceAll(' name', '|name')
    .replaceAll(' author', '|author')
    .split('|');
  const { stickerName, stickerAuthor } = parseOptions(options);

  // handle help
  if (command.toLowerCase().includes('!help')) {
    return helpHandler(message);
  }

  // handle sticker
  if (['!sticker', '!stiker'].includes(command) && message.type === 'image') {
    await stickerHandler({
      message,
      phoneNumber: contact.id.user,
      stickerName,
      stickerAuthor,
    });

    return;
  } else if (['sticker', 'stiker'].some(keyword => command.toLowerCase().includes(keyword))) {
    return message.reply('Gambarnya mana?');
  }

};

export default messageListener;
