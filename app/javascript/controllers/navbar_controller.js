// navbar_controller.js
import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="navbar"
export default class extends Controller {
  static targets = ["menu"]

  connect() {
    console.log('Menu controller connected')
  }

  openMenu() {
    this.menuTarget.classList.remove('hidden');
  }

  closeMenu() {
    // Delay to allow smooth transition and to avoid closing when moving between button and menu
    setTimeout(() => {
      if (!this.menuTarget.matches(":hover") && !this.element.querySelector('#mega-menu-dropdown-button').matches(":hover")) {
        this.menuTarget.classList.add('hidden');
      }
    }, 50); // Adjust delay if needed
  }
}