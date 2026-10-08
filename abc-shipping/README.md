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
| Discharge Port ETA, Final Destination ETA | FOB ETD **+ 31 days** |
| SI Cutoff Date | FOB ETD **− 3 working days** (Saturday and Sunday not counted) |
| Cargo Cutoff Date | FOB ETD **− 1 day** |
| Stuffing Location | looked up from the vendor (`stuffingByVendor`) |

Example: delivery 10/13/2026 → FOB ETD 10/19, ETAs 11/19, SI cutoff 10/14, cargo cutoff 10/18.

- **⚡ Auto-Fill** (booking page) fills all of the above; every filled field turns yellow.
- **Confirm** requires all of them to be filled.
- **⚡ Auto-Process Selected** (overview) does Auto-Fill + Confirm for every ticked booking; bookings flagged
  *Ready to Decline* / *Not Ready to Process* are skipped for a human.

## Step 2 – Move Booking to Shipment
After **Confirm**, the booking waits under *Bookings Not Yet Moved to Shipment*. Open it → **☰ menu → Move Booking to Shipment**
(or click *Move to Shipment* in the prompt that appears right after Confirm).

- The **ship key depends on the FOB ETD**. The sailing schedule (NEW YORK (MAERSK) / EFLR, Mondays) is in
  `data.js` → `SHIPMENT_LANES`, copied from the planning sheet. FOB ETD 10/19/2026 → `981N002185BB0`,
  10/26/2026 → `981N002188BB0`.
- The dialog suggests the right key ("Use this key"). A key that sails on a different date, a closed (green) shipment
  or an unknown key is rejected with the reason.
- On submit the booking key is saved under the ship key. **Shipping → Shipment Schedule** lists every ship key with
  its booking keys and the total cartons / volume / weight, ready for container booking later.
- **⚡ Auto-Process Selected** can do the whole chain (fill → confirm → move) in one go; the "Also move confirmed
  bookings to their shipment" box controls the last step.

## Data
All sample data is in `data.js` (fictional). State (confirmed/declined/edits) is kept in the browser's
`localStorage`; the reset icon in the top bar restores the originals.

## Visitor log (published page only)
When the page is published as an artifact, every open is recorded: the visitor's id and the time (shared `visits`
collection, one document per person, last 200 opens). Names are looked up when the log is shown. The owner and editors
get a **VISITORS** link in the top bar; everyone else sees a notice that visits are recorded. Only people with
Contributor access or higher can be recorded. Opened as a plain file, nothing is logged.
