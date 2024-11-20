import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["dealContent"];

  connect() {
    // Initialize the Flowbite Drawer
    // this.drawer = new Drawer(document.getElementById("dealDrawer"), {
    //   placement: "right",
    //   backdrop: true,
    // });

  }

  async showDeal(event) {
    event.preventDefault();
    console.log("showDeal");
    // document.addEventListener('load', () => {
    this.drawer = FlowbiteInstances.getInstance('Drawer', 'dealDrawer');
    this.drawer.show();
    // });
  }

  closeDrawer() {
    // Hide the drawer programmatically
    this.drawer.hide();
  }
}