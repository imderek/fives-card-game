import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    url: String
  }

  goToUrl(){
    // Rails 7
    Turbo.visit(this.urlValue)
    // Prior to Rails 7 I would use the following
    // Turbolinks.visit(this.urlValue)
  }
}