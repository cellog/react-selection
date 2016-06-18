export default function verifyComponent(Component) {
  if (!Component instanceof Function) {
    throw new Error('Component must be a stateful React Class')
  }
  let test
  if (!(Component instanceof Function)) {
    throw new Error('Component is not a class, must be a stateful React Component class')
  }
  try {
    test = new Component
    if (test.render instanceof Function) return false
    return true
  } catch (e) {
    return true
  }
}
