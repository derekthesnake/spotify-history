/**
 * This is avery simple tool to check your spotify history.
 * There's no way to check it outside the API, so this should hopefully help.
 * You need to get your own secret and id for this, I'm not giving you mine. ;)
 *
 * Also, this is based on the spotify OAuth code flow example.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var pug = require('pug');

var client_id = 'CHANGE ME'; // Your client id
var client_secret = 'CHANGE ME' //Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.set('view engine', 'pug');
app.use('/static', express.static('static'));
app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-read-recently-played';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var history_options = {
          url: 'https://api.spotify.com/v1/me/player/recently-played?limit=50',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        var final_array = [];
        request.get(history_options, function(error, response, body) {
          body.items.forEach(function(value, index, array){
            var temp = {};
            temp_artists = [];
            value.track.artists.forEach(function(artist, index, array){
              temp_artists.push(artist.name);
            });
            temp.artist = temp_artists.join(', ');
            temp.title = value.track.name;
            temp.preview_url = value.track.preview_url;
            temp.album = value.track.album.name;
            temp.image_url = value.track.album.images[0].url;
            final_array.push(temp);
          });
          res.render('spotify-history.pug', {tracks: final_array});
        });
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

console.log('Listening on 8888');
app.listen(8888);
