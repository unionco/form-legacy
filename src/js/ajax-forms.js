let firstInit = true;

// ajax forms
export default function () {
    if (!firstInit) {
        return;
    }

    document.addEventListener('submit', e => {
        const form = e.target;

        if (!form.hasAttribute('data-ajax-form')) {
            return;
        }

        e.preventDefault();

        const apiEndPoint = form.getAttribute('action');
        const params = {
            method: 'post',
            body: new FormData(form),
            credentials: 'same-origin',
        };

        form.classList.add('is-processing');

        fetch(apiEndPoint, params)
            .then(response => response.json())
            .then(results => {
                const response = results[0];
                const json = results[1];

                if (response.status === 200) {
                    form.classList.add('is-success');
                } else {
                    const resultsContainer = form.querySelector('[data-ajax-form-results]');

                    if (resultsContainer) {
                        resultsContainer.innerHTML = json.errors.join(' ');
                    }
                }

                form.classList.remove('is-processing');
            });
    });

    firstInit = false;
}
