const imageDisplay = document.getElementById("displayedImage");
const currentPageIndicator = document.getElementById("currentPageIndicator");
const firstPageButton = document.getElementById("firstPageButton");
const previousPageButton = document.getElementById("previousPageButton");
const nextPageButton = document.getElementById("nextPageButton");
const lastPageButton = document.getElementById("lastPageButton");
const hachureButton = document.getElementById("hachureButton");
const resetZoomButton = document.getElementById("resetZoomButton");
const downloadButton = document.getElementById("downloadButton");
const imageContainer = document.querySelector("#image-container");

const apiEndpoint = "https://api-hachuraservi1.websiteseguro.com/api/document";
let currentPage = 1;
const totalPages = 30; // Replace with the actual total number of pages from the API
let isDrawingMode = false;
let isDrawing = false;
let currentHachure = null;
const hachures = [];
let zoomLevel = 1;
const maxZoom = 3; // Maximum zoom level
const minZoom = 0.5; // Minimum zoom level

// Function to fetch the image from the API
function fetchImage() {
  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: "Basic 96f9c92582aed580ba10a780e8af7fea57531c9c",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `page=${currentPage}`,
  };

  // const xhr = new XMLHttpRequest();
  // xhr.open("POST", apiEndpoint, true);
  // xhr.setRequestHeader(
  //   "Authorization",
  //   "Basic 96f9c92582aed580ba10a780e8af7fea57531c9c"
  // );
  // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  // xhr.onload = function () {
  //   if (xhr.status >= 200 && xhr.status < 300) {
  //     const totalPages = xhr.getResponseHeader("total_page");
  //     console.log("Total Pages:", totalPages);

  //     const data = JSON.parse(xhr.responseText);
  //     // ... your code to handle the data and totalPages
  //   } else {
  //     console.error("API request failed with status", xhr.status);
  //   }
  // };

  // xhr.onerror = function () {
  //   console.error("API request failed");
  // };

  // xhr.send(`page=${currentPage}`);
  fetch(apiEndpoint, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.image) {
        // Check if the image data already includes the data URL prefix
        if (data.image.startsWith("data:image")) {
          imageDisplay.src = data.image; // Use the data URL directly
        } else {
          // Determine the image type from the API response (if available)
          const imageType = data.imageType || "png";

          // Construct the image src with the correct image type
          imageDisplay.src = `data:image/<span class="math-inline">\{imageType\};base64,</span>{data.image}`;
        }

        currentPageIndicator.textContent = `Página ${currentPage}`;
      } else {
        imageDisplay.src = "";
        currentPageIndicator.textContent = "No image found";
      }
    })
    .catch((error) => {
      console.error("Error fetching image:", error);
      alert(`Error loading image: ${error.message}`);
    });
}

// Function to update the pagination buttons' state
function updatePaginationButtons() {
  firstPageButton.disabled = currentPage === 1;
  previousPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === totalPages;
  lastPageButton.disabled = currentPage === totalPages;
}

// Function to navigate to a specific page
function goToPage(pageNumber) {
  currentPage = pageNumber;
  fetchImage();
  updatePaginationButtons();
}

// Event listeners for pagination buttons
firstPageButton.addEventListener("click", () => currentPage-10 > 0 ? goToPage(currentPage-10) : goToPage(1));
previousPageButton.addEventListener("click", () => goToPage(currentPage - 1));
nextPageButton.addEventListener("click", () => goToPage(currentPage + 1));
lastPageButton.addEventListener("click", () => currentPage+10 < totalPages ? goToPage(currentPage+10) : goToPage(totalPages));

// Initial button state update
updatePaginationButtons();

// Function to start drawing a hachure
function startDrawing(e) {
  e.preventDefault();
  isDrawing = true;
  currentHachure = {
    x1: e.offsetX,
    y1: e.offsetY,
    x2: e.offsetX,
    y2: e.offsetY,
    color: "rgba(128, 0, 128, 0.1)",
  };
  hachures.push(currentHachure);
  redrawHachures();
}

// Function to update the hachure while drawing
function draw(e) {
  e.preventDefault();
  if (!isDrawing) return;
  currentHachure.x2 = e.offsetX;
  currentHachure.y2 = e.offsetY;
  redrawHachures();
}

// Function to stop drawing
function stopDrawing() {
  isDrawing = false;
  currentHachure = null;
  // Store hachures in localStorage (or sessionStorage ???)
  // Should be used to retrieve the hachures later when user come back to image  
  localStorage.setItem("hachures", JSON.stringify(hachures));
}

