/**
 * NXUS Token Export — reads the variable collections and emits the three
 * sections scripts/figma-tokens.json is built from.
 *
 * This logic was proven BEFORE it was packaged: the identical code was run
 * against QAZA_FE through the Figma MCP and its output diffed against the
 * committed snapshot. Qaza, Mapped and Responsive came back identical, every
 * value, once key order was normalised. So this is not a first draft — it is a
 * transcription of something already verified.
 *
 * It deliberately emits ONLY those three sections. The rest of
 * figma-tokens.json is human curation a plugin cannot reproduce — the _cssPair
 * map the drift check depends on, the _role notes, the Allias family map, the
 * _verified provenance. scripts/figma-merge.mjs splices these three in and
 * leaves the curation alone.
 */

const hexOf = (c) => {
  const h = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
  const base = '#' + h(c.r) + h(c.g) + h(c.b);
  // Alpha is only appended when it is actually doing something — Border/input
  // is stored as navy at zero alpha, and dropping the alpha would silently
  // turn an invisible border into a solid navy one.
  return c.a !== undefined && c.a < 1 ? base + h(c.a) : base;
};

async function extract() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const allIds = collections.reduce((acc, c) => acc.concat(c.variableIds), []);
  const fetched = await Promise.all(allIds.map((id) => figma.variables.getVariableByIdAsync(id)));
  const byId = new Map(allIds.map((id, i) => [id, fetched[i]]));

  // Follows VARIABLE_ALIAS across collections. Mapped -> Allias -> Qaza is
  // three hops, so this must recurse rather than resolve one level.
  const resolve = (v, modeId, depth) => {
    depth = depth || 0;
    if (!v || depth > 10) return null;
    let val = v.valuesByMode[modeId];
    if (val === undefined) val = Object.values(v.valuesByMode)[0];
    if (val && val.type === 'VARIABLE_ALIAS') return resolve(byId.get(val.id), modeId, depth + 1);
    if (val && typeof val === 'object' && 'r' in val) return hexOf(val);
    return val;
  };

  const out = { Qaza: {}, Mapped: {}, Responsive: {} };
  const warnings = [];

  // --- Qaza: raw values, one mode -----------------------------------------
  const qaza = collections.find((c) => c.name.trim() === 'Qaza');
  if (!qaza) { warnings.push('No collection named "Qaza"'); } else {
    const mode = qaza.modes[0].modeId;
    for (const id of qaza.variableIds) {
      const v = byId.get(id);
      if (!v) continue;
      const raw = v.valuesByMode[mode];
      const val = raw && typeof raw === 'object' && 'r' in raw ? hexOf(raw) : raw;
      const parts = v.name.split('/');

      if (parts[0] === 'Fonts') {
        // Fonts/<Family>/Weight/<Name> collapses to an ARRAY, in file order —
        // the order is the weight ramp, so it is data and must not be sorted.
        // Fonts/<Family>/Family/<Role> stays a scalar.
        const rest = parts.slice(1);
        const F = out.Qaza.Fonts || (out.Qaza.Fonts = {});
        if (rest[1] === 'Weight') {
          const key = rest[0] + '/Weight';
          (F[key] || (F[key] = [])).push(val);
        } else {
          F[rest.join('/')] = val;
        }
        continue;
      }

      const step = parts[parts.length - 1];
      const group = parts.slice(0, -1).join('/');
      if (!group) { warnings.push('Skipped ungrouped Qaza variable: ' + v.name); continue; }
      (out.Qaza[group] || (out.Qaza[group] = {}))[step] = val;
    }
  }

  // --- Mapped: [light, dark] ----------------------------------------------
  const mapped = collections.find((c) => c.name === 'Mapped');
  if (!mapped) { warnings.push('No collection named "Mapped"'); } else {
    const light = (mapped.modes.find((m) => m.name === 'Light') || {}).modeId;
    const dark = (mapped.modes.find((m) => m.name === 'Dark') || {}).modeId;
    if (!light || !dark) warnings.push('Mapped is missing a Light or Dark mode');
    for (const id of mapped.variableIds) {
      const v = byId.get(id);
      if (!v || v.name.indexOf('Color/') !== 0) continue;
      out.Mapped[v.name] = [resolve(v, light), resolve(v, dark)];
    }
  }

  // --- Responsive: [mobile, tablet, desktop] -------------------------------
  const resp = collections.find((c) => c.name === 'Responsive');
  if (!resp) { warnings.push('No collection named "Responsive"'); } else {
    const order = ['Mobile', 'Tablet', 'Desktop'].map((n) => (resp.modes.find((m) => m.name === n) || {}).modeId);
    if (order.some((m) => !m)) warnings.push('Responsive is missing a Mobile/Tablet/Desktop mode');
    for (const id of resp.variableIds) {
      const v = byId.get(id);
      if (!v) continue;
      out.Responsive[v.name] = order.map((m) => resolve(v, m));
    }
  }

  return {
    data: out,
    warnings,
    counts: {
      qaza: Object.keys(out.Qaza).length,
      mapped: Object.keys(out.Mapped).length,
      responsive: Object.keys(out.Responsive).length,
    },
  };
}

figma.showUI(__html__, { width: 460, height: 520, themeColors: true });

extract().then((result) => {
  figma.ui.postMessage({ type: 'export', ...result });
}).catch((e) => {
  figma.ui.postMessage({ type: 'error', message: String((e && e.message) || e) });
});

figma.ui.onmessage = (msg) => {
  if (msg.type === 'close') figma.closePlugin();
};
