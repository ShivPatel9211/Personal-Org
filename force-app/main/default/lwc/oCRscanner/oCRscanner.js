import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import IMAGE_COMPRESSION from '@salesforce/resourceUrl/compressJs';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOCResponseBase64 from '@salesforce/apex/OCRScannerController.getOCResponseBase64';
import createContact from '@salesforce/apex/OCRScannerController.createContact';
import { NavigationMixin } from 'lightning/navigation';

export default class OCRscanner extends NavigationMixin(LightningElement) {
    @track base64Data;
    @track OCRextractedText;
    @track textExtracted = false;
    @track totalLines = [];
    @track contactInfo = {
        Name: '',
        Title: '',
        Company: '',
        Address: '',
        Phone: [],
        Email: '',
        Website: ''
    };
    isLoaded = true;
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
        this.isLoaded = false;
        const file = event.target.files[0];
        if (file) {
            this.originalImage = file;
            this.originalSize = this.formatSize(file.size);
            this.originalImageUrl = URL.createObjectURL(file);
            console.log('Orginal Image Size' + this.originalSize);
            if (file.size > 1048576) { // If file size is greater than 1MB
                this.compressImage(file);
            } else {
                this.processFile(file);
            }
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
            this.processFile(compressedFile); // Continue with your OCR process using the compressed file
        } catch (error) {
            console.error('Error compressing image', error);
        }
    }

    processFile(file) {
        console.log('after compress:', file.size);
        this.getFileType(file).then(fileType => {
            console.log('File type:', fileType);
            const reader = new FileReader();
            reader.onloadend = () => {
                this.base64Data = `data:${fileType};base64,${reader.result.split(',')[1]}`;
                this.getOCRExtractedText();
            };
            reader.readAsDataURL(file);
        }).catch(error => {
            console.error('Error:', error);
        });
    }

    getFileType(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const arr = new Uint8Array(reader.result).subarray(0, 4);
                let header = '';
                for (let i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16);
                }
                switch (header) {
                    case '89504e47':
                        resolve('image/png');
                        break;
                    case '47494638':
                        resolve('image/gif');
                        break;
                    case 'ffd8ffe0':
                    case 'ffd8ffe1':
                    case 'ffd8ffe2':
                        resolve('image/jpeg');
                        break;
                    case '25504446':
                        resolve('application/pdf');
                        break;
                    default:
                        reject('Unknown file type');
                        break;
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    getOCRExtractedText() {
        getOCResponseBase64({ base64Data: this.base64Data })
            .then(data => {
                console.log('data from backend', data);
                let parsData = JSON.parse(data);
                this.OCRextractedText = parsData.ParsedResults[0].ParsedText;
                if (this.OCRextractedText.length == 0) {
                    const e = new ShowToastEvent({
                        title: 'Error',
                        message: 'File size is too big or no text extracted from uploaded file',
                        variant: 'error',
                    });
                    this.dispatchEvent(e);
                    this.isLoaded = true;
                    this.textExtracted = false;
                    //console.error('File size is too big or no text extracted from uploaded file')
                }
                else {
                    this.parseBusinessCard(this.OCRextractedText)
                    this.isLoaded = true;
                }
                console.log('data from backend', JSON.stringify(parsData.ParsedResults[0].ParsedText));
            })
            .catch(error => {
                console.log('error', JSON.stringify(error));
            });
    }

    parseBusinessCard(text) {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        const phoneRegex = /\b\d{2,4}[-.\s]?\d{3}[-.\s]?\d{4}\b/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const websiteRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

        let i = 0;

        // Extract email
        for (i = 0; i < lines.length; i++) {
            if (emailRegex.test(lines[i])) {
                this.contactInfo.Email = lines[i];
                break;
            }
        }

        // Extract phone numbers
        for (i = 0; i < lines.length; i++) {
            if (phoneRegex.test(lines[i])) {
                this.contactInfo.Phone.push(lines[i].match(phoneRegex)[0]);
            }
        }

        // Extract website
        for (i = 0; i < lines.length; i++) {
            if (websiteRegex.test(lines[i])) {
                this.contactInfo.Website = lines[i];
                break;
            }
        }

        // Extract address
        for (i = lines.length - 1; i >= 0; i--) {
            if (lines[i].match(/^\d+/) || lines[i].match(/#[\d\w\s,]+/) || lines[i].match(/\d{5}/)) {
                this.contactInfo.Address = lines[i];
                break;
            }
        }

        // Extract name, title, and company
        let nameSet = false, titleSet = false, companySet = false;
        for (i = 0; i < lines.length; i++) {
            if (
                lines[i] === this.contactInfo.Email ||
                this.contactInfo.Phone.includes(lines[i]) ||
                lines[i] === this.contactInfo.Address ||
                lines[i] === this.contactInfo.Website
            ) {
                continue;
            }
            if (!nameSet) {
                this.contactInfo.Name = lines[i];
                nameSet = true;
            } else if (!titleSet) {
                this.contactInfo.Title = lines[i];
                titleSet = true;
            } else if (!companySet) {
                this.contactInfo.Company = lines[i];
                companySet = true;
            }
        }

        // Handle case where company is split into multiple lines
        if (this.contactInfo.Company === '' && !this.contactInfo.Title.includes(' ')) {
            this.contactInfo.Company = this.contactInfo.Title;
            this.contactInfo.Title = lines[1]; // Assuming the second line is the company name if title is a single word
        }

        // Adjust company if it was split into two lines
        if (!this.contactInfo.Company.includes(' ') && lines.length > 1 && lines[0].includes(' ')) {
            this.contactInfo.Company = lines[0] + ' ' + lines[1];
        }
        this.totalLines.push('None');
        for (i = 0; i < lines.length; i++) {
            this.totalLines.push(lines[i]);
            this.textExtracted = true;
        }
        return this.contactInfo;
    }

    handleOptionChange(event) {
        console.log('HandleChange', event.target.name);
        this.contactInfo[event.target.name] = event.target.value;
        console.log(this.contactInfo);
    }
    handleInputChange(event) {
        this.contactInfo[event.target.label] = event.target.value;
    }
    handleSave(event) {
        createContact({ contactInfo: JSON.stringify(this.contactInfo) })
            .then(result => {
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: result,
                        objectApiName: 'Contact',
                        actionName: 'view'
                    },
                });
            })
            .catch(error => {
                console.log('error ' + JSON.stringify(error));
            })
    }
}