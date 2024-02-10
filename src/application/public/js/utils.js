// eslint-disable-next-line no-unused-vars
const utils = {
  removeChildsFromParent(parent) {
    while (parent.lastChild) {
      parent.removeChild(parent.lastChild);
    }
  },
};
