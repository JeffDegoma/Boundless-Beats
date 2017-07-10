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
		    success: ((ids) => {
		    	const toAppend = ids.map(makeSongPlayer)
		    	$('#player').append(toAppend)
		    })
		})
	})

	const makeSongPlayer = (songId) => {
		return `<iframe src="https://embed.spotify.com/?uri=spotify:track:${songId}" width="288" frameborder="0" allowtransparency="true"></iframe>`
	}

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
			swal(`You've already searched for ${userInput.toUpperCase()}!`)
		 }
	})

	$('.restart').on('click', (e)=>{
		e.preventDefault();
		$('#player').html('');
		searchedArtists = [];
		$('.song-title').val('');
	})
	
})