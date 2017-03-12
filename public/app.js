$(document).ready(function(){
	const searchedArtists = []
	const resultsPlaceholder = document.getElementById('results')





//----------- Get data from TasteKid API --------------//


	const getTasteKidApi = ((artist, callback)=>{
		$.ajax({
			url: "https://www.tastekid.com/api/similar",
	    	type: 'GET',
	    	dataType: 'jsonp',
	    	data: {
		      	k: "262446-Sendmeba-QIY9SFUH",
			    q: artist,
			    limit: 5,
		      	type: "music",
		      	info: 1
		    },

		    success: ((data)=>{
		      if(data.Similar.Results.length > 0) {
		        let similarArtist = data.Similar.Results;
		        	similarArtist.forEach(((artist)=>{
		        	 	getSpotifyArtistId(artist.Name)
		        	}))
		      }
		      else {
		      	swal("Well this is embarrassing." , "We can't find that artist..")
		      }
		    })
		})
	})

//---------- Get data from Spotify API ----------//

	
	const getSpotifyArtistId = ((artist) =>{
		$.ajax({
			url: 'https://api.spotify.com/v1/search',
			data: {
				q: artist,
				type: 'artist',
			},

			success: ((data)=>{
				let id = data.artists.items[0].id
				getSpotifyTopTracksApi(id)
			})
		})
	})

	const getSpotifyTopTracksApi = ((artistId) => {
		 $.ajax({
			url: `https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
			data: {
				id: artistId,
				limit: 5,
				country: 'ES'
			},

			success: ((data)=>{
				let songId = data.tracks[0].id
				makeSongPlayer(songId)
				})
			})
	})



	const makeSongPlayer = ((songId)=>{
		let songPlayer = `<iframe src="https://embed.spotify.com/?uri=spotify:track:${songId}" width="288" frameborder="0" allowtransparency="true"></iframe>`
		$('#player').append(songPlayer)
	})


//------------Ajax Error-----------//

	$(() =>{
	    $.ajaxSetup({
	        error:  ((x, status, error) =>{
	            if (x.status == 400) {
	             alert("An error occurred: " + status + "Error: " + error);
	            }
	        })
	    });
	});


//-------------Submit Handler-------------//

	$('.search').on('click',(e)=>{
		e.preventDefault();
		let userInput = $('input').val();
		let foundArtist = searchedArtists.find((artist)=>{
			return artist === userInput
		})

		 if(!foundArtist){
		 	searchedArtists.push(userInput)
			getTasteKidApi(userInput)
		 }
		else{
			swal(`You've already searched for ${userInput.toUpperCase()}`)
		 }
	})


})