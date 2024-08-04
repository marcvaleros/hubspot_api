
require('dotenv').config();
const { OpenAI } = require("openai");

async function openai_message(cmd){
  const openai = new OpenAI();

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system', content: cmd }],
  });

  return completion;
};


module.exports = {
  openai_message
};
