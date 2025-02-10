import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["toggle"]
  static values = {
    preferenceName: String
  }

  toggle() {
    const enabled = this.toggleTarget.checked
    
    fetch("/user_preferences/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector("[name='csrf-token']").content
      },
      body: JSON.stringify({ 
        key: this.preferenceNameValue,
        value: enabled 
      })
    })
  }
} 