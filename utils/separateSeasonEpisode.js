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

module.exports = {separateSeasonEpisode};