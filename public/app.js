$(document).ready(function(){
	let searchedArtists = []


//----------- Get data from TasteKid API --------------//

	const getTasteKidApi = ((artist, callback)=>{
		$.ajax({
	    	url: "/find-similar-artist",
	    	type: 'POST',
	    	data: {
				artist
		    },
		    success: ((data)=>{
		    	console.log("Data", data)
		    	makeSongPlayer(data)
		     	// if(data.Similar.Results.length > 0) {
		      //   let similarArtist = data.Similar.Results;
		      //   	similarArtist.forEach(((artist)=>{
		      //   	 	getSpotifyArtistId(artist.Name)
		      //   	}))
		      // 	}
		      // 	else {
		      // 	swal("Well this is embarrassing." , "We can't find that artist..")
		      // 	}
		    })
		})
	})

//---------- Get data from Spotify API ----------//
	//find id based by artist
	const getSpotifyArtistId = ((artist) =>{
		$.ajax({
			method: 'POST',
			url: '/get-artist',
			dataType: 'json',
			data: {
				artist
			},
			success: (data => {
				//data that comes in is id
				let id = data
				if(id) {
					getSpotifyTopTracksApi(id)
				}
				else {
					swal("no id")
				}
			}),
			fail: (err => {
				swal(err)
			}) 
		})
	})

	const getSpotifyTopTracksApi = ((artistId) => {
		$.ajax({
		 	method: 'POST',
			url: `/get-tracks`,
			dataType: 'json',
			data: {
				artistId,
				country: 'ES'
			},
			success: ((data)=>{
				let songId = data
				if(songId){
					makeSongPlayer(songId)
				}
			}),
			fail: (err => {
				swal(err)
			})
		})
	})

	const makeSongPlayer = ((songId)=>{
		let songPlayer = `<iframe src="https://embed.spotify.com/?uri=spotify:track:${songId}" width="288" frameborder="0" allowtransparency="true"></iframe>`
		$('#player').append(songPlayer)
	})

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

	$('.restart').on('click', (e)=>{
		e.preventDefault();
		$('#player').html('');
		searchedArtists = [];
		$('.song-title').val('');
	})
})