import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    setTimeout(() => {
      this.dismiss();
    }, 2000);
  }

  dismiss() {
    this.element.classList.add('transform', 'opacity-0', 'transition', 'duration-500');
    setTimeout(() => this.element.remove(), 1000);
  }
}
