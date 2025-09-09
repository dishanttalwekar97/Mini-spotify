console.log('Lets write JavaScript');
let currentsong = new Audio();
let song;
let currfolder;

// Convert seconds to MM:SS format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch songs from the folder
async function getsong(folder) {
    currfolder = folder;
    let response = await fetch(`${folder}/songs.json`);
    if (!response.ok) {
        console.error(`songs.json missing in ${folder}`);
        return [];
    }
    let data = await response.json();
    song = data.songs;

    let songUL = document.querySelector(".song-list ul");
    songUL.innerHTML = "";
    for (const songs of song) {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="https://www.svgrepo.com/show/107676/musical-sixteenth-note.svg" alt="">
                <div class="info">
                    <div>${songs.replaceAll("%20", " ")}</div>
                    <div>Dishant</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="/svg/play.svg" alt="">
                </div>
            </li>`;
    }

    Array.from(document.querySelectorAll(".song-list li")).forEach(e => {
        e.addEventListener("click", () => {
            playmusic(e.querySelector(".info div").innerText.trim());
        });
    });

    return song;
}


const playmusic = (track, pause = false) => {
    currentsong.src = `${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        document.querySelector("#play").src = "./svg/pause.svg";
    }

    document.querySelector(".songinfo").innerText = decodeURI(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
};



// Display all albums
async function displayAlbums() {
    console.log("Displaying albums");
    let response = await fetch(`song/`);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container");

    for (let e of anchors) {
        if (e.href.includes("/song") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];

            // 🚫 Skip root "song" and duplicates
            if (folder.toLowerCase() === "song") continue;
            if (document.querySelector(`[data-folder="${folder}"]`)) continue;

            try {
                // check if info.json exists
                let metaResponse = await fetch(`song/${folder}/info.json`);
                if (!metaResponse.ok) {
                    console.warn(`Skipping ${folder}, no info.json`);
                    continue;
                }

                let meta = await metaResponse.json();

                // check if folder has mp3 songs
                let testResponse = await fetch(`song/${folder}/`);
                let testText = await testResponse.text();
                if (!testText.includes(".mp3")) {
                    console.warn(`Skipping ${folder}, no songs inside`);
                    continue;
                }

                // ✅ Add card only if folder is valid
                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg viewBox="0 0 24 24">
                                <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
                            </svg>
                        </div>
                        <img src="song/${folder}/cover.jpg" alt="">
                        <h2>${meta.title || folder}</h2>
                        <p>${meta.description || "Artist"}</p>
                    </div>`;
            } catch (error) {
                console.warn("Skipping invalid folder:", folder, error);
            }
        }
    }

    // ✅ Attach click events only to valid cards
    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async (event) => {
            let folder = event.currentTarget.dataset.folder;
            if (!folder) {
                console.error("Folder is undefined!");
                return;
            }
            console.log("Fetching Songs for", folder);
            song = await getsong(`song/${folder}`);
            if (song.length > 0) playmusic(song[0]);
        });
    });
}


    // Fix click event for albums
    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async (event) => {
            let folder = event.currentTarget.dataset.folder;
            if (!folder) {
                console.error("Folder is undefined!");
                return;
            }
            console.log("Fetching Songs for", folder);
            song = await getsong(`song/${folder}`);
            if (song.length > 0) playmusic(song[0]);
        });
    });



    // Fix click event for albums
    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async (event) => {
            let folder = event.currentTarget.dataset.folder;
            if (!folder) {
                console.error("Folder is undefined!");
                return;
            }
            console.log("Fetching Songs for", folder);
            song = await getsong(`song/${folder}`);
            if (song.length > 0) playmusic(song[0]);
        });
    });



// Main function
async function main() {
    let defaultAlbum = "song";  // Change to an existing folder name
    try {
        song = await getsong(defaultAlbum);
        if (song.length > 0) {
            playmusic(song[0], true);
        } else {
            console.warn(`No songs found in ${defaultAlbum}`);
        }
    } catch (error) {
        console.error("Error loading default album:", error);
    }

    await displayAlbums();

    let play = document.querySelector("#play");
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "./svg/pause.svg";
        } else {
            currentsong.pause();
            play.src = "./svg/play.svg";
        }
    });

    // Update song time
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // Seek bar click event
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });


    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add eventlistenr to close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    // Previous and Next buttons
    document.querySelector("#previous").addEventListener("click", () => {
        let index = song.indexOf(currentsong.src.split("/").pop());
        if (index > 0) playmusic(song[index - 1]);
    });

    document.querySelector("#next").addEventListener("click", () => {
        let index = song.indexOf(currentsong.src.split("/").pop());
        if (index < song.length - 1) playmusic(song[index + 1]);
    });

    // Volume Control
    let volumeControl = document.querySelector(".range input");
    volumeControl.addEventListener("change", e => {
        currentsong.volume = e.target.value / 100
        if(currentsong > 0){
            document.querySelector(".volume>logo").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
    });

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
}

main();
