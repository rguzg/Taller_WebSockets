const express = require('express');
const app = express();

app.use('/static', express.static('Static'));

app.get('/', (req, res) => res.sendFile(`${__dirname}/Templates/login.html`));

app.listen(process.env.PORT || 3000, () => {
    console.log('The server is running!');
});