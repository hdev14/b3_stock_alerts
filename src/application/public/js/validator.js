const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/;
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/;

const RULE_FUNCTIONS = {
  required: (value) => {
    switch (typeof value) {
      case 'number':
        return (value === undefined || value === null);
      case 'string':
        return (value === undefined || value === null || value.length === 0);
      case 'object':
        // don't use it with Date.
        return (
          value === undefined
          || value === null
          || Object.keys(value).length === 0
        );
      default:
        return true;
    }
  },
  max: (value, max) => {
    if (value !== undefined) {
      switch (typeof value) {
        case 'number':
          return value > max;
        case 'string':
          return value.length > max;
        default:
          return true;
      }
    }
    return false;
  },
  min: (value, min) => {
    if (value !== undefined) {
      switch (typeof value) {
        case 'number':
          return value < min;
        case 'string':
          return value.length < min;
        default:
          return true;
      }
    }

    return false;
  },
  url: (value) => (value !== undefined && typeof value === 'string' && !URL_REGEX.test(value)),
  string: (value) => (value !== undefined && typeof value !== 'string'),
  number: (value) => (value !== undefined && typeof value !== 'number'),
  integer: (value) => (value !== undefined && typeof value === 'number' && !Number.isInteger(value)),
  float: (value) => (value !== undefined && typeof value === 'number' && Number.isInteger(value)),
  date: (value) => (value !== undefined && !(value instanceof Date)),
  email: (value) => (value !== undefined && typeof value === 'string' && !EMAIL_REGEX.test(value)),
  password: (value) => (
    value !== undefined
    && typeof value === 'string'
    && !(
      value.includes('!')
      || value.includes('@')
      || value.includes('#')
      || value.includes('$')
      || value.includes('%')
      || value.includes('&')
      || value.includes('*')
      || value.includes('(')
      || value.includes(')')
      || value.includes('_')
      || value.includes('+')
    )
  ),
};

const RULE_MESSAGES = {
  required: () => 'O campo é obrigatório.',
  max: (max, isString) => {
    if (isString) {
      return `O texto precisa ter até ${max} caracteres.`;
    }
    return `O campo menor ou igual à ${max}.`;
  },
  min: (min, isString) => {
    if (isString) {
      return `O texto precisa ter pelo menos ${min} caracteres.`;
    }

    return `O campo preicsa maior ou igual à ${min}.`;
  },
  url: () => 'O campo precisa ser uma URL.',
  string: () => 'O campo precisa ser um texto.',
  number: () => 'O campo precisa ser um número.',
  integer: () => 'O campo precisa ser um inteiro.',
  float: () => 'O campo precisa ser um decimal.',
  date: () => 'O campo precisa ser uma data válida.',
  email: () => 'O campo precisa ser um e-mail válido.',
  password: () => 'O campo precisa ter letras, números e algum caracter especial.',
};

// eslint-disable-next-line no-unused-vars
class Validator {
  #data;

  #rule_map = new Map();

  #errors = [];

  constructor(data) {
    this.#data = data;
  }

  /**
   *
   * @param {Object} data
   * @returns {Validator}
   */
  static setData(data) {
    return new Validator(data);
  }

  /**
   *
   * @param {string} field
   * @param {string[]} rule
   * @returns {Validator}
   */
  setRule(field, rule) {
    this.#rule_map.set(field, rule);
    return this;
  }

  /**
   *
   * @returns {Object[]}
   */
  validate() {
    const entries = this.#rule_map.entries();

    for (const [fieldName, rule] of entries) {
      const field = this.#data[fieldName];
      const messages = [];

      if (typeof rule === 'function') {
        if (!rule(field)) {
          messages.push(`O campo ${fieldName} não é válido.`);
        }
      } else {
        messages.push(...this.#validateByArray(rule, field));
      }

      if (messages.length > 0) {
        this.#addError({ field: fieldName, messages });
      }
    }

    return this.#errors;
  }

  /**
   *
   * @param {*} rule
   * @param {*} field
   * @returns {string[]}
   */
  #validateByArray(rule, field) {
    const messages = [];

    for (let i = 0, len = rule.length; i < len; i += 1) {
      const ruleString = rule[i];
      const [name, value] = ruleString.split(':');
      const isNotValid = RULE_FUNCTIONS[name](field, value);

      if (isNotValid) {
        const message = RULE_MESSAGES[name](value, typeof field === 'string');
        messages.push(message);
      }
    }

    return messages;
  }

  #addError(error) {
    const index = this.#errors.findIndex((e) => e.field === error.field);

    if (index !== -1) {
      this.#errors[index].messages = [...this.#errors[index].messages, ...error.messages];
      return;
    }

    this.#errors.push(error);
  }
}
