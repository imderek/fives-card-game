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
    const dealId = event.currentTarget.dataset.dealId;

    // Fetch deal details via Turbo stream
    const response = await fetch(`/deals/${dealId}`, {
      headers: { Accept: "text/vnd.turbo-stream.html" },
    });

    if (response.ok) {
      const html = await response.text();
      this.dealContentTarget.innerHTML = html;
      this.drawer = FlowbiteInstances.getInstance('Drawer', 'dealDrawer');
      this.drawer.show();
    } else {
      console.error("Failed to fetch deal details");
    }
  }

  closeDrawer() {
    // Hide the drawer programmatically
    this.drawer.hide();
  }
}