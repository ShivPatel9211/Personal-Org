import { LightningElement } from 'lwc';

export default class ParentComponent extends LightningElement {
    steps = [
        { value: 'step1', label: 'Step 1: New', selected: true, completed: false },
        { value: 'step2', label: 'Step 2: In Progress', selected: false, completed: false },
        { value: 'step3', label: 'Step 3: Under Review', selected: false, completed: false },
        { value: 'step4', label: 'Step 4: Completed', selected: false, completed: false },
    ];

    currentStep = 'step1';

    handleStepChange(event) {
        this.currentStep = event.detail;
        this.steps = this.steps.map(step => ({
            ...step,
            selected: step.value === this.currentStep
        }));
    }
}