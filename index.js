const { IgApiClient } = require('instagram-private-api');
const { getRandomFrame } = require('./scrapper.js');
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
  const res = await getRandomFrame();
  // console.log('description', res.juicyPostDescription);
  const publishResult = await ig.publish.photo({
    // attach image as a buffer
    file: res.frameBuffer,
    // optional, default ''
    caption: res.juicyPostDescription,
  });
  console.log(publishResult);
  return;
}

module.exports = {handler};