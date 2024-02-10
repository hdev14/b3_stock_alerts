export default class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('E-mail já cadastrado.');
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, EmailAlreadyRegisteredError.prototype);
  }
}
