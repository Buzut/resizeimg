import smartcrop from 'smartcrop';

/**
 * Read EXIF orentation from JPEG file
 * attribution https://stackoverflow.com/questions/7584794/
 * @param { Object } file
 * @return { Promise }
 */
function getOrientation(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = () => {
            const view = new DataView(reader.result);
            if (view.getUint16(0, false) !== 0xFFD8) {
                return resolve(-2);
            }

            const length = view.byteLength;
            let offset = 2;

            while (offset < length) {
                if (view.getUint16(offset + 2, false) <= 8) return resolve(-1);

                const marker = view.getUint16(offset, false);
                offset += 2;

                if (marker === 0xFFE1) {
                    if (view.getUint32(offset += 2, false) !== 0x45786966) return resolve(-1); // eslint-disable-line

                    const little = view.getUint16(offset += 6, false) === 0x4949;
                    offset += view.getUint32(offset + 4, little);
                    const tags = view.getUint16(offset, little);
                    offset += 2;
                    for (let i = 0; i < tags; i++) {
                        if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                            return resolve(view.getUint16(offset + (i * 12) + 8, little));
                        }
                    }
                }

                else if ((marker & 0xFF00) !== 0xFF00) break; // eslint-disable-line
                else offset += view.getUint16(offset, false);
            }

            return resolve(-1);
        };

        reader.readAsArrayBuffer(file);
    });
}

/**
 * Take file object from input file and convert it to base64
 * @param { Object } file
 * @param { Function } callback – base64 dataUrl
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
 * @param { String } b64img
 * @param { Function } callback – HTMLImageElement
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
 * @param { Object } imgObj – HTMLImageElement
 * @param { String } targetWidth
 * @param { String } targetHeight
 * @param { Bool } crop
 * @param { Bool } forceRatio
 * @param { Function } callback – object containing image size and cropping info
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

        return;
    }

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

/**
 * Resize an image, preserving (or not), its aspect ratio
 * @param { Object } file – file object from input file
 * @param { Object } options - this object requires the following options:
 *  { String } outputFormat – (jpe?g|png|canvas)
 *  { String } targetWidth
 *  { String } targetHeight
 *  { Bool } crop – if true, will (smartly) crop image to fit given dimensions (optional)
 *  { Bool } forceRatio – if true, force dimensions without regard to the aspect ratio (optional)
 * @param { Function } callback – err, b64img (the image is returned as a base64 dataUrl string)
 */
function resize(img, options, callback) {
    if (!/(jpe?g|png)$/i.test(img.type)) {
        callback(new TypeError('image must be either jpeg or png'));
        return;
    }

    if (!/^(jpe?g|png|canvas)$/.test(options.outputFormat)) {
        callback(new Error('outputFormat must be either (jpe?g|png|canvas)'));
        return;
    }

    const output = (options.outputFormat === 'png') ? 'png' : 'jpeg';
    const orientation = getOrientation(img);

    convertFileToB64(img, (b64img) => {
        getImage(b64img, (imgObj) => {
            const { crop } = options;
            const { forceRatio } = options;

            computeNewSize(imgObj, options.targetWidth, options.targetHeight, crop, forceRatio, (newSize) => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = newSize.dstWidth;
                canvas.height = newSize.dstHeight;

                orientation.then((exifOrientation) => {
                    if (exifOrientation > 4) {
                        canvas.width = newSize.dstHeight;
                        canvas.height = newSize.dstWidth;
                    }

                    if (exifOrientation === 3) {
                        context.rotate(Math.PI);
                        context.translate(-newSize.dstWidth, -newSize.dstHeight);
                    }

                    else if (exifOrientation === 6) {
                        context.rotate(0.5 * Math.PI);
                        context.translate(0, -newSize.dstHeight);
                    }

                    else if (exifOrientation === 8) {
                        context.rotate(-0.5 * Math.PI);
                        context.translate(-newSize.dstWidth, 0);
                    }

                    context.drawImage(imgObj, newSize.srcX, newSize.srcY, newSize.srcWidth, newSize.srcHeight, 0, 0, newSize.dstWidth, newSize.dstHeight);

                    callback(null, options.outputFormat === 'canvas' ? canvas : canvas.toDataURL(`image/${output}`));
                });
            });
        });
    });
}

export default resize;
