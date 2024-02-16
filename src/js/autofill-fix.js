import { toArray } from './utils';

const KEY_ARROW_UP = 38;
const KEY_ARROW_DOWN = 40;

let firstInit = true;
let form;
let elements = [];

function potentialAutofillEvent(e) {
    if (e.type === 'click') return true;
    if (e.type === 'blur') return true;

    if (e.type === 'keyup') {
        if (e.keyCode === KEY_ARROW_UP) return true;
        if (e.keyCode === KEY_ARROW_DOWN) return true;
    }

    return e.detail && e.detail.autofill;
}

function getValueProp(element) {
    if (typeof element.checked !== 'undefined') {
        return 'checked'
    } else if (typeof element.selectedIndex !== 'undefined') {
        return 'selectedIndex'
    }
    return 'value';
}

function setCurrentValue(element) {
    element.$$currentValue = element[getValueProp(element)];
}

function currentValueMatches(element) {
    return element.$$currentValue === element[getValueProp(element)];
}

function onInput(e) {
    const targetElement = e.target;
    if (targetElement.form === form && !potentialAutofillEvent(e)) {
        setCurrentValue(targetElement);
    }

    if (potentialAutofillEvent(e)) {
        requestAnimationFrame(() => {
            elements.forEach(element => {
                if (typeof element.$$currentValue === 'undefined') {
                    setCurrentValue(element);
                }
                if (!currentValueMatches(element)) {
                    setCurrentValue(element);
                    element.dispatchEvent(new CustomEvent('change', {
                        detail: {
                            autofill: true
                        }
                    }));
                    if (getValueProp(element) === 'value') {
                        element.dispatchEvent(new CustomEvent('input', {
                            detail: {
                                autofill: true
                            }
                        }));
                    }
                }
            });
        });
    }
}

function addListeners(e) {
    if (!e.target.form) return;

    form = e.target.form;
    elements = toArray(form.elements);

    elements.forEach(element => {
        if (typeof element.$$currentValue === 'undefined') {
            setCurrentValue(element);
        }
    });
    document.addEventListener('input', onInput);
    document.addEventListener('keyup', onInput);
    document.addEventListener('change', onInput);
    document.addEventListener('click', onInput);
}

function removeListeners(e) {
    if (!form) return;

    onInput(e);
    form = elements = void 0;
    document.removeEventListener('input', onInput);
    document.removeEventListener('keyup', onInput);
    document.removeEventListener('change', onInput);
    document.removeEventListener('click', onInput);
}

export default function() {
    if (firstInit) {
        document.addEventListener('focus', addListeners);
        document.addEventListener('blur', removeListeners);
        firstInit = false;
    }
}
