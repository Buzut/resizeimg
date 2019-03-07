# resize-image

Efficiently resize and/or crop images in browser thanks to HTML5 canvas. Cropping is automatically adjusted in a smart way thanks to [smartcrop](https://github.com/jwagner/smartcrop.js).

_Why waste time on network transfer when you can compress in the browser?_


## Installation & usage

```
npm install smart-img-resize
```


```js
// require using commonJS
const resizeImage = require('smart-img-resize');

// or in es6, using a module bundler like rollup or webpack
import resizeImage from 'smart-img-resize';

// get your input file (it has id="upload-image")
const inputFile = document.getElementById('upload-image');

// get the actual file object from your input field as soon as a file is selected
inputFile.onchange = function () {
    const img = inputFile.files[0];

    resizeImage(img, {
        outputFormat: 'jpeg',
        targetWidth: 200,
        targetHeight: 200,
        crop: true
    }, (err, b64img) => {
        if (err) {
            console.error(err);
            return;
        }

        // do what you have to with the b64img
    });
};
```

### Parameters

The function takes three arguments:

- `img` – the image as a file object from input file
- `options` object
  - {string} `outputFormat` – (jpe?g|png|canvas), canvas => canvas element, others => dataURI
  - {string} `targetWidth`
  - {string} `targetHeight`
  - {bool} `crop` – if true, (smartly) crop image to the desired dimensions (optional)
  - {bool} `forceRatio` – if true, force dimensions without regard to the aspect ratio (optional)
- `callback`

__Note that `crop` and `forceRatio` are mutually exclusive__

## Contributing
There's sure room for improvement, so feel free to hack around and submit PRs!
Please just follow the style of the existing code, which is [Airbnb's style](http://airbnb.io/javascript/) with [minor modifications](.eslintrc).

To maintain things clear and visual, please follow the [git commit template](https://github.com/Buzut/git-emojis-hook).
