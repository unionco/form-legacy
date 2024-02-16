import { toArray } from './utils';

const DEFAULTS = {
    parentClass: 'Form-group',
    componentClass: 'Form-input',
    valueClass: 'Form-selectValue',
    initializedClass: 'is-initialized',
};
window.union = window.union || {};

// selects
export default function () {
    const opts = Object.assign({}, DEFAULTS, window.union.selects);

    // when multiple options are selected in a single select, the last one is selected, however it is more common to
    // want the first selected option to be the option selected.
    toArray(document.querySelectorAll('select:not([multiple])')).forEach(node => {
        // find all selected options
        const options = node.querySelectorAll('option[selected]');

        // remove selected attribute from all but the first
        for (let i = 1, l = options.length; i < l; i++) {
            options[i].removeAttribute('selected');
        }
    });

    // make sure that selects are properly wrapped.
    toArray(document.querySelectorAll(`select.${opts.componentClass}:not(.${opts.initializedClass})`)).forEach(node => {
        let wrap = node.parentNode;

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

        let value = wrap.querySelector(`.${opts.valueClass}`);

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
            const selectedOption = node.options[node.selectedIndex];
            // update value element with the label text of the selected option.
            value.innerHTML = selectedOption && selectedOption.value && selectedOption.innerHTML || '';
        }

        if (window.$) {
            window.$(node).on('change.select', render)
        } else {
            node.addEventListener('change', render);
        }

        render();

        node.classList.add(opts.initializedClass);
    });
}
