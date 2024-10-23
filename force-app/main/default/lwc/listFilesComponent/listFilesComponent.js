import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
import getRelatedFiles from '@salesforce/apex/FileController.getRelatedFiles';

export default class FileAttachmentComponent extends LightningElement {
    @api recordId;
    @track files = [];
    @track noFiles = false;

    acceptedFormats = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx', '.xls', '.csv', '.txt', '.json'];

    connectedCallback() {
        this.fetchFiles();
    }

    // Fetch files and map extensions to icon names
    fetchFiles() {
        getRelatedFiles({ recordId: this.recordId })
            .then(data => {
                this.files = data.map(file => ({
                    id: file.ContentDocumentId,
                    title: file.ContentDocument.Title,
                    fileExtension: file.ContentDocument.FileExtension.toLowerCase(),
                    versionId: file.ContentDocument.LatestPublishedVersionId,
                    // Corrected preview URL using renditionDownload with preview operation
                    previewUrl: `/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=${file.ContentDocument.LatestPublishedVersionId}&operation=preview`,
                    iconName: this.getIconName(file.ContentDocument.FileExtension) // Map file extension to icon name
                }));
                this.noFiles = this.files.length === 0;
            })
            .catch(error => {
                this.showToast('Error', 'Error loading files: ' + error.body.message, 'error');
            });
    }

    // Map file extensions to corresponding icon names
    getIconName(extension) {
        const extToIcon = {
            pdf: 'doctype:pdf',
            png: 'doctype:image',
            jpg: 'doctype:image',
            jpeg: 'doctype:image',
            doc: 'doctype:word',
            docx: 'doctype:word',
            xls: 'doctype:excel',
            xlsx: 'doctype:excel',
            csv: 'doctype:csv',
            txt: 'doctype:txt',
            json: 'doctype:txt'
        };
        return extToIcon[extension.toLowerCase()] || 'doctype:attachment';
    }

    // Handle file upload
    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        const newFiles = uploadedFiles.map(file => ({
            id: file.documentId,
            title: file.name,
            fileExtension: file.name.split('.').pop(),
            iconName: this.getIconName(file.name.split('.').pop())
        }));
        this.files = [...this.files, ...newFiles];
        this.noFiles = this.files.length === 0;

        this.showToast('Success', `${uploadedFiles.length} file(s) uploaded successfully`, 'success');
    }

    // Handle delete
    handleDeleteFile(event) {
        const fileId = event.currentTarget.dataset.id;
        deleteRecord(fileId)
            .then(() => {
                this.files = this.files.filter(file => file.id !== fileId);
                this.noFiles = this.files.length === 0;
                this.showToast('Success', 'File deleted successfully', 'success');
            })
            .catch(error => {
                this.showToast('Error', 'Error deleting file: ' + error.body.message, 'error');
            });
    }

    // Show toast messages
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}