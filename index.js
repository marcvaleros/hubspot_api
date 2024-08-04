
const { App } = require('@slack/bolt');
require('dotenv').config();
const express = require('express');
const {getCompanies, findCompany, convertDate,tcase, }  = require('./hubspot.js');
const {openai_message}  = require('./openai.js');

const port = process.env.PORT || 8080;

//create a server 
const server = express();

server.get('/', (req, res) => {
  res.send('HubSpot Api for CRM Company Objects! Your server is running.');
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

app.command('/ask', async ({command, ack, say}) => {
  try {
    let cmd = command.text;
    let completion = await openai_message(cmd);
    say(completion.data.choices[0].message.content);
    
  } catch (error) {
      console.log("err")
    console.error(error);
  }
})

app.command('/hubspot', async({command, ack, say}) => {
	await ack();
  const results  = await getCompanies();
  const args = command.text.split(' ');
  const subcommand = args[0].toLowerCase();
  const restOfArgs = args.slice(1).join(' ');
  let responseMessage = '';
  let message = "";
  let result;

  switch (subcommand) {
    case 'recent':
      const recentData = await getCompanies('DESCENDING');
      responseMessage = recentData ? JSON.stringify(recentData, null, 2) : 'Failed to fetch recent companies.';
      message = "Here's the latest company information from Hubspot."
      result = recentData[0];
      break;
    case 'oldest':
      const oldestData = await getCompanies('ASCENDING');
      responseMessage = oldestData ? JSON.stringify(oldestData, null, 2) : 'Failed to fetch oldest companies.';
      message = "Here's the oldest company information from Hubspot."
      result = oldestData[0];
      break;
    case 'company':
      const company = await findCompany(restOfArgs);
      if(company && company.length > 0 && restOfArgs != ''){
        const responseMessage = JSON.stringify(company, null, 2);
        message = "Here's the company information you requested from Hubspot."
        result = company[0];
      }else{
        const result = null;
      }
      break;

    default:
    responseMessage = 'Unknown subcommand. Use /hubspot recent, /hubspot oldest, or /hubspot company <name>.';
  }
  

  let blocks;
  if(result != null){
    blocks =  [
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `Hey there, <@${command.user_id}> 👋 ${message}`
          },
          "accessory": {
            "type": "image",
            "image_url": "https://th.bing.com/th/id/OIP.iMaNhyhWZhZwI2LxButxvQHaDy?w=860&h=440&rs=1&pid=ImgDetMain",
            "alt_text": "hubspot_logo"
          }
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "plain_text",
              "text": `Company Name: ${tcase(result.properties.name)}`,
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": `Company ID: ${result.id}`,
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": `Phone Number: ${result.properties.phone == null ? 'None' : result.properties.phone}`,
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": `Email: ${tcase(result.properties.email)}`,
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": `DOT Number: ${result.properties.dot_number}`,
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": `MC Number: ${result.properties.mc_number == null ? 'None' : result.properties.mc_number}`,
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": `Interstate Drivers: ${result.properties.interstate_drivers}`,
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": `Date Created: ${convertDate(result.properties.createdate)}`,
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": `FF Number: ${result.properties.ff_number == null ? 'None' : result.properties.ff_number}`,
              "emoji": true
            },
            {
              "type": "plain_text",
              "text": `Mailing Address: ${tcase(result.properties.mailing_address)}`,
              "emoji": true
            },
          ]
        },
        {
          "type": "divider"
        }
      ];
  }else{
    blocks = [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Ooops, there were no results found. Try again <@${command.user_id}>.`
        },
      },
    ]
  }

  await app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: process.env.SLACK_CHANNEL,
    text: 'Update from HubSpot',
    blocks,
  });

});

(async () => {
  await app.start();
  console.log(`⚡️ Slack Bolt app is running!`);
})();


