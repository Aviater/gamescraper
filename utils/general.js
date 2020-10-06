
exports.stripSymbol = (string) => {
    if(typeof string === 'string' && string.includes('€')) {
        const strippedString = string.replace('€', '');
        return Number(strippedString);
    } else if(typeof string === 'string' && string.includes('DKK')) {
        const strippedString = string.replace('DKK', '');
        return Number(strippedString);
    }
    return Number(string);
}
