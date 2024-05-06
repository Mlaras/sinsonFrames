const { IgApiClient } = require('instagram-private-api');
const { getMultipleFrames } = require('./multiPostScrapper.js');
require('dotenv').config();

const ig = new IgApiClient();
const user = process.env.IG_USERNAME;
const pass = process.env.IG_PASSWORD;


async function login() {
  // basic login-procedure
  ig.state.generateDevice(user);
  await ig.account.login(user, pass);
}

const handler = async (event, context) => {
  if(!user || !pass){
    console.log('Ig username or pass not found');
    return
  }
  await login();
  const res = await getMultipleFrames();

  const albumPublishResult = await ig.publish.album({
    items: res.responseObject,
    caption: res.juicyPostDescription
  });

  console.log(albumPublishResult);
  return;
}

module.exports = {handler};