function formatUnixToDate(ms) {
    const date = new Date(Number(ms));
    return date.toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });
}

module.exports = formatUnixToDate;