const buttons: NodeListOf<HTMLButtonElement> = document.querySelectorAll(
  "button.ripple-button"
);

type ButtonEvent = MouseEvent & {
  target: EventTarget & HTMLButtonElement;
};

function getIsRightButtonPressed(event) {
  if ("which" in event)
    // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
    return event.which === 3;
  else if ("button" in event)
    // IE, Opera
    return event.button === 2;
}

function removeRippleFromNode({ node, ripple }) {
  if (node.contains(ripple)) {
    ripple.classList.remove("active-ripple-span");
    ripple.classList.add("deactive-ripple-span");

    setTimeout(() => {
      if (node.contains(ripple)) {
        node.removeChild(ripple);
      }
    }, 600);
  }
}

function handleClickRippleSpan(Event: ButtonEvent) {
  const isRightButton: boolean = getIsRightButtonPressed(Event);
  if (isRightButton) {
    // aint adding ripple if right button triggered the event
    return;
  }

  Event.target.classList.add("click-event-flag");
  setTimeout(() => Event.target.classList.remove("click-event-flag"), 10);
  const cursorPositionY: number = Event.clientY;
  const cursorPositionX: number = Event.clientX;

  const buttonCurrentColor = window.getComputedStyle(Event.target).color;

  const {
    y: buttonPositionY,
    x: buttonPositionX
  } = Event.target.getBoundingClientRect() as { y: number; x: number };

  const ripplePositionY: number = cursorPositionY - buttonPositionY;
  const ripplePositionX: number = cursorPositionX - buttonPositionX;

  const rippleSpan = document.createElement("span");
  rippleSpan.classList.add(
    "ripple-span",
    "active-ripple-span",
    "click-ripple-span"
  );
  rippleSpan.style.backgroundColor = buttonCurrentColor;

  rippleSpan.style.top = `${ripplePositionY}px`;
  rippleSpan.style.left = `${ripplePositionX}px`;

  Event.target.appendChild(rippleSpan);

  ["mouseup", "mouseout"].forEach((event) => {
    Event.target.addEventListener(event, () => {
      removeRippleFromNode({ node: Event.target, ripple: rippleSpan });
    });
  });
}

function handleFocusRippleSpan(Event: ButtonEvent) {
  // prevent the function will happens if the target had been focused on click, it makes this function a "focus-visible" function.
  if (Event.target.classList.contains("click-event-flag")) return;

  const buttonCurrentColor = window.getComputedStyle(Event.target).color;

  const rippleSpan = document.createElement("span");
  rippleSpan.classList.add("ripple-span", "focus-ripple-span");
  rippleSpan.style.backgroundColor = buttonCurrentColor;

  setTimeout(() => {
    rippleSpan.classList.add("active-ripple-span");
  }, 10);

  Event.target.appendChild(rippleSpan);

  ["focusout", "blur", "mouseout", "mousedown"].forEach((event) => {
    Event.target.addEventListener(event, () => {
      removeRippleFromNode({
        node: Event.target,
        ripple: rippleSpan
      });
    });
  });

  Event.target.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.code === "Space" || event.key === " " || event.keyCode === 32) {
      removeRippleFromNode({
        node: Event.target,
        ripple: rippleSpan
      });
    }
  });
}

function handleInsetToast(e: ButtonEvent) {
  const toastContent = e.target.getAttribute("data-toast-content");

  const portal = document.createElement("div");
  portal.id = "portal";

  const toastContainer = document.createElement("div");
  toastContainer.classList.add("floating-toast");
  toastContainer.setAttribute("data-state", "open");
  toastContainer.innerHTML = `<p>${toastContent}</p>`;

  if (!document.querySelector("#portal")) {
    portal.appendChild(toastContainer);
    document.querySelector("html").appendChild(portal);
  } else {
    document.querySelector("#portal").appendChild(toastContainer);
  }

  setTimeout(() => {
    toastContainer.setAttribute("data-state", "close");
  }, 3000);

  setTimeout(() => {
    document.querySelector("#portal").removeChild(toastContainer);

    if (document.querySelector("#portal").childNodes.length === 0) {
      document
        .querySelector("html")
        .removeChild(document.querySelector("#portal"));
    }
  }, 4000);
}

buttons.forEach((button) =>
  button.addEventListener("mousedown", handleClickRippleSpan)
);

buttons.forEach((button) => {
  button.addEventListener("keydown", (event: KeyboardEvent) => {
    if (
      !(event.code === "Space" || event.key === " " || event.keyCode === 32)
    ) {
      return;
    }
    if (event.repeat) {
      return;
    }
    button.dispatchEvent(new Event("mousedown"));
  });
  button.addEventListener("keyup", (event: KeyboardEvent) => {
    if (event.code === "Space" || event.key === " " || event.keyCode === 32) {
      button.dispatchEvent(new Event("mouseup"));
    }
  });
});

buttons.forEach((button) =>
  button.addEventListener("focus", handleFocusRippleSpan)
);

document.querySelectorAll(".toast-cta").forEach((botao) => {
  botao.addEventListener("click", handleInsetToast);
});
