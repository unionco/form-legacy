// safari validation fix
export default function () {
    function onFormSubmit(e) {
        if (!e.target.checkValidity()) {
            e.preventDefault();
            e.target.classList.add('is-errorsShown');
        }
    }

    document.addEventListener('submit', onFormSubmit);
}
