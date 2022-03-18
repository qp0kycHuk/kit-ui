let selectors = { attached: [], deAttached: [] }

const getSupportedEvents = function () {
  let support = {
    pointer: !!("PointerEvent" in window || ("msPointerEnabled" in window.navigator)),
    touch: !!(typeof window.orientation !== "undefined" || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || "ontouchstart" in window || navigator.msMaxTouchPoints || "maxTouchPoints" in window.navigator > 1 || "msMaxTouchPoints" in window.navigator > 1)
  };
  return support.touch ?
    { type: 'touch', start: "touchstart", end: "touchend", cancel: "touchcancel" } :
    { type: 'mouse', start: "mousedown", end: "mouseup", cancel: "mouseleave" }
};

const init = () => {
  document.addEventListener(getSupportedEvents().start, clickHandler)
}

const destroy = () => {
  document.removeEventListener(getSupportedEvents().start, clickHandler)
}

const attach = (selector) => {
  selectors.deAttached = selectors.deAttached.filter((item) => item !== selector)
  selectors.attached.push(selector)
}

const deAttach = (selector) => {
  selectors.attached = selectors.attached.filter((item) => item !== selector)
  selectors.deAttached.push(selector)
}

function clickHandler(event) {
  let target = event.target;
  let isMatch = false

  for (const i in selectors.attached) {
    if (!Object.hasOwnProperty.call(selectors.attached, i)) continue
    if (event.target.matches(selectors.attached[i]) || event.target.closest(selectors.attached[i])) {
      isMatch = true
      target = event.target.closest(selectors.attached[i])
      break
    }
  }
  for (const i in selectors.deAttached) {
    if (!Object.hasOwnProperty.call(selectors.deAttached, i)) continue
    if (target.matches(selectors.deAttached[i])) {
      isMatch = false
      break
    }
  }
  if (!isMatch) return

  if (getSupportedEvents().type !== 'touch') event.preventDefault()

  if (getComputedStyle(target).position == 'static') target.style.position = 'relative'

  let rect = target.getBoundingClientRect();
  let rippleWraps = target.querySelectorAll('.ripple-wrap');
  let rippleWrap;
  let ripple = target.querySelector('.ripple');

  for (const i in rippleWraps) {
    if (!Object.hasOwnProperty.call(rippleWraps, i)) continue
    if (rippleWraps[i].parentElement == target) rippleWrap = rippleWraps[i]
  }

  if (!rippleWrap) {
    rippleWrap = document.createElement('span');
    rippleWrap.className = 'ripple-wrap';
    target.appendChild(rippleWrap);
  }

  ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.height = ripple.style.width = 2 * Math.max(rect.width, rect.height, 48) + 'px';
  rippleWrap.appendChild(ripple);

  let pageX = 0;
  let pageY = 0;

  if (event.pageY && event.pageX) {
    pageX = event.pageX;
    pageY = event.pageY;
  }

  if (event.touches) {
    for (const i in event.touches) {
      if (!Object.hasOwnProperty.call(event.touches, i)) continue
      if (target.contains(event.touches[i].target) || target == event.touches[i].target) {
        pageX = event.touches[i].pageX;
        pageY = event.touches[i].pageY;
        break
      }
    }
  }

  var top = pageY - rect.top - ripple.offsetHeight / 2 - window.pageYOffset;
  var left = pageX - rect.left - ripple.offsetWidth / 2 - window.pageXOffset;
  ripple.style.top = top + 'px';
  ripple.style.left = left + 'px';
  ripple.classList.add('show');

  let isAnimEnd = false
  ripple.addEventListener('animationend', () => isAnimEnd = true, { once: true });

  target.style.userSelect = 'none'
  let isRemoved = false

  const leaveHandler = () => {
    target.style.userSelect = ''
    ripple.classList.add('hide');

    const remove = () => {
      isRemoved = true
      setTimeout(() => ripple.parentElement.removeChild(ripple), 500)
    }

    if (isRemoved) return
    if (isAnimEnd) ripple.classList.add('removed');
    if (isAnimEnd) remove()
    else ripple.addEventListener('animationend', remove, { once: true });

  }
  document.addEventListener(getSupportedEvents().end, leaveHandler, { once: true })

  return false;
}

export default { init, destroy, attach, deAttach }