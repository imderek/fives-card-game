import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["menu", "buttonText"]

  connect() {
    console.log("Dropdown controller connected!")
    document.addEventListener('click', this.handleClickOutside.bind(this))
  }

  toggle(event) {
    console.log("Toggle called!")
    event.stopPropagation()
    this.menuTarget.classList.toggle('hidden')
  }

  close(event) {
    if (event && event.target.type === 'radio') {
      const selectedText = event.target.dataset.dropdownTextValue
      this.buttonTextTarget.textContent = selectedText
    }
    this.menuTarget.classList.add('hidden')
  }

  handleClickOutside = (event) => {
    if (!this.element.contains(event.target)) {
      this.close()
    }
  }

  disconnect() {
    document.removeEventListener('click', this.handleClickOutside.bind(this))
  }
} 