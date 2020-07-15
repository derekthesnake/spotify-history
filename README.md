# Spotify History Tool

I discovered that there is literally no good way to see your persistent Spotify history outside of the API. So I made this simple tool to do it.

I acknowledge that there is certainly some jank in it (public/ and views/, deprecation warning, along with other things that I probably don't even *know*) and I am not promising it is secure at all. I don't recommend using this in any non-personal setting (if you host it and make it available publicly, that's your problem).

It's based directly off the authorization_code example from Spotify's official github (https://github.com/spotify/web-api-auth-examples). As such, I'm redistributing it under the same license (Apache).

To use this, you need to populate it with your client id and client secret. You can do that [here](https://developer.spotify.com/documentation/general/guides/app-settings/#register-your-app). Additionally, you need to update your callback url (with `http://localhost/8888/callback` if you're using this without changing settings) in your developer dashboard.

Then, just `npm install` and `node app.js`. It will serve on port 8888 by default.