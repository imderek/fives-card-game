// navbar_controller.js
import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="navbar"
export default class extends Controller {
  static targets = ["menu", "navItem"]

  connect() {
    console.log('Menu controller connected')
    // console.log(this.navItemTarget.offsetLeft)
    // console.log(this.menuTarget.offsetLeft)
    // this.menuTarget.style.left = this.navItemTarget.offsetLeft + 'px';
    this.menuTarget.style.marginLeft = '-15.5px'
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