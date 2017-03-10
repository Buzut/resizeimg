window.resizeImage = (() => {
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
     * Resize an image, preserving (or not), its aspect ratio
     * @param {object} file – file object from input file
     * @param {object} options - this object requires the following options:
     *  {string} outputFormat – (jpe?g or png)
     *  {string} targetWidth
     *  {string} targetHeight
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
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                const imgWidth = imgObj.width;
                const imgHeight = imgObj.height;
                let width;
                let height;

                if (!options.forceRatio) {
                    if (imgWidth > imgHeight) {
                        width = options.targetWidth;
                        height = Math.round((imgHeight / imgWidth) * width);
                    }

                    else {
                        height = options.targetHeight;
                        width = Math.round((imgWidth / imgHeight) * height);
                    }
                }

                else {
                    width = options.targetWidth;
                    height = options.targetHeight;
                }

                canvas.width = width;
                canvas.height = height;
                context.drawImage(imgObj, 0, 0, width, height);
                callback(null, canvas.toDataURL(`image/${output}`));
            });
        });
    }

    return resize;
})();
