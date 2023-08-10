// @ts-ignore
const { fromEvent, throttleTime, debounceTime, tap, filter, pluck } = rxjs;

// Initial Setup
const root = document.querySelector("#root")!;
// @ts-ignore
let albumsData: Album[] = JSON.parse(data);
let audiotag = document.createElement("audio");
audiotag.id = "audiotag";
let isPlaying = false;

// router setup
router();
window.addEventListener("popstate", router); // when hitting back button
function resolveRoute(route: string, nestedRoute: string) {
  if (route === "dist" && nestedRoute === "home") {
    return homePage;
  }
  if (route === "dist" && nestedRoute === "search") {
    return searchPage;
  }
  if (route === "dist" && nestedRoute === "library") {
    return libraryPage;
  }
  if (route === "library" && nestedRoute === "likedsongs") {
    return likedSongsPage;
  }
  // playing music:
  if (route === "music" && nestedRoute !== "") {
    return playerPage;
  }
  if (route === "albums" && nestedRoute !== "") {
    return albumsPage;
  }
  if (route === "search") {
    return searchPage;
  }
  return homePage;
}

// router when hashchange:
function router() {
  root.innerHTML = "";
  let url = window.location.href.split("/").filter((URLPart) => URLPart !== "");
  let route = resolveRoute(url[url.length - 2], url[url.length - 1]);
  // runs component function:
  route();
}

function navigateTo(route: string) {
  history.pushState({ pageID: route }, route, `/dist/${route}`);
  router();
}

// component functions:
function navMenu(activeTab: string) {
  return `<div class='navMenu__flex-wrapper'>
  <div class='nav-item ${
    activeTab === "home" ? "active" : ""
  }' onclick="navigateTo('home')">
  <img class='nav-icon' src="${
    activeTab === "home" ? "../../home-fill-icon.svg" : "../../home-icon.svg"
  }" onerror="this.onerror=null; this.src='../../home-icon.svg'" alt="" />
  <div>Home</div>
  </div>
  <div class='nav-item ${
    activeTab === "search" ? "active" : ""
  }' onclick="navigateTo('search')">
  <img class='nav-icon' src="${
    activeTab === "search"
      ? "../../search-fill-icon.svg"
      : "../../search-icon.svg"
  }" onerror="this.onerror=null; this.src='../../search-icon.svg'" alt="" />
  <div>Search</div>
  </div>
  <div class='nav-item ${
    activeTab === "library" ? "active" : ""
  }' onclick="navigateTo('library')">
  <img class='nav-icon' src="${
    activeTab === "library"
      ? "../../library-fill-icon.svg"
      : "../../library-icon.svg"
  }" onerror="this.onerror=null; this.src='../../library-icon.svg'" alt="" />
  <div>Your Library</div>
  </div>
  </div>`;
}

