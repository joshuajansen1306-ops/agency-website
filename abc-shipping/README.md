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

## Automation rules (all in `data.js` → `RULES`)
Always the same: **Cargo Cutoff Time 17:00 · Voyage 99 · Vessel A VESSEL**.

Worked out from the **Estimated Cargo Delivery Date** (always given):

| Field | Rule |
|---|---|
| FOB ETD | first **Monday** on or after the delivery date |
| Discharge Port ETA, Final Destination ETA | FOB ETD **+ 30 days** |
| SI Cutoff Date | FOB ETD **− 3 days** |
| Cargo Cutoff Date | FOB ETD **− 1 day** |
| Stuffing Location | looked up from the vendor (`stuffingByVendor`) |

Example: delivery 10/13/2026 → FOB ETD 10/19, ETAs 11/18, SI cutoff 10/16, cargo cutoff 10/18.

- **⚡ Auto-Fill** (booking page) fills all of the above; every filled field turns yellow.
- **Confirm** requires all of them to be filled.
- **⚡ Auto-Process Selected** (overview) does Auto-Fill + Confirm for every ticked booking; bookings flagged
  *Ready to Decline* / *Not Ready to Process* are skipped for a human.

## Data
All sample data is in `data.js` (fictional). State (confirmed/declined/edits) is kept in the browser's
`localStorage`; the reset icon in the top bar restores the originals.
