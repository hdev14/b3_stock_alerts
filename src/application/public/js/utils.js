function removeChildsFromParent(parent) {
  while (parent.lastChild) {
    parent.removeChild();
  }
}