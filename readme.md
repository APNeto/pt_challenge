## Project Challenge for PrivacyTools

Frontend challenge which shall not use libraries or frameworks. It might/may only use pure JavaScript;

## What it does
1. Fetch images from PrivacyTools API. Unfortunately, due to CORS, the info of how many images are there in total could not be retrieved from the headers.
2. Show image fetched along with the header and footer.
3. Header and footer each have their own set of button actions: header has the actions on dealing with the image, while footer has the actions to change the image being presented at the moment.
4. It should add Hachuras to the image without any problem. However, while creating the hachura, the image is growing higher (for now).
5. With the scroll, the user should be able to zoom in and out off the image. There is a reset button, but not 100% functional (for now).
6. With the download button, the user should be able to download the resulting images with the hachuras.

## The code
The code is simply split into 3 files, one for each technology: html, css and javascript.

Tried to follow good rules and practices, such as semantic HTML, variables and functions naming with patterns on javascript as well as id and classes names for css/javascript. 