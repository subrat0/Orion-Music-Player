console.log("JAVASCRIPT")
let currentsong = new Audio();
let currFolder;
let songs;

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // show all songs  in the playlist
    let songli = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songli.innerHTML = ""
    for (const song of songs) {
        songli.innerHTML = songli.innerHTML + `<li>
                        <div class="info">
                           <img src="img/music.svg" alt="music">
                            <div class="songinfo">
                                <div class="songname">${song.replaceAll("%20", " ")}</div>
                                <div class="artistname">Arijit Singh</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="img/play.svg" alt="play">
                            </div>
                        </div>
                       </li>`;
    }

    //Attach an event Listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            //  console.log(e.querySelector(".songinfo").firstElementChild.innerHTML);
            playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim());
        })

    })
    return songs;
}
//this function is used for convert seconds to minutes
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"; // Default value for invalid inputs
    }

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60); // Ensure it's an integer

    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/"+ track)
    currentsong.src = `/${currFolder}/` + track;
    let a = document.querySelector(".circle")
   
    if (!pause) {
        currentsong.play();
        playx.src = "img/pause.svg";
    }
   
    document.querySelector(".songplaybar").querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00 : 00 / 00 : 00"
}


// for display all the albums in the page
async function displayAlbums() {
    let a = await fetch(`/songs`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //get the meta data of folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);

            cards.innerHTML = cards.innerHTML + ` <div  data-folder=${folder} class="card-box">
                            <div class="playbutton">
                                <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="50" cy="50" r="50" fill="#1ED760" />
                                    <polygon points="38,28 75,50 38,72" fill="black" />
                                </svg>
                            </div>
                            <img src="/songs/${folder}/cover.png" alt="first">
                            <h3>${response.title}</h3>
                            <p>${response.description}</p>
                        </div>`
        }
    }
    //   For Click on card Button 
    Array.from(document.getElementsByClassName("card-box")).forEach(e => {
        e.addEventListener("click", async item => {
            await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })
}

async function main() {
    //get the list f all the song
    // let songs = await getsongs("songs/vishnu");
    // console.log(songs);
    // //aek song phle se set krne ke liye
    // playMusic(songs[0],true);

    // Code for fetch all the albums 
    displayAlbums();

    //attach event listenner to the play button
    playx.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            playx.src = "img/pause.svg";
        }
        else {
            currentsong.pause();
            playx.src = "img/songplay.svg";
        }
    })

    //Listen for time update
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime , currentsong.duration);
        let ct = currentsong.currentTime;
        let cd = currentsong.duration;
        document.querySelector(".songtime").innerHTML = `${formatTime(ct)} / ${formatTime(cd)}`;

        document.querySelector(".circle").style.left = ct / cd * 100 + "%";
        progress.style.width = ct / cd * 100 + "%";

    })
    //if song is finish then play next one

    currentsong.addEventListener("ended", () => {
        currentSongIndex = (currentSongIndex + 1) % songs.length; // Go to next song, loop if at end
        playMusic(songs[currentSongIndex]); // Play the next song
    });



    //ADD AN EVENT LISTENER TO SEEKBAR
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seekbar = e.currentTarget;
        const rect = seekbar.getBoundingClientRect();
        let percent = ((e.clientX - rect.left) / rect.width) * 100;

        if (!isNaN(currentsong.duration) && currentsong.duration > 0) {
            currentsong.currentTime = (currentsong.duration * percent) / 100;
        } else {
            console.error("Invalid song duration:", currentsong.duration);
        }
        // Clamp percent between 0 and 100
        percent = Math.max(0, Math.min(100, percent));

        document.querySelector(".circle").style.left = percent + "%";
        progress.style.width = percent + "%";
    });


    //clicklistener for hamburger
    hamburger.addEventListener("click", (e) => {
        document.querySelector(".left-side").style.left = "0%";
    })

    //click listener for close leftbar
    closeleftbar.addEventListener("click", (e) => {
        document.querySelector(".left-side").style.left = "-140%";
    })


    let currentSongIndex = 0; // to track which song is playing

    // Play song based on index
    function playSongByIndex(index) {
        if (index >= 0 && index < songs.length) {
            currentSongIndex = index;
            playMusic(songs[currentSongIndex]);
        }
    }

    // Add event listeners for next and previous
    document.getElementById("next").addEventListener("click", () => {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSongByIndex(currentSongIndex);
    });

    document.getElementById("previous").addEventListener("click", () => {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSongByIndex(currentSongIndex);
    });

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", element => {
            currentSongIndex = index; // 🧠 update index
            playMusic(songs[currentSongIndex]);
        });
    });

    // volume button
    document.querySelector(".volume-slider").addEventListener("input", (e) => {
        currentsong.volume = e.target.value;
    });

    //   for mute volume
    let previousvol;
    upvol.addEventListener("click", e => {

        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replaceAll("volume.svg", "mutevol.svg")
            previousvol = currentsong.volume;
            currentsong.volume = 0

            document.querySelector(".volume-control").getElementsByTagName("input")[0].value = currentsong.volume;
        }
        else {
            e.target.src = e.target.src.replaceAll("mutevol.svg", "volume.svg")
            console.log(previousvol)
            currentsong.volume = previousvol;
            document.querySelector(".volume-control").getElementsByTagName("input")[0].value = currentsong.volume;
        }
    })
}
main()
