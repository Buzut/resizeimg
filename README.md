# resize-image

Resize image allows to efficiently resize and/or crop images in the browser prior to upload thanks to HTML5 canvas. Cropping is automatically adjusted in a smart way thanks to [smartcrop](https://github.com/jwagner/smartcrop.js).

_Why waste time on network transfer when you can compress in the browser?_


## Installation

### Bower

```
bower install resizeimage
```

### Manual

Download the archive and extract it. Then just link `resize-image.js` in your `<head>`:

    <script src="resize-image.js"></script>

## Can I haz the code?

__Yes sir!__

_You'll notice that this is ES6 code (so is the module, more details below), treat with caution._

```js
// get your input file (it has id="upload-image")
const inputFile = document.getElementById('upload-image');

// get the actual file object from your input field as soon as a file is selected
inputFile.onchange = function(event) {
   const img = inputFile.files[0];

	resizeImage(img, { outputFormat: 'jpeg', targetWidth: 200, targetHeight: 200, crop: true }, (err, b64img) => {
    	if (err) {
    	    console.error(err);
    	    return;
    	}

    	// do what you have to with the b64img
	});
});
```

### Parameters

The function takes three arguments:

- `img` – the image as a file object from input file
- `options` object
  - {string} `outputFormat` – (jpe?g or png)
  - {string} `targetWidth`
  - {string} `targetHeight`
  - {bool} `crop` – if true, (smartly) crop image to the desired dimensions (optional)
  - {bool} `forceRatio` – if true, force dimensions without regard to the aspect ratio (optional)
- `callback`

__Note that `crop` and `forceRatio` are mutually exclusive__


## ES6 compatibility without a build pipeline

The module is written is ES2015. If you want it compatible with (moderately) older browsers and don't have a build process, you'll have to [transpile it to ES5](https://es6console.com/). While you're at it, don't forget to uglify it for better delivery.
