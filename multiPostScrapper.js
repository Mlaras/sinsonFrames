const axios = require('axios');
const { separateSeasonEpisode } = require('./utils/separateSeasonEpisode.js');
const {removeTags } = require('./utils/removeTags.js');

const getMultipleFrames = async () => {
    let imagePromises = [];
    let frameBuffers = [];
    let responseObject = [];
    let juicyPostDescription = '';
    try {
        const metadataResponse = await axios.get('https://frinkiac.com/api/random');
        // First we get metadata about the episode and season returned
        const { Episode, Timestamp } = metadataResponse.data.Frame;
        const { Nearby } = metadataResponse.data;
        // add main frame to promise array
        const mainImgUrl = `https://frinkiac.com/img/${Episode}/${Timestamp}.jpg`;
        const mainImagePromise = fetch(mainImgUrl, { method: 'GET', responseType: 'arraybuffer' });
        imagePromises.push(mainImagePromise);
        
        // use Nearby attribute to get more images.
        // The following for loop skips 1 frame each time to make the post feel more dynamic
        for (let index = 1; index < 5; index += 2) {
            const nextTimestamp = Nearby[index].Timestamp;
            const nearbyImgUrl = `https://frinkiac.com/img/${Episode}/${nextTimestamp}.jpg`;
            const imagePromise = fetch(nearbyImgUrl, { method: 'GET', responseType: 'arraybuffer' });
            imagePromises.push(imagePromise);
        }
        const imageResponses = await Promise.all(imagePromises);

        // iterate over image promises array to get multiple buffers of consecutive frames
        for (const image of imageResponses) {
            const buffer = await image.arrayBuffer();
            frameBuffers.push(Buffer.from(buffer));
        }
        
        // store buffers in an object type allowed by instagram private api 
        for (const image of frameBuffers) {
            responseObject.push({
                width: 640,
                height: 480,
                file: image
            })
        }

        // Episode information
        const [season, episode] = separateSeasonEpisode(Episode);
        if (season && episode) {
            console.log(`Season: ${season}, Episode: ${episode}`);
        } else {
            console.error("Invalid episode format");
        }

        const tvmazeRes = await axios.get(`https://api.tvmaze.com/shows/83/episodebynumber?season=${season}&number=${episode}`);

        const text = tvmazeRes.data.summary;
        const episodeName = tvmazeRes.data.name;

        // Extract summary and blackboard message
        const summary = removeTags(text.split('<b>Blackboard:</b>')[0]).trim();

        juicyPostDescription += `${Episode} | ${episodeName} | ${summary} `

        if (text.includes('<b>Blackboard:</b>')) {
            const blackboardMessage = removeTags(text.split('<b>Blackboard:</b>')[1]).trim();
            juicyPostDescription += `\nBlackboard: ${blackboardMessage} `
        }

        juicyPostDescription += `#simpsons #thesimpsons #homer #bart #sinsonposting`;

        return {
            juicyPostDescription,
            responseObject
        };
    } catch (error) {
        console.error('Error getting random frame:', error);
    }
}
module.exports = {getMultipleFrames};
