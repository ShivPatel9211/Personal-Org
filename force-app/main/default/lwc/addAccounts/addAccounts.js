import { LightningElement, track, api } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AddAccounts extends LightningElement {
    @api accountRecords = [
            {
                Name : '',
                Industry : ''
            }
        ];
    error;

    addRow() {
        const newAccount = {
            Name: '',
            Industry: ''
        };
        this.accountRecords = [...this.accountRecords, newAccount];
    }

    handleInputChange(event) {
        const { index, field } = event.currentTarget.dataset;
        this.accountRecords[index][field] = event.target.value;
    }

    // async createAccounts() {
    //     try {
    //         const recordInputs = this.accountRecords.map(account => {
    //             return { apiName: 'Account', fields: account };
    //         });

    //         const result = await Promise.all(recordInputs.map(recordInput => createRecord(recordInput)));
            
    //         this.dispatchEvent(
    //             new ShowToastEvent({
    //                 title: 'Success',
    //                 message: 'accountRecords created successfully',
    //                 variant: 'success'
    //             })
    //         );
            
    //         this.accountRecords = []; // Reset accountRecords array
    //         this.error = null;
    //     } catch (error) {
    //         this.error = error.body.message;
    //     }
    // }
}