const { IgApiClient } = require('instagram-private-api');
const {getRandomFrame} = require('./scrapper');
const { StickerBuilder } = require('instagram-private-api/dist/sticker-builder/sticker-builder.js');
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
  const randomFrame = await getRandomFrame();
  const itemToPost = (await ig.feed.user(50428722630).items())[0];
  
  console.info("About to post...");
  const storyPublishResult = await ig.publish.story({
    file: randomFrame.frameBuffer,
    stickerConfig: new StickerBuilder()
      .add(StickerBuilder.attachmentFromMedia(itemToPost).center().scale(0.5))
  });
  console.info("Posted !");
  console.log(storyPublishResult);
  return;
}
module.exports = {handler};