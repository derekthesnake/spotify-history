/*
* This is a test to create a viable page layout for the spotify-history tool.
*/

const pug = require('pug');
const express = require('express');

var app = express();
app.set('view engine', 'pug');
app.use('/static', express.static('static'));

app.get('/', function(req, res) {
    res.render('pug-test-layout');
});
app.listen(8888);