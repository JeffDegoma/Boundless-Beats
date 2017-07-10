require('dotenv').config()
const express = require('express');
const app = express();
const SpotifyWebApi = require('spotify-web-api-node');
const bodyParser = require('body-parser');
const request = require('request');
const PORT = process.env.PORT || 8080

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

function getSpotifyApi(tasteArtists){
	return new Promise(_resolve => {
		const promises = tasteArtists.map(artist => {
			return new Promise(resolve => {
				spotifyApi.searchArtists(artist)
				 	.then(data => {
				    	return data.body.artists.items[0].id
				    },(err) => {
				    	console.log('Something went wrong in here!', err);
				  	})
				  	.then((artistID) => {
			  			spotifyApi.getArtistTopTracks(artistID, "ES")
						.then(trackID => {
							resolve(trackID)
						},(err) => {
							console.log('Something went wrong!', err);
						})
			  		})
			})
		})
		Promise.all(promises).then(spotifyArtists => { 
			const ids = spotifyArtists.map(artist => artist.body.tracks[0].id)
			_resolve(ids)
		});
	})
}

async function getArtistRecommendations(artist){
	const tasteKidAsync = await tasteKidApi(artist)
	const tasteKidArtists = tasteKidAsync.Similar.Results.map(artist => artist.Name)
	return await getSpotifyApi(tasteKidArtists)
}

app.post('/find-similar-artist', (req, res) => {
	getArtistRecommendations(req.body.artist)
		.then(ids => {
			res.json(ids)
		})
})

app.listen(PORT, () => console.log(`Server listening on ${PORT}`))