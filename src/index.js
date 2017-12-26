const smartcrop = require('smartcrop');

/**
 * Take file object from input file and convert it to base64
 * @param {object} file
 * @callback – base64 dataUrl
 */
function convertFileToB64(file, callback) {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
        callback(reader.result);
    }, false);

    reader.readAsDataURL(file);
}

/**
 * Create an HTMLImageElement from b64 string
 * @param {string} b64img
 * @callback – HTMLImageElement
 */
function getImage(b64img, callback) {
    const imgObj = new Image();

    imgObj.onload = () => {
        callback(imgObj);
    };

    imgObj.src = b64img;
}

/**
 * Compute image new size and crop info (if any)
 * @param {object} imgObj – HTMLImageElement
 * @param {string} targetWidth
 * @param {string} targetHeight
 * @param {bool} crop
 * @param {bool} forceRatio
 * @callback – object containing image size and cropping info
 */
function computeNewSize(imgObj, targetWidth, targetHeight, crop, forceRatio, callback) {
    const imgWidth = imgObj.width;
    const imgHeight = imgObj.height;

    if (crop) {
        smartcrop.crop(imgObj, { width: targetWidth, height: targetHeight }).then((cropInfos) => {
            callback({
                srcX: cropInfos.topCrop.x,
                srcY: cropInfos.topCrop.y,
                srcWidth: cropInfos.topCrop.width,
                srcHeight: cropInfos.topCrop.height,
                dstWidth: targetWidth,
                dstHeight: targetHeight
            });
        });
    }

    else {
        let newWidth;
        let newHeight;

        if (forceRatio) {
            newWidth = targetWidth;
            newHeight = targetHeight;
        }

        else if (imgWidth > imgHeight) {
            newWidth = targetWidth;
            newHeight = Math.round((imgHeight / imgWidth) * newWidth);
        }

        else {
            newHeight = targetHeight;
            newWidth = Math.round((imgWidth / imgHeight) * newHeight);
        }

        callback({
            srcX: 0,
            srcY: 0,
            srcWidth: imgWidth,
            srcHeight: imgHeight,
            dstWidth: newWidth,
            dstHeight: newHeight
        });
    }
}

/**
 * Resize an image, preserving (or not), its aspect ratio
 * @param {object} file – file object from input file
 * @param {object} options - this object requires the following options:
 *  {string} outputFormat – (jpe?g or png)
 *  {string} targetWidth
 *  {string} targetHeight
 *  {bool} crop – if true, will (smartly) crop image to fit given dimensions (optional)
 *  {bool} forceRatio – if true, force dimensions without regard to the aspect ratio (optional)
 * @callback – err, b64img (the image is returned as a base64 dataUrl string)
 */
function resize(img, options, callback) {
    if (!/(jpe?g|png)$/i.test(img.type)) {
        callback(new TypeError('image must be either jpeg or png'));
        return;
    }

    if (options.outputFormat !== 'jpg' && options.outputFormat !== 'jpeg' && options.outputFormat !== 'png') {
        callback(new Error('outputFormat must be either jpe?g or png'));
        return;
    }

    const output = (options.outputFormat === 'png') ? 'png' : 'jpeg';

    convertFileToB64(img, (b64img) => {
        getImage(b64img, (imgObj) => {
            const { crop } = options;
            const { forceRatio } = options;

            computeNewSize(imgObj, options.targetWidth, options.targetHeight, crop, forceRatio, (newSize) => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = newSize.dstWidth;
                canvas.height = newSize.dstHeight;
                context.drawImage(imgObj, newSize.srcX, newSize.srcY, newSize.srcWidth, newSize.srcHeight, 0, 0, newSize.dstWidth, newSize.dstHeight);
                callback(null, canvas.toDataURL(`image/${output}`));
            });
        });
    });
}

export default resize;
