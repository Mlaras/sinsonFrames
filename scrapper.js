const axios = require('axios');

function separateSeasonEpisode(episodeString) {
  try {
    // Remove leading "S" and split by "E"
    const [season, episode] = episodeString.slice(1).split("E");

    // Convert season and episode to integers
    return [parseInt(season, 10), parseInt(episode, 10)];
  } catch (error) {
    // Handle invalid format errors (e.g., missing "S", non-numeric characters)
    return null;
  }
}

  // Function to remove HTML tags
function removeTags(str) {
  console.log('string received: ', str);
  return str.replace(/<[^>]*>/g, '');
}


const getRandomFrame = async () => {
  let juicyPostDescription = '';
  let frameBuffer;
  try {
    const metadataResponse = await axios.get('https://frinkiac.com/api/random');
    const { Episode, Timestamp } = metadataResponse.data.Frame;
    // Example usage
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
    
    if(text.includes('<b>Blackboard:</b>')){
      const blackboardMessage = removeTags(text.split('<b>Blackboard:</b>')[1]).trim();
      juicyPostDescription += `\nBlackboard: ${blackboardMessage} `
    }
    
    juicyPostDescription += `#simpsons #thesimpsons #homer #bart #sinsonposting`;
    const imgUrl = `https://frinkiac.com/img/${Episode}/${Timestamp}.jpg`;

    const imageResponse = await fetch(imgUrl, { method: 'GET', responseType: 'arraybuffer' });
    const buffer = await imageResponse.arrayBuffer();
    frameBuffer = Buffer.from(buffer);

    return {
      juicyPostDescription,
      frameBuffer
    };
  } catch (error) {
    console.error('Error getting random frame:', error);
  }
}

module.exports = {getRandomFrame};
