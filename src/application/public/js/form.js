// eslint-disable-next-line no-unused-vars
class Form {
  /**
   * @property {Object[]} fields
   * @property {Element} fields.input_element
   * @property {Element} fields.error_message_element
   * @property {string[]} fields.rules
   */
  fields = [];

  /**
   * @property {Element} form
   */
  form_element;

  /**
   * @param {Element} form
   * @param {Object[]} fields
   * @param {Element} fields[].input_element
   * @param {Element} fields[].error_message_element
   */
  constructor(form, fields) {
    this.form_element = form;
    this.fields = fields;
  }

  init() {
    this.fields.forEach(({ input_element, error_message_element, rules }) => {
      input_element.addEventListener('blur', this.validateInput(
        error_message_element,
        input_element.getAttribute('name'),
        rules,
      ).bind(this));
    });

    this.form_element.addEventListener('submit', this.submit.bind(this));
  }

  /**
   *
   * @returns {boolean}
   */
  hasErrors() {
    return this.fields.some(({ error_message_element }) => !!error_message_element.firstChild);
  }

  /**
   *
   * @param {Event} event
   */
  submit(event) {
    console.log(event);
    throw new Error('Not implemented');
  }

  /**
   * @param {Element} error_message_element
   * @param {string} field_name
   * @param {string[]} rules
   */
  validateInput(error_message_element, field_name, rules) {
    return function onBlur(e) {
      utils.removeChildsFromParent(error_message_element);

      const errors = Validator.setData({ [field_name]: e.target.value })
        .setRule(field_name, rules)
        .validate();

      if (errors.length) {
        this.#appendErrorMessages(errors[0].messages, error_message_element);
      }
    };
  }

  /**
   *
   * @param {string[]} error_messages
   * @param {Element} element
   */
  #appendErrorMessages(error_messages, element) {
    error_messages.forEach((message) => {
      const li = document.createElement('li');
      const text = document.createTextNode(message);
      li.appendChild(text);
      element.appendChild(li);
    });
  }
}
