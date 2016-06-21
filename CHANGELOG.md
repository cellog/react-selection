0.4.0 / 2016-??-??
==================
- BREAKING CHANGE: all selection options are now part of a map, selectionOptions
- BREAKING CHANGE: selectIntermediates renamed "selectionOptions.inBetween"
- BREAKING CHANGE: constantSelect renamed "selectionOptions.constant"
- BREAKING CHANGE: preserveSelection renamed "selectionOptions.preserve"
- BREAKING CHANGE: all selection callbacks are now part of a map, selectionCallback
- BREAKING CHANGE: onSelectSlot renamed selectionOptions.onSelectionChange
- fix #9: onSelectSlot called after selection finished and onFinishSelect already called
- implement #7: by default, sort selectable items by DOM order
- implement #3: add selectable types

0.3.0 / 2016-06-19
==================
- remove IE9 support.  React crashes on setting state in a Selectable component.
  This is unfixable.
- fully unit test every line of code
- verify all assumptions about browser-specific behavior in regards to bounds,
  events (mouse and touch)
- add support for stateless functional components
- remove any addition of <div>s to the DOM, so CSS and structure is not broken
- split off selection and input handling from the main code.  Modular=maintainable

0.2.0 / 2016-06-14
==================
- fix subtle browser bugs in iOS and IE 7-10
- known issue: still doesn't work in IE 9

0.1.0 / 2016-06-06
==================
- Initial alpha release