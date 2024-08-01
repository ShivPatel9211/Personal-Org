import { LightningElement, wire, api, track } from 'lwc';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getRecord } from 'lightning/uiRecordApi';
import { FlowNavigationFinishEvent } from 'lightning/flowSupport';

export default class ResuableCustomPath extends LightningElement {
    @track _recordTypeId;
    @api recordId;
    @api pickListApiName;
    @track currentStep;
    @track _fieldApiName;
    @track selectedStep;
    @track stepList = [];
    size;
    @track lastStepName;
    @track showCompleteStep;
    @track showCurrentStep;
    @track isFlowModalOpen = false;
    flowApiName = 'test_flow'; // Replace with your flow's API name

    @wire(getRecord, {
        recordId: '$recordId',
        layoutTypes: ['Full', 'Compact'],
        modes: ['View', 'Edit', 'Create']
    })
    wiredRecordData({ error, data }) {
        if (data) {
            console.log('in data');
            console.log('data', JSON.stringify(data));
            this._recordTypeId = data.recordTypeId;
            this.currentStep = data.fields[this.pickListApiName].value;
            this.selectedStep = this.currentStep;
            this._fieldApiName = data.apiName + '.' + this.pickListApiName;
        } else if (error) {
            console.log('in error');
            console.error('Error:', error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$_recordTypeId', fieldApiName: '$_fieldApiName' })
    wiredPicklistValue({ error, data }) {
        if (data) {
            this.stepList = data.values.map((step) => step.value);
            this.size = this.stepList.length;
            this.lastStepName = this.stepList[this.size - 1];
            this.showCompleteStep = this.stepList.indexOf(this.currentStep) === (this.size - 1) ? false : true;
        } else if (error) {
            console.error('Error:', error);
        }
    }

    handleClick(event) {
        let stepName = event.target.label;
        if (this.currentStep === this.lastStepName && this.currentStep === stepName) {
            this.showCompleteStep = false;
            this.showCurrentStep = false;
        } else if ((stepName === this.lastStepName && this.currentStep !== stepName) ||
                   (this.currentStep === stepName && this.currentStep !== this.lastStepName)) {
            this.showCompleteStep = true;
            this.showCurrentStep = false;
            this.selectedStep = stepName;
        } else {
            this.showCompleteStep = false;
            this.showCurrentStep = true;
            this.selectedStep = stepName;
        }
    }

    handleUpdate(event) {
        // Handle your current step update logic here
    }

    handleUpdateComplete(event) {
        // Open the flow modal
        this.isFlowModalOpen = true;
    }

    handleFlowStatusChange(event) {
        if (event.detail.status === 'FINISHED') {
            this.isFlowModalOpen = false;
        }
    }

    closeModal() {
        this.isFlowModalOpen = false;
    }
}