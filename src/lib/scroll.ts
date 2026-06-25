/** Scrolls the page to the top. The document/window is the scroll container
 *  (the header and sidebar are sticky), so scroll the window. */
export function scrollPageToTop() {
  // 'instant' so navigation feels immediate rather than animating a long way up.
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  // Belt-and-suspenders for browsers that scroll the documentElement/body.
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}
