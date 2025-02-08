const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('البوت يعمل بنجاح!');
});

app.listen(3000, () => {
    console.log('تم تشغيل السيرفر على المنفذ 3000');
});
// Create a new Discord client
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(`تم تسجيل الدخول باسم ${client.user.tag}`);
});



    











const bankAccounts = new Map();
const loans = new Map();
const cooldowns = new Map();
const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutes
const LOAN_COOLDOWN = 60 * 60 * 1000; // 1 hour

function isOnCooldown(userId, command) {
  const key = `${userId}-${command}`;
  const lastUse = cooldowns.get(key);
  if (!lastUse) return false;
  return Date.now() - lastUse < COOLDOWN_TIME;
}

function setCooldown(userId, command) {
  const key = `${userId}-${command}`;
  cooldowns.set(key, Date.now());
}

function calculateInvestment(amount) {
  const profitRate = 0.20 + (Math.random() * 0.10); // 20% to 30%
  return Math.floor(amount * (1 + profitRate));
}

function calculateTrading(amount) {
  const profitRate = 0.20 + (Math.random() * 0.10); // 20% to 30%
  return Math.floor(amount * (1 + profitRate));
}

function handleGambling(amount) {
  const win = Math.random() > 0.5;
  return win ? amount * 2 : 0;
}

function handleDice(amount) {
  const win = Math.random() > 0.5;
  return win ? amount * 2 : 0;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Check loans every hour
  setInterval(() => {
    const now = Date.now();
    loans.forEach((loan, userId) => {
      if (now - loan.time >= LOAN_COOLDOWN) {
        const balance = bankAccounts.get(userId) || 0;
        if (balance >= loan.amount) {
          bankAccounts.set(userId, balance - loan.amount);
          loans.delete(userId);
        } else {
          bankAccounts.set(userId, 0);
          loans.delete(userId);
        }
      }
    });
  }, LOAN_COOLDOWN);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();

  switch(command) {
    case 'اوامر':
      message.reply(`📜 قائمة الأوامر المتاحة:
راتب
بخشيش
حظ
توب
فلوس
قرض
استثمار
تداول
قمار
نرد
وقت`);
      break;

    case 'وقت':
      const cooldownStatus = [];
      const commands = ['راتب', 'استثمار', 'تداول', 'قمار', 'نرد'];

      for (const cmd of commands) {
        if (isOnCooldown(message.author.id, cmd)) {
          const key = `${message.author.id}-${cmd}`;
          const timeLeft = COOLDOWN_TIME - (Date.now() - cooldowns.get(key));
          const minutes = Math.ceil(timeLeft / 60000);
          cooldownStatus.push(`⏳ ${cmd}: ${minutes} دقائق متبقية`);
        } else {
          cooldownStatus.push(`✅ ${cmd}: جاهز للاستخدام`);
        }
      }

      if (loans.has(message.author.id)) {
        const loan = loans.get(message.author.id);
        const timeLeft = LOAN_COOLDOWN - (Date.now() - loan.time);
        const minutes = Math.ceil(timeLeft / 60000);
        cooldownStatus.push(`💰 قرض: ${minutes} دقائق للتسديد`);
      }

      message.reply(cooldownStatus.join('\n'));
      break;

    case 'بخشيش':
      if (isOnCooldown(message.author.id, 'بخشيش')) {
        return message.reply('⏰ انتظر 5 دقائق قبل استخدام هذا الأمر مرة أخرى');
      }
      setCooldown(message.author.id, 'بخشيش');
      const tipAmount = Math.floor(Math.random() * 1000) + 100;
      bankAccounts.set(message.author.id, (bankAccounts.get(message.author.id) || 0) + tipAmount);
      message.reply(`خذ يافقير ${tipAmount} 💰`);
      break;

    case 'حظ':
      if (isOnCooldown(message.author.id, 'حظ')) {
        return message.reply('⏰ انتظر 5 دقائق قبل استخدام هذا الأمر مرة أخرى');
      }
      setCooldown(message.author.id, 'حظ');
      const luckAmount = Math.floor(Math.random() * 2000) + 200;
      bankAccounts.set(message.author.id, (bankAccounts.get(message.author.id) || 0) + luckAmount);
      message.reply(`هذا حظك ${luckAmount} 💰`);
      break;

    case 'راتب':
      if (isOnCooldown(message.author.id, 'راتب')) {
        return message.reply('⏰ انتظر 5 دقائق قبل استخدام هذا الأمر مرة أخرى');
      }
      setCooldown(message.author.id, 'راتب');
      const salary = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
      bankAccounts.set(message.author.id, (bankAccounts.get(message.author.id) || 0) + salary);
      message.reply(`تم إضافة ${salary} 💰 إلى رصيدك!`);
      break;

    case 'قرض':
      if (loans.has(message.author.id)) {
        return message.reply('❌ لديك قرض حالي يجب تسديده أولاً');
      }
      const loanAmount = 100000;
      bankAccounts.set(message.author.id, (bankAccounts.get(message.author.id) || 0) + loanAmount);
      loans.set(message.author.id, { amount: loanAmount, time: Date.now() });
      message.reply(`تم منحك قرض بقيمة ${loanAmount} 💰\nيجب التسديد خلال ساعة!`);
      break;

    case 'فلوسك':
      const balance = bankAccounts.get(message.author.id) || 0;
      message.reply(`فلوسك: ${balance} 💰`);
      break;

    case 'توب':
      const sortedUsers = Array.from(bankAccounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      if (sortedUsers.length === 0) {
        return message.reply('❌ لا يوجد مستخدمين في القائمة بعد');
      }

      const topList = await Promise.all(sortedUsers.map(async ([userId, balance], index) => {
        try {
          const user = await client.users.fetch(userId);
          return `${index + 1}. ${user.username}: ${balance} 💰`;
        } catch (err) {
          return `${index + 1}. مستخدم غير معروف: ${balance} 💰`;
        }
      }));

      message.reply(`👑 أغنى 10 أشخاص:\n${topList.join('\n')}`);
      break;

    case 'اضافه':
      if (!args[0]) {
        return message.reply('❌ الرجاء تحديد المبلغ المراد إضافته');
      }
      const amount = BigInt(args[0]);
      if (amount <= 0n || amount > BigInt('1' + '0'.repeat(63))) {
        return message.reply('❌ المبلغ غير صالح! يجب أن يكون أكبر من 0 وأقل من 63 صفر');
      }
      const currentBalance = BigInt(bankAccounts.get(message.author.id) || 0);
      const newBalance = currentBalance + amount;
      bankAccounts.set(message.author.id, Number(newBalance));
      message.reply(`✅ تمت إضافة ${amount} 💰 إلى رصيدك!\nرصيدك الجديد: ${newBalance} 💰`);
      break;
  }

  const gameCommands = ['استثمار', 'تداول', 'قمار', 'نرد'];
  const gameType = gameCommands.find(cmd => message.content.startsWith(cmd));

  if (gameType) {
    if (isOnCooldown(message.author.id, gameType)) {
      return message.reply('⏰ انتظر 5 دقائق قبل استخدام هذا الأمر مرة أخرى');
    }

    const args = message.content.split(' ');
    if (args.length < 2) {
      return message.reply('❌ الرجاء تحديد النوع: كامل/نص/ربع');
    }

    const type = args[1];
    const userBalance = bankAccounts.get(message.author.id) || 0;
    let amount = 0;

    switch(type) {
      case 'كامل': amount = userBalance; break;
      case 'نص': amount = Math.floor(userBalance / 2); break;
      case 'ربع': amount = Math.floor(userBalance / 4); break;
      default: return message.reply('❌ نوع غير صحيح. استخدم: كامل/نص/ربع');
    }

    if (amount <= 0) {
      return message.reply('❌ لا يوجد رصيد كافي!');
    }

    let result = 0;
    setCooldown(message.author.id, gameType);

    switch(gameType) {
      case 'استثمار':
        result = calculateInvestment(amount);
        break;
      case 'تداول':
        result = calculateTrading(amount);
        break;
      case 'قمار':
        result = handleGambling(amount);
        break;
      case 'نرد':
        result = handleDice(amount);
        break;
    }

    bankAccounts.set(message.author.id, (bankAccounts.get(message.author.id) || 0) - amount + result);

    if (result > amount) {
      message.reply(`🎉 مبروك! ربحت ${result - amount} 💰\nرصيدك الجديد: ${bankAccounts.get(message.author.id)} 💰`);
    } else {
      message.reply(`😢 خسرت ${amount - result} 💰\nرصيدك الجديد: ${bankAccounts.get(message.author.id)} 💰`);
    }
  }
});

client.login(process.env.TOKEN);
