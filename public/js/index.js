console.log(`It works!`);

let secretToken = "";
function checkTokenInStorage() {
  const token = localStorage.getItem("rin-transcribe-auth-secret");
  if (!token) {
    const tokenStr = prompt("Please set your token");
    if (tokenStr) {
      localStorage.setItem("rin-transcribe-auth-secret", tokenStr);
      location.reload();
    }
    return;
  }
  secretToken = token;
}

function refresh() {
  document.querySelector("#input-audio-file").value = "";
  document.querySelector("#output").value = "";
  location.reload();
}

function showLoading() {
  const loading = document.querySelector("#loading");
  loading.classList.remove("d-none");
}

function hideLoading() {
  const loading = document.querySelector("#loading");
  loading.classList.add("d-none");
}

function uploadAudioFile() {
  const inputFile = document.querySelector("#input-audio-file");

  if (!inputFile.files[0]) {
    alert("Error: Select audio file");
    return;
  }

  showLoading();

  const data = new FormData();
  data.append("file", inputFile.files[0]);

  fetch("/upload", {
    method: "POST",
    body: data,
    headers: {
      "rin-transcribe-auth-secret": secretToken,
    },
  })
    .then(async (res) => {
      if (!res.ok) {
        return res.text().then((text) => {
          throw new Error(text);
        });
      }
      return res.json();
    })
    .then((data) => {
      const text = data.data.text;
      const ta = document.querySelector("#output");
      ta.value = text;
    })
    .catch((err) => {
      alert(`Error uploading audio: ${err.message}`);
      console.log("Got an error from /upload", err.message);
    })
    .finally(() => {
      hideLoading();
    });
}

// start
checkTokenInStorage();
