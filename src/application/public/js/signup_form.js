// eslint-disable-next-line no-unused-vars
class SignupForm extends Form {
  submit(e) {
    e.preventDefault();

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
}
