// eslint-disable-next-line no-unused-vars
class LoginForm {
  #login_form = document.getElementById('login-form');

  #email_input = document.getElementById('email');

  #email_error_messages_ul = document.getElementById('email-error-messages');

  #password_input = document.getElementById('password');

  #password_error_messages_ul = document.getElementById('password-error-messages');

  init() {
    this.#email_input.addEventListener('blur', this.#validateEmail.bind(this));
    this.#password_input.addEventListener('blur', this.#validatePassword.bind(this));
    this.#login_form.addEventListener('submit', this.#submit.bind(this));
  }

  static #appendErrorMessages(error_messages, element) {
    error_messages.forEach((message) => {
      const li = document.createElement('li');
      const text = document.createTextNode(message);
      li.appendChild(text);
      element.appendChild(li);
    });
  }

  #validateEmail(e) {
    utils.removeChildsFromParent(this.#email_error_messages_ul);

    const errors = Validator.setData({ email: e.target.value })
      .setRule('email', ['required', 'string', 'email'])
      .validate();

    if (errors.length) {
      LoginForm.#appendErrorMessages(errors[0].messages, this.#email_error_messages_ul);
    }
  }

  #validatePassword(e) {
    utils.removeChildsFromParent(this.#password_error_messages_ul);

    const errors = Validator.setData({ password: e.target.value })
      .setRule('password', ['required', 'string', 'min:8', 'password'])
      .validate();

    if (errors.length) {
      LoginForm.#appendErrorMessages(errors[0].messages, this.#password_error_messages_ul);
    }
  }

  #submit(e) {
    e.preventDefault();

    if (this.#email_error_messages_ul.firstChild && this.#password_error_messages_ul.firstChild) {
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
        this.#login_form.submit();
      }
    });
  }
}
