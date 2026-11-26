/* CIN / LLPIN decoder. Pure functions, no DOM. Sources listed in README. */
(function (root) {
  const STATES = {
    AN: "Andaman and Nicobar Islands", AP: "Andhra Pradesh", AR: "Arunachal Pradesh", AS: "Assam",
    BR: "Bihar", CH: "Chandigarh", CG: "Chhattisgarh", CT: "Chhattisgarh (older code)", DD: "Daman and Diu",
    DL: "Delhi", DN: "Dadra and Nagar Haveli", GA: "Goa", GJ: "Gujarat", HP: "Himachal Pradesh",
    HR: "Haryana", JH: "Jharkhand", JK: "Jammu and Kashmir", KA: "Karnataka", KL: "Kerala",
    LD: "Lakshadweep", MH: "Maharashtra", ML: "Meghalaya", MN: "Manipur", MP: "Madhya Pradesh",
    MZ: "Mizoram", NL: "Nagaland", OR: "Odisha", PB: "Punjab", PY: "Puducherry", RJ: "Rajasthan",
    SK: "Sikkim", TN: "Tamil Nadu", TG: "Telangana", TR: "Tripura", UP: "Uttar Pradesh",
    UT: "Uttarakhand", UR: "Uttarakhand (older code)", WB: "West Bengal",
    TS: "Telangana (older code)", OD: "Odisha (older code)",
    // Newer codes that follow the Registrar of Companies (RoC) office. Seen in MCA's own 2014 list (PN, TZ)
    // and mapped by two secondary sources (see README).
    PN: "Maharashtra (RoC Pune)", MR: "Maharashtra (RoC Mumbai II)", ME: "Maharashtra (RoC Nagpur)",
    UW: "Uttar Pradesh (RoC Uttar Pradesh II)", DC: "Delhi (RoC Delhi II)",
    WR: "West Bengal (RoC Kolkata II)", TZ: "Tamil Nadu (RoC Coimbatore)"
  };
  const TYPES = {
    PLC: "Public limited company", PTC: "Private limited company", OPC: "One person company",
    NPL: "Not-for-profit (Section 8) company", FLC: "Financial leasing company",
    FTC: "Subsidiary of a foreign company", GAP: "General association, public", GAT: "General association, private",
    GOI: "Government of India company", SGC: "State government company",
    ULL: "Public company with unlimited liability", ULT: "Private company with unlimited liability"
  };
  const FIRST_YEAR = 1850;

  function normalise(raw) { return String(raw).replace(/[\s\u00a0\u200b]+/g, "").toUpperCase(); }

  function checkCIN(s, year) {
    const problems = [];
    const add = (part, msg) => problems.push({ part, msg });
    if (s.length !== 21) add("Length", `A CIN has 21 characters. This has ${s.length}.`);
    if (!/^[A-Z0-9]*$/.test(s)) add("Characters", "Only letters and digits are allowed. Remove dashes, dots or other symbols.");
    const p = { list: s.slice(0, 1), nic: s.slice(1, 6), st: s.slice(6, 8), yr: s.slice(8, 12), ty: s.slice(12, 15), no: s.slice(15, 21) };
    if (s.length >= 1 && !/^[LU]$/.test(p.list)) add("Listing status", `The first character must be L (listed) or U (unlisted). Found "${p.list}".`);
    if (s.length >= 6 && !/^\d{5}$/.test(p.nic)) add("Industry code", `Characters 2 to 6 must be five digits. Found "${p.nic}".`);
    if (s.length >= 8) {
      if (!/^[A-Z]{2}$/.test(p.st)) add("State code", `Characters 7 and 8 must be two letters. Found "${p.st}".`);

    }
    if (s.length >= 12) {
      if (!/^\d{4}$/.test(p.yr)) add("Year", `Characters 9 to 12 must be a four digit year. Found "${p.yr}".`);
      else if (+p.yr > year) add("Year", `${p.yr} is in the future.`);
    }
    if (s.length >= 15) {
      if (!/^[A-Z]{3}$/.test(p.ty)) add("Company type", `Characters 13 to 15 must be three letters. Found "${p.ty}".`);

    }
    if (s.length >= 21 && !/^\d{6}$/.test(p.no)) add("Registration number", `The last six characters must be digits. Found "${p.no}".`);
    if (problems.length) return { valid: false, kind: "CIN", id: s, problems };
    const notes = [];
    if (!STATES[p.st]) notes.push({ part: "State code", msg: `"${p.st}" has the right shape but is not in our table of state codes, so we cannot name the state. Check the record on MCA.` });
    if (!TYPES[p.ty]) notes.push({ part: "Company type", msg: `"${p.ty}" has the right shape but is not a type code we recognise. Check the record on MCA.` });
    if (+p.yr < FIRST_YEAR) notes.push({ part: "Year", msg: `${p.yr} is unusually early. Check the record on MCA.` });
    return {
      valid: true, kind: "CIN", id: s, entity: "Company",
      listing: p.list === "L" ? "Listed" : "Unlisted", nic: p.nic,
      state: STATES[p.st] || "Not recognised (" + p.st + ")", stateCode: p.st, year: +p.yr,
      type: TYPES[p.ty] || "Not recognised (" + p.ty + ")", typeCode: p.ty, regNo: p.no, problems: [], notes
    };
  }

  function checkLLPIN(raw) {
    const s = raw.replace(/-/g, "");
    const problems = [];
    if (!/^[A-Z0-9]*$/.test(s)) problems.push({ part: "Characters", msg: "Only letters, digits and one dash are allowed." });
    if (s.length !== 7) problems.push({ part: "Length", msg: `An LLPIN has 3 letters and 4 digits (7 characters, like AAA-1234). This has ${s.length}.` });
    else {
      if (!/^[A-Z]{3}/.test(s)) problems.push({ part: "Prefix", msg: `The first three characters must be letters. Found "${s.slice(0, 3)}".` });
      if (!/^\d{4}$/.test(s.slice(3))) problems.push({ part: "Number", msg: `The last four characters must be digits. Found "${s.slice(3)}".` });
    }
    if (problems.length) return { valid: false, kind: "LLPIN", id: raw, problems };
    return { valid: true, kind: "LLPIN", id: s.slice(0, 3) + "-" + s.slice(3), entity: "LLP", problems: [], notes: [] };
  }

  function check(raw, year) {
    year = year || new Date().getFullYear();
    const s = normalise(raw);
    if (!s) return null;
    if (/^F\d{5}$/.test(s)) return { valid: false, kind: "FCRN", id: s, problems: [{ part: "Foreign company", msg: "This looks like an FCRN, the number MCA gives to foreign companies with a place of business in India. It is not a CIN or LLPIN and carries no state, year or type." }] };
    // Decide which format the user meant.
    if (/^[A-Z]{3}-?\d{4}$/.test(s)) return checkLLPIN(s);
    if (s.includes("-") && s.replace(/-/g, "").length <= 8) return checkLLPIN(s);
    if (/^[A-Z]{3}[-]/.test(s) || (/^[A-Z]{3}\d/.test(s) && s.length < 10)) return checkLLPIN(s);
    return checkCIN(s, year);
  }

  function checkList(text, year) {
    const out = [], seen = new Map();
    String(text).split(/\r?\n/).forEach((line, i) => {
      const r = check(line, year);
      if (!r) return;
      r.line = i + 1; r.input = line.trim();
      const key = r.valid ? r.id : normalise(line);
      if (seen.has(key)) r.duplicateOf = seen.get(key); else seen.set(key, r.line);
      out.push(r);
    });
    return out;
  }

  const api = { check, checkList, normalise, STATES, TYPES };
  if (typeof module !== "undefined") module.exports = api; else root.CIN = api;
})(typeof window !== "undefined" ? window : globalThis);
