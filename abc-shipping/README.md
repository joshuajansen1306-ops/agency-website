# ABC Shipping – Booking Portal (demo)

Static replica of the booking workflow. No build step: open `index.html`
(or visit `/abc-shipping/` on the published site).

## The flow
1. **Booking** in the left menu (hover shows the *Workflow* flyout) → enter company code **981**.
2. *Booking Overview* lists the bookings still to be done (status **Sent**).
3. Open a booking → *Booking Header* tab. Editable fields are white, read-only are grey.
4. **Stuffing Location** is the field that must be filled (turns **yellow** when changed; the address
   fields fill themselves). For `ABCNYC43653IN0` the correct answer is **ALL CARGO TERMINAL Limited**.
5. **Confirm** (needs a stuffing location) / **Decline** (needs a reason code) / **Void**.

## Automation
- **⚡ Auto-Fill** (booking page) sets the stuffing location from the vendor rule.
- **⚡ Auto-Process Selected** (overview) fills + confirms every ticked booking; bookings flagged
  *Ready to Decline* / *Not Ready to Process* are skipped for a human.
- Rules live in `data.js` → `RULES.stuffingByVendor` (vendor code → stuffing location).

## Data
All sample data is in `data.js` (fictional). State (confirmed/declined/edits) is kept in the browser's
`localStorage`; the reset icon in the top bar restores the originals.
