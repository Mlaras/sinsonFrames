  // Function to remove HTML tags
function removeTags(str) {
    console.log('string received: ', str);
    return str.replace(/<[^>]*>/g, '');
}

module.exports = { removeTags };