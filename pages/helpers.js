import {scroller} from "react-scroll";

export const scrollToWizardTop = (event, options = {}) => {
    if (event && event.preventDefault()) {
        event.preventDefault();
    }
    const {duration = 800, delay = 0, smooth = 'easeInOutQuart'} = options;
    scroller.scrollTo('wizard-top', {
        duration,
        delay,
        smooth
    });
}