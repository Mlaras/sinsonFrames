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
        const { Episode } = metadataResponse.data.Frame;
        const { Nearby } = metadataResponse.data;
        if (!Nearby) {
            console.error('No nearby frames found');
            return;
        }
        // const lastTimestamp = Nearby[Nearby.length-1].Timestamp;
        // use Nearby attribute to get more images.
        // The carrousel contains the main image right in the middle.
        for (let index = 0; index < 7; index += 1) {
            const nextTimestamp = Nearby[index].Timestamp;
            const nearbyImgUrl = `https://frinkiac.com/img/${Episode}/${nextTimestamp}.jpg`;
            const imagePromise = fetch(nearbyImgUrl, { method: 'GET', responseType: 'arraybuffer' });
            imagePromises.push(imagePromise);
        }

        /* const nextThreeFramesPromises = await getNextThreeFrames(Episode, lastTimestamp);
        imagePromises = [...imagePromises, ...nextThreeFramesPromises]; */

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

/* const getNextThreeFrames = async (episode, timestamp) => {
    let imagePromises = [];    
    try {
        // Get the metadata of the episode
        const metadataResponse = await axios.get(`https://frinkiac.com/caption/${episode}/${timestamp}`);
        console.log('Metadata response:', metadataResponse.data);
        const { Nearby } = metadataResponse.data;
        if (!Nearby) {
            console.error('No nearby frames found');
            return;
        }
        // Look for the last 3 nearby frames (4 - 5 - 6)
        for (let index = 4; index < 7; index += 1) {
            const nextTimestamp = Nearby[index].Timestamp;
            const nearbyImgUrl = `https://frinkiac.com/img/${episode}/${nextTimestamp}.jpg`;
            const imagePromise = fetch(nearbyImgUrl, { method: 'GET', responseType: 'arraybuffer' });
            imagePromises.push(imagePromise);
        }
        return imagePromises;
    } catch (error) {
        return console.error('Error getting next three random frames:', error);
    }

} */
module.exports = {getMultipleFrames};
