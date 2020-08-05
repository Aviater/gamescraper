const router = require('express').Router();
const fs = require('fs');

const header = fs.readFileSync('./public/html/header.html', 'utf8');
const footer = fs.readFileSync('./public/html/footer.html', 'utf8');

router.get('/', (req, res) => {
    const index = fs.readFileSync('./public/html/index.html', 'utf8');
    return res.send(header + index + footer);
});

router.get('/game/:id', (req, res) => {
    const gamePage = fs.readFileSync('./public/html/gamePage.html');
    return res.send(header + gamePage + footer);
});

module.exports = router;