async function playerPage() {
  const musicid = window.location.href.split("/").pop()!;
  let musicDetail!: Music;
  let albumName: string;
  albumsData.every((album, albumIndex) => {
    const [result] = album.musics.filter((music) => music.id === +musicid);
    if (result) {
      musicDetail = result;
      albumName = albumsData[albumIndex].album.album_name;
      return false;
    }
    return true;
  });

  const div = document.createElement("div");
  div.innerHTML = `<div class='player-wrapper'>
  <div class="player-options">
    <img class="player-chevron" src="../../chevron-icon.svg" />
    <div class="liked-songs">Liked Songs</div>
    <img class="three-dots" src="../../more-icon.svg" />
  </div>
  <div class='player-pic-wrapper'>
  <img class="player-pic" src=${musicDetail.track_thumb} />
  </div>
  <div class="song-info">
    <div class="name-artist">
      <div class="player-name">${musicDetail.track_name}</div>
      <div class="player-artist">${albumName!}</div>
    </div>
    <img class="player-like" data-id='${musicDetail.id}' src="${
    musicDetail.is_favorited
      ? "../../like-fill-icon.svg"
      : "../../like-nofill-icon.svg"
  }"/>
  </div>
  <div class="slider_container">
      <input type="range" min="1" max="100"
      value="0" class="seek_slider">
      <div class='player-times'>
         <div class="current-time">00:00</div>
         <div class="total-duration">${musicDetail.track_time}</div>
      </div>
  </div>
  <div class="music-options">
    <img src="../../shuffle-off-icon.svg" alt="" class="shuffle-icon" />
    <img src="../../prev-music-icon.svg" alt="" class="prev-icon" />
    <div class='play-pause-icon'>
      <img src="../../ellipse-icon.svg" alt="" class="ellipse-icon" />
      <img src="../../wait-icon.svg" alt="" class="pause-icon" />
    </div>
    <img src="../../next-music-icon.svg" alt="" class="next-icon" />
    <img src="../../repeat-icon.svg" alt="" class="repeat-icon" />
  </div>
  <div class="devices-queue">
    <img src="../../devices-icon.svg" alt="" class="player-devices" />
    <img src="../../queue-icon.svg" alt="" class="player-queue" />
  </div>
</div>`;

  function seekTo() {
    const seekto = audiotag.duration * (+seekSlider.value / 100);
    audiotag.currentTime = seekto;
  }
  root.appendChild(div);
  let seekSlider = document.querySelector(".seek_slider")! as HTMLInputElement;
  let likeButton = document.querySelector(".player-like")! as HTMLInputElement;
  let currentTime = document.querySelector(
    ".current-time"
  )! as HTMLInputElement;
  let nextButton = document.querySelector(".next-icon")! as HTMLInputElement;
  let prevButton = document.querySelector(".prev-icon")! as HTMLInputElement;
  let shuffleButton = document.querySelector(
    ".shuffle-icon"
  )! as HTMLInputElement;

  seekSlider.addEventListener("input", seekTo);
  likeButton.addEventListener("click", () => {
    const currElementid = likeButton.getAttribute("data-id")!;
    let song: Music;
    albumsData.forEach((album, albumIndex) => {
      const musicIndex = album.musics.findIndex(
        (music) => music.id === +currElementid
      );
      if (musicIndex !== -1) {
        const currentFavStatus =
          albumsData[albumIndex].musics[musicIndex].is_favorited;
        albumsData[albumIndex].musics[musicIndex].is_favorited =
          1 - currentFavStatus;
        likeButton.src =
          currentFavStatus === 0
            ? "../../like-fill-icon.svg"
            : "../../like-nofill-icon.svg";
      }
    });
  });
  let isShuffling = false;
  nextButton.addEventListener("click", () => loadNextPrevMusic("next"));
  prevButton.addEventListener("click", () => loadNextPrevMusic("prev"));
  shuffleButton.addEventListener("click", () => {
    if (isShuffling) {
      isShuffling = false;
      shuffleButton.src = "../../shuffle-off-icon.svg";
    } else {
      isShuffling = true;
      shuffleButton.src = "../../shuffle-icon.svg";
    }
  });
  audiotag.addEventListener("ended", function () {
    if (isShuffling) {
      loadNextPrevMusic("shuffle");
    }
    audiotag.currentTime = 0;
  });
  function loadNextPrevMusic(to: "next" | "prev" | "shuffle") {
    isPlaying = true;
    const currElementid = likeButton.getAttribute("data-id")!;
    let song: Music;
    albumsData.forEach((album, albumIndex) => {
      const musicIndex = album.musics.findIndex(
        (music) => music.id === +currElementid
      );
      if (musicIndex !== -1) {
        const indexChanger: number = musicIndex + (to === "next" ? 1 : -1);
        const targetedSongID =
          albumsData[albumIndex].musics[
            to === "shuffle"
              ? Math.floor(Math.random() * album.musics.length)
              : indexChanger
          ]?.id;
        if (targetedSongID) {
          navigateTo(`music/${targetedSongID}`);
        }
      }
    });
  }
  const playPauseElement = document.querySelector(
    ".pause-icon"
  )! as HTMLImageElement;

  playPauseElement.addEventListener("click", () => {
    if (isPlaying) {
      isPlaying = false;
      audiotag.pause();
      playPauseElement.src = "../../play-icon.svg";
    } else {
      isPlaying = true;
      audiotag.play();
      playPauseElement.src = "../../pause-icon.svg";
    }
  });
  function seekUpdate() {
    let seekPosition = 0;
    if (!isNaN(audiotag.duration)) {
      seekPosition = audiotag.currentTime * (100 / audiotag.duration);
      seekSlider.value = seekPosition.toString();
      let currentMinutes = Math.floor(audiotag.currentTime / 60).toString();
      let currentSeconds = Math.floor(
        audiotag.currentTime - +currentMinutes * 60
      ).toString();
      // Add a zero to the single digit time values
      if (+currentSeconds < 10) {
        currentSeconds = "0" + currentSeconds;
      }
      if (+currentMinutes < 10) {
        currentMinutes = "0" + currentMinutes;
      }
      // Display the updated duration
      currentTime.textContent = currentMinutes + ":" + currentSeconds;
    }
  }
  let timerID: number | undefined;
  timerID = setInterval(seekUpdate, 1000);
  await loadTrackFromDB(
    musicDetail.id,
    musicDetail.track_url,
    playPauseElement
  );
}
function homePage() {
  const last7Records = albumsData.slice(0, 6);
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="homePage">
    <h3>Good afternoon</h3>
    <div class='categoriesClassWrapper'>
    <div class="categoryCard" on>
    <img src="../../home-card-1.png" alt="" />
    <div>Dance & EDM</div>
    </div>
    <div class="categoryCard">
      <img src="../../home-card-2.png" alt="" />
      <div>Country Rocks</div>
    </div>
    <div class="categoryCard">
      <img src="../../home-card-3.png" alt="" />
      <div>Indie</div>
    </div>
    <div class="categoryCard">
      <img src="../../home-card-4.png" alt="" />
      <div>Chilled Hits</div>
    </div>
    <div class="categoryCard">
      <img src="../../home-card-5.png" alt="" />
      <div>Electronic</div>
    </div>
    <div class="categoryCard">
      <img src="../../home-card-6.png" alt="" />
      <div>Are & Be</div>
    </div>
      </div>
      <h3>Recently Played</h3>
      <div class="recently-gallery-wrapper">
      ${last7Records
        .map((album: Album) => {
          return `<div class="recently-gallery-item" onclick="navigateTo('albums/${album.album.id}')">
          <img src="${album.album.album_thumb}" class="recently-album-image" />
          <div class="recently-album-name">${album.album.album_name}</div>
        </div>`;
        })
        .join("")}
      </div>
    </div>
      ${navMenu("home")}`;
  root.appendChild(div);
}
function searchPage() {
  const div = document.createElement("div");
  div.innerHTML = `
      <div class="searchPage">
        <div class="searchBar">
          <input class="search-input" type="text" placeholder="Search" />
          <div class='clear-input'>Cancel</div>
          <img class="camera-icon" src="../../camera-icon.svg" alt="" />
        </div>
      </div>
      <div class='found-items-wrapper'></div>
      ${navMenu("search")}
      `;
  let searchResult: any = {
    artists: [],
    songs: [],
    albums: [],
  };

  root.appendChild(div);
  const cancelButton = document.querySelector(".clear-input");
  const inputElement = document.querySelector(
    ".search-input"
  ) as HTMLInputElement;
  cancelButton?.addEventListener("click", () => {
    inputElement!.value = "";
  });

  fromEvent(inputElement, "input")
    .pipe(debounceTime(1000), pluck("target", "value"))
    .subscribe({
      next: (next: string) => {
        searchHandler(next);
      },
      error: (error: any) => {
        console.log(error);
      },
      completed: null,
    });

  function searchHandler(text: string) {
    searchResult = text === "" ? null : searchFor(text);
    const itemsWrapperElement = document.querySelector(".found-items-wrapper");
    itemsWrapperElement!.innerHTML = "";
    const searchHTML = !searchResult
      ? ""
      : `
    ${
      // artists
      searchResult.artists.length !== 0
        ? searchResult.artists
            .map((artist: any) => {
              return `<div class="found-item">
        <img class="found-pic" src="../../found-pic.jpg" style='border-radius:50%;' alt="" />
        <div class='found-wrapper'>
        <div class="found-name">${artist.name}</div>
        <div class="found-type">Artist</div>
        </div>
        <img class="cross-icon" src="../../close-icon.svg" alt="delete" />
        </div>`;
            })
            .join("")
        : ""
    }
    ${
      // songs
      searchResult.songs.length !== 0
        ? searchResult.songs
            .map((song: any) => {
              return `<a class="found-item" onclick="navigateTo('music/${song.id}')">
        <img class="found-pic" src=${song.track_thumb} alt="" />
        <div class='found-wrapper'>
        <div class="found-name">${song.track_name}</div>
        <div class="found-type">song</div>
        </div>
        <img class="cross-icon" src="../../close-icon.svg" alt="delete" />
        </a>`;
            })
            .join("")
        : ""
    }
    ${
      // albums
      searchResult.albums.length !== 0
        ? searchResult.albums
            .map((album: any) => {
              return `<div class="found-item" onclick="navigateTo('albums/${album.id}')">
        <img class="found-pic" src=${album.album_thumb} alt="" />
        <div class='found-wrapper'>
        <div class="found-name">${album.album_name}</div>
        <div class="found-type">Album by ${album.album_composer}</div>
        </div>
        <img class="cross-icon" src="../../close-icon.svg" alt="delete" />
        </div>`;
            })
            .join("")
        : ""
    }
    `;
    itemsWrapperElement!.insertAdjacentHTML("afterbegin", searchHTML);
  }
  function searchFor(searchText: string) {
    const resultsInArtists = albumsData.filter((result) =>
      result.album.album_composer
        .toLowerCase()
        .startsWith(searchText.toLowerCase())
    );

    let resultsInSongs: Music[] = [];
    albumsData.forEach((album) => {
      const foundedInMusics = album.musics.filter((music) =>
        music.track_name.toLowerCase().startsWith(searchText.toLowerCase())
      );
      foundedInMusics.length && resultsInSongs.push(...foundedInMusics);
    });
    const resultsInAlbumName = albumsData.filter((result) =>
      result.album.album_name.toLowerCase().startsWith(searchText.toLowerCase())
    );
    return {
      artists: resultsInArtists.map((result) => {
        return { ID: result.album.id, name: result.album.album_composer };
      }),
      songs: resultsInSongs.map((result) => {
        return result;
      }),
      albums: resultsInAlbumName.map((result) => {
        return result.album;
      }),
    };
  }
}
function libraryPage() {
  const likedItem = `<div class="like-item" onclick='navigateTo("library/likedsongs")'>
  <img
  class="likedsongs-pic"
  src="../../like-fill-icon.svg"
  alt=""
  />
  <div class="likedsongs-name">Liked Songs</div>
  </div>`;

  const div = document.createElement("div");
  div.innerHTML = `
  <div class="category-music">Music</div>
  <div class="library-grouping">
    <div class="library-tab library-playlists active">Playlists</div>
    <div class="library-tab library-artists">Artists</div>
    <div class="library-tab library-albums">Albums</div>
  </div>
  <div class='library-content'>
  ${likedItem}
  </div>
      ${navMenu("library")}`;
  root.appendChild(div);

  const tabElements = document.querySelectorAll(".library-tab");
  const playlistsButton = document.querySelector(".library-playlists");
  const artistsButton = document.querySelector(".library-artists");
  const albumsButton = document.querySelector(".library-albums");
  const pageContent = document.querySelector(".library-content");

  albumsButton?.addEventListener("click", () => {
    changeActiveTab("Albums");
    pageContent!.innerHTML = `
    <div class="searchBar">
    <input class="search-input" type="text" placeholder="Find in albums" onkeydown="searchStartHandler(event)"
    />
    <div class='filters'>Filters</div>
    </div>
    <div class='albums-wrapper'> 
    ${albumsData
      .map((album) => {
        return `
        <div class="album-item" onclick="navigateTo('albums/${album.album.id}')">
        <img src="${album.album.album_thumb}" alt="" class="album-image" />
        <div class="album-details">
          <div class="album-name">${album.album.album_name}</div>
          <div class="album-composer">${album.album.album_composer}</div>
        </div>
      </div>`;
      })
      .join("")}
      </div>
    `;
  });

  artistsButton?.addEventListener("click", () => {
    changeActiveTab("Artists");
    pageContent!.innerHTML = `
    <div class="searchBar">
      <input class="search-input" type="text" placeholder="Find in artists" onkeydown="searchStartHandler(event)"/>
      <div class='filters'>Filters</div>
    </div>
    <div class='albums-wrapper'> 
    ${albumsData
      .map((album) => {
        return `
        <div class="album-item" onclick="navigateTo('albums/${album.album.id}')">
        <img src="../../found-pic.jpg" alt="" class="artist-image" />
        <div class="album-details">
          <div class="album-composer">${album.album.album_composer}</div>
        </div>
      </div>`;
      })
      .join("")}
      </div>
    `;
  });

  playlistsButton?.addEventListener("click", () => {
    changeActiveTab("Playlists");
    pageContent!.innerHTML = likedItem;
  });

  function changeActiveTab(tabName: string) {
    tabElements.forEach((tab) => {
      tab.classList.remove("active");
    });
    switch (tabName) {
      case "Playlists":
        playlistsButton?.classList.add("active");
        break;
      case "Artists":
        artistsButton?.classList.add("active");
        break;
      case "Albums":
        albumsButton?.classList.add("active");
        break;
    }
  }
}
function albumsPage() {
  const albumID = window.location.href.split("/").pop()!;
  let musicDetail!: Music;
  const [albumInfo] = albumsData.filter((album) => album.album.id === albumID);

  const albumDetail = albumInfo!.album;
  const albumMusics = albumInfo!.musics;
  const div = document.createElement("div");

  div.innerHTML = `
  <div class="albumsPage">
  <div class='album-image-wrapper'>
    <div class='faded-background'></div>
    <img src="${albumDetail.album_thumb}" alt="" class="album-image" />
  </div>
  <div class="album-name">${albumDetail.album_name}</div>
  <div class="album-composer">
    <img src="../../found-pic.jpg" alt="" class="artist-image" />
    <div class="artist-name">${albumDetail.album_composer}</div>
  </div>
  <div class="album-date">Album ▪ 2017</div>
  <div class="album-icons">
    <img src="../../like-nofill-icon.svg" class="album-like" />
    <img src="../../download-icon.svg" class="album-download" />
    <img src="../../more-icon.svg" class="album-more" />
    <div class="album-play-shuffle">
      <img src="../../play-icon.svg" alt="" class="album-play-icon" />
      <img src="../../shuffle-icon.svg" alt="" class="album-shuffle-icon" />
    </div>
  </div>
  <div class="album-songs-wrapper">
  ${albumMusics
    .map((song) => {
      return `<div class="album-song-item" onclick="navigateTo('music/${song.id}')">
    <div class="album-detail">
      <div class="album-song-name">${song.track_name}</div>
      <div class="album-song-artist">${albumDetail.album_composer}</div>
    </div>
    <img src="../../more-icon.svg" alt="" class="more-icon" />
  </div>`;
    })
    .join("")}
  </div>
</div>
      ${navMenu("home")}`;
  root.appendChild(div);
  const element = document.querySelector(".album-image") as HTMLImageElement;
  window.addEventListener("scroll", () => {
    element.style.width = `calc(70% - ${window.pageYOffset}px)`;
  });
}

function likedSongsPage() {
  let likedSongs: Music[] = [];
  albumsData.forEach((album) => {
    const likedInAlbum = album.musics.filter(
      (music) => music.is_favorited === 1
    );
    likedInAlbum.length && likedSongs.push(...likedInAlbum);
  });
  const div = document.createElement("div");
  div.innerHTML = `
  <div class='likedsongs-header'>
    <div class="likedsongs">Liked Songs</div>
    <div class="likedsongs-shuffleplaybtn">SHUFFLE PLAY</div>
    <div class="likedsongs-addsongs">ADD SONGS</div>
   </div>      
  <div class='liked-items-wrapper'>
  ${
    likedSongs.length !== 0
      ? likedSongs
          .map((music: any) => {
            return `
          <div class="liked-item" onclick="navigateTo('music/${music.id}')">
          <img class="liked-pic" src="${music.track_thumb}" alt="" />
          <div class="liked-wrapper">
          <div class="liked-name">${music.track_name}</div>
          <div class="liked-type">${music.track_name}</div>
      </div>
      <img
      class="like-icon"
      src="../../like-fill-icon.svg"
      alt="like"
      />
      <img class="more-icon" src="../../more-icon.svg" alt="more" />
      </div>
      `;
          })
          .join("")
      : "<div class='no-favorites'>No song is liked yet :(</div>"
  }
  </div>
  ${navMenu("library")}`;
  root.appendChild(div);
}

async function loadTrackFromDB(
  musicid: number,
  track_url: string,
  icon: HTMLImageElement
) {
  const indexedDB = window.indexedDB; // maybe bring other browsers implementions
  let request = indexedDB.open("musicsDB", 1);

  request.onerror = function (event) {
    console.error("There was an Error opening indexedDB", request.error, event);
  };
  // database version mismatch or initial load
  request.onupgradeneeded = function () {
    const db = request.result;
    const store = db.createObjectStore("musics", { keyPath: "id" });
  };

  // new database was created or it was already there:
  request.onsuccess = function () {
    let db = request.result;
    const transaction = db.transaction("musics", "readonly");
    const store = transaction.objectStore("musics");
    const query = store.get(musicid);

    query.onsuccess = async function () {
      const queryResult = query.result;
      if (queryResult?.music) {
        // is in indexedDB, load it
        // file to (blob to) objectURL // URL.createObjectURL(blobedResponse)
        const objectURL = URL.createObjectURL(queryResult.music);
        audiotag.src = objectURL;
        icon.src = "../../play-icon.svg";
        try {
          audiotag.play().then(() => {
            icon.src = "../../pause-icon.svg";
            isPlaying = true;
          });
        } catch (error) {
          isPlaying = false;
          icon.src = "../../play-icon.svg";
        }
      } else {
        // is not in indexedDB, download it
        audiotag.src = (await downloadAndStoreInDB(track_url, musicid)) || "";
        try {
          icon.src = "../../play-icon.svg";
          audiotag.play().then(() => {
            icon.src = "../../pause-icon.svg";
            isPlaying = true;
          });
        } catch (error) {
          isPlaying = false;
          icon.src = "../../play-icon.svg";
        }
      }
    };
    transaction.oncomplete = function () {
      db.close();
    };
  };
}

async function downloadAndStoreInDB(url: string, id: number) {
  try {
    let musicFile;
    await fetch(url)
      .then((response) => response.blob())
      .then(function (blobedResponse) {
        const objectURL = URL.createObjectURL(blobedResponse);
        musicFile = objectURL;
        saveToIndexedDB(blobedResponse, id);
      });
    return musicFile as unknown as string;
  } catch (error) {
    console.log(error);
  }
}

function saveToIndexedDB(objectURl: Blob, id: number) {
  const indexedDB = window.indexedDB; // maybe bring other browsers implementions
  let request = indexedDB.open("musicsDB", 1);

  request.onerror = function (event) {
    console.error("There was an Error opening indexedDB", request.error, event);
  };
  // database version mismatch or initial load
  request.onupgradeneeded = function () {
    const db = request.result;
    const store = db.createObjectStore("musics", { keyPath: "id" });
  };

  // new database was created or it was already there:
  request.onsuccess = function () {
    let db = request.result;
    const transaction = db.transaction("musics", "readwrite");
    const store = transaction.objectStore("musics");
    const music = blobToFile(objectURl, "music.mp3");
    store.put({ id, music });
    transaction.oncomplete = function () {
      db.close();
    };
  };
}
function blobToFile(theBlob: Blob, fileName: string) {
  return new File([theBlob], fileName, { lastModified: Date.now() });
}
