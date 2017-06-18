require('dotenv').config()
const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080
const bodyParser = require('body-parser');
const request = require('request');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Create the api object with the credentials
const spotifyApi = new SpotifyWebApi({
  clientId : process.env.CLIENT_ID,
  clientSecret : process.env.CLIENT_SECRET
});

// Retrieve an access token.
spotifyApi.clientCredentialsGrant()
 	.then((data) => {
    	// Save the access token so that it's used in future calls
    	spotifyApi.setAccessToken(data.body['access_token']);
  	}, (err) => {
        console.log('Something went wrong when retrieving an access token', err);
  	});

function tasteKidApi(artist) {
	return new Promise((resolve)=> {
		const url = 'https://tastedive.com/api/similar?'
		const params = `k=${process.env.TASTE_KID}&q=${artist}`
		const params2 = `&limit=8&type=music`
		
		request(url + params + params2, (error, response, body) => {
			resolve(JSON.parse(body))
		})
	})
}

function spotifyGetArtistIdApi(tasteArtists){
	console.log("ARTISTS", tasteArtists)
	return new Promise((resolve) => {
		spotifyApi.searchArtists(tasteArtists)
	 	.then((data) => {
	 		console.log("artists id", data.body)
	    	const artistID = data.body.artists.items[0].id
	    	resolve(artistID)
	    },(err) => {
	    	console.log('Something went wrong in here!', err);
	  	})
	})
}


function spotifyGetTrackIdApi(artistId){
	return new Promise((resolve) => {
		spotifyApi.getArtistTopTracks(artistId, "ES")
		.then((data) => {
			const trackID = data
			console.log("top track id", data.body.tracks[0].id)
			resolve(trackID)
		},(err) => {
			console.log('Something went wrong!', err);
		})
	})
}

//function that takes all the ascynchrnous actions
async function getArtistRecommendations(artist) {
	const tasteKidAsync = await tasteKidApi(artist)
	const tasteKidArtists = tasteKidAsync.Similar.Results.map(artist => artist.Name)
	const spotifyArtistId = await spotifyGetArtistIdApi(tasteKidArtists)
	const spotifyGetTrackIdAsync = await spotifyGetTrackIdApi(spotifyArtistId)
	return spotifyGetTrackIdAsync
}

app.post('/find-similar-artist', (req, res) => {
	getArtistRecommendations(req.body.artist)
		.then(artists => {
			// console.log("find similiar artist endpoint", artists.body)
			const songID = artists.body.tracks[0].id
			res.json(songID)
		})
})

// app.post('/get-tracks', (req, res) => {
// 	spotifyApi.getArtistTopTracks(`${req.body.artistId}`, "ES")
// 		.then((data) => {
// 	    	const trackID = data.body.tracks[0].id
// 	    	res.json(trackID)
// 	    },(err) => {
// 	    	console.log('Something went wrong!', err);
// 	  	})
// })

app.listen(PORT, () => console.log(`Server listening on ${PORT}`))