require('dotenv').config();

const { Client, GatewayIntentBits, Events } = require('discord.js');
const axios = require('axios');

if (!process.env.DISCORD_TOKEN) {
  console.error('Missing DISCORD_TOKEN in your .env file.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (content === '!ping') {
    await message.reply('Pong! 🏓');
    return;
  }

  if (content === '!help') {
    await message.reply('Available commands:\n!ping\n!help\n!trades');
    return;
  }

  if (content === '!trades') {
    try {
      // Convert Google Sheets URL to CSV export URL
      const sheetUrl = 'https://docs.google.com/spreadsheets/d/1xN4UysnBq7mWPf3PXIhU7XGdefS09newvPhBqAUzR8U/export?format=csv&gid=465324115';
      
      const response = await axios.get(sheetUrl);
      const csvData = response.data;
      
      // Proper CSV parsing function that handles quoted values
      function parseCSV(csvString) {
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let insideQuotes = false;
        
        for (let i = 0; i < csvString.length; i++) {
          const char = csvString[i];
          const nextChar = csvString[i + 1];
          
          if (char === '"') {
            if (insideQuotes && nextChar === '"') {
              currentCell += '"';
              i++;
            } else {
              insideQuotes = !insideQuotes;
            }
          } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = '';
          } else if ((char === '\n' || char === '\r') && !insideQuotes) {
            if (currentCell || currentRow.length > 0) {
              currentRow.push(currentCell.trim());
              if (currentRow.some(cell => cell)) {
                rows.push(currentRow);
              }
              currentRow = [];
              currentCell = '';
            }
            if (char === '\r' && nextChar === '\n') {
              i++;
            }
          } else {
            currentCell += char;
          }
        }
        
        if (currentCell || currentRow.length > 0) {
          currentRow.push(currentCell.trim());
          if (currentRow.some(cell => cell)) {
            rows.push(currentRow);
          }
        }
        
        return rows;
      }
      
      // Parse CSV data
      const rows = parseCSV(csvData);
      
      if (rows.length < 2) {
        await message.reply('No trades data found.');
        return;
      }
      
      // Get header row
      const headerRow = rows[0];
      
      // Find the row where column A contains "Current"
      let currentRowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        const columnAValue = rows[i][0]?.toLowerCase() || '';
        if (columnAValue.includes('current')) {
          currentRowIndex = i;
          break;
        }
      }
      
      if (currentRowIndex === -1) {
        await message.reply('No current trade found (no "Current" marker in column A).');
        return;
      }
      
      // Get the current trade row
      const dataRow = rows[currentRowIndex];
      
      // Format nicely for Discord
      let formattedOutput = '**📊 Current Trade to 1 million out of 66 trades:**\n\n';
      
      for (let i = 1; i < headerRow.length; i++) {
        const header = headerRow[i] ;
        const value = dataRow[i] || '';
        
        // Skip empty columns at the end
        if (value === '' && i > 10) {
          continue;
        }

        if (value) {
          formattedOutput += `**${header}:** ${value}\n`;
        }
        
      }
      
      await message.reply(formattedOutput);
    } catch (error) {
      console.error('Error fetching trades data:', error);
      await message.reply('Error loading trades data. Please try again later.');
    }
    return;
  }
});

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error('Failed to log in:', error);
  process.exit(1);
});
