import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["columnSelector"]

  showColumnSelector() {
    this.columnSelectorTarget.classList.remove("hidden")
  }

  // submitForm(event) {
  //   // Prevent any default handling
  //   event.stopPropagation()
    
  //   // Submit the form
  //   event.target.submit()
  // }
}