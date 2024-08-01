import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import IMAGE_COMPRESSION from '@salesforce/resourceUrl/compressJs';

export default class FileCompress extends LightningElement {
    @track originalImage;
    @track compressedImage;
    @track originalSize;
    @track compressedSize;
    @track originalImageUrl;
    @track compressedImageUrl;

    imageCompressionLibInitialized = false;

    renderedCallback() {
        if (this.imageCompressionLibInitialized) {
            return;
        }
        this.imageCompressionLibInitialized = true;

        loadScript(this, IMAGE_COMPRESSION)
            .then(() => {
                console.log('Image compression library loaded successfully');
            })
            .catch(error => {
                console.error('Error loading image compression library', error);
            });
    }

    handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            this.originalImage = file;
            this.originalSize = this.formatSize(file.size);
            this.originalImageUrl = URL.createObjectURL(file);
            this.compressImage(file);
        }
    }

    formatSize(size) {
        return (size / 1024 / 1024).toFixed(2);
    }

    async compressImage(file) {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        };
        try {
            const compressedFile = await window.imageCompression(file, options);
            this.compressedImage = compressedFile;
            this.compressedSize = this.formatSize(compressedFile.size);
            this.compressedImageUrl = URL.createObjectURL(compressedFile);
        } catch (error) {
            console.error('Error compressing image', error);
        }
    }
}