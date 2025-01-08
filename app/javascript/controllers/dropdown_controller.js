import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["menu", "buttonText", "buttonAvatar"]

  initialize() {
    this.boundHandleClick = (event) => this.handleDocumentClick(event)
  }

  connect() {
    document.addEventListener('click', this.boundHandleClick, true)
  }

  disconnect() {
    document.removeEventListener('click', this.boundHandleClick, true)
  }

  handleDocumentClick(event) {
    if (!this.element.contains(event.target) && !this.menuTarget.classList.contains('hidden')) {
      this.close()
    }
  }

  toggle(event) {
    event.stopPropagation()
    this.menuTarget.classList.toggle('hidden')
  }

  close(event) {
    if (event && event.target.type === 'radio') {
      const selectedText = event.target.dataset.dropdownTextValue
      const avatarClass = event.target.dataset.dropdownAvatarClass
      const avatarText = event.target.dataset.dropdownAvatarText
      
      this.buttonTextTarget.textContent = selectedText
      this.buttonAvatarTarget.className = `w-6 h-6 rounded-full bg-gradient-to-b shadow-lg ${avatarClass} text-white flex items-center justify-center`
      this.buttonAvatarTarget.textContent = avatarText
      this.buttonAvatarTarget.classList.remove('hidden')
    }
    this.menuTarget.classList.add('hidden')
  }
} 