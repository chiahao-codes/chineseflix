const hamburgerMenuWrapper = document.getElementById("menuIconWrapper");
const mobileDropMenu = document.getElementById("mobile-nav-links-parent");

function setHamburgerInLocalStorage(setting) {
  localStorage.setItem("hamburger", setting);
}
function hamburgerOpen() {
  window.scrollTo(0, 0);
  hamburgerMenuWrapper.children[0].style.top = "19px";
  hamburgerMenuWrapper.children[0].style.width = "0%";
  hamburgerMenuWrapper.children[0].style.left = "50%";

  hamburgerMenuWrapper.children[1].style.transform = "rotate(45deg)";
  hamburgerMenuWrapper.children[2].style.transform = "rotate(-45deg)";

  hamburgerMenuWrapper.children[3].style.top = "18px";
  hamburgerMenuWrapper.children[3].style.width = "0%";
  hamburgerMenuWrapper.children[3].style.left = "50%";

  mobileDropMenu.style.top = "92px";
  setHamburgerInLocalStorage("open");
}

function hamburgerClose() {
  hamburgerMenuWrapper.children[0].style.top = "4px";
  hamburgerMenuWrapper.children[0].style.width = "100%";
  hamburgerMenuWrapper.children[0].style.left = "0px";

  hamburgerMenuWrapper.children[1].style.transform = "rotate(0deg)";
  hamburgerMenuWrapper.children[1].style.top = "19px";
  hamburgerMenuWrapper.children[2].style.top = "19px";
  hamburgerMenuWrapper.children[2].style.transform = "rotate(0deg)";

  hamburgerMenuWrapper.children[3].style.top = "34px";
  hamburgerMenuWrapper.children[3].style.width = "100%";
  hamburgerMenuWrapper.children[3].style.left = "0px";

  mobileDropMenu.style.top = "-150%";

  setHamburgerInLocalStorage("closed");
}
function setTransitionProperty() {
  for (let hmi of hamburgerMenuWrapper.children) {
    hmi.style.transitionProperty = "transform left width top";
    hmi.style.transitionDuration = ".1s";
    hmi.style.transitionTimingFunction = "ease-in-out";
  }

  mobileDropMenu.style.transition = "top .15s ease-in-out";
}
function windowScrollHamburgerClose() {
  window.addEventListener("scroll", () => {
    if (localStorage.getItem("hamburger") === "open" && window.scrollY > 0) {
      hamburgerClose();
      setHamburgerInLocalStorage("closed");
    }
  });
}

//mobile hamburger menu
hamburgerMenuWrapper.addEventListener(
  "click",
  () => {
    return new Promise((resolve) => {
      setTransitionProperty();
      resolve("transitions set");
    })
      .then(() => {
        if (localStorage.getItem("hamburger") === "closed") {
          hamburgerOpen();
        } else {
          hamburgerClose();
        }
      })
      .then(() => {
        windowScrollHamburgerClose();
      })
      .catch((e) => {
        console.log("Promise error", e);
      });
  },
  { passive: true }
);

window.addEventListener("load", () => {
  localStorage.setItem("hamburger", "closed");
  windowScrollHamburgerClose();
});