// Function to delete a hachure
function deleteHachure(e) {
  const clickedX = e.offsetX;
  const clickedY = e.offsetY;

  // Find the hachure that was clicked
  const clickedHachureIndex = hachures.findIndex((hachure) => {
    const distance =
      Math.abs(
        (hachure.y2 - hachure.y1) * clickedX -
          (hachure.x2 - hachure.x1) * clickedY +
          hachure.x2 * hachure.y1 -
          hachure.y2 * hachure.x1
      ) /
      Math.sqrt(
        Math.pow(hachure.y2 - hachure.y1, 2) +
          Math.pow(hachure.x2 - hachure.x1, 2)
      );
    return distance < 5; // Adjust the threshold as needed
  });

  if (clickedHachureIndex > -1) {
    hachures.splice(clickedHachureIndex, 1); // Remove the hachure from the array
    redrawHachures();
    localStorage.setItem("hachures", JSON.stringify(hachures)); // Update localStorage
  }
}

imageContainer.addEventListener("click", deleteHachure);

// Function to draw the image on the canvas
function drawImageOnCanvas(canvas, ctx) {
  ctx.drawImage(imageDisplay, 0, 0, canvas.width, canvas.height);
}

// Function to draw the hachures on the canvas
function drawHachuresOnCanvas(canvas, ctx) {
  hachures.forEach((hachure) => {
    const width = Math.abs(hachure.x2 - hachure.x1);
    const height = Math.abs(hachure.y2 - hachure.y1);
    const x = Math.min(hachure.x1, hachure.x2);
    const y = Math.min(hachure.y1, hachure.y2);
    ctx.fillStyle = hachure.color;
    ctx.fillRect(
      x * zoomLevel,
      y * zoomLevel,
      width * zoomLevel,
      height * zoomLevel
    );
  });
}

// Function to redraw all elements on the canvas
function redrawHachures() {
  const canvas = document.createElement("canvas");
  canvas.width = imageContainer.scrollWidth;
  canvas.height = imageContainer.scrollHeight;
  const ctx = canvas.getContext("2d");
  drawImageOnCanvas(canvas, ctx);
  drawHachuresOnCanvas(canvas, ctx);
  imageDisplay.src = canvas.toDataURL();
}

// Event listeners for adding the hachures
hachureButton.addEventListener("click", () => {
  isDrawingMode = !isDrawingMode;

  if (isDrawingMode) {
    hachureButton.textContent = "Parar Hachura";
    imageContainer.removeEventListener("click", deleteHachure);
    imageContainer.removeEventListener("wheel", zoom);


    imageContainer.addEventListener("mousedown", startDrawing);
    imageContainer.addEventListener("mousemove", draw);
    imageContainer.addEventListener("mouseup", stopDrawing);
  } else {
    hachureButton.textContent = "Hachurar";
    imageContainer.removeEventListener("mousedown", startDrawing);
    imageContainer.removeEventListener("mousemove", draw);
    imageContainer.removeEventListener("mouseup", stopDrawing);
    imageContainer.addEventListener("click", deleteHachure);
    imageContainer.addEventListener("wheel", zoom);
  }
});

// Event listener for zooming
function zoom(e) {
    e.preventDefault();
  
    const scaleFactor = 1.1;
    let newZoomLevel = zoomLevel * (e.deltaY < 0 ? scaleFactor : 1 / scaleFactor);
  
    // Clamp the zoom level within the limits
    zoomLevel = Math.min(Math.max(newZoomLevel, minZoom), maxZoom);
  
    // Apply zoom to the image
    imageDisplay.style.transform = `scale(${zoomLevel})`;
}
imageContainer.addEventListener("wheel", zoom);

// Event listener for reset zoom
resetZoomButton.addEventListener("click", () => {
  zoomLevel = 1;
  imageDisplay.style.transform = `scale(${zoomLevel})`;
  redrawHachures();
});

// Event listener for download
downloadButton.addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  canvas.width = imageContainer.offsetWidth;
  canvas.height = imageContainer.offsetHeight;
  const ctx = canvas.getContext("2d");

  drawImageOnCanvas(canvas, ctx);
  drawHachuresOnCanvas(canvas, ctx);

  const dataURL = canvas.toDataURL("image/jpeg");

  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "hachured_image.jpg";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Initial image fetch
fetchImage();
