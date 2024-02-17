// eslint-disable-next-line no-unused-vars
const utils = {
  removeChildsFromParent(parent) {
    while (parent.lastChild) {
      parent.removeChild(parent.lastChild);
    }
  },
  changeClass(element, current_class, target_class) {
    element.classList.remove(current_class);
    element.classList.add(target_class);
  },
};
