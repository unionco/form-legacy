import { toArray } from './utils';

// floating input placeholders
export default function () {
    toArray(document.querySelectorAll('.Form-group[data-form-label-placeholder=""]')).forEach(node => {
        const input = node.querySelector('input, textarea, select');

        function setPlaceholderState() {
            const node = this.tagName === 'SELECT' ? this.options[this.selectedIndex] : this;
            const isFloating = node && node.value !== '';
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
}
