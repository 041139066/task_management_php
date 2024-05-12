import { notification } from './utils.js';
import fetch from './fetch.js'

/**
 * This function make a hint text element for a form field.\
 * @param {String} message 
 * @returns the hind element 
 */
function makeHint (message) {
  const hint = document.createElement("div")
  hint.style.display = "none";
  hint.classList.add("hint")
  hint.innerText = message
  return hint
}
/**
 * This function add form field validation to the given field
 * @param {HTMLElement} field The form field to add validation
 * @param {RegExp | Function} regex The regular expression to test with the value of the form field, or a function to run and return the test result
 * @param {String} hintText The hint text for the form field 
 * @returns the validator and setter of the form field
 */
function makeValidator (field, regex, hintText) {
  const hint = makeHint(hintText)
  field.after(hint)
  const setter = (valid) => {
    hint.style.display = valid ? 'none' : 'block'
    valid ? field.classList.remove('error-field') : field.classList.add('error-field')
  }
  const validator = () => {
    const valid = regex instanceof RegExp ? regex.test(field.value) : regex()
    setter(valid)
    return valid
  }
  field.addEventListener('input', validator)
  field.addEventListener('change', validator)
  field.addEventListener('blur', validator)
  return { validator, setter }
}

/**
 * This function create a validator for the form which validates all the given fields
 * @param {HTMLFormElement} form 
 * @param {HTMLElement[]} fields 
 * @returns formValidator that validator all the given fields in the form
 */
export function makeFormValidator (form, fields) {
  if (fields.length === 0) return () => true
  const validators = fields.map(itm => makeValidator(...itm))
  const formValidator = () => {
    const valid = validators.map(({ validator }) => validator())
    return valid.every(itm => itm)
  }
  form.addEventListener('reset', () => {
    validators.forEach(({ setter }) => setter(true))
  })
  return formValidator
}

/**
 * This function add validtion to the given form fields, and handle the submit event
 * @param {HTMLFormElement} form the target form
 * @param {HTMLElement[]} fields the form fields that need validation
 * @param {HTMLButtonElement} button the submit button of the form
 * @param {String} url the submit url
 * @param {Function} handleParams the function, if provided, that will be called to get the params
 * @param {Object} options the fetch options
 * @param {Function} handleData the success handler
 * @param {String} message the error message 
 */
export default function handleSubmit (form, fields, button, { url, handleParams, options = {}, handleData, message }) {
  const formValidator = makeFormValidator(form, fields)
  form.addEventListener("submit", function (e) {
    e.preventDefault()
    if (formValidator()) {
      button.disabled = true
      button.style.cursor = 'wait'
      const params = handleParams ? handleParams() : new FormData(this)
      fetch(url, params, { method: "form-data", ...options })
        .then(res => {
          if (res?.code === 0) {
            handleData(res?.data)
          } else {
            throw new Error(res?.message || message);
          }
        }).catch(e => {
          notification(e.message, "error")
        }).finally(() => {
          button.disabled = false
          button.style.cursor = 'default'
        })
    }
  })
}

