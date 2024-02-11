export default class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('Endereço de e-mail já cadastrado.');
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, EmailAlreadyRegisteredError.prototype);
  }
}
