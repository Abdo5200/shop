const backdrop = document.querySelector(".backdrop");
const sideDrawer = document.querySelector(".mobile-nav");
const menuToggle = document.querySelector("#side-menu-toggle");

function backdropClickHandler() {
  backdrop.classList.remove("show");
  sideDrawer.classList.remove("open");
  // Prevent body scroll when menu is closed
  document.body.style.overflow = "";
}

function menuToggleClickHandler() {
  backdrop.classList.add("show");
  sideDrawer.classList.add("open");
  // Prevent body scroll when menu is open
  document.body.style.overflow = "hidden";
}

// Close menu when clicking on menu items
const menuItems = document.querySelectorAll(
  ".mobile-nav__item a, .mobile-nav__item button"
);
menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    backdrop.classList.remove("show");
    sideDrawer.classList.remove("open");
    document.body.style.overflow = "";
  });
});

backdrop.addEventListener("click", backdropClickHandler);
menuToggle.addEventListener("click", menuToggleClickHandler);
