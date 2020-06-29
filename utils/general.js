exports.stripSymbol = (string) => {
    if(typeof string === 'string' && string.includes('€')) {
        const strippedString = string.replace('€', '');
        // console.log('Stripped string:', strippedString);
        return Number(strippedString);
    }
    // console.log('Stripped string 2:', string);
    return Number(string);
} 
