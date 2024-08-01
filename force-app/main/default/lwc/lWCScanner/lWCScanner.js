import { LightningElement, track } from 'lwc';
import { getDocumentScanner } from "lightning/mobileCapabilities";
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createLead from '@salesforce/apex/OCRScannerController.createLead';
export default class LWCScanner extends NavigationMixin(LightningElement) {
    scannedDocument;
    show = false;
    totalLines = [];
    @track LeadInfo;
    handleScanFromCameraClick() {
        this.scanDocument("DEVICE_CAMERA");
    }

    handleScanFromPhotoLibraryClick() {
        this.scanDocument("PHOTO_LIBRARY");
    }

    scanDocument(imageSource) {
        // Clear previous results / errors
        this.resetScanResults();

        // Main document scan cycle
        const myScanner = getDocumentScanner();
        if (myScanner.isAvailable()) {
            // Configure the scan
            const options = {
                imageSource: imageSource,
                scriptHint: "LATIN",
                returnImageBytes: true,
            };

            // Perform document scan
            myScanner
                .scan(options)
                .then((results) => {
                    // Do something with the results
                    this.processScannedDocuments(results);
                })
                .catch((error) => {
                    // Handle errors
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Error',
                        message: "Error code: " + error.code + "\nError message: " + error.message,
                        variant: 'error'
                    }));

                });
        } else {
            // Scanner not available
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Problem initiating scan. Are you using a mobile device?',
                variant: 'error'
            }));
        }
    }

    resetScanResults() {
        this.scannedDocument = null;
    }

    processScannedDocuments(documents) {
        // DocumentScanner only processes the first scanned document in an array
        this.scannedDocument = documents[0];
        //this.rowData = JSON.stringify(documents[0]);
        const lines = documents[0].text.split(/\r?\n/).filter(line => line.trim() !== '');
        this.LeadInfo = this.extractLeadInfo(lines);
        this.show = true;
        // And this is where you take over; process results as desired
    }
    extractLeadInfo(array) {
        let LeadInfo = {
            name: '',
            companyName: '',
            title: '',
            phone: '',
            email: '',
            website: '',
            address: ''
        };

        // Regex patterns
        const titleRegex = /\b(Founder & CEO|Director|Manager|CEO|CTO|CFO|COO|Owner|President|[\w]+er|[\w]+(?:designer|developer|creator|inventor))\b/i;
        const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
        const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
        const websiteRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

        array.forEach((item, index) => {
            // Detect email
            if (emailRegex.test(item)) {
                LeadInfo.email = item.match(emailRegex)[0];
            }
            // Detect phone number
            else if (phoneRegex.test(item)) {
                LeadInfo.phone = item.match(phoneRegex)[0];
            }
            // Detect website
            else if (websiteRegex.test(item)) {
                LeadInfo.website = item;
            }
            // Detect title
            else if (titleRegex.test(item)) {
                LeadInfo.title = item.match(titleRegex)[0];
            }
            // Assume last item is the address if it wasn't matched previously
            else if (index === array.length - 1) {
                LeadInfo.address = item;
            }
            // Detect company name and name
            else {
                // Omit single-letter entries
                if (item.length > 1) {
                    // Detect company name as single-word
                    if (item.split(' ').length === 1) {
                        LeadInfo.companyName = item;
                    }
                    // Detect name as multi-word
                    else if (/^[A-Za-z\s]+$/.test(item)) {
                        if (!LeadInfo.name) {
                            LeadInfo.name = item;
                        } else {
                            LeadInfo.name += ` ${item}`;
                        }
                    }
                }
            }
        });
        this.totalLines.push('None');
        for (let i = 0; i < array.length; i++) {
            this.totalLines.push(array[i]);
        }
        return LeadInfo;
    }
    extractLeadInfo(array) {
        let LeadInfo = {
            name: '',
            companyName: '',
            title: '',
            phone: '',
            email: '',
            website: '',
            address: ''
        };

        // Regex patterns
        const titleRegex = /\b(Founder & CEO|Director|Manager|CEO|CTO|CFO|COO|Owner|President|[\w]+er|[\w]+(?:designer|developer|creator|inventor))\b/i;
        const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
        const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
        const websiteRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
        const nameRegex = /^[A-Z][A-Z\s]+[A-Z]$/; // Updated regex for name detection

        array.forEach((item, index) => {
            // Detect email
            if (emailRegex.test(item)) {
                LeadInfo.email = item.match(emailRegex)[0];
            }
            // Detect phone number
            else if (phoneRegex.test(item)) {
                LeadInfo.phone = item.match(phoneRegex)[0];
            }
            // Detect website
            else if (websiteRegex.test(item)) {
                LeadInfo.website = item;
            }
            // Detect title
            else if (titleRegex.test(item)) {
                LeadInfo.title = item; // Capture the entire line for the title
            }
            // Detect name
            else if (nameRegex.test(item)) {
                if (!LeadInfo.name) {
                    LeadInfo.name = item;
                } else {
                    LeadInfo.name += ` ${item}`;
                }
            }
            // Assume last item is the address if it wasn't matched previously
            else if (index === array.length - 1) {
                LeadInfo.address = item;
            }
            // Detect company name and name
            else {
                // Omit single-letter entries
                if (item.length > 1) {
                    // Detect company name as single-word
                    if (item.split(' ').length === 1) {
                        LeadInfo.companyName = item;
                    }
                    // Detect name as multi-word
                    else if (/^[A-Za-z\s]+$/.test(item)) {
                        if (!LeadInfo.name) {
                            LeadInfo.name = item;
                        } else {
                            LeadInfo.name += ` ${item}`;
                        }
                    }
                }
            }
        });

        this.totalLines.push('None');
        for (let i = 0; i < array.length; i++) {
            this.totalLines.push(array[i]);
        }
        return LeadInfo;
    }


    handleInputChange(event) {
        this.LeadInfo[event.target.name] = event.target.value;
    }
    handleOptionChange(event) {
        console.log('HandleChange', event.target.name);
        this.LeadInfo[event.target.name] = event.target.value;
        console.log(this.LeadInfo);
    }

    handleSave(event) {
        createLead({ LeadInfo: JSON.stringify(this.LeadInfo) })
            .then(result => {
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: result,
                        objectApiName: 'Lead',
                        actionName: 'view'
                    },
                });
            })
            .catch(error => {
                // this.scannerError = JSON.stringify(error.body.message);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                }));
            });
    }

}