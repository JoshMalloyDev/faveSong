var save = document.getElementsByClassName("save");
const deleteSaved = document.querySelectorAll(".deleteSaved")
const savedMusic = document.querySelector(".savedMusic").querySelectorAll(".artistName")

Array.from(save).forEach(function(element) {
      element.addEventListener('click', function(){
        const album = this.parentNode.querySelector('.albumName').innerText
        const artist = this.parentNode.querySelector('.artist').innerText
        const albumCover = this.parentNode.querySelector('.link').innerText
        console.log(albumCover)
        fetch('save', {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'album': album,
            'artist': artist,
            'cover': albumCover
          })
        })
        .then(response => {
          console.log(response)
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

deleteSaved.forEach((button, index) => {
  button.addEventListener('click', function(){
    let musicId = button.parentNode.childNodes[1].innerText
    console.log(musicId)
    fetch('deleteSave', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        musicId: musicId,
      })
    }).then(function (response) {
      window.location.reload()
    })
  });
})
