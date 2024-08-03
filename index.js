
const { App } = require('@slack/bolt');
require('dotenv').config();
const express = require('express');
const {getCompanies,convertDate,tcase}  = require('./hubspot.js');

const port = process.env.PORT || 8080;

// async function test () {
//   const result = await getCompanies();
//   console.log(JSON.stringify(result,null,2));
// }

// test();

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


app.command('/hubspot', async({command, ack, say}) => {
	await ack();
  const results  = await getCompanies();
  const result = results[0];
console.log(JSON.stringify(result));
  
  const blocks =  [
      {
        "type": "divider"
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there, <@${command.user_id}> 👋 Here's the latest company information from Hubspot.`
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


