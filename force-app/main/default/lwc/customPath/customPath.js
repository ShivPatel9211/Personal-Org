import { LightningElement, api } from 'lwc';

export default class CustomPath extends LightningElement {
    @api steps = [];

    handleStepClick(event) {
        const stepValue = event.currentTarget.dataset.value;
        this.steps = this.steps.map(step => ({
            ...step,
            selected: step.value === stepValue,
            completed: step.completed || step.value === stepValue
        }));
        this.dispatchEvent(new CustomEvent('stepchange', {
            detail: stepValue
        }));
    }
}