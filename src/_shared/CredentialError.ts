export default class CredentialError extends Error {
  constructor() {
    super('E-mail ou senha inválido.');
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, CredentialError.prototype);
  }
}
