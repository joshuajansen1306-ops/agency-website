/* ABC Shipping – demo data.
   Everything here is fictional sample data. The ONLY values that are tied to the
   original walkthrough are: company code 981 and the Stuffing Location
   "ALL CARGO TERMINAL Limited" (the yellow-highlighted answer for booking
   ABCNYC43653IN0). Edit freely. */
window.ABC_DATA = (function () {
  const COMPANIES = {
    '981': 'Summit Apparel Trading',
    '214': 'Harbor Home Goods',
  };

  /* Stuffing Location dropdown – exact option list from the walkthrough. */
  const STUFFING = [
    { name: 'ALL CARGO TERMINAL Limited', addr1: 'Village – Khopte, Taluka – Uran, (JN Port Area), Dist. – Raigad,', addr2: '', city: 'Uran', state: 'Maharashtra', country: 'IN', postal: '410206' },
    { name: 'Ameya Logistics Private Limited', addr1: 'Survey No. 66, Village Dronagiri, Taluka Uran', addr2: 'JNPT Road', city: 'Navi Mumbai', state: 'Maharashtra', country: 'IN', postal: '400707' },
    { name: 'APM Terminals Inland Services', addr1: 'Plot 12, Sector 9, Dronagiri Node', addr2: '', city: 'Navi Mumbai', state: 'Maharashtra', country: 'IN', postal: '400707' },
    { name: 'Gateway Distriparks Limited (GDL)', addr1: 'Sector 6, Dronagiri, Taluka Uran', addr2: 'Dist. Raigad', city: 'Navi Mumbai', state: 'Maharashtra', country: 'IN', postal: '400707' },
    { name: 'Gateway Distriparks Limited CFS', addr1: 'Survey No. 105, Village Panvel', addr2: 'Kalamboli Road', city: 'Panvel', state: 'Maharashtra', country: 'IN', postal: '410206' },
    { name: 'JM Baxi Ports & Logistics Ltd.', addr1: 'Plot 5, Sector 8, Dronagiri', addr2: '', city: 'Navi Mumbai', state: 'Maharashtra', country: 'IN', postal: '400707' },
    { name: 'Kuehne + Nagel India Pvt Ltd.', addr1: 'CFS Yard, Gate 3, Nhava Sheva Port Area', addr2: '', city: 'Navi Mumbai', state: 'Maharashtra', country: 'IN', postal: '400707' },
    { name: 'Kuehne Nagel India Pvt Ltd.', addr1: 'Warehouse 14, Uran-Panvel Road', addr2: '', city: 'Uran', state: 'Maharashtra', country: 'IN', postal: '400702' },
    { name: 'Multiple', addr1: '', addr2: '', city: '', state: '', country: '', postal: '' },
    { name: 'ULSS CFS (Container Freight Station)', addr1: 'Plot 41, Sector 3, Dronagiri', addr2: '', city: 'Navi Mumbai', state: 'Maharashtra', country: 'IN', postal: '400707' },
  ];

  /* Automation rule: which stuffing location is correct for which vendor. */
  const RULES = {
    /* Same on every booking – always filled in. */
    constants: { cargoCutoffTime: '17:00', voyage: '99', vessel: 'A VESSEL' },
    /* Everything below is worked out from the Estimated Cargo Delivery Date (always given). */
    schedule: {
      fobEtdWeekday: 1,          // Monday (0 = Sunday); first one on or after the delivery date
      etaDaysAfterFobEtd: 31,    // Discharge Port ETA and Final Destination ETA (calendar days)
      siCutoffWorkingDaysBefore: 3, // SI Cutoff Date = FOB ETD - 3 working days (Sat/Sun not counted)
      cargoCutoffDaysBefore: 1,  // Cargo Cutoff Date = FOB ETD - 1 day
    },
    stuffingByVendor: {
      '50701': 'ALL CARGO TERMINAL Limited',
      '50822': 'Gateway Distriparks Limited CFS',
      '50937': 'Kuehne + Nagel India Pvt Ltd.',
      '51044': 'APM Terminals Inland Services',
      '51160': 'JM Baxi Ports & Logistics Ltd.',
      '51278': 'ULSS CFS (Container Freight Station)',
      '51305': 'Ameya Logistics Private Limited',
    },
  };

  const LISTS = {
    carriers: ['Maersk(MAEU)', 'MSC(MSCU)', 'CMA CGM(CMDU)', 'Hapag-Lloyd(HLCU)', 'ONE(ONEY)', 'Evergreen(EGLV)'],
    dischargePorts: ['New York / New Jersey', 'Savannah', 'Norfolk', 'Charleston', 'Houston', 'Los Angeles', 'Long Beach'],
    finalDest: ['New York, NY', 'Columbus, OH', 'Savannah, GA', 'Reno, NV', 'Dallas, TX'],
    dc: ['New York, NY', 'Columbus, OH', 'Savannah, GA', 'Reno, NV'],
    shipTo: ['Summit USA, OH', 'Summit USA, NY', 'Summit USA, GA', 'Summit USA, NV'],
    shipMode: ['Ocean', 'Air', 'Truck'],
    freightType: ['CFS/CY', 'CY/CY', 'CFS/CFS', 'LCL'],
    impacted: ['Yes', 'No'],
    containerType: ['20 GP', '40 GP', '40 HC', '45 HC', 'LCL'],
    opContacts: ['Meera Iyer', 'Rohan Desai', 'Farah Khan'],
    docContacts: ['Anil Menon', 'Sneha Kulkarni'],
    reasonCodes: [
      'Capacity not available',
      'Vendor not ready',
      'Cargo cutoff missed',
      'Incorrect booking details',
      'Duplicate booking',
      'Customer request',
    ],
  };

  const OPS = {
    'Meera Iyer': ['meera.iyer@abcshipping.example', '91-22-40001000'],
    'Rohan Desai': ['rohan.desai@abcshipping.example', '91-22-40001001'],
    'Farah Khan': ['farah.khan@abcshipping.example', '91-22-40001002'],
  };
  const DOCS = {
    'Anil Menon': ['anil.menon@abcshipping.example', '91-22-40002000'],
    'Sneha Kulkarni': ['sneha.kulkarni@abcshipping.example', '91-22-40002001'],
  };


  /* Sailing schedule – NEW YORK (MAERSK) / EFLR, Monday, from the planning sheet.
     closed = green row in the sheet (containers already booked). Years assumed 2026. */
  const SHIPMENT_LANES = [{
    id: 'NEW YORK', title: 'NEW YORK (MAERSK) / EFLR', weekday: 'Monday', carrier: 'Maersk(MAEU)', dest: 'New York', service: 'EFLR',
    shipments: [
      ['981N002122BB0', '08/17/2026', 1], ['981N002126BB0', '08/24/2026', 1], ['981N002132BB0', '08/31/2026', 1],
      ['981N002151BB0', '09/07/2026', 1], ['981N002141BB0', '09/14/2026', 1], ['981N002165BB0', '09/20/2026', 1],
      ['981N002166BB0', '09/20/2026', 1], ['981N002160BB0', '09/21/2026', 0], ['981N002176BB0', '09/21/2026', 0],
      ['981N002164BB0', '09/28/2026', 0], ['981N002167BB0', '10/12/2026', 0], ['981N002185BB0', '10/19/2026', 0],
      ['981N002188BB0', '10/26/2026', 0], ['981N002196BB0', '11/02/2026', 0],
    ].map((r) => ({ key: r[0], etd: r[1], closed: !!r[2] })),
  }];
  const LANE_TABS = ['SHEKOU', 'SHANGHAI', 'ROTTERDAM', 'NEW YORK'];

  /* ---------- item generator ---------- */
  const SIZES = ['XX SMALL', 'X SMALL', 'SMALL', 'MEDIUM', 'LARGE', 'X LARGE', 'XXLARGE'];
  function items(po, productBase, color, desc, n, bulkIdx, seed) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const bulk = i === bulkIdx;
      out.push({
        project: '',
        shipMethod: '2-International - Ocean',
        hold: 'No',
        po: po,
        product: String(productBase + i * 9),
        color: color,
        size: SIZES[i % SIZES.length],
        finalDest: 'USCMH',
        poType: 'INI',
        pack: 'Loose',
        desc: desc,
        range: '01',
        cartons: bulk ? 40 + (seed % 9) : 1,
        units: bulk ? 960 + seed * 7 : 24 + ((i * 3 + seed) % 7),
        weight: bulk ? 120 + seed : 3 + (i % 2),
        volume: bulk ? 0.9 : 0.02,
      });
    }
    return out;
  }

  /* ---------- booking factory ---------- */
  function booking(o) {
    const op = OPS[o.op || 'Meera Iyer'];
    const isOpen = (o.status || 'Sent') === 'Sent';
    const f = {
      bookingKey: o.id, office: 'IN0', companyCode: '981', status: 'Sent to Origin',
      vendorCode: o.vendorCode, vendorName: o.vendorName,
      vendorContact: o.vendorContact || 'Kavita Rao', vendorPhone: '', vendorEmail: o.vendorEmail,
      subVendor: '', subContact: '', subPhone: '', subEmail: '',
      usVendor: 'No', vendorRef: '', incoterms: '', bookingType: '',
      shipKey: '', shipMovedDate: '',
      createdDate: o.created, receivedDate: o.received, confirmDate: o.confirmDate,
      contactName: o.contactName, contactPhone: o.contactPhone || '022-48044300', contactFax: '022-48006311', contactEmail: o.contactEmail,
      opContact: o.op || 'Meera Iyer', opEmail: op[0], opPhone: op[1],
      defOpContact: '', defOpEmail: '', defOpPhone: '',
      docContact: '', docEmail: '', docPhone: '',
      whContact: '', whEmail: '', whPhone: '',
      shipperAddress: o.shipperAddress,
      shipperName: o.vendorName, fcrEmail: o.vendorEmail,
      originCountry: 'INDIA', solidWood: 'No', exportLicense: 'No', dg: 'No',
      mfrName: o.mfrName, mfrAddr1: o.mfrAddr1, mfrAddr2: o.mfrAddr2 || '', mfrCity: o.mfrCity, mfrState: o.mfrState, mfrCountry: 'IN', mfrPostal: o.mfrPostal,
      stuffing: '', stAddr1: '', stAddr2: '', stCity: '', stState: '', stCountry: '', stPostal: '',
      fobPort: o.fobPort, fobEtd: isOpen ? '' : o.fobEtd,
      dischargePort: '', dischargeEta: isOpen ? '' : o.dischargeEta,
      finalDest: o.finalDest || 'New York, NY', finalEta: isOpen ? '' : o.dischargeEta,
      dc: o.dc || 'New York, NY', shipTo: o.shipTo || 'Summit USA, OH',
      estDelivery: o.estDelivery, actualReceived: '',
      siCutoffDate: '', siCutoffTime: '',
      cargoCutoffDate: isOpen ? '' : o.cutoff, cargoCutoffTime: isOpen ? '' : '17:00',
      carrier: o.carrier || 'Maersk(MAEU)', carrierSo: '',
      vessel: isOpen ? '' : 'A VESSEL', voyage: isOpen ? '' : '99',
      trucking: false,
      shipMode: 'Ocean', freightType: 'CFS/CY', impacted: '', pallets: '', chargeableWeight: '',
      containers: ['', '', '', '', ''], containerTypes: ['', '', '', '', ''],
    };
    return {
      id: o.id,
      workId: 'IN0',
      status: o.status || 'Sent',
      kpi: o.kpi || 'On Time',
      readiness: o.readiness || 'process',   // process | decline | notready
      reason: o.reason || '',
      fields: f,
      items: o.items,
      notes: [],
    };
  }

  const open = [
    booking({
      id: 'ABCNYC43653IN0', vendorCode: '50701', vendorName: 'Rajhans Exports Private Limited',
      vendorContact: 'Kavita Rao', vendorEmail: 'kavita@rajhansgroup.example',
      created: '09/20/2026', received: '10/08/2026', confirmDate: '09/21/2026',
      contactName: 'PRADEEP KUMAR', contactEmail: 'pradeep@rajhansgroup.example;ops@rajhansgroup.example', contactPhone: '0124-48044300',
      shipperAddress: 'PLOT NO. 17-22, SECTOR-34 EHTP\nGURUGRAM, HARYANA 122004\nState Code: 6  State Name: Haryana\nGSTN: 06AAAAA0000A1Z5',
      mfrName: 'Rajhans Exports Private Limited - (Knits Unit)', mfrAddr1: 'PLOT NO. 17-22', mfrAddr2: 'SECTOR 34,', mfrCity: 'GURGAON', mfrState: 'HR', mfrPostal: '122001',
      fobPort: 'Nhava Sheva', fobEtd: '10/19/2026', dischargeEta: '11/19/2026', estDelivery: '10/13/2026', cutoff: '10/18/2026',
      items: (function () {
        const r = items('3209087', 676223562, 'CASUAL BLACK', 'WMNS KNIT SLEEPWEAR', 7, 4, 0);
        const units = [25, 30, 30, 25, 1190, 25, 25], wt = [3, 3, 3, 3, 157, 3, 4], vol = [0.016, 0.016, 0.016, 0.016, 1.0, 0.017, 0.017];
        const prod = [676223562, 676223589, 676223571, 676223600, 676223618, 676223626, 676223597];
        const size = ['XX SMALL', 'LARGE', 'X SMALL', 'X LARGE', 'SMALL', 'XXLARGE', 'MEDIUM'];
        r.forEach((x, i) => { x.units = units[i]; x.weight = wt[i]; x.volume = vol[i]; x.product = String(prod[i]); x.size = size[i]; x.cartons = i === 4 ? 49 : 1; });
        return r;
      })(),
    }),
    booking({
      id: 'ABCNYC43654IN0', vendorCode: '50822', vendorName: 'Kaveri Knitwear Private Limited', op: 'Rohan Desai',
      vendorEmail: 'exports@kaveriknit.example', created: '09/22/2026', received: '10/08/2026', confirmDate: '09/23/2026',
      contactName: 'SURESH BABU', contactEmail: 'suresh@kaveriknit.example',
      shipperAddress: '88, MANGALAM ROAD, KUMARAN NAGAR\nTIRUPPUR, TAMIL NADU 641604\nState Code: 33  State Name: Tamil Nadu',
      mfrName: 'Kaveri Knitwear - Unit 2', mfrAddr1: '88 MANGALAM ROAD', mfrCity: 'TIRUPPUR', mfrState: 'TN', mfrPostal: '641604',
      fobPort: 'Chennai', fobEtd: '10/21/2026', dischargeEta: '11/24/2026', estDelivery: '10/15/2026', cutoff: '10/19/2026',
     
      items: items('3209114', 676300110, 'HEATHER GREY', 'MENS FLEECE JOGGER', 6, 2, 2),
    }),
    booking({
      id: 'ABCNYC43660IN0', vendorCode: '50937', vendorName: 'Bluewave Garments Limited', op: 'Farah Khan',
      vendorEmail: 'shipping@bluewave.example', created: '09/25/2026', received: '10/08/2026', confirmDate: '09/26/2026',
      contactName: 'ANITA SHARMA', contactEmail: 'anita@bluewave.example',
      shipperAddress: '14 INDUSTRIAL AREA PHASE II\nLUDHIANA, PUNJAB 141003\nState Code: 3  State Name: Punjab',
      mfrName: 'Bluewave Garments - Woven Unit', mfrAddr1: '14 INDUSTRIAL AREA', mfrAddr2: 'PHASE II', mfrCity: 'LUDHIANA', mfrState: 'PB', mfrPostal: '141003',
      fobPort: 'Mundra', fobEtd: '10/24/2026', dischargeEta: '11/26/2026', estDelivery: '10/17/2026', cutoff: '10/22/2026',
     
      items: items('3209201', 676410220, 'INDIGO WASH', 'MENS DENIM SHIRT', 7, 1, 4),
    }),
    booking({
      id: 'ABCLAX43702IN0', vendorCode: '51044', vendorName: 'Sunrise Textiles Pvt Ltd', op: 'Meera Iyer', kpi: 'At Risk',
      vendorEmail: 'logistics@sunrisetex.example', created: '09/29/2026', received: '10/08/2026', confirmDate: '09/30/2026',
      contactName: 'IMRAN SHEIKH', contactEmail: 'imran@sunrisetex.example',
      shipperAddress: 'GALA 7-9, ANDHERI INDUSTRIAL ESTATE\nMUMBAI, MAHARASHTRA 400093\nState Code: 27  State Name: Maharashtra',
      mfrName: 'Sunrise Textiles - Unit 1', mfrAddr1: 'GALA 7-9', mfrCity: 'MUMBAI', mfrState: 'MH', mfrPostal: '400093',
      fobPort: 'Nhava Sheva', fobEtd: '10/27/2026', dischargeEta: '11/30/2026', estDelivery: '10/20/2026', cutoff: '10/25/2026',
     
      items: items('3209255', 676520330, 'OATMEAL', 'WMNS CASHMERE BLEND SWEATER', 5, 3, 1),
    }),
    booking({
      id: 'ABCNYC43711IN0', vendorCode: '51160', vendorName: 'Orchid Apparel Exports', op: 'Rohan Desai', readiness: 'decline', kpi: 'Late',
      vendorEmail: 'orders@orchidapparel.example', created: '09/18/2026', received: '10/02/2026', confirmDate: '09/19/2026',
      contactName: 'DEEPA NAIR', contactEmail: 'deepa@orchidapparel.example',
      shipperAddress: '5 SEEPZ SPECIAL ECONOMIC ZONE\nMUMBAI, MAHARASHTRA 400096\nState Code: 27  State Name: Maharashtra',
      mfrName: 'Orchid Apparel - SEEPZ', mfrAddr1: '5 SEEPZ SEZ', mfrCity: 'MUMBAI', mfrState: 'MH', mfrPostal: '400096',
      fobPort: 'Nhava Sheva', fobEtd: '10/09/2026', dischargeEta: '11/10/2026', estDelivery: '10/05/2026', cutoff: '10/05/2026',
     
      items: items('3209070', 676110440, 'WHITE', 'GIRLS WOVEN BLOUSE', 4, 0, 5),
    }),
    booking({
      id: 'ABCSAV43725IN0', vendorCode: '51278', vendorName: 'Lotus Home Textiles', op: 'Farah Khan',
      vendorEmail: 'dispatch@lotushome.example', created: '10/01/2026', received: '10/08/2026', confirmDate: '10/02/2026',
      contactName: 'RAJESH PATEL', contactEmail: 'rajesh@lotushome.example',
      shipperAddress: 'SURVEY 212, GIDC ESTATE, SACHIN\nSURAT, GUJARAT 394230\nState Code: 24  State Name: Gujarat',
      mfrName: 'Lotus Home Textiles - Terry Unit', mfrAddr1: 'SURVEY 212, GIDC', mfrCity: 'SURAT', mfrState: 'GJ', mfrPostal: '394230',
      fobPort: 'Mundra', fobEtd: '10/28/2026', dischargeEta: '11/29/2026', estDelivery: '10/22/2026', cutoff: '10/26/2026',
     
      items: items('3209310', 676630550, 'NATURAL', 'COTTON TERRY BATH TOWEL', 6, 5, 3),
    }),
    booking({
      id: 'ABCNYC43733IN0', vendorCode: '51305', vendorName: 'Greenfield Garments Pvt Ltd', op: 'Meera Iyer',
      vendorEmail: 'team@greenfieldgarments.example', created: '10/02/2026', received: '10/08/2026', confirmDate: '10/03/2026',
      contactName: 'NEHA VERMA', contactEmail: 'neha@greenfieldgarments.example',
      shipperAddress: 'B-22, NOIDA SEZ, PHASE II\nNOIDA, UTTAR PRADESH 201305\nState Code: 9  State Name: Uttar Pradesh',
      mfrName: 'Greenfield Garments - Unit 3', mfrAddr1: 'B-22 NOIDA SEZ', mfrAddr2: 'PHASE II', mfrCity: 'NOIDA', mfrState: 'UP', mfrPostal: '201305',
      fobPort: 'Nhava Sheva', fobEtd: '10/30/2026', dischargeEta: '12/01/2026', estDelivery: '10/24/2026', cutoff: '10/27/2026',
      carrier: 'Maersk(MAEU)',
      items: items('3209388', 676740660, 'DEEP NAVY', 'MENS KNIT POLO', 7, 6, 6),
    }),
  ];

  /* Nine previously declined bookings (matches the "Declined Bookings (9)" tile). */
  const declinedVendors = [
    ['50701', 'Rajhans Exports Private Limited'], ['50822', 'Kaveri Knitwear Private Limited'], ['50937', 'Bluewave Garments Limited'],
    ['51044', 'Sunrise Textiles Pvt Ltd'], ['51160', 'Orchid Apparel Exports'], ['51278', 'Lotus Home Textiles'],
  ];
  const declined = [];
  for (let i = 0; i < 9; i++) {
    const v = declinedVendors[i % declinedVendors.length];
    declined.push(booking({
      id: 'ABCNYC4' + (3400 + i * 11) + 'IN0', status: 'Declined', reason: LISTS.reasonCodes[i % LISTS.reasonCodes.length],
      vendorCode: v[0], vendorName: v[1], vendorEmail: 'ops@' + v[1].split(' ')[0].toLowerCase() + '.example',
      created: '08/' + String(10 + i).padStart(2, '0') + '/2026', received: '08/' + String(12 + i).padStart(2, '0') + '/2026', confirmDate: '08/' + String(13 + i).padStart(2, '0') + '/2026',
      contactName: 'OPS DESK', contactEmail: 'ops@' + v[1].split(' ')[0].toLowerCase() + '.example',
      shipperAddress: 'Vendor address on file', mfrName: v[1], mfrAddr1: 'On file', mfrCity: 'MUMBAI', mfrState: 'MH', mfrPostal: '400001',
      fobPort: 'Nhava Sheva', fobEtd: '09/0' + (1 + (i % 8)) + '/2026', dischargeEta: '10/0' + (1 + (i % 8)) + '/2026', estDelivery: '08/30/2026', cutoff: '08/30/2026',
      items: items('31' + (10000 + i * 37), 676000100 + i * 100, 'ASSORTED', 'ASSORTED APPAREL', 3, 1, i),
    }));
  }

  return { COMPANIES, STUFFING, RULES, LISTS, OPS, DOCS, SHIPMENT_LANES, LANE_TABS, bookings: open.concat(declined) };
})();
