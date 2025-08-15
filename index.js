// index.js - AutofarmBot full v3.x (Platform Android)

const { Client, Message } = require('discord.js-selfbot-v13');
const config = require('./config.json');

// Inisialisasi client
const client = new Client({
    checkUpdate: false, // matikan warning update
});

// Login bot
client.login(config.token);

// Helper class n dengan platform Android
class n {
    constructor(client) {
        this.client = client;
        this.platform = "android"; // set platform default ke Android
    }

    async someFunction() {
        console.log('Menjalankan someFunction dengan platform:', this.platform);
    }
}

// Fungsi klik tombol
async function clickButton(msg, rowIndex = 0, buttonIndex = 0) {
    try {
        if (!msg || !msg.components.length) return;

        const row = msg.components[rowIndex];
        if (!row || !row.components[buttonIndex]) {
            console.log(`Button row ${rowIndex}, index ${buttonIndex} tidak ditemukan`);
            return;
        }

        const button = row.components[buttonIndex];
        await msg.clickButton(button);
        console.log(`Klik tombol row ${rowIndex}, index ${buttonIndex} berhasil (message: ${msg.id})`);
    } catch (err) {
        console.error(`Error klik tombol row ${rowIndex}, index ${buttonIndex}:`, err.message);
    }
}

// AutoFarm fleksibel untuk semua tombol di semua row
async function autoFarm(channelId, interval = 6000) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            console.error('Channel tidak ditemukan atau tidak bisa diakses:', channelId);
            return;
        }

        console.log('AutoFarm aktif di channel:', channel.name);

        setInterval(async () => {
            try {
                const messages = await channel.messages.fetch({ limit: 10 });
                for (const msg of messages.values()) {
                    if (!msg.components.length) continue;

                    for (let r = 0; r < msg.components.length; r++) {
                        const row = msg.components[r];
                        for (let b = 0; b < row.components.length; b++) {
                            await clickButton(msg, r, b);
                            await new Promise(r => setTimeout(r, 1000)); // delay antar klik
                        }
                    }
                }
            } catch (err) {
                console.error('Error autoFarm loop:', err.message);
            }
        }, interval);
    } catch (err) {
        console.error('Gagal fetch channel:', err.message);
    }
}

// Event ready
client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    if (config.channelId) {
        try {
            const testChannel = await client.channels.fetch(config.channelId);
            console.log('Channel ditemukan:', testChannel.name);
            autoFarm(config.channelId, config.interval || 6000);
        } catch (err) {
            console.error('Channel tidak ditemukan / tidak bisa diakses:', err.message);
        }
    } else {
        console.log('channelId belum diatur di config.json');
    }
});

// Event messageCreate opsional
client.on('messageCreate', async (message) => {
    if (message.author.id !== client.user.id) return;

    if (message.content.toLowerCase().includes('farm')) {
        if (message.components.length) {
            for (let r = 0; r < message.components.length; r++) {
                const row = message.components[r];
                for (let b = 0; b < row.components.length; b++) {
                    await clickButton(message, r, b);
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        }
    }
});
