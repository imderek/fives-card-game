// navbar_controller.js
import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="navbar"
export default class extends Controller {
  static targets = ["menu"]

  connect() {
    console.log('Menu controller connected')
    // this.closeMenu()
  }

  openMenu() {
    // Remove classes that hide the menu
    this.menuTarget.classList.remove('opacity-0', 'pointer-events-none');
    this.menuTarget.classList.add('opacity-100');
  }

  closeMenu() {
    // Add classes to hide the menu with a transition
    this.menuTarget.classList.remove('opacity-100');
    this.menuTarget.classList.add('opacity-0', 'pointer-events-none');
  }
}