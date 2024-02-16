import initAjaxForms from './js/ajax-forms';
import initAutofillFix from './js/autofill-fix';
import initFloatingPlaceholders from './js/floating-placeholders';
import initFormattedInputs from './js/formatted-inputs';
import initSafariValidationFix from './js/safari-validation-fix';
import initSelects from './js/selects';

export default function () {
    initAjaxForms();
    initAutofillFix();
    initFloatingPlaceholders();
    initFormattedInputs();
    initSafariValidationFix();
    initSelects();
}
