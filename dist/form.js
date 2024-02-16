var form = (function () {
'use strict';

var firstInit = true;

// ajax forms
var initAjaxForms = function () {
    if (!firstInit) {
        return;
    }

    document.addEventListener('submit', function (e) {
        var form = e.target;

        if (!form.hasAttribute('data-ajax-form')) {
            return;
        }

        e.preventDefault();

        var apiEndPoint = form.getAttribute('action');
        var params = {
            method: 'post',
            body: new FormData(form),
            credentials: 'same-origin',
        };

        form.classList.add('is-processing');

        fetch(apiEndPoint, params)
            .then(function (response) { return response.json(); })
            .then(function (results) {
                var response = results[0];
                var json = results[1];

                if (response.status === 200) {
                    form.classList.add('is-success');
                } else {
                    var resultsContainer = form.querySelector('[data-ajax-form-results]');

                    if (resultsContainer) {
                        resultsContainer.innerHTML = json.errors.join(' ');
                    }
                }

                form.classList.remove('is-processing');
            });
    });

    firstInit = false;
};

var toArray = function (collection) { return Array.prototype.slice.call(collection); };

var KEY_ARROW_UP = 38;
var KEY_ARROW_DOWN = 40;

var firstInit$1 = true;
var form;
var elements = [];

function potentialAutofillEvent(e) {
    if (e.type === 'click') { return true; }
    if (e.type === 'blur') { return true; }

    if (e.type === 'keyup') {
        if (e.keyCode === KEY_ARROW_UP) { return true; }
        if (e.keyCode === KEY_ARROW_DOWN) { return true; }
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
    var targetElement = e.target;
    if (targetElement.form === form && !potentialAutofillEvent(e)) {
        setCurrentValue(targetElement);
    }

    if (potentialAutofillEvent(e)) {
        requestAnimationFrame(function () {
            elements.forEach(function (element) {
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
    if (!e.target.form) { return; }

    form = e.target.form;
    elements = toArray(form.elements);

    elements.forEach(function (element) {
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
    if (!form) { return; }

    onInput(e);
    form = elements = void 0;
    document.removeEventListener('input', onInput);
    document.removeEventListener('keyup', onInput);
    document.removeEventListener('change', onInput);
    document.removeEventListener('click', onInput);
}

var initAutofillFix = function() {
    if (firstInit$1) {
        document.addEventListener('focus', addListeners);
        document.addEventListener('blur', removeListeners);
        firstInit$1 = false;
    }
};

// floating input placeholders
var initFloatingPlaceholders = function () {
    toArray(document.querySelectorAll('.Form-group[data-form-label-placeholder=""]')).forEach(function (node) {
        var input = node.querySelector('input, textarea, select');

        function setPlaceholderState() {
            var node = this.tagName === 'SELECT' ? this.options[this.selectedIndex] : this;
            var isFloating = node && node.value !== '';
            this.parentNode.classList[isFloating ? 'add' : 'remove']('is-floating');
        }

        if (window.$) {
            window.$(input).on(
                'input.floatingPlaceholder keydown.floatingPlaceholder change.floatingPlaceholder',
                setPlaceholderState
            );
        } else {
            input.addEventListener('change', setPlaceholderState);
            input.addEventListener('input', setPlaceholderState);
            input.addEventListener('keydown', setPlaceholderState);
        }
        setPlaceholderState.call(input);

        node.setAttribute('data-form-label-placeholder', 'initialized');
    });
};

// import { toArray } from './utils';
// import Formatter from 'formatter.js';

// formatted inputs
var initFormattedInputs = function () {
    // toArray(document.querySelectorAll('[data-input-validation="phone"]')).forEach(function() {
    //     new Formatter(this, {
    //         'pattern': '({{999}}) {{999}}-{{9999}}',
    //     });
    // });
};

// safari validation fix
var initSafariValidationFix = function () {
    function onFormSubmit(e) {
        if (!e.target.checkValidity()) {
            e.preventDefault();
            e.target.classList.add('is-errorsShown');
        }
    }

    document.addEventListener('submit', onFormSubmit);
};

var DEFAULTS = {
    parentClass: 'Form-group',
    componentClass: 'Form-input',
    valueClass: 'Form-selectValue',
    initializedClass: 'is-initialized',
};
window.union = window.union || {};

// selects
var initSelects = function () {
    var opts = Object.assign({}, DEFAULTS, window.union.selects);

    // when multiple options are selected in a single select, the last one is selected, however it is more common to
    // want the first selected option to be the option selected.
    toArray(document.querySelectorAll('select:not([multiple])')).forEach(function (node) {
        // find all selected options
        var options = node.querySelectorAll('option[selected]');

        // remove selected attribute from all but the first
        for (var i = 1, l = options.length; i < l; i++) {
            options[i].removeAttribute('selected');
        }
    });

    // make sure that selects are properly wrapped.
    toArray(document.querySelectorAll(("select." + (opts.componentClass) + ":not(." + (opts.initializedClass) + ")"))).forEach(function (node) {
        var wrap = node.parentNode;

        // does the parent node have the desired class?
        if (!wrap.classList.contains(opts.parentClass)) {
            // if not, create a div
            wrap = document.createElement('div');
            // with the appropriate parent class name
            wrap.className = opts.parentClass;
            // and wrap it around the select element
            node.parentNode.insertBefore(wrap, node);
            wrap.appendChild(node);
        }

        var value = wrap.querySelector(("." + (opts.valueClass)));

        // does the select have a sibling with the desired class?
        if (!value) {
            // if not, create a span
            value = document.createElement('span');
            // with the appropriate value class name
            value.className = opts.valueClass;
            // and append it to the wrapper
            wrap.appendChild(value);
        }

        function render() {
            // query all options and pull the currently selected option.
            var selectedOption = node.options[node.selectedIndex];
            // update value element with the label text of the selected option.
            value.innerHTML = selectedOption && selectedOption.value && selectedOption.innerHTML || '';
        }

        if (window.$) {
            window.$(node).on('change.select', render);
        } else {
            node.addEventListener('change', render);
        }

        render();

        node.classList.add(opts.initializedClass);
    });
};

var index = function () {
    initAjaxForms();
    initAutofillFix();
    initFloatingPlaceholders();
    initFormattedInputs();
    initSafariValidationFix();
    initSelects();
};

return index;

}());
