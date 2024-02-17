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
   * @property {Element} form_element
   */
  form_element;

  /**
   * @property {function} custom_submit
   */
  custom_submit;

  /**
   * @param {Element} form_element
   * @param {Object[]} fields
   * @param {Element} fields[].input_element
   * @param {Element} fields[].error_message_element
   */
  constructor(form_element, fields) {
    this.form_element = form_element;
    this.fields = fields;
  }

  /**
   *
   * @param {boolean} captcha
   */
  init(captcha = false) {
    this.fields.forEach(({ input_element, error_message_element, rules }) => {
      input_element.addEventListener('blur', this.validateInput(
        error_message_element,
        input_element.getAttribute('name'),
        rules,
      ).bind(this));
    });

    if (this.custom_submit) {
      this.form_element.addEventListener('submit', this.custom_submit.bind(this));
      return;
    }

    if (captcha && grecaptcha !== undefined) {
      this.form_element.addEventListener('submit', this.submitCaptcha.bind(this));
      return;
    }

    this.form_element.addEventListener('submit', this.submit.bind(this));
  }

  /**
   *
   * @param {function} callback
   * @returns {Form}
   */
  setCustomSubmit(callback) {
    this.custom_submit = callback;
    return this;
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
    event.preventDefault();

    if (this.hasErrors()) {
      return;
    }

    this.form_element.submit();
  }

  /**
   *
   * @param {Event} event
   */
  submitCaptcha(event) {
    event.preventDefault();

    if (this.hasErrors()) {
      return;
    }

    grecaptcha.ready(async () => {
      const token = await grecaptcha.execute(
        '6LdAc2UpAAAAAObuHow9pOS5dy0coRW11AKKiWJA',
        { action: 'submit' },
      );

      const response = await fetch('/api/auth/captcha', {
        method: 'POST',
        body: JSON.stringify({ token }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 204) {
        this.form_element.submit();
      }
    });
  }

  /**
   * @param {Element} error_message_element
   * @param {string} field_name
   * @param {string[]} rules
   */
  validateInput(error_message_element, field_name, rules) {
    const equal_rule = rules.find((rule) => rule.startsWith('equal'));

    return function onBlur(e) {
      utils.removeChildsFromParent(error_message_element);
      utils.changeClass(e.target, 'border-red-400', 'border-gray-400');

      const data = { [field_name]: e.target.value };

      if (equal_rule) {
        const [, name] = equal_rule.split(':');
        const field = this.fields.find((f) => f.input_element.getAttribute('name') === name);
        if (field) {
          data[name] = field.input_element.value;
        }
      }

      const errors = Validator.setData(data)
        .setRule(field_name, rules)
        .validate();

      if (errors.length) {
        utils.changeClass(e.target, 'border-gray-400', 'border-red-400');

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
