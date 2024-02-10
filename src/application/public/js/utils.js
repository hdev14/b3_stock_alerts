const utils = {
  removeChildsFromParent(parent) {
    while (parent.lastChild) {
      parent.removeChild(parent.lastChild);
    }
  }
};
