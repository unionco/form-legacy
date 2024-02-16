import { on } from 'lego-events';
import data from 'lego-data';
import state from 'lego-state';
import createElement from '../utils/_create-element';
import getInstance from '../utils/_get-instance';
import identify from '../utils/_identify';

const opts = {
    closeClass: 'Select-close',
    componentClass: 'Form-group',
    listClass: 'Select-list',
    valueClass: 'Select-value',
    initializedClass: 'is-initialized',
};

let firstInit = true;
let optionCount = 0;

class Option {
    constructor(node, select) {
        this.select = select;
        this.node = node;
        this.value = node.value;
        this.item = createElement(
            'li',
            null,
            this.input = createElement(
                'input',
                {
                    id: `selectOption${++optionCount}`,
                    name: select.name,
                    value: node.value,
                    onChange: () => {
                        this.select.selectOption(this);
                    },
                }
            ),
            createElement(
                'label',
                { htmlFor: `selectOption${optionCount}` },
                node.innerHTML
            )
        );

        this.build();
    }

    build() {
        this.input.type = this.select.node.multiple ? 'checkbox' : 'radio';
        this.input.disabled = this.node.disabled;
        this.input.value = this.node.value;
        return this;
    }
}

const getOptionInstance = getInstance('_selectOption', Option);
Option.getInstance = (node, select) => getOptionInstance(node, select).build();

export default class Select {

    constructor(node) {
        this.node = node;
        this.name = node.name;
        if (node.multiple) {
            this.plural = data(this.node, 'plural') || (data(this.node, 'placeholder') ||
                this.node.querySelector('option[value=""]').innerHTML).replace('All', '');
        }
        this.wrap = node.parentNode;

        if (!this.wrap || !this.wrap.classList.contains(opts.componentClass)) {
            this.wrap = createElement(
                'div',
                { className: opts.componentClass }
            );
            if (node.parentNode) {
                node.parentNode.insertBefore(this.wrap, node);
            }
            this.wrap.appendChild(node);
        }

        this.value = this.wrap.querySelector(`.${opts.valueClass}`);
        if (!this.value) {
            this.value = createElement(
                'label',
                {
                    htmlFor: identify(node, 'select'),
                    className: opts.valueClass,
                }
            );
            this.wrap.appendChild(this.value);
        }

        if (!window.isMobile) {
            node.removeAttribute('name');
            this.list = createElement('ul', { className: opts.listClass });

            createElement(
                this.wrap,
                null,
                this.list,
                createElement('span', { className: opts.closeClass })
            );

            $(this.list).on({
                focusout() {
                    state(this, 'tabbed', false);
                },
                tabbedInSelect() {
                    state(this, 'tabbed', true);
                },
                mousedown() {
                    state(this, 'mouseDown', true);
                },
                mouseup() {
                    state(this, 'mouseDown', false);
                },
            });

            this.buildOptions();
        }

        $(node).on('change', () => this.selectOption());
        this.selectOption();
        node.classList.add(opts.initializedClass);
    }

    buildOptions() {
        if (window.isMobile) return this;

        const items = _($('option', this.node))
            // hydrate list options
            .map(option => Option.getInstance(option, this))
            // get the generated list item from the option
            .map('item').value();

        $(this.list)
            .empty()
            .append(items);

        return this;
    }

    selectOption(option) {
        if (!window.isMobile) {
            const options = $('input', this.list);

            if (!option) {
                $('option', this.node).each((i, opt) => {
                    Option.getInstance(opt, this).input.checked = opt.selected;
                });

                if (!options.filter(':not([value=""]):checked').length) {
                    options.filter('[value=""]').prop('checked', true);
                    $(this.node).val('');
                }
            } else {
                if (option.input.checked && option.value === '') {
                    options.not(option.input).prop('checked', false);
                } else if (option.input.checked && option.value !== '') {
                    options.filter('[value=""]').prop('checked', false);
                } else if (!options.filter(':checked').length) {
                    options.filter('[value=""]').prop('checked', true);
                }

                $(this.node).val(
                    _.map(options.filter(':checked'), 'value')
                ).trigger('change');
            }
        }

        return this.render();
    }

    render() {
        const selectedValues = $(this.node).val();
        if (!selectedValues || !selectedValues.length) {
            this.value.innerHTML = data(this.node, 'placeholder') || '';
        } else if (typeof selectedValues === 'string' || selectedValues.length === 1) {
            this.value.innerHTML = $('option:selected', this.node).html();
        } else {
            this.value.innerHTML = `${selectedValues.length} ${this.plural}`;
        }

        return this;
    }
}

const getSelectInstance = getInstance('_formSelect', Select);
Select.getInstance = node => getSelectInstance(node).buildOptions();

export function init(selector) {
    if (firstInit) {
        $(window).on('keydown', e => {
            if ((e.keyCode ? e.keyCode : e.which) === 9) {
                requestAnimationFrame(() => {
                    $(document.querySelector(':focus')).trigger('tabbedInSelect');
                });
            }
        });
    }
    _.forEach($(selector), Select.getInstance);
    firstInit = false;
}
