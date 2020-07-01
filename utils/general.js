
exports.stripSymbol = (string) => {
    if(typeof string === 'string' && string.includes('€')) {
        const strippedString = string.replace('€', '');
        return Number(strippedString);
    }
    return Number(string);
}