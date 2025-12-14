import Xe, { useState as $e, useCallback as He, useMemo as ln, useEffect as nt, useRef as rt, forwardRef as cn } from "react";
import { jsx as e, jsxs as i, Fragment as je } from "react/jsx-runtime";
const jt = () => ({
  // Player state
  players: Array.from({ length: 9 }, (t, n) => ({
    id: n + 1,
    name: "",
    position: "",
    stack: 0
  })),
  playerData: {},
  // Game configuration
  defaultUnit: "K",
  stackData: {
    smallBlind: 0,
    bigBlind: 0,
    ante: 0,
    unit: "K"
  },
  autoSelectCards: !0,
  // View state
  currentView: "stack",
  showFoldedPlayers: !1,
  // Community cards
  communityCards: {
    flop: { card1: null, card2: null, card3: null },
    turn: { card1: null },
    river: { card1: null }
  },
  // Action levels
  visibleActionLevels: {
    preflop: ["base"],
    flop: ["base"],
    turn: ["base"],
    river: ["base"]
  },
  // Processing state
  isProcessing: !1,
  processedSections: {},
  sectionStacks: {},
  contributedAmounts: {},
  currentProcessingSection: null,
  latestSection: null,
  // Betting round state
  bettingRoundComplete: {},
  completedSections: {},
  // Pot state
  potsByStage: {},
  // UI state
  foldingPlayers: /* @__PURE__ */ new Set(),
  stackAnimating: /* @__PURE__ */ new Set(),
  // Confirmation dialog
  showConfirmDialog: !1,
  pendingAction: null,
  confirmMessage: "",
  // Focus management
  elementToRefocus: null,
  // Next hand generation
  generatedNextHand: null
});
function dn() {
  const [t, n] = $e(jt().players), [a, b] = $e({}), [u, h] = $e("K"), [c, d] = $e({
    handNumber: "#123456",
    startedAt: "14:30:45",
    tournamentName: "Sunday Million",
    tournamentDate: "2024/03/15",
    youtubeUrl: "",
    bigBlind: 1e3,
    smallBlind: 500,
    ante: 1e3,
    anteOrder: "BB First",
    rawInput: `Hand (1)
started_at: 00:05:40 ended_at: HH:MM:SS
SB 500 BB 1000 Ante 1000
Stack Setup:
John Dealer 10000
Jane SB 8500
Bob BB 12000
Alice 9500
Charlie 11000
David 7500
Emma 15000
Frank 9000
Grace 13000`,
    unit: "K"
  }), [s, o] = $e(!0), [f, l] = $e("stack"), [x, g] = $e(!1), [p, r] = $e({
    flop: { card1: null, card2: null, card3: null },
    turn: { card1: null },
    river: { card1: null }
  }), [y, m] = $e({
    preflop: ["base"],
    flop: ["base"],
    turn: ["base"],
    river: ["base"]
  }), [v, N] = $e(!1), [A, $] = $e({}), [S, _] = $e({}), [w, P] = $e({}), [D, C] = $e(null), [j, F] = $e(null), [Y, ne] = $e({}), [oe, me] = $e({}), [Pe, Ae] = $e({}), [K, re] = $e(/* @__PURE__ */ new Set()), [q, Ne] = $e(/* @__PURE__ */ new Set()), [Oe, De] = $e(!1), [Me, be] = $e(null), [Te, pe] = $e(""), [V, ae] = $e(null), [se, _e] = $e(null), Ee = He((Fe, Je, H, we = "") => {
    b((le) => ({
      ...le,
      [Fe]: {
        ...le[Fe],
        [`${Je}${we}`]: H
      }
    }));
  }, []), Ie = He((Fe, Je, H) => {
    r((we) => Fe === "flop" ? {
      ...we,
      flop: {
        ...we.flop,
        [`card${Je}`]: H
      }
    } : Fe === "turn" ? {
      ...we,
      turn: {
        ...we.turn,
        card1: H
      }
    } : Fe === "river" ? {
      ...we,
      river: {
        ...we.river,
        card1: H
      }
    } : we);
  }, []), We = He((Fe, Je) => {
    m((H) => ({
      ...H,
      [Fe]: [...H[Fe] || [], Je]
    }));
  }, []), Ve = He((Fe, Je) => {
    m((H) => ({
      ...H,
      [Fe]: (H[Fe] || []).filter((we) => we !== Je)
    }));
  }, []), Ge = He(() => {
    const Fe = jt();
    n(Fe.players), b(Fe.playerData), h(Fe.defaultUnit), d(Fe.stackData), o(Fe.autoSelectCards), l(Fe.currentView), g(Fe.showFoldedPlayers), r(Fe.communityCards), m(Fe.visibleActionLevels), N(Fe.isProcessing), $(Fe.processedSections), _(Fe.sectionStacks), P(Fe.contributedAmounts), C(Fe.currentProcessingSection), F(Fe.latestSection), ne(Fe.bettingRoundComplete), me(Fe.completedSections), Ae(Fe.potsByStage), re(Fe.foldingPlayers), Ne(Fe.stackAnimating), De(Fe.showConfirmDialog), be(Fe.pendingAction), pe(Fe.confirmMessage), ae(Fe.elementToRefocus), _e(Fe.generatedNextHand);
  }, []);
  return [{
    players: t,
    playerData: a,
    defaultUnit: u,
    stackData: c,
    autoSelectCards: s,
    currentView: f,
    showFoldedPlayers: x,
    communityCards: p,
    visibleActionLevels: y,
    isProcessing: v,
    processedSections: A,
    sectionStacks: S,
    contributedAmounts: w,
    currentProcessingSection: D,
    latestSection: j,
    bettingRoundComplete: Y,
    completedSections: oe,
    potsByStage: Pe,
    foldingPlayers: K,
    stackAnimating: q,
    showConfirmDialog: Oe,
    pendingAction: Me,
    confirmMessage: Te,
    elementToRefocus: V,
    generatedNextHand: se
  }, {
    setPlayers: n,
    updatePlayerData: Ee,
    setPlayerData: b,
    setDefaultUnit: h,
    setStackData: d,
    setAutoSelectCards: o,
    setCurrentView: l,
    setShowFoldedPlayers: g,
    setCommunityCards: r,
    updateCommunityCard: Ie,
    setVisibleActionLevels: m,
    addActionLevel: We,
    removeActionLevel: Ve,
    setIsProcessing: N,
    setProcessedSections: $,
    setSectionStacks: _,
    setContributedAmounts: P,
    setCurrentProcessingSection: C,
    setLatestSection: F,
    setBettingRoundComplete: ne,
    setCompletedSections: me,
    setPotsByStage: Ae,
    setFoldingPlayers: re,
    setStackAnimating: Ne,
    setShowConfirmDialog: De,
    setPendingAction: be,
    setConfirmMessage: pe,
    setElementToRefocus: ae,
    setGeneratedNextHand: _e,
    resetGameState: Ge
  }];
}
function Dt(t, n = "actual") {
  return n === "K" ? `${(t / 1e3).toFixed(1)}K` : n === "Mil" ? `${(t / 1e6).toFixed(2)}M` : t.toLocaleString();
}
function Po(t, n = "K") {
  return t >= 1e6 && n !== "actual" ? Dt(t, "Mil") : t >= 1e3 && n !== "actual" ? Dt(t, "K") : Dt(t, "actual");
}
function Zt(t, n) {
  return n === "K" ? t * 1e3 : n === "Mil" ? t * 1e6 : t;
}
function Bo(t, n) {
  return n === "K" ? t / 1e3 : n === "Mil" ? t / 1e6 : t;
}
function _o(t) {
  return t >= 1e6 ? "Mil" : t >= 1e3 ? "K" : "actual";
}
function ut(t) {
  const n = t.trim().toUpperCase();
  return {
    BTN: "Dealer",
    BUTTON: "Dealer",
    D: "Dealer",
    DEALER: "Dealer",
    SB: "SB",
    "SMALL BLIND": "SB",
    BB: "BB",
    "BIG BLIND": "BB",
    UTG: "UTG",
    "UTG+1": "UTG+1",
    "UTG+2": "UTG+2",
    MP: "MP",
    "MP+1": "MP+1",
    "MP+2": "MP+2",
    CO: "CO",
    CUTOFF: "CO",
    HJ: "HJ",
    HIJACK: "HJ"
  }[n] || t;
}
function ht(t) {
  const n = [
    "Dealer",
    "SB",
    "BB",
    "UTG",
    "UTG+1",
    "UTG+2",
    "MP",
    "CO",
    "HJ"
  ];
  return t <= 6 ? ["Dealer", "SB", "BB", "UTG", "MP", "CO"] : t <= 7 ? ["Dealer", "SB", "BB", "UTG", "UTG+1", "MP", "CO"] : t <= 8 ? ["Dealer", "SB", "BB", "UTG", "UTG+1", "MP", "CO", "HJ"] : n;
}
function Eo(t) {
  const n = t.filter((s) => s.name && s.stack > 0), a = n.length;
  if (a === 0)
    return t;
  const b = n.findIndex(
    (s) => s.position.toLowerCase() === "dealer" || s.position.toLowerCase() === "btn" || s.position.toLowerCase() === "d"
  ), u = n.findIndex(
    (s) => s.position.toLowerCase() === "sb" || s.position.toLowerCase() === "small blind"
  ), h = n.findIndex(
    (s) => s.position.toLowerCase() === "bb" || s.position.toLowerCase() === "big blind"
  );
  if (b !== -1) {
    const s = ht(a), o = [...t];
    return n.forEach((f, l) => {
      const x = t.findIndex((p) => p.id === f.id), g = (l - b + a) % a;
      o[x] = {
        ...f,
        position: s[g] || f.position
      };
    }), o;
  }
  if (u !== -1 || h !== -1) {
    const s = u !== -1 ? u : h, o = u !== -1 ? 1 : 2, f = ht(a), l = [...t];
    return n.forEach((x, g) => {
      const p = t.findIndex((y) => y.id === x.id), r = (g - s + o + a) % a;
      l[p] = {
        ...x,
        position: f[r] || x.position
      };
    }), l;
  }
  const c = ht(a), d = [...t];
  return n.forEach((s, o) => {
    const f = t.findIndex((l) => l.id === s.id);
    d[f] = {
      ...s,
      position: c[o] || ""
    };
  }), d;
}
function To(t, n) {
  return ht(n).indexOf(t);
}
function Do(t) {
  const a = t.filter((u) => u.name && u.stack > 0).length, b = ht(a);
  return [...t].sort((u, h) => {
    const c = b.indexOf(u.position), d = b.indexOf(h.position);
    return c !== -1 && d !== -1 ? c - d : 0;
  });
}
function un(t, n, a, b, u) {
  const h = ["preflop", "flop", "turn", "river"], c = ["base", "more", "more2"], d = h.indexOf(n), s = c.indexOf(a);
  if (s > 0) {
    const o = c[s - 1], f = o === "base" ? "" : o === "more" ? "_moreAction" : "_moreAction2", x = (b[t] || {})[`${n}${f}_action`];
    return (typeof x == "string" ? x : null) || null;
  }
  if (d > 0) {
    const o = h[d - 1], f = u[o] || ["base"], l = f[f.length - 1], x = l === "base" ? "" : l === "more" ? "_moreAction" : "_moreAction2", p = (b[t] || {})[`${o}${x}_action`];
    return (typeof p == "string" ? p : null) || null;
  }
  return null;
}
function pn(t, n, a, b, u) {
  const h = t.filter((s) => un(s.id, a, b, n, u) !== "fold"), c = a === "preflop" ? ["utg", "utg+1", "utg+2", "mp", "mp+1", "mp+2", "co", "dealer", "sb", "bb"] : ["sb", "bb", "utg", "utg+1", "utg+2", "mp", "mp+1", "mp+2", "co", "dealer"];
  let d = h.sort((s, o) => {
    const f = ut(s.position).toLowerCase(), l = ut(o.position).toLowerCase(), x = c.indexOf(f), g = c.indexOf(l);
    return (x === -1 ? 999 : x) - (g === -1 ? 999 : g);
  });
  if (b === "more" || b === "more2") {
    const s = b === "more" ? "base" : "more", o = s === "base" ? "" : s === "more" ? "_moreAction" : "_moreAction2";
    let f = -1;
    for (let l = d.length - 1; l >= 0; l--) {
      const x = d[l], p = (n[x.id] || {})[`${a}${o}_action`];
      if (p && p !== "no action" && p !== "fold") {
        f = l;
        break;
      }
    }
    if (f !== -1) {
      const l = (f + 1) % d.length;
      d = [
        ...d.slice(l),
        ...d.slice(0, l)
      ];
    }
  }
  return d;
}
function fn(t, n, a, b, u) {
  const h = {};
  if (a === "preflop" && b === "base")
    t.forEach((c) => {
      if (!c.name || c.stack === 0) {
        h[c.id] = 0;
        return;
      }
      const d = n[c.id] || {}, s = ut(c.position).toLowerCase();
      let o = c.stack;
      s === "sb" && typeof d.postedSB == "number" && (o -= d.postedSB), s === "bb" && (typeof d.postedBB == "number" && (o -= d.postedBB), typeof d.postedAnte == "number" && (o -= d.postedAnte)), h[c.id] = o;
    });
  else if (b === "more" || b === "more2") {
    const d = `${a}_${b === "more" ? "base" : "more"}`, s = u[d];
    s && s.updated ? t.forEach((o) => {
      const f = s.updated[o.id];
      h[o.id] = f !== void 0 ? f : o.stack;
    }) : t.forEach((o) => {
      h[o.id] = o.stack;
    });
  } else {
    const c = ["preflop", "flop", "turn", "river"], d = c.indexOf(a);
    if (d > 0) {
      const s = c[d - 1];
      let o = null;
      if (u[`${s}_more2`] ? o = `${s}_more2` : u[`${s}_more`] ? o = `${s}_more` : u[`${s}_base`] && (o = `${s}_base`), o && u[o]) {
        const f = u[o];
        t.forEach((l) => {
          const x = f.updated ? f.updated[l.id] : l.stack;
          h[l.id] = x !== void 0 ? x : l.stack;
        });
      } else
        t.forEach((f) => {
          h[f.id] = f.stack;
        });
    } else
      t.forEach((s) => {
        h[s.id] = s.stack;
      });
  }
  return h;
}
function mn(t, n, a, b, u) {
  const h = {};
  if (b === "base")
    a === "preflop" ? t.forEach((c) => {
      const d = n[c.id] || {}, s = ut(c.position).toLowerCase();
      let o = 0;
      s === "sb" && typeof d.postedSB == "number" ? o = d.postedSB : s === "bb" && typeof d.postedBB == "number" && (o = d.postedBB), h[c.id] = o;
    }) : t.forEach((c) => {
      h[c.id] = 0;
    });
  else if (t.forEach((c) => {
    h[c.id] = 0;
  }), a === "preflop" && t.forEach((c) => {
    const d = n[c.id] || {}, s = ut(c.position).toLowerCase();
    s === "sb" && typeof d.postedSB == "number" ? h[c.id] += d.postedSB : s === "bb" && typeof d.postedBB == "number" && (h[c.id] += d.postedBB);
  }), b === "more") {
    const c = `${a}_base`;
    u[c] && t.forEach((d) => {
      const s = u[c][d.id] || 0;
      s > 0 && (h[d.id] += s);
    });
  } else if (b === "more2") {
    const c = `${a}_base`, d = `${a}_more`;
    u[c] && t.forEach((s) => {
      const o = u[c][s.id] || 0;
      o > 0 && (h[s.id] += o);
    }), u[d] && t.forEach((s) => {
      const o = u[d][s.id] || 0;
      o > 0 && (h[s.id] += o);
    });
  }
  return h;
}
function en(t, n, a, b, u, h, c, d = "K") {
  const s = n === "base" ? "" : n === "more" ? "_moreAction" : "_moreAction2", o = pn(a, u, t, n, c), f = fn(
    a,
    u,
    t,
    n,
    b
  ), l = mn(
    a,
    u,
    t,
    n,
    h
  ), x = { ...u }, g = {}, p = {};
  a.forEach((m) => {
    p[m.id] = 0;
  });
  let r = 0;
  const y = [];
  if (t === "preflop" && n === "base") {
    const m = a.find((v) => ut(v.position).toLowerCase() === "bb");
    if (m) {
      const v = u[m.id];
      v && typeof v.postedBB == "number" && (r = v.postedBB);
    }
  } else if (n === "more" || n === "more2") {
    const m = Object.values(l).filter((v) => v > 0);
    m.length > 0 && (r = Math.max(...m));
  }
  return o.forEach((m) => {
    const v = u[m.id] || {}, N = `${t}${s}_action`, A = v[N], $ = f[m.id] || 0;
    let S = 0;
    if (A === "call") {
      const w = l[m.id] || 0, P = r, D = Math.max(0, P - w);
      let C;
      $ >= D ? (C = P, S = D) : (C = w + $, S = $, x[m.id] || (x[m.id] = {}), x[m.id][N] = "all-in", y.push({
        playerId: m.id,
        name: m.name,
        position: m.position,
        required: P,
        available: w + $
      })), p[m.id] = S;
      const j = `${t}${s}_amount`, F = `${t}${s}_unit`, Y = u[m.id]?.[F] || d;
      let ne;
      Y === "K" ? ne = C / 1e3 : Y === "Mil" ? ne = C / 1e6 : ne = C, x[m.id] || (x[m.id] = {}), x[m.id][j] = ne;
    } else if (A === "bet" || A === "raise") {
      const w = `${t}${s}_amount`, P = v[w], D = v[`${t}${s}_unit`];
      let C = d;
      if ((D === "K" || D === "Mil" || D === "actual") && (C = D), !P || P === "" || parseFloat(String(P)) <= 0)
        return null;
      const j = Zt(parseFloat(String(P)), C), F = l[m.id] || 0;
      S = Math.max(0, j - F), S = Math.min(S, $), r = Math.max(r, j), p[m.id] = S;
    } else if (A === "all-in") {
      S = $;
      const P = (l[m.id] || 0) + S;
      r = Math.max(r, P), p[m.id] = S;
      const D = `${t}${s}_amount`, C = `${t}${s}_unit`, j = u[m.id]?.[C] || d;
      let F;
      j === "K" ? F = P / 1e3 : j === "Mil" ? F = P / 1e6 : F = P, x[m.id] || (x[m.id] = {}), x[m.id][D] = F, y.push({
        playerId: m.id,
        name: m.name,
        position: m.position
      });
    } else (A === "fold" || A === "check" || A === "no action" || !A) && (S = 0);
    const _ = $ - S;
    g[m.id] = _;
  }), {
    updatedPlayerData: x,
    updatedStacks: g,
    currentStacks: f,
    contributedAmounts: p,
    allInPlayers: y
  };
}
function gn(t, n, a, b, u, h = "K") {
  const c = ["preflop", "flop", "turn", "river"], d = ["base", "more", "more2"], s = c.indexOf(t), o = d.indexOf(n), f = [];
  for (let y = 0; y <= s; y++) {
    const m = c[y], v = y === s ? o : 2;
    for (let N = 0; N <= v; N++) {
      const A = d[N], $ = A === "base" ? "" : A === "more" ? "_moreAction" : "_moreAction2";
      (a.some((_) => {
        const w = b[_.id] || {}, P = `${m}${$}_action`;
        return w[P] !== void 0 && w[P] !== "";
      }) || m === "preflop" && A === "base") && f.push({ stage: m, level: A });
    }
  }
  const l = {};
  let x = { ...b };
  const g = {}, p = {}, r = [];
  return f.forEach((y) => {
    const m = en(
      y.stage,
      y.level,
      a,
      l,
      x,
      g,
      u,
      h
    );
    m && (l[`${y.stage}_${y.level}`] = {
      initial: m.currentStacks,
      current: m.currentStacks,
      updated: m.updatedStacks
    }, x = m.updatedPlayerData, g[`${y.stage}_${y.level}`] = m.contributedAmounts, p[`${y.stage}_${y.level}`] = !0, m.allInPlayers && m.allInPlayers.length > 0 && m.allInPlayers.forEach((v) => {
      r.push({
        ...v,
        section: `${y.stage}_${y.level}`
      });
    }));
  }), {
    sectionStacks: l,
    playerData: x,
    contributedAmounts: g,
    processedSections: p,
    allAllInPlayers: r,
    sectionsProcessed: f
  };
}
function hn(t, n) {
  const a = He((d, s) => `${d}_${s === "base" ? "base" : s === "more" ? "more" : "more2"}`, []), b = He((d, s) => {
    const o = a(d, s);
    return !!t.processedSections[o];
  }, [t.processedSections, a]), u = He((d, s) => {
    const o = a(d, s);
    n.setProcessedSections((f) => ({
      ...f,
      [o]: !0
    }));
  }, [n, a]), h = He((d, s) => {
    const o = a(d, s);
    n.setCurrentProcessingSection(o);
    const f = en(
      d,
      s,
      t.players,
      t.sectionStacks,
      t.playerData,
      t.contributedAmounts,
      t.visibleActionLevels,
      t.defaultUnit
    );
    return f ? (n.setSectionStacks((l) => ({
      ...l,
      [o]: {
        initial: f.currentStacks,
        current: f.currentStacks,
        updated: f.updatedStacks
      }
    })), n.setContributedAmounts((l) => ({
      ...l,
      [o]: f.contributedAmounts
    })), u(d, s), n.setLatestSection(o), n.setCurrentProcessingSection(null), f) : (n.setCurrentProcessingSection(null), null);
  }, [
    t.players,
    t.sectionStacks,
    t.playerData,
    t.contributedAmounts,
    t.visibleActionLevels,
    t.defaultUnit,
    n,
    a,
    u
  ]);
  return {
    processCascade: He((d, s) => {
      n.setIsProcessing(!0);
      const o = gn(
        d,
        s,
        t.players,
        t.playerData,
        t.visibleActionLevels,
        t.defaultUnit
      );
      if (n.setSectionStacks((f) => ({ ...f, ...o.sectionStacks })), n.setContributedAmounts((f) => ({ ...f, ...o.contributedAmounts })), n.setProcessedSections((f) => ({ ...f, ...o.processedSections })), n.setPlayerData(o.playerData), o.sectionsProcessed.length > 0) {
        const f = o.sectionsProcessed[o.sectionsProcessed.length - 1], l = a(f.stage, f.level);
        n.setLatestSection(l);
      }
      return n.setIsProcessing(!1), o;
    }, [
      t.players,
      t.playerData,
      t.visibleActionLevels,
      t.defaultUnit,
      n,
      a
    ]),
    processSection: h,
    isSectionProcessed: b,
    markSectionProcessed: u,
    getSectionKey: a
  };
}
function ft(t) {
  return {
    id: t.playerId,
    name: t.playerName,
    position: t.position,
    contribution: t.totalContributed,
    totalContribution: t.totalContributed,
    isAllIn: t.isAllIn
  };
}
function tn(t) {
  if (!t) return "";
  const n = t.toLowerCase();
  return n === "d" || n === "btn" || n === "button" ? "dealer" : n === "u" || n === "utg" ? "utg" : n;
}
function bn(t, n, a) {
  const b = a[t];
  if (!b) return !1;
  const u = b[`${n}Action`], h = b[`${n}_moreActionAction`], c = b[`${n}_moreAction2Action`];
  return u === "fold" || h === "fold" || c === "fold" || n === "preflop" && (!u || u === "no action");
}
function nn(t, n, a, b, u, h, c, d, s = !1) {
  console.log(`
💰 ${"=".repeat(50)}`), console.log(`💰 GATHERING CONTRIBUTIONS FOR ${t.toUpperCase()} (up to ${n})`), console.log(`💰 ${"=".repeat(50)}`);
  const o = `${t}_base`, f = `${t}_more`, l = `${t}_more2`;
  let x = !1, g = !1, p = !1;
  s ? n === "base" ? x = !0 : n === "more" ? g = !0 : n === "more2" && (p = !0) : n === "base" ? x = !0 : n === "more" ? (x = !0, g = !0) : n === "more2" && (x = !0, g = !0, p = !0), console.log(`   📊 Including sections: base=${x}, more=${g}, more2=${p}`), console.log(`
   🔍 SECTION PROCESSING STATUS:`), console.log(`      ${o}: ${h[o] ? "✅ PROCESSED" : "❌ NOT PROCESSED"}`), console.log(`      ${f}: ${h[f] ? "✅ PROCESSED" : "❌ NOT PROCESSED"}`), console.log(`      ${l}: ${h[l] ? "✅ PROCESSED" : "❌ NOT PROCESSED"}`);
  const r = [];
  for (const v of a) {
    if (!v.name) continue;
    const N = b[v.id] || {};
    let A = 0;
    const $ = { base: 0, more: 0, more2: 0 };
    let S = 0, _ = 0, w = 0;
    if (t === "preflop" && x) {
      const F = tn(v.position);
      F === "sb" ? (S = N.postedSB || 0, console.log(`   💵 ${v.name} (SB): Posted SB ${S}`)) : F === "bb" && (_ = N.postedBB || 0, w = N.postedAnte || 0, console.log(`   💵 ${v.name} (BB): Posted BB ${_}, Ante ${w}`));
    }
    if (x && u[o]) {
      const F = u[o][v.id] || 0;
      $.base = F, A += F;
    }
    if (g && u[f]) {
      const F = u[f][v.id] || 0;
      $.more = F, A += F;
    }
    if (p && u[l]) {
      const F = u[l][v.id] || 0;
      $.more2 = F, A += F;
    }
    const P = bn(v.id, t, b);
    if (t === "preflop" && x)
      if (P) {
        if (S > 0 && (A += S, console.log(`   💀 ${v.name} (SB) folded: ${S} goes to pot as dead money`)), _ > 0 || w > 0) {
          const F = _ + w;
          A += F, console.log(`   💀 ${v.name} (BB) folded: ${_} (BB) + ${w} (Ante) = ${F} goes to pot as dead money`);
        }
      } else
        S > 0 && (A += S, console.log(`   💰 ${v.name} (SB) stayed: ${S} SB included in actions`)), _ > 0 && (A += _, console.log(`   💰 ${v.name} (BB) stayed: ${_} BB included in actions`)), w > 0 && console.log(`   💰 ${v.name} (BB) stayed: ${w} ante is dead money (separate from contribution)`);
    let D = v.stack;
    const C = [l, f, o];
    for (const F of C)
      if (c[F]?.updated?.[v.id] !== void 0) {
        D = c[F].updated[v.id];
        break;
      }
    const j = D <= 0;
    r.push({
      playerId: v.id,
      playerName: v.name,
      position: v.position || "",
      totalContributed: A,
      contributions: $,
      postedSB: S,
      postedBB: _,
      postedAnte: w,
      isFolded: P,
      isAllIn: j,
      currentStack: D
    }), (A > 0 || P) && console.log(`   💵 ${v.name}: ${A} contributed (${P ? "FOLDED" : "ACTIVE"})`);
  }
  const y = r.filter((v) => !v.isFolded).length, m = r.filter((v) => v.isFolded).length;
  return console.log(`
   📊 Total players: ${r.length}`), console.log(`   ✅ Active (not folded): ${y}`), console.log(`   ❌ Folded: ${m}`), r;
}
function xn(t, n) {
  console.log(`
💀 ${"=".repeat(50)}`), console.log(`💀 CALCULATING DEAD MONEY FOR ${t.toUpperCase()}`), console.log(`💀 ${"=".repeat(50)}`);
  let a = 0, b = 0, u = 0;
  for (const c of n) {
    if (t === "preflop" && (a += c.postedAnte), t === "preflop" && c.isFolded) {
      const d = tn(c.position);
      d === "sb" && c.postedSB > 0 ? (b += c.postedSB, console.log(`   💀 SB folded: ${c.postedSB} (${c.playerName})`)) : d === "bb" && c.postedBB > 0 && (b += c.postedBB, console.log(`   💀 BB folded: ${c.postedBB} (${c.playerName})`));
    }
    if (c.isFolded && c.totalContributed > 0)
      if (t === "preflop") {
        const d = c.totalContributed - c.postedSB - c.postedBB - c.postedAnte;
        d > 0 && (u += d, console.log(`   💀 ${c.playerName} folded bets: ${d}`));
      } else
        u += c.totalContributed, console.log(`   💀 ${c.playerName} folded bets: ${c.totalContributed}`);
  }
  const h = a + b + u;
  return console.log(`
   💀 Ante: ${a}`), console.log(`   💀 Folded blinds: ${b}`), console.log(`   💀 Folded bets: ${u}`), console.log(`   💀 TOTAL DEAD MONEY: ${h}`), {
    total: h,
    ante: a,
    foldedBlinds: b,
    foldedBets: u
  };
}
function vn(t, n, a = 0, b, u) {
  console.log(`
🎯 ${"=".repeat(50)}`), console.log(`🎯 CREATING POTS FOR ${b.toUpperCase()} ${u.toUpperCase()}`), console.log(`🎯 ${"=".repeat(50)}`);
  const h = t.filter((g) => !g.isFolded);
  if (h.length === 0)
    return console.log("   ⚠️  No active players - creating zero pot"), {
      mainPot: {
        potNumber: 0,
        amount: n.total + a,
        cappedAt: 0,
        eligiblePlayers: [],
        excludedPlayers: [],
        percentage: 100
      },
      sidePots: [],
      totalPot: n.total + a,
      deadMoney: n.total,
      deadMoneyBreakdown: n,
      hasZeroContributor: !1,
      zeroContributors: []
    };
  const c = h.reduce((g, p) => g + p.totalContributed, 0), d = h.filter((g) => g.isAllIn);
  if (console.log(`   💰 Total contributions: ${c}`), console.log(`   💀 Dead money: ${n.total}`), console.log(`   🎰 Previous street pot: ${a}`), console.log(`   🔴 All-in players: ${d.length}`), d.length > 0 && (console.log(`
   🔴 ALL-IN PLAYERS DETAILS:`), d.forEach((g) => {
    console.log(`      ${g.playerName}: ${g.totalContributed} (all-in)`);
  })), d.length === 0) {
    console.log(`
   ✅ No all-ins - Creating single main pot`);
    const g = Math.max(...h.map((y) => y.totalContributed)), p = c + n.total + a, r = {
      potNumber: 0,
      amount: p,
      cappedAt: g,
      eligiblePlayers: h.map(ft),
      excludedPlayers: [],
      percentage: 100
    };
    return console.log(`
   🎯 MAIN POT: ${p}`), console.log(`      Capped at: ${g} per player`), console.log(`      Eligible: ${r.eligiblePlayers.map((y) => y.name).join(", ")}`), {
      mainPot: r,
      sidePots: [],
      totalPot: c + n.total + a,
      deadMoney: n.total,
      deadMoneyBreakdown: n,
      hasZeroContributor: h.some((y) => y.totalContributed === 0),
      zeroContributors: h.filter((y) => y.totalContributed === 0).map(ft)
    };
  }
  console.log(`
   🔴 Has all-ins - Creating multiple pots`);
  const s = [...h].sort((g, p) => g.totalContributed - p.totalContributed), o = [];
  let f = 0;
  const l = [...new Set(s.map((g) => g.totalContributed))].sort((g, p) => g - p);
  console.log(`
   🎯 Unique contribution levels: ${l.join(", ")}`);
  for (let g = 0; g < l.length; g++) {
    const p = l[g], r = p - f, y = s.filter((A) => A.totalContributed >= p), m = r * y.length, v = s.filter((A) => A.totalContributed < p).map((A) => ({ ...ft(A), reason: "Below contribution level" })), N = {
      potNumber: o.length,
      amount: m,
      cappedAt: p,
      eligiblePlayers: y.map(ft),
      excludedPlayers: v,
      percentage: 0
      // Will be calculated later
    };
    o.push(N), f = p, console.log(`
   🎯 ${o.length === 1 ? "MAIN POT" : `SIDE POT ${o.length - 1}`}: ${m}`), console.log(`      Capped at: ${p} per player`), console.log(`      Calculation: (${p} - ${p - r}) × ${y.length} players`), console.log(`      Eligible: ${N.eligiblePlayers.map((A) => A.name).join(", ")}`), v.length > 0 && console.log(`      Excluded: ${v.map((A) => A.name).join(", ")}`);
  }
  o.length > 0 && (o[0].amount += n.total, console.log(`
   💀 Added ${n.total} dead money to main pot`)), a > 0 && o.length > 0 && (o[0].amount += a, console.log(`   🎰 Added ${a} from previous street to main pot`));
  const x = c + n.total + a;
  return o.forEach((g) => {
    g.percentage = x > 0 ? Math.round(g.amount / x * 100) : 0;
  }), console.log(`
   ${"=".repeat(50)}`), console.log(`   💰 TOTAL POT: ${x}`), console.log(`   ${"=".repeat(50)}`), {
    mainPot: o[0],
    sidePots: o.slice(1),
    totalPot: x,
    deadMoney: n.total,
    deadMoneyBreakdown: n,
    hasZeroContributor: h.some((g) => g.totalContributed === 0),
    zeroContributors: h.filter((g) => g.totalContributed === 0).map(ft)
  };
}
function st(t, n, a, b, u, h, c, d, s = 0) {
  console.log(`

🎰 ${"=".repeat(60)}`), console.log(`🎰 CALCULATE POTS FOR BETTING ROUND: ${t.toUpperCase()} ${n.toUpperCase()}`), console.log(`🎰 ${"=".repeat(60)}`);
  const o = nn(
    t,
    n,
    a,
    b,
    u,
    h,
    c,
    d,
    !1
    // Cumulative
  ), f = on(o), l = xn(t, o), x = vn(o, l, s, t, n);
  return console.log(`
🎰 ${"=".repeat(60)}`), console.log("🎰 POT CALCULATION COMPLETE"), console.log(`🎰 ${"=".repeat(60)}

`), {
    ...x,
    bettingRoundStatus: f
  };
}
function on(t) {
  const n = t.filter((c) => !c.isFolded);
  if (n.length === 0)
    return { complete: !0, reason: "All players folded", pendingPlayers: [] };
  if (n.length === 1)
    return { complete: !0, reason: "Only one player remaining", pendingPlayers: [] };
  const a = n.filter((c) => !c.isAllIn);
  if (a.length === 0)
    return { complete: !0, reason: "All remaining players are all-in", pendingPlayers: [] };
  const b = Math.max(...a.map((c) => c.totalContributed));
  return a.every((c) => c.totalContributed === b) ? { complete: !0, reason: "All active players have matched bets", pendingPlayers: [] } : {
    complete: !1,
    reason: "Action pending from some players",
    pendingPlayers: a.filter((c) => c.totalContributed < b).map((c) => c.playerName)
  };
}
function Mo(t, n, a, b, u = "K") {
  try {
    const h = [
      "preflop_base",
      "preflop_more",
      "preflop_more2",
      "flop_base",
      "flop_more",
      "flop_more2",
      "turn_base",
      "turn_more",
      "turn_more2",
      "river_base",
      "river_more",
      "river_more2"
    ], d = `${n}_${{
      base: "base",
      more: "more",
      more2: "more2"
    }[a] || a}`, s = h.indexOf(d);
    if (s <= 0)
      return null;
    for (let o = s - 1; o >= 0; o--) {
      const f = h[o], [l, x] = f.split("_"), g = x === "base" ? "base" : x === "more" ? "more" : "more2", p = g === "base" ? "" : g === "more" ? "_moreAction" : "_moreAction2", r = `${l}${p}_action`, y = `${l}${p}_amount`, m = `${l}${p}_unit`, v = b[t]?.[r];
      if (v && typeof v == "string" && v !== "no action" && v !== "") {
        const N = b[t]?.[y], A = typeof N == "number" ? N : 0, $ = b[t]?.[m];
        let S = u;
        ($ === "K" || $ === "Mil" || $ === "actual") && (S = $);
        const _ = Zt(A, S);
        return {
          stageName: l.toUpperCase(),
          levelName: g === "base" ? "BASE" : g === "more" ? "MORE ACTION 1" : "MORE ACTION 2",
          action: v.charAt(0).toUpperCase() + v.slice(1),
          // Capitalize
          amount: _,
          sectionKey: f
        };
      }
    }
    return null;
  } catch (h) {
    return console.error("Error in getPreviousRoundInfo:", h), null;
  }
}
function yn(t, n) {
  const a = He((o, f) => `${o}_${f === "base" ? "base" : f === "more" ? "more" : "more2"}`, []), b = He((o, f, l = 0) => st(
    o,
    f,
    t.players,
    t.playerData,
    t.contributedAmounts,
    t.processedSections,
    t.sectionStacks,
    t.stackData,
    l
  ), [
    t.players,
    t.playerData,
    t.contributedAmounts,
    t.processedSections,
    t.sectionStacks,
    t.stackData
  ]), u = He((o, f) => {
    const l = a(o, f);
    return t.potsByStage[l] || null;
  }, [t.potsByStage, a]), h = He((o, f) => {
    const l = nn(
      o,
      f,
      t.players,
      t.playerData,
      t.contributedAmounts,
      t.processedSections,
      t.sectionStacks,
      t.stackData,
      !1
    );
    return on(l);
  }, [
    t.players,
    t.playerData,
    t.contributedAmounts,
    t.processedSections,
    t.sectionStacks,
    t.stackData
  ]), c = He((o, f, l) => {
    const x = a(o, f);
    n.setPotsByStage((g) => ({
      ...g,
      [x]: l
    })), n.setBettingRoundComplete((g) => ({
      ...g,
      [x]: {
        isComplete: l.bettingRoundStatus.complete,
        reason: l.bettingRoundStatus.reason,
        pendingPlayers: l.bettingRoundStatus.pendingPlayers || []
      }
    }));
  }, [n, a]), d = He(() => {
    let o = 0;
    return Object.values(t.potsByStage).forEach((f) => {
      f && f.totalPot && (o = Math.max(o, f.totalPot));
    }), o;
  }, [t.potsByStage]), s = He(() => t.latestSection && t.potsByStage[t.latestSection] || null, [t.latestSection, t.potsByStage]);
  return {
    calculatePots: b,
    getPotsForSection: u,
    checkBettingComplete: h,
    updatePotsForSection: c,
    getTotalPot: d,
    getCurrentPots: s
  };
}
function An(t) {
  switch (t) {
    case "base":
      return "";
    case "more":
      return "_moreAction";
    case "more2":
      return "_moreAction2";
  }
}
function wn(t, n, a, b, u) {
  let h = t;
  if (n === "K" ? h = t * 1e3 : n === "Mil" && (h = t * 1e6), a === "preflop" && b === "") {
    const c = u.postedSB || 0, d = u.postedBB || 0;
    h += c + d;
  }
  return h;
}
function Nn(t) {
  return t.filter((n) => n.name && n.name.trim() !== "");
}
function kn(t, n, a, b) {
  if (!a || a === "no action" || a === "fold")
    return;
  const u = n.card1, h = n.card2;
  (!u || !u.rank || !u.suit) && b.push(`${t.name || `Player ${t.id}`}: Card 1 required`), (!h || !h.rank || !h.suit) && b.push(`${t.name || `Player ${t.id}`}: Card 2 required`);
}
function Sn(t, n, a, b, u, h, c) {
  if (a !== "bet" && a !== "raise")
    return c;
  const d = `${b}${u}_amount`, s = n[d];
  return (!s || s === "" || parseFloat(s) <= 0) && (h.push(`${t.name || `Player ${t.id}`}: Amount required for ${a}`), !c) ? {
    playerId: t.id,
    playerName: t.name || `Player ${t.id}`,
    action: a,
    stage: b,
    suffix: u
  } : c;
}
function $n(t, n, a, b, u = "K") {
  const h = [];
  return t.forEach((c) => {
    const d = n[c.id] || {}, s = d[`${a}${b}_action`];
    if (s === "raise" || s === "bet") {
      const o = `${a}${b}_amount`, f = `${a}${b}_unit`, l = parseFloat(d[o]) || 0, x = d[f] || d.unit || u, g = wn(l, x, a, b, d);
      h.push({
        player: c,
        action: s,
        amount: l,
        unit: x,
        actualAmount: g
      });
    }
  }), h;
}
function Cn(t, n, a) {
  let b = a;
  for (let u = 1; u < t.length; u++) {
    const h = t[u - 1], c = t[u];
    if (c.actualAmount <= h.actualAmount) {
      const d = `${c.player.name}: ${c.action} amount (${c.amount}${c.unit || ""}) must be higher than ${h.player.name}'s ${h.action} (${h.amount}${h.unit || ""})`;
      n.push(d), b || (b = {
        playerId: c.player.id,
        playerName: c.player.name || `Player ${c.player.id}`,
        action: c.action,
        stage: h.player.name.includes("stage") ? "preflop" : "flop",
        // Simplified - in real usage, pass stage
        suffix: ""
      });
    }
  }
  return b;
}
function Pn(t, n, a, b, u = "K") {
  const h = An(n), c = Nn(a), d = [], s = {}, o = [];
  let f = null;
  c.forEach((x) => {
    const g = b[x.id] || {}, p = g[`${t}${h}_action`];
    if (!p || p === "no action") {
      t === "preflop" && h === "" && (s[x.id] = {
        ...g,
        [`${t}${h}_action`]: "fold"
      }, o.push(x.name || `Player ${x.id}`));
      return;
    }
    p !== "fold" && (kn(x, g, p, d), f = Sn(
      x,
      g,
      p,
      t,
      h,
      d,
      f
    ));
  });
  const l = $n(
    c,
    b,
    t,
    h,
    u
  );
  return f = Cn(
    l,
    d,
    f
  ), {
    errors: d,
    updatedData: s,
    firstPlayerWithMissingAmount: f,
    autoFoldedPlayers: o
  };
}
function Bn(t) {
  const n = t.card1, a = t.card2;
  return !!(n && n.rank && n.suit && a && a.rank && a.suit);
}
function _n(t, n) {
  const a = [], b = [], u = [];
  return t.forEach((h) => {
    if (!h.name)
      return;
    const c = n[h.id] || {}, d = c.preflop_action;
    if (d === "no action" && !Bn(c)) {
      b.push(h), u.push(h.name);
      return;
    }
    if (d && d !== "fold" && d !== "no action") {
      const s = c.card1?.rank && c.card1?.suit, o = c.card2?.rank && c.card2?.suit;
      if (!s || !o)
        if (!s && !o)
          a.push(`${h.name}: Missing both cards`);
        else if (s) {
          if (!o) {
            const f = c.card2?.rank ? "suit" : "rank";
            a.push(`${h.name}: Missing card 2 ${f}`);
          }
        } else {
          const f = c.card1?.rank ? "suit" : "rank";
          a.push(`${h.name}: Missing card 1 ${f}`);
        }
    }
  }), {
    isValid: a.length === 0,
    errors: a,
    playersToFold: b,
    autoFoldedPlayerNames: u
  };
}
function En(t, n) {
  const a = [], b = [];
  return t.forEach((u) => {
    if (!u.name)
      return;
    const c = (n[u.id] || {}).preflop_action;
    (!c || c === "no action" || c === "none") && (a.push(u), b.push(u.name));
  }), {
    playersToFold: a,
    autoFoldedPlayerNames: b
  };
}
function Tn(t, n) {
  const a = n[t] || {}, b = ["preflop", "flop", "turn", "river"];
  for (const u of b)
    if (a[`${u}_action`] === "fold" || a[`${u}_moreAction_action`] === "fold" || a[`${u}_moreAction2_action`] === "fold") return !0;
  return !1;
}
function Ro(t, n) {
  return t.filter(
    (a) => a.name && Tn(a.id, n)
  );
}
function At(t) {
  return !!(t && t.rank && t.suit);
}
function Dn(t, n) {
  if (t !== "turn" && t !== "river")
    return {
      isValid: !0,
      errorMessage: null
    };
  if (t === "turn" || t === "river") {
    const a = n.flop.card1, b = n.flop.card2, u = n.flop.card3;
    if (!(At(a) && At(b) && At(u)))
      return {
        isValid: !1,
        errorMessage: `Flop must have 3 complete cards (rank and suit) before proceeding to ${t}`
      };
  }
  if (t === "river") {
    const a = n.turn.card1;
    if (!At(a))
      return {
        isValid: !1,
        errorMessage: "Turn must have 1 complete card (rank and suit) before proceeding to River"
      };
  }
  return {
    isValid: !0,
    errorMessage: null
  };
}
function Mn(t, n) {
  const a = /* @__PURE__ */ new Set();
  return t.forEach((b) => {
    b.card1?.rank && b.card1?.suit && a.add(`${b.card1.rank}${b.card1.suit}`), b.card2?.rank && b.card2?.suit && a.add(`${b.card2.rank}${b.card2.suit}`);
  }), n.flop.card1?.rank && n.flop.card1?.suit && a.add(`${n.flop.card1.rank}${n.flop.card1.suit}`), n.flop.card2?.rank && n.flop.card2?.suit && a.add(`${n.flop.card2.rank}${n.flop.card2.suit}`), n.flop.card3?.rank && n.flop.card3?.suit && a.add(`${n.flop.card3.rank}${n.flop.card3.suit}`), n.turn.card1?.rank && n.turn.card1?.suit && a.add(`${n.turn.card1.rank}${n.turn.card1.suit}`), n.river.card1?.rank && n.river.card1?.suit && a.add(`${n.river.card1.rank}${n.river.card1.suit}`), a;
}
function Rt(t, n, a, b) {
  if (!t || !n)
    return !0;
  const u = `${t}${n}`;
  return a.has(u) ? b?.rank === t && b?.suit === n : !0;
}
function Rn(t, n, a, b) {
  return a.filter(
    (h) => Rt(t, h, n, b)
  ).length === 0;
}
function Ye(t, n, a, b) {
  console.log("═══════════════════════════════════════════"), console.log("🔍 checkBettingRoundComplete called"), console.log("   Stage:", t), console.log("   Action Level:", n), console.log("   Total Players:", a.length);
  const u = a.filter((h) => {
    const c = jn(h, t, n, b);
    return h.name && !c;
  });
  return console.log("   Active Players:", u.length), u.length === 0 ? (console.log("   → No active players, round complete"), console.log("═══════════════════════════════════════════"), { isComplete: !0, reason: "No active players" }) : u.length === 1 ? (console.log("   → Only 1 active player, round complete"), console.log("═══════════════════════════════════════════"), { isComplete: !0, reason: "Only one active player" }) : t === "preflop" ? On(t, n, u, b) : Ln(t, n, u, b);
}
function On(t, n, a, b) {
  console.log("🔍 Checking PREFLOP round completion");
  const u = n === "base" ? "" : n === "more" ? "_moreAction" : "_moreAction2", h = a.map((o) => {
    const f = b[o.id];
    let l = 0;
    if (n === "base") {
      const x = (f.postedSB || 0) + (f.postedBB || 0), g = lt(o, u, b);
      if (g && g.amount && parseFloat(g.amount) > 0) {
        const p = parseFloat(g.amount), r = g.unit;
        r === "K" ? l = p * 1e3 : r === "Mil" ? l = p * 1e6 : r === "actual" ? l = p : l = p < 1e3 ? p * 1e3 : p;
      } else
        l = x;
    } else {
      const x = lt(o, u, b);
      if (x && x.amount && parseFloat(x.amount) > 0) {
        const g = parseFloat(x.amount), p = x.unit;
        p === "K" ? l = g * 1e3 : p === "Mil" ? l = g * 1e6 : p === "actual" ? l = g : l = g < 1e3 ? g * 1e3 : g;
      } else {
        const g = (f.postedSB || 0) + (f.postedBB || 0);
        if (n === "more2") {
          const p = lt(o, "_moreAction", b);
          if (console.log(`      [DEBUG] ${o.name} More Action 1 data:`, p), p && p.amount && parseFloat(p.amount) > 0) {
            const r = parseFloat(p.amount), y = p.unit;
            console.log(`      [DEBUG] ${o.name} MA1 amount=${r}, unit=${y}`), y === "K" ? l = r * 1e3 : y === "Mil" ? l = r * 1e6 : y === "actual" ? l = r : l = r < 1e3 ? r * 1e3 : r, console.log(`      [DEBUG] ${o.name} MA1 contribution=${l}`);
          } else {
            console.log(`      [DEBUG] ${o.name} No More Action 1, falling back to BASE`);
            const r = lt(o, "", b);
            if (r && r.amount && parseFloat(r.amount) > 0) {
              const y = parseFloat(r.amount), m = r.unit;
              m === "K" ? l = y * 1e3 : m === "Mil" ? l = y * 1e6 : m === "actual" ? l = y : l = y < 1e3 ? y * 1e3 : y;
            } else
              l = g;
          }
        } else {
          const p = lt(o, "", b);
          if (console.log(`      [DEBUG] ${o.name} More Action 1 - Falling back to BASE:`, p), p && p.amount && parseFloat(p.amount) > 0) {
            const r = parseFloat(p.amount), y = p.unit;
            console.log(`      [DEBUG] ${o.name} BASE amount=${r}, unit=${y}`), y === "K" ? l = r * 1e3 : y === "Mil" ? l = r * 1e6 : y === "actual" ? l = r : l = r < 1e3 ? r * 1e3 : r, console.log(`      [DEBUG] ${o.name} BASE contribution=${l}`);
          } else
            l = g, console.log(`      [DEBUG] ${o.name} No BASE action, using blinds only=${g}`);
        }
      }
    }
    return {
      playerId: o.id,
      playerName: o.name,
      contribution: l,
      action: lt(o, u, b)?.action || "none",
      isAllIn: f.isForcedAllInPreflop || rn(o, t, n, b)
    };
  });
  console.log("   Contributions:"), h.forEach((o) => {
    console.log(`      ${o.playerName}: contribution=${o.contribution}, action="${o.action}", isAllIn=${o.isAllIn}`);
  });
  const c = Math.max(...h.map((o) => o.contribution));
  console.log("   Max Contribution:", c);
  const d = h.filter((o) => {
    const f = o.action === "none" || o.action === "no action", l = !o.isAllIn, x = o.contribution < c;
    return console.log(`      ${o.playerName}: hasNoAction=${f}, notAllIn=${l}, hasNotMatchedBet=${x}`), f && l && x;
  });
  if (d.length > 0)
    return console.log("   → Players without action:", d.map((o) => o.playerName)), console.log("   → Round NOT complete (players pending action)"), console.log("═══════════════════════════════════════════"), {
      isComplete: !1,
      reason: "Players pending action",
      pendingPlayers: d.map((o) => o.playerId)
    };
  const s = h.filter((o) => !o.isAllIn && o.contribution < c);
  return s.length > 0 ? (console.log("   → Players with mismatched contributions:", s.map((o) => o.playerName)), console.log("   → Round NOT complete (contributions not matched)"), console.log("═══════════════════════════════════════════"), {
    isComplete: !1,
    reason: "Contributions not matched",
    pendingPlayers: s.map((o) => o.playerId),
    maxContribution: c
  }) : (console.log("   → All checks passed, round COMPLETE"), console.log("═══════════════════════════════════════════"), {
    isComplete: !0,
    reason: "All players acted and contributions matched",
    maxContribution: c
  });
}
function wt(t, n) {
  const a = typeof t == "string" ? parseFloat(t) : t;
  return isNaN(a) ? 0 : n === "K" ? a * 1e3 : n === "Mil" ? a * 1e6 : n === "actual" ? a : a < 1e3 ? a * 1e3 : a;
}
function Ln(t, n, a, b) {
  console.log("🔍 Checking POSTFLOP round completion");
  const u = a.map((s) => {
    const o = b[s.id];
    let f = 0, l = "none";
    const x = `${t}Action`, g = `${t}Amount`, p = `${t}Unit`, r = o[x];
    if (r === "bet" || r === "raise" || r === "call" || r === "all-in") {
      const y = parseFloat(o[g] || "0"), m = o[p];
      f = wt(y, m);
    }
    if (n === "more") {
      const y = `${t}_moreActionAction`, m = `${t}_moreActionAmount`, v = `${t}_moreActionUnit`, N = o[y];
      if (N === "bet" || N === "raise" || N === "call" || N === "all-in") {
        const A = parseFloat(o[m] || "0"), $ = o[v];
        f = wt(A, $), l = N;
      } else
        l = "none";
    } else if (n === "more2") {
      const y = `${t}_moreAction2Action`, m = `${t}_moreAction2Amount`, v = `${t}_moreAction2Unit`, N = o[y];
      if (N === "bet" || N === "raise" || N === "call" || N === "all-in") {
        const A = parseFloat(o[m] || "0"), $ = o[v];
        f = wt(A, $), l = N;
      } else {
        const A = `${t}_moreActionAction`, $ = `${t}_moreActionAmount`, S = `${t}_moreActionUnit`, _ = o[A];
        if (_ === "bet" || _ === "raise" || _ === "call" || _ === "all-in") {
          const w = parseFloat(o[$] || "0"), P = o[S];
          f = wt(w, P);
        }
        l = "none";
      }
    } else
      l = r || "none";
    return {
      playerId: s.id,
      playerName: s.name,
      contribution: f,
      action: l,
      isAllIn: rn(s, t, n, b)
    };
  });
  console.log("   Contributions:", u);
  const h = Math.max(...u.map((s) => s.contribution));
  if (console.log("   Max Contribution:", h), h === 0)
    return u.every(
      (o) => o.action === "check" || o.isAllIn
    ) ? (console.log("   → All players checked or all-in, round COMPLETE"), console.log("═══════════════════════════════════════════"), {
      isComplete: !0,
      reason: "All players checked or all-in",
      maxContribution: 0
    }) : (console.log("   → Not all players have checked"), console.log("   → Round NOT complete"), console.log("═══════════════════════════════════════════"), {
      isComplete: !1,
      reason: "Players pending action (check required)",
      pendingPlayers: u.filter((o) => o.action === "none" && !o.isAllIn).map((o) => o.playerId)
    });
  const c = u.filter((s) => {
    const o = s.action === "none", f = !s.isAllIn, l = s.contribution < h;
    return o && f && l;
  });
  if (c.length > 0)
    return console.log("   → Players without action:", c.map((s) => s.playerName)), console.log("   → Round NOT complete (players pending action)"), console.log("═══════════════════════════════════════════"), {
      isComplete: !1,
      reason: "Players pending action",
      pendingPlayers: c.map((s) => s.playerId)
    };
  const d = u.filter((s) => !s.isAllIn && s.contribution < h);
  return d.length > 0 ? (console.log("   → Players with mismatched contributions:", d.map((s) => s.playerName)), console.log("   → Round NOT complete (contributions not matched)"), console.log("═══════════════════════════════════════════"), {
    isComplete: !1,
    reason: "Contributions not matched",
    pendingPlayers: d.map((s) => s.playerId),
    maxContribution: h
  }) : (console.log("   → All checks passed, round COMPLETE"), console.log("═══════════════════════════════════════════"), {
    isComplete: !0,
    reason: "All players acted and contributions matched",
    maxContribution: h
  });
}
function jn(t, n, a, b) {
  const u = b[t.id] || {}, h = ["preflop", "flop", "turn", "river"], c = h.indexOf(n);
  for (let d = 0; d <= c; d++) {
    const s = h[d];
    if (d === c) {
      const o = `${s}Action`;
      if (u[o] === "fold") return !0;
      if (a === "more" || a === "more2") {
        const f = `${s}_moreActionAction`;
        if (u[f] === "fold") return !0;
      }
      if (a === "more2") {
        const f = `${s}_moreAction2Action`;
        if (u[f] === "fold") return !0;
      }
    } else {
      const o = `${s}Action`, f = `${s}_moreActionAction`, l = `${s}_moreAction2Action`;
      if (u[o] === "fold" || u[f] === "fold" || u[l] === "fold") return !0;
    }
  }
  return !1;
}
function rn(t, n, a, b) {
  const u = b[t.id], h = a === "base" ? "" : a === "more" ? "_moreAction" : "_moreAction2";
  if (u.isForcedAllInPreflop) return !0;
  const c = `${n}${h}Action`;
  if (u[c] === "all-in") return !0;
  const d = ["preflop", "flop", "turn", "river"], s = d.indexOf(n);
  for (let o = 0; o < s; o++) {
    const f = d[o], l = `${f}Action`, x = `${f}_moreActionAction`, g = `${f}_moreAction2Action`;
    if (u[l] === "all-in" || u[x] === "all-in" || u[g] === "all-in") return !0;
  }
  return !1;
}
function lt(t, n, a) {
  const b = a[t.id], u = `preflop${n}Action`, h = `preflop${n}Amount`, c = `preflop${n}Unit`, d = b[u], s = b[h], o = b[c];
  return d ? { action: d, amount: s || "0", unit: o } : null;
}
const Ot = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"], $t = ["♠", "♥", "♦", "♣"];
function Fn() {
  const t = [];
  return Ot.forEach((n) => {
    $t.forEach((a) => {
      t.push({ rank: n, suit: a });
    });
  }), t;
}
function In(t) {
  const n = [...t];
  for (let a = n.length - 1; a > 0; a--) {
    const b = Math.floor(Math.random() * (a + 1));
    [n[a], n[b]] = [n[b], n[a]];
  }
  return n;
}
function Lt(t, n, a) {
  const b = /* @__PURE__ */ new Set();
  return t.forEach((u) => {
    const h = n[u.id];
    h && (h.card1?.rank && h.card1?.suit && b.add(`${h.card1.rank}${h.card1.suit}`), h.card2?.rank && h.card2?.suit && b.add(`${h.card2.rank}${h.card2.suit}`));
  }), a.flop.card1?.rank && a.flop.card1?.suit && b.add(`${a.flop.card1.rank}${a.flop.card1.suit}`), a.flop.card2?.rank && a.flop.card2?.suit && b.add(`${a.flop.card2.rank}${a.flop.card2.suit}`), a.flop.card3?.rank && a.flop.card3?.suit && b.add(`${a.flop.card3.rank}${a.flop.card3.suit}`), a.turn.card1?.rank && a.turn.card1?.suit && b.add(`${a.turn.card1.rank}${a.turn.card1.suit}`), a.river.card1?.rank && a.river.card1?.suit && b.add(`${a.river.card1.rank}${a.river.card1.suit}`), b;
}
function Oo(t, n, a, b, u, h, c, d) {
  const s = `${t}${n}`, o = Lt(u, h, c);
  if (d) {
    const f = h[a], l = b === 1 ? f?.card1 : f?.card2;
    if (l?.rank === t && l?.suit === n)
      return !0;
  }
  return !o.has(s);
}
function Un(t, n, a, b) {
  const u = Fn(), h = Lt(n, a, b), c = a[t];
  return c && (c.card1?.rank && c.card1?.suit && h.delete(`${c.card1.rank}${c.card1.suit}`), c.card2?.rank && c.card2?.suit && h.delete(`${c.card2.rank}${c.card2.suit}`)), u.filter((d) => !h.has(`${d.rank}${d.suit}`));
}
function Lo(t, n, a, b) {
  const u = Lt(n, a, b);
  return $t.every((h) => u.has(`${t}${h}`));
}
function jo(t, n, a, b) {
  const u = Un(t, n, a, b);
  if (u.length < 2)
    throw new Error("Not enough available cards to assign");
  const h = In(u);
  return {
    card1: { rank: h[0].rank, suit: h[0].suit },
    card2: { rank: h[1].rank, suit: h[1].suit }
  };
}
function Fo(t, n) {
  const a = [];
  return (t === "flop" || t === "turn" || t === "river") && (n.flop.card1?.rank || a.push("Flop Card 1"), n.flop.card2?.rank || a.push("Flop Card 2"), n.flop.card3?.rank || a.push("Flop Card 3")), (t === "turn" || t === "river") && (n.turn.card1?.rank || a.push("Turn Card")), t === "river" && (n.river.card1?.rank || a.push("River Card")), {
    isValid: a.length === 0,
    missingCards: a
  };
}
function Io(t) {
  return !t || !t.rank || !t.suit ? "" : `${t.rank}${t.suit}`;
}
function Uo(t) {
  if (!t || t.length < 2)
    return null;
  const n = t[0], a = t.slice(1);
  return !Ot.includes(n) || !$t.includes(a) ? null : { rank: n, suit: a };
}
const Ft = Ot, Mt = $t;
function Hn(t, n) {
  const a = ln(() => {
    const l = t.players.map((x) => {
      const g = t.playerData[x.id] || {};
      return {
        id: x.id,
        card1: g.card1 || null,
        card2: g.card2 || null
      };
    });
    return Mn(l, t.communityCards);
  }, [t.players, t.playerData, t.communityCards]), b = He((l, x, g) => Rt(l, x, a, g), [a]), u = He((l, x) => Rn(l, a, Mt, x), [a]), h = He((l, x, g) => {
    const p = `card${x}`;
    n.updatePlayerData(l, p, g, "");
  }, [n]), c = He((l, x, g) => {
    n.updateCommunityCard(l, x, g);
  }, [n]), d = He((l) => {
    const x = t.playerData[l] || {};
    return {
      card1: x.card1 || null,
      card2: x.card2 || null
    };
  }, [t.playerData]), s = He((l) => l === "flop" ? t.communityCards.flop : l === "turn" ? t.communityCards.turn : l === "river" ? t.communityCards.river : {}, [t.communityCards]), o = He((l) => {
    const x = l === "flop" ? 3 : 1, g = [];
    for (const p of Ft)
      for (const r of Mt)
        Rt(p, r, a) && g.push({ rank: p, suit: r });
    for (let p = g.length - 1; p > 0; p--) {
      const r = Math.floor(Math.random() * (p + 1));
      [g[p], g[r]] = [g[r], g[p]];
    }
    for (let p = 0; p < x && p < g.length; p++)
      n.updateCommunityCard(l, p + 1, g[p]);
  }, [a, n]), f = He(() => {
    t.players.forEach((l) => {
      l.name && (n.updatePlayerData(l.id, "card1", null, ""), n.updatePlayerData(l.id, "card2", null, ""));
    }), n.setCommunityCards({
      flop: { card1: null, card2: null, card3: null },
      turn: { card1: null },
      river: { card1: null }
    });
  }, [t.players, n]);
  return {
    selectedCards: a,
    checkCardAvailable: b,
    checkAllSuitsTaken: u,
    updatePlayerCard: h,
    updateCommunityCard: c,
    autoSelectCommunityCards: o,
    getPlayerCards: d,
    getCommunityCards: s,
    clearAllCards: f,
    availableRanks: Ft,
    availableSuits: Mt
  };
}
function Kn(t, n) {
  const a = He((p, r) => `${p}${r === "base" ? "" : r === "more" ? "_moreAction" : "_moreAction2"}`, []), b = He((p, r, y, m) => {
    const v = a(y, m);
    n.updatePlayerData(p, `${v}_action`, r, "");
  }, [n, a]), u = He((p, r, y, m) => {
    const v = a(y, m);
    n.updatePlayerData(p, `${v}_amount`, r, "");
  }, [n, a]), h = He((p, r, y, m) => {
    const v = a(y, m);
    n.updatePlayerData(p, `${v}_unit`, r, "");
  }, [n, a]), c = He((p, r) => {
    const y = Pn(
      p,
      r,
      t.players,
      t.playerData,
      t.defaultUnit
    );
    return Object.keys(y.updatedData).length > 0 && Object.entries(y.updatedData).forEach(([m, v]) => {
      Object.entries(v).forEach(([N, A]) => {
        n.updatePlayerData(parseInt(m), N, A, "");
      });
    }), {
      isValid: y.errors.length === 0,
      errors: y.errors,
      autoFoldedPlayers: y.autoFoldedPlayers
    };
  }, [t.players, t.playerData, t.defaultUnit, n]), d = He(() => {
    const p = _n(t.players, t.playerData);
    return p.playersToFold.length > 0 && p.playersToFold.forEach((r) => {
      n.updatePlayerData(r.id, "preflop_action", "fold", "");
    }), {
      isValid: p.isValid,
      errors: p.errors,
      autoFoldedPlayers: p.autoFoldedPlayerNames
    };
  }, [t.players, t.playerData, n]), s = He((p) => {
    const r = Dn(p, t.communityCards);
    return {
      isValid: r.isValid,
      errors: r.errorMessage ? [r.errorMessage] : []
    };
  }, [t.communityCards]), o = He(() => {
    const p = En(
      t.players,
      t.playerData
    );
    return p.playersToFold.forEach((r) => {
      n.updatePlayerData(r.id, "preflop_action", "fold", ""), n.setFoldingPlayers((y) => new Set(y).add(r.id)), setTimeout(() => {
        n.setFoldingPlayers((y) => {
          const m = new Set(y);
          return m.delete(r.id), m;
        });
      }, 500);
    }), {
      playersToFold: p.autoFoldedPlayerNames,
      count: p.playersToFold.length
    };
  }, [t.players, t.playerData, n]), f = He((p, r, y) => {
    const m = a(r, y);
    return (t.playerData[p] || {})[`${m}_action`] || "no action";
  }, [t.playerData, a]), l = He((p, r, y) => {
    const m = a(r, y), N = (t.playerData[p] || {})[`${m}_amount`];
    return typeof N == "string" || typeof N == "number" ? N : "";
  }, [t.playerData, a]), x = He((p, r, y) => {
    const m = a(r, y), v = t.playerData[p] || {};
    return v[`${m}_unit`] || v.unit || t.defaultUnit;
  }, [t.playerData, t.defaultUnit, a]), g = He((p, r, y) => {
    const m = f(p, r, y);
    return m !== "no action" && m !== void 0;
  }, [f]);
  return {
    setPlayerAction: b,
    setPlayerAmount: u,
    setPlayerUnit: h,
    validateSection: c,
    validatePreflop: d,
    validateCommunityCardsForStage: s,
    autoFoldNoAction: o,
    getPlayerAction: f,
    getPlayerAmount: l,
    getPlayerUnit: x,
    hasPlayerActed: g
  };
}
function bt(t) {
  const n = t.trim().split(`
`);
  if (n.length < 4)
    return console.warn("Not enough lines for hand format"), null;
  try {
    const b = n[0].trim().match(/Hand\s*\((\d+)\)/), u = b ? b[1] : "", h = n[1].trim(), c = h.match(/started_at:\s*([\d:]+)/), d = h.match(/ended_at:\s*([\d:]+)/), s = c ? c[1] : "", o = d ? d[1] : void 0, f = n[2].trim(), l = f.match(/SB\s+([\d,]+)/), x = f.match(/BB\s+([\d,]+)/), g = f.match(/Ante\s+([\d,]+)/), p = l ? parseInt(l[1].replace(/,/g, "")) : 0, r = x ? parseInt(x[1].replace(/,/g, "")) : 0, y = g ? parseInt(g[1].replace(/,/g, "")) : 0, m = n.slice(4).filter((N) => N.trim()), v = [];
    return m.forEach((N) => {
      const A = N.trim().split(/\s+/);
      if (A.length >= 2) {
        const $ = A[0];
        let S = "", _ = 0;
        A[1] === "Dealer" || A[1] === "SB" || A[1] === "BB" ? (S = A[1], _ = parseFloat(A[2]?.replace(/,/g, "") || "0") || 0) : _ = parseFloat(A[1]?.replace(/,/g, "") || "0") || 0, $ && _ >= 0 && v.push({ name: $, position: S, stack: _ });
      }
    }), {
      header: {
        handNumber: u,
        startedAt: s,
        endedAt: o,
        sb: p,
        bb: r,
        ante: y
      },
      players: v
    };
  } catch (a) {
    return console.error("Error parsing hand format:", a), null;
  }
}
function Vn(t, n, a, b, u, h) {
  const c = [];
  return c.push(`Hand (${t})`), c.push(`started_at: ${n} ended_at: HH:MM:SS`), c.push(`SB ${a.toLocaleString()} BB ${b.toLocaleString()} Ante ${u.toLocaleString()}`), c.push("Stack Setup:"), h.forEach((d) => {
    const s = d.stack.toLocaleString(), o = d.position.toLowerCase();
    o === "dealer" || o === "sb" || o === "bb" ? c.push(`${d.name} ${d.position} ${s}`) : c.push(`${d.name} ${s}`);
  }), c.join(`
`);
}
function gt(t) {
  if (!t) return "";
  const n = t.toLowerCase().trim();
  return n === "dealer" || n === "btn" || n === "button" ? "dealer" : n === "sb" || n === "small blind" ? "sb" : n === "bb" || n === "big blind" ? "bb" : t;
}
function Wn(t) {
  const n = t.findIndex((s) => gt(s.position) === "dealer"), a = t.findIndex((s) => gt(s.position) === "sb"), b = t.findIndex((s) => gt(s.position) === "bb");
  if (n === -1 || a === -1 || b === -1)
    return console.error("Missing Dealer, SB, or BB position"), t;
  const u = t.filter((s) => s.name).length, c = {
    2: ["SB", "BB"],
    3: ["Dealer", "SB", "BB"],
    4: ["Dealer", "SB", "BB", "UTG"],
    5: ["Dealer", "SB", "BB", "UTG", "CO"],
    6: ["Dealer", "SB", "BB", "UTG", "MP", "CO"],
    7: ["Dealer", "SB", "BB", "UTG", "UTG+1", "MP", "CO"],
    8: ["Dealer", "SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "CO"],
    9: ["Dealer", "SB", "BB", "UTG", "UTG+1", "UTG+2", "LJ", "HJ", "CO"]
  }[u] || [];
  return t.map((s, o) => {
    if (!s.name) return s;
    const f = gt(s.position);
    if (f === "dealer" || f === "sb" || f === "bb")
      return s;
    const l = (o - n + u) % u, x = c[l] || "";
    return {
      ...s,
      position: x
    };
  });
}
function Gn({
  state: t,
  actions: n,
  cardManagement: a,
  onClearAll: b,
  onExport: u,
  formatStack: h,
  onBackToTournament: c
}) {
  nt(() => {
    const y = new URLSearchParams(window.location.search).get("fromTournament");
    y && (localStorage.setItem("lastTournamentId", y), window.history.replaceState({}, document.title, window.location.pathname));
  }, []);
  const d = He(() => `/tpro.html?view=handHistory&tournamentId=${localStorage.getItem("lastTournamentId") || "1"}`, []), s = He(() => {
    if (!((t.players.some((y) => y.name) || Object.keys(t.playerData).length > 0 || t.currentView !== "stack") && !window.confirm(
      `⚠️ WARNING: This will clear all entered data and start fresh!

All player data, cards, actions, and progress will be lost.

Do you want to continue?`
    )))
      try {
        console.log("=== setupPlayers CALLED ==="), console.log("🔄 Resetting all game state..."), n.setPlayerData({}), n.setContributedAmounts({}), n.setProcessedSections({}), n.setPotsByStage({}), n.setVisibleActionLevels({ preflop: ["base"], flop: ["base"], turn: ["base"], river: ["base"] }), n.setSectionStacks({}), n.setCommunityCards({
          flop: { card1: null, card2: null, card3: null },
          turn: { card1: null },
          river: { card1: null }
        }), n.setCurrentView("stack"), console.log("✅ Complete reset done, loading new hand...");
        const y = (t.stackData.rawInput || "").trim(), m = bt(y);
        let v = [], N = t.stackData.smallBlind, A = t.stackData.bigBlind, $ = t.stackData.ante, S = t.stackData.anteOrder;
        if (console.log("🔍 [setupPlayers] Initial blind values from state.stackData:", {
          smallBlind: N,
          bigBlind: A,
          ante: $,
          anteOrder: S
        }), m ? (console.log("✅ Parsed 4-line header format"), console.log("  Hand Number:", m.header.handNumber), console.log("  Started At:", m.header.startedAt), console.log("  SB:", m.header.sb, "BB:", m.header.bb, "Ante:", m.header.ante), N = m.header.sb, A = m.header.bb, $ = m.header.ante, console.log("📝 Using parsed blind values from textarea:", {
          smallBlind: N,
          bigBlind: A,
          ante: $
        }), n.setStackData({
          ...t.stackData,
          handNumber: m.header.handNumber,
          startedAt: m.header.startedAt,
          smallBlind: N,
          bigBlind: A,
          ante: $
        }), console.log("✅ stackData updated, blind input fields auto-populated with parsed values"), v = m.players, console.log("📋 Parsed", v.length, "players from 4-line format")) : (console.log("ℹ️ Using simple format (no header)"), y.split(`
`).forEach((j) => {
          const F = j.trim();
          if (!F) return;
          const Y = F.split(/\s+/);
          if (Y.length >= 2) {
            const ne = Y[0];
            let oe = "", me = 0;
            Y[1] === "Dealer" || Y[1] === "SB" || Y[1] === "BB" ? (oe = Y[1], me = parseFloat(Y[2]?.replace(/,/g, "") || "0") || 0) : me = parseFloat(Y[1]?.replace(/,/g, "") || "0") || 0, ne && me >= 0 && v.push({ name: ne, position: oe, stack: me });
          }
        })), v.length === 0) {
          alert("No valid players found. Please check the format.");
          return;
        }
        v.length > 9 && alert(`Found ${v.length} players, but maximum is 9. Only the first 9 will be used.`), console.log("📋 Parsed players:", v.length), v.forEach((C, j) => {
          console.log(`  ${j + 1}. ${C.name} - ${C.position || "no position"} - ${C.stack}`);
        });
        const _ = t.players.map((C, j) => j < v.length ? {
          id: C.id,
          name: v[j].name,
          position: v[j].position,
          stack: v[j].stack,
          inputOrder: j
        } : { id: C.id, name: "", position: "", stack: 0, inputOrder: j }), w = Wn(_), P = {};
        w.forEach((C) => {
          if (!C.name) return;
          const j = gt(C.position);
          let F = 0, Y = 0, ne = 0, oe = !1, me = 0;
          if (C.stack === 0) {
            P[C.id] = {
              postedSB: 0,
              postedBB: 0,
              postedAnte: 0,
              isForcedAllIn: !1,
              forcedAllInAmount: 0
            }, n.updatePlayerData(C.id, "preflopAction", "fold", ""), n.updatePlayerData(C.id, "postedSB", 0, ""), n.updatePlayerData(C.id, "postedBB", 0, ""), n.updatePlayerData(C.id, "postedAnte", 0, ""), console.log(`   🚫 Player ${C.id} (${C.name}) has 0 chips - posted=0, fold button highlighted`);
            return;
          }
          if (j === "sb" && (console.log(`🔍 [setupPlayers] SB player ${C.name} posting SB:`, {
            smallBlindValue: N,
            playerStack: C.stack,
            willPost: Math.min(N, C.stack)
          }), F = Math.min(N, C.stack), C.stack <= N && (oe = !0, me = C.stack)), w.filter((Pe) => Pe.name).length === 2 && j === "dealer" && (F = Math.min(N, C.stack), C.stack <= N && (oe = !0, me = C.stack)), j === "bb")
            if (S === "BB First") {
              Y = Math.min(A, C.stack);
              const Pe = C.stack - Y;
              C.stack <= A ? (oe = !0, me = Y) : Pe > 0 && (ne = Math.min($, Pe), Pe <= $ && (oe = !0, me = Y));
            } else {
              ne = Math.min($, C.stack);
              const Pe = C.stack - ne;
              C.stack <= $ ? (oe = !0, me = 0) : Pe > 0 && (Y = Math.min(A, Pe), Pe <= A && (oe = !0, me = Y));
            }
          P[C.id] = {
            postedSB: F,
            postedBB: Y,
            postedAnte: ne,
            isForcedAllIn: oe,
            forcedAllInAmount: me
          }, n.updatePlayerData(C.id, "postedSB", F, ""), n.updatePlayerData(C.id, "postedBB", Y, ""), n.updatePlayerData(C.id, "postedAnte", ne, ""), oe && (n.updatePlayerData(C.id, "isForcedAllInPreflop", !0, ""), n.updatePlayerData(C.id, "forcedAllInAmount", me, ""));
        }), n.setPlayers(w), console.log("🔍 [StackSetupView] Initializing sectionStacks for", w.length, "players");
        const D = {};
        if (D.preflop_base = {
          initial: {},
          current: {},
          updated: {}
        }, w.forEach((C) => {
          if (console.log("🔍 [StackSetupView] Player:", C.id, C.name, "stack:", C.stack), C.name) {
            const j = P[C.id] || { postedSB: 0, postedBB: 0, postedAnte: 0, isForcedAllIn: !1, forcedAllInAmount: 0 }, F = j.postedSB + j.postedBB + j.postedAnte;
            D.preflop_base.initial[C.id] = C.stack;
            const Y = C.stack - F;
            D.preflop_base.current[C.id] = Y, D.preflop_base.updated[C.id] = Y, C.stack === 0 ? console.log(`   🚫 Player ${C.id} (${C.name}): starting=0, posted=0, now=0, FOLDED (0 chips)`) : console.log(`   ✅ Player ${C.id} (${C.name}): starting=${C.stack}, posted=${F} (SB:${j.postedSB}, BB:${j.postedBB}, Ante:${j.postedAnte}), now=${Y}, forcedAllIn=${j.isForcedAllIn}`);
          }
        }), console.log("🔍 [StackSetupView] Calling setSectionStacks with:", JSON.stringify(D, null, 2)), n.setSectionStacks(D), console.log('✅ [StackSetupView] Initialized "Now" stacks for preflop_base'), t.autoSelectCards) {
          console.log("🎴 Auto-selecting cards for all players...");
          const C = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"], j = ["♠", "♥", "♦", "♣"], F = [];
          for (const ne of C)
            for (const oe of j)
              F.push({ rank: ne, suit: oe });
          for (let ne = F.length - 1; ne > 0; ne--) {
            const oe = Math.floor(Math.random() * (ne + 1));
            [F[ne], F[oe]] = [F[oe], F[ne]];
          }
          let Y = 0;
          w.forEach((ne) => {
            if (ne.name && ne.stack > 0) {
              if (Y < F.length) {
                const oe = F[Y++];
                a.updatePlayerCard(ne.id, 1, oe), console.log(`  Player ${ne.id} (${ne.name}) Card 1: ${oe.rank}${oe.suit}`);
              }
              if (Y < F.length) {
                const oe = F[Y++];
                a.updatePlayerCard(ne.id, 2, oe), console.log(`  Player ${ne.id} (${ne.name}) Card 2: ${oe.rank}${oe.suit}`);
              }
            } else ne.name && ne.stack === 0 && console.log(`  Player ${ne.id} (${ne.name}) - No cards (0 chips, folded)`);
          }), console.log("✅ Auto-select cards complete");
        }
        n.setCurrentView("preflop"), console.log("✅ Players setup complete");
      } catch (y) {
        console.error("Error setting up players:", y), alert("Error setting up players. Please check the console for details.");
      }
  }, [t.stackData, t.players, t.autoSelectCards, n, a]);
  He(async () => {
    try {
      if (console.log("🔍 [LoadNextHand] Checking for generated next hand..."), console.log("🔍 [LoadNextHand] state.generatedNextHand:", t.generatedNextHand), console.log("🔍 [LoadNextHand] Type:", typeof t.generatedNextHand), console.log("🔍 [LoadNextHand] Length:", t.generatedNextHand?.length), t.generatedNextHand) {
        console.log("✅ [LoadNextHand] Loading generated next hand:", t.generatedNextHand), n.setStackData({ ...t.stackData, rawInput: t.generatedNextHand }), alert(`✅ Next hand loaded from generation!

Click "Setup Players" to start the new hand.`), n.setGeneratedNextHand(null);
        return;
      }
      const r = await navigator.clipboard.readText();
      if (!r.trim()) {
        alert(`❌ No next hand available!

The next hand has not been generated yet.
Please complete the current hand and generate the next hand first.`);
        return;
      }
      n.setStackData({ ...t.stackData, rawInput: r }), alert(`✅ Next hand loaded from clipboard!

Click "Setup Players" to start the new hand.`);
    } catch (r) {
      console.error("Failed to read clipboard:", r), alert("Failed to read from clipboard. Please make sure you have granted clipboard permissions.");
    }
  }, [t.stackData, t.generatedNextHand, n]);
  const o = He((r) => {
    n.setAutoSelectCards(r), console.log("Auto-select cards:", r);
  }, [n]), f = t.potsByStage && Object.keys(t.potsByStage).some((r) => r.startsWith("preflop")), l = t.potsByStage && Object.keys(t.potsByStage).some((r) => r.startsWith("flop")), x = t.potsByStage && Object.keys(t.potsByStage).some((r) => r.startsWith("turn")), g = t.potsByStage && Object.keys(t.potsByStage).some((r) => r.startsWith("river"));
  return /* @__PURE__ */ e("div", { className: "p-2 max-w-full mx-auto bg-gray-50 min-h-screen", children: /* @__PURE__ */ i("div", { className: "bg-white rounded-lg shadow-lg p-3", children: [
    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-2 pb-2 border-b border-gray-100", children: /* @__PURE__ */ i(
      "button",
      {
        onClick: () => {
          c ? c() : window.open(d(), "_blank");
        },
        className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors",
        children: [
          /* @__PURE__ */ e("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }),
          /* @__PURE__ */ e("span", { children: c ? "Back to Tournament" : "Back to Hand History" })
        ]
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "flex justify-between items-center mb-3", children: [
      /* @__PURE__ */ e("h1", { className: "text-lg font-bold text-gray-800", children: "Stack Setup" }),
      /* @__PURE__ */ i("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => n.setCurrentView("pot-demo"),
            className: "px-2 py-0.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors font-semibold",
            title: "View Pot Calculation Display Demo",
            children: "🎰 Pot Demo"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: b,
            className: "px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors",
            children: "Clear All"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: u,
            className: "px-2 py-0.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors",
            children: "Export"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e("div", { className: "mb-3 p-2 bg-gray-100 rounded", children: /* @__PURE__ */ i("div", { className: "flex flex-wrap gap-1", children: [
      /* @__PURE__ */ e("button", { className: "px-2 py-1 rounded text-xs font-medium bg-purple-600 text-white", children: "Stack" }),
      f && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => n.setCurrentView("preflop"),
          className: "px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors",
          children: "Pre-flop"
        }
      ),
      l && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => n.setCurrentView("flop"),
          className: "px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors",
          children: "Flop"
        }
      ),
      x && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => n.setCurrentView("turn"),
          className: "px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors",
          children: "Turn"
        }
      ),
      g && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => n.setCurrentView("river"),
          className: "px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors",
          children: "River"
        }
      )
    ] }) }),
    /* @__PURE__ */ i("div", { className: "space-y-3", children: [
      /* @__PURE__ */ i("div", { className: "border border-gray-300 rounded p-3 bg-gray-50", children: [
        /* @__PURE__ */ e("h3", { className: "text-sm font-bold text-gray-800 mb-2", children: "Tournament Information" }),
        /* @__PURE__ */ i("div", { className: "space-y-2", children: [
          /* @__PURE__ */ i("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ i("div", { className: "flex-1", children: [
              /* @__PURE__ */ e("label", { className: "text-xs text-gray-600", children: "Hand #:" }),
              /* @__PURE__ */ e(
                "input",
                {
                  type: "text",
                  value: t.stackData.handNumber || "",
                  onChange: (r) => n.setStackData({ ...t.stackData, handNumber: r.target.value }),
                  className: "w-full px-2 py-1 border border-gray-300 rounded text-sm"
                }
              )
            ] }),
            /* @__PURE__ */ i("div", { className: "flex-1", children: [
              /* @__PURE__ */ e("label", { className: "text-xs text-gray-600", children: "Started:" }),
              /* @__PURE__ */ e(
                "input",
                {
                  type: "text",
                  value: t.stackData.startedAt || "",
                  onChange: (r) => n.setStackData({ ...t.stackData, startedAt: r.target.value }),
                  className: "w-full px-2 py-1 border border-gray-300 rounded text-sm",
                  placeholder: "HH:mm:ss"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ i("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ i("div", { className: "flex-1", children: [
              /* @__PURE__ */ e("label", { className: "text-xs text-gray-600", children: "Tournament:" }),
              /* @__PURE__ */ e(
                "input",
                {
                  type: "text",
                  value: t.stackData.tournamentName || "",
                  onChange: (r) => n.setStackData({ ...t.stackData, tournamentName: r.target.value }),
                  className: "w-full px-2 py-1 border border-gray-300 rounded text-sm"
                }
              )
            ] }),
            /* @__PURE__ */ i("div", { className: "flex-1", children: [
              /* @__PURE__ */ e("label", { className: "text-xs text-gray-600", children: "Date:" }),
              /* @__PURE__ */ e(
                "input",
                {
                  type: "text",
                  value: t.stackData.tournamentDate || "",
                  onChange: (r) => n.setStackData({ ...t.stackData, tournamentDate: r.target.value }),
                  className: "w-full px-2 py-1 border border-gray-300 rounded text-sm",
                  placeholder: "yyyy/mm/dd"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ i("div", { children: [
            /* @__PURE__ */ e("label", { className: "text-xs text-gray-600", children: "YouTube URL:" }),
            /* @__PURE__ */ e(
              "input",
              {
                type: "text",
                value: t.stackData.youtubeUrl || "",
                onChange: (r) => n.setStackData({ ...t.stackData, youtubeUrl: r.target.value }),
                className: "w-full px-2 py-1 border border-gray-300 rounded text-sm",
                placeholder: "https://youtube.com/watch?v=..."
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "border border-gray-300 rounded p-3 bg-gray-50", children: [
        /* @__PURE__ */ e("h3", { className: "text-sm font-bold text-gray-800 mb-2", children: "Blind Structure" }),
        /* @__PURE__ */ i("div", { className: "space-y-2", children: [
          /* @__PURE__ */ i("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ i("div", { className: "flex-1", children: [
              /* @__PURE__ */ e("label", { className: "text-xs text-gray-600", children: "SB:" }),
              /* @__PURE__ */ e(
                "input",
                {
                  type: "number",
                  value: t.stackData.smallBlind,
                  onChange: (r) => n.setStackData({ ...t.stackData, smallBlind: parseInt(r.target.value) || 0 }),
                  className: "w-full px-2 py-1 border border-gray-300 rounded text-sm"
                }
              )
            ] }),
            /* @__PURE__ */ i("div", { className: "flex-1", children: [
              /* @__PURE__ */ e("label", { className: "text-xs text-gray-600", children: "BB:" }),
              /* @__PURE__ */ e(
                "input",
                {
                  type: "number",
                  value: t.stackData.bigBlind,
                  onChange: (r) => n.setStackData({ ...t.stackData, bigBlind: parseInt(r.target.value) || 0 }),
                  className: "w-full px-2 py-1 border border-gray-300 rounded text-sm"
                }
              )
            ] }),
            /* @__PURE__ */ i("div", { className: "flex-1", children: [
              /* @__PURE__ */ e("label", { className: "text-xs text-gray-600", children: "Ante:" }),
              /* @__PURE__ */ e(
                "input",
                {
                  type: "number",
                  value: t.stackData.ante,
                  onChange: (r) => n.setStackData({ ...t.stackData, ante: parseInt(r.target.value) || 0 }),
                  className: "w-full px-2 py-1 border border-gray-300 rounded text-sm"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ i("div", { children: [
            /* @__PURE__ */ e("label", { className: "text-xs text-gray-600", children: "Ante Order:" }),
            /* @__PURE__ */ i(
              "select",
              {
                value: t.stackData.anteOrder || "BB First",
                onChange: (r) => n.setStackData({ ...t.stackData, anteOrder: r.target.value }),
                className: "w-full px-2 py-1 border border-gray-300 rounded text-sm",
                children: [
                  /* @__PURE__ */ e("option", { value: "BB First", children: "BB First" }),
                  /* @__PURE__ */ e("option", { value: "Ante First", children: "Ante First" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ i(
            "div",
            {
              style: {
                padding: "20px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
              },
              children: [
                /* @__PURE__ */ i("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "white"
                }, children: [
                  /* @__PURE__ */ i("div", { style: { flex: 1 }, children: [
                    /* @__PURE__ */ i("h3", { style: {
                      margin: "0 0 5px 0",
                      fontSize: "18px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }, children: [
                      /* @__PURE__ */ e("span", { children: "🎴" }),
                      /* @__PURE__ */ e("span", { children: "Auto-Select Cards (Testing Mode)" })
                    ] }),
                    /* @__PURE__ */ e("p", { style: {
                      margin: 0,
                      fontSize: "14px",
                      opacity: 0.9,
                      lineHeight: "1.4"
                    }, children: "Automatically populate all player cards and community cards for faster testing" })
                  ] }),
                  /* @__PURE__ */ i("label", { style: {
                    position: "relative",
                    display: "inline-block",
                    width: "60px",
                    height: "34px",
                    marginLeft: "20px",
                    flexShrink: 0,
                    cursor: "pointer"
                  }, children: [
                    /* @__PURE__ */ e(
                      "input",
                      {
                        type: "checkbox",
                        checked: t.autoSelectCards,
                        onChange: (r) => o(r.target.checked),
                        style: {
                          opacity: 0,
                          width: 0,
                          height: 0
                        }
                      }
                    ),
                    /* @__PURE__ */ e("span", { style: {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: t.autoSelectCards ? "#4ade80" : "#cbd5e1",
                      transition: "background-color 0.3s",
                      borderRadius: "34px",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
                    }, children: /* @__PURE__ */ e("span", { style: {
                      position: "absolute",
                      height: "26px",
                      width: "26px",
                      left: t.autoSelectCards ? "30px" : "4px",
                      bottom: "4px",
                      backgroundColor: "white",
                      transition: "left 0.3s",
                      borderRadius: "50%",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    } }) })
                  ] })
                ] }),
                t.autoSelectCards && /* @__PURE__ */ i("div", { style: {
                  marginTop: "12px",
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  fontSize: "13px",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }, children: [
                  /* @__PURE__ */ e("span", { children: "✅" }),
                  /* @__PURE__ */ e("span", { children: "Cards auto-selected! Click Setup Players again to refresh cards" })
                ] })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ i("div", { children: [
        /* @__PURE__ */ e("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Player Data (with 4-line header)" }),
        /* @__PURE__ */ e(
          "textarea",
          {
            value: t.stackData.rawInput || "",
            onChange: (r) => n.setStackData({ ...t.stackData, rawInput: r.target.value }),
            className: "w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono",
            rows: 15,
            placeholder: `Hand (1)
started_at: 00:05:40 ended_at: HH:MM:SS
SB 500 BB 1000 Ante 1000
Stack Setup:
John Dealer 10000
Jane SB 8500
Bob BB 12000
Alice 9500
Charlie 11000
David 7500
Emma 15000
Frank 9000
Grace 13000`
          }
        ),
        /* @__PURE__ */ i("div", { className: "text-xs text-gray-600 mt-1", children: [
          /* @__PURE__ */ e("strong", { children: "Format:" }),
          " Line 1: Hand (number) | Line 2: started_at: HH:MM:SS ended_at: HH:MM:SS | Line 3: SB value BB value Ante value | Line 4: Stack Setup: | Lines 5+: Player lines",
          /* @__PURE__ */ e("br", {}),
          /* @__PURE__ */ e("strong", { children: "Player format:" }),
          " Name [Position] Stack - Position only for Dealer, SB, BB",
          /* @__PURE__ */ e("br", {}),
          /* @__PURE__ */ e("strong", { children: "Note:" }),
          " SB, BB, Ante values from Line 3 will be auto-filled when you click Setup Players."
        ] })
      ] }),
      /* @__PURE__ */ e("div", { className: "flex gap-2", children: /* @__PURE__ */ e(
        "button",
        {
          onClick: s,
          className: "w-full px-4 py-3 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 transition-colors",
          style: {
            backgroundColor: "#16a34a",
            color: "white",
            padding: "12px 16px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          },
          children: "🎯 Enter Hand Details"
        }
      ) }),
      t.players.some((r) => r.name) && /* @__PURE__ */ i("div", { className: "mt-4 p-3 bg-blue-50 border border-blue-200 rounded", children: [
        /* @__PURE__ */ e("h3", { className: "text-sm font-bold text-blue-900 mb-2", children: "Current Players" }),
        /* @__PURE__ */ e("div", { className: "space-y-1", children: t.players.filter((r) => r.name).map((r, y) => /* @__PURE__ */ i("div", { className: "text-xs", children: [
          /* @__PURE__ */ i("span", { className: "font-medium", children: [
            y + 1,
            ". ",
            r.name
          ] }),
          r.position && /* @__PURE__ */ i("span", { className: "ml-2 text-blue-600", children: [
            "(",
            r.position,
            ")"
          ] }),
          /* @__PURE__ */ i("span", { className: "ml-2 text-gray-600", children: [
            "Stack: ",
            h(r.stack)
          ] })
        ] }, r.id)) })
      ] })
    ] })
  ] }) });
}
const It = ({
  playerId: t,
  cardNumber: n,
  currentCard: a,
  onCardChange: b,
  isCardAvailable: u,
  areAllSuitsTaken: h,
  dataCardFocus: c
}) => {
  const [d, s] = $e(!1), [o, f] = $e(null), l = rt(null), x = ["A", "2", "3", "4", "5", "6", "7", "8", "9"], g = ["K", "Q", "J", "10"], p = ["♠", "♥", "♦", "♣"], r = {
    "♠": "text-gray-900",
    "♣": "text-green-700",
    "♥": "text-red-600",
    "♦": "text-blue-600"
  }, y = a?.rank || o, m = a?.suit, v = (S) => {
    const _ = S === "10" ? "T" : S;
    if (a?.rank === _) {
      b(t, n, null), f(null);
      return;
    }
    const w = a?.suit;
    w && u(t, n, _, w) ? (b(t, n, {
      rank: _,
      suit: w
    }), f(null), A()) : (f(_), b(t, n, null));
  }, N = (S) => {
    const _ = a?.rank || o;
    if (!_)
      return;
    const w = u(t, n, _, S), P = a?.suit === S;
    !w && !P || (P ? (b(t, n, null), o && f(_)) : (b(t, n, {
      rank: _,
      suit: S
    }), f(null), A()));
  }, A = () => {
    c && setTimeout(() => {
      if (n === 1) {
        const S = c.replace("-1-", "-2-"), _ = document.querySelector(`[data-card-focus="${S}"]`);
        _ && _.focus();
      } else if (n === 2) {
        const S = c.split("-"), _ = S[0], w = S[2] + (S[3] || ""), P = `${_}-${w}`, D = document.querySelector(`[data-action-focus="${P}"]`);
        D && D.focus();
      }
    }, 100);
  };
  return /* @__PURE__ */ i(
    "div",
    {
      ref: l,
      className: `rounded p-2 transition-all outline-none ${d ? "border-2 border-blue-400 bg-blue-50 ring-2 ring-blue-500" : "border-2 border-gray-300 bg-gray-50"}`,
      style: { minWidth: "240px" },
      tabIndex: 0,
      "data-card-focus": c,
      onKeyDown: (S) => {
        const _ = S.key.toLowerCase(), w = {
          a: "A",
          k: "K",
          q: "Q",
          j: "J",
          t: "10",
          2: "2",
          3: "3",
          4: "4",
          5: "5",
          6: "6",
          7: "7",
          8: "8",
          9: "9"
        };
        if (w[_]) {
          S.preventDefault(), S.stopPropagation(), v(w[_]);
          return;
        }
        const P = {
          d: "♦",
          c: "♣",
          h: "♥",
          s: "♠"
        };
        if (P[_]) {
          S.preventDefault(), S.stopPropagation(), N(P[_]);
          return;
        }
        if (S.key === "Tab" && !S.shiftKey && c) {
          if (S.preventDefault(), n === 1) {
            const D = c.replace("-1-", "-2-"), C = document.querySelector(`[data-card-focus="${D}"]`);
            if (C) {
              C.focus();
              return;
            }
          } else if (n === 2) {
            const D = c.split("-"), C = D[0], j = D[2] + (D[3] || ""), F = `${C}-${j}`, Y = document.querySelector(`[data-action-focus="${F}"]`);
            if (Y) {
              Y.focus();
              return;
            }
          }
        }
        if (S.key === "Tab" && S.shiftKey && c && (S.preventDefault(), n === 2)) {
          const D = c.replace("-2-", "-1-"), C = document.querySelector(`[data-card-focus="${D}"]`);
          if (C) {
            C.focus();
            return;
          }
        }
      },
      onFocus: () => s(!0),
      onBlur: (S) => {
        l.current?.contains(S.relatedTarget) || s(!1);
      },
      role: "button",
      "aria-label": `Card ${n}: ${y || "?"}${m || "?"}`,
      children: [
        /* @__PURE__ */ i("div", { className: "text-xs font-semibold mb-0.5 flex items-center justify-between", children: [
          /* @__PURE__ */ i("div", { children: [
            /* @__PURE__ */ i("span", { className: "text-gray-700", children: [
              "Card ",
              n,
              ": "
            ] }),
            /* @__PURE__ */ e("span", { className: "text-blue-600", children: y === "T" ? "10" : y || "?" }),
            m && /* @__PURE__ */ e("span", { className: `${r[m]} ml-0.5`, children: m })
          ] }),
          /* @__PURE__ */ e("div", { className: "text-[9px] text-gray-400 font-mono", children: "TAB↓" })
        ] }),
        /* @__PURE__ */ e("div", { className: "text-[10px] text-gray-500 mb-0.5 font-mono", children: "a-9,t | d,c,h,s" }),
        /* @__PURE__ */ e("div", { className: "flex gap-0.5 mb-0.5 items-center", children: x.map((S) => {
          const _ = S === "10" ? "T" : S, w = h(t, n, _), P = y === _, D = w && !P;
          return /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              disabled: D,
              onMouseDown: (C) => {
                C.preventDefault(), D || v(S);
              },
              className: `w-6 h-6 rounded text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${D ? "bg-gray-100 text-gray-300 line-through cursor-not-allowed opacity-50" : P ? "bg-blue-800 text-white hover:bg-blue-900" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`,
              children: S
            },
            S
          );
        }) }),
        /* @__PURE__ */ i("div", { className: "flex gap-0.5 items-center", children: [
          g.map((S) => {
            const _ = S === "10" ? "T" : S, w = h(t, n, _), P = y === _, D = w && !P;
            return /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                disabled: D,
                onMouseDown: (C) => {
                  C.preventDefault(), D || v(S);
                },
                className: `w-6 h-6 rounded text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${D ? "bg-gray-100 text-gray-300 line-through cursor-not-allowed opacity-50" : P ? "bg-blue-800 text-white hover:bg-blue-900" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`,
                children: S === "10" ? "T" : S
              },
              S
            );
          }),
          /* @__PURE__ */ e("div", { className: "border-l border-blue-300 h-6 mx-1" }),
          /* @__PURE__ */ e("div", { className: "flex gap-0.5", children: p.map((S) => {
            const _ = y ? u(t, n, y, S) : !0, w = m === S;
            return /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                disabled: !y || !_ && !w,
                onMouseDown: (D) => {
                  D.preventDefault(), y && (_ || w) && N(S);
                },
                className: `w-6 h-6 rounded text-sm font-bold flex items-center justify-center cursor-pointer transition-colors ${y ? w ? "bg-blue-800 text-white hover:bg-blue-900" : _ ? `bg-gray-200 hover:bg-gray-300 ${r[S]}` : "bg-gray-100 text-gray-300 line-through cursor-not-allowed opacity-50" : "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50"}`,
                children: S
              },
              S
            );
          }) })
        ] })
      ]
    }
  );
}, Ct = ({
  playerId: t,
  selectedAction: n,
  onActionClick: a,
  availableActions: b,
  isAllInLocked: u = !1,
  suffix: h = "",
  onActionComplete: c
}) => {
  const d = [
    { value: "check", label: "check", shortcut: "x" },
    { value: "call", label: "call", shortcut: "c" },
    { value: "bet", label: "bet", shortcut: "b" },
    { value: "raise", label: "raise", shortcut: "r" },
    { value: "fold", label: "fold", shortcut: "f" },
    { value: "all-in", label: "all-in", shortcut: "a" },
    { value: "no action", label: "none", shortcut: "n" }
  ], s = (l, x) => {
    if (!x)
      return "bg-gray-200 text-gray-700 hover:bg-gray-300";
    switch (l) {
      case "fold":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "check":
        return "bg-gray-500 hover:bg-gray-600 text-white";
      case "call":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "bet":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "raise":
        return "bg-purple-500 hover:bg-purple-600 text-white";
      case "all-in":
        return "bg-orange-500 hover:bg-orange-600 text-white";
      case "no action":
        return "bg-gray-300 hover:bg-gray-400 text-gray-700";
      default:
        return "bg-gray-200 text-gray-700 hover:bg-gray-300";
    }
  }, o = (l) => {
    l === "all-in" && u || (a(l), l === "bet" || l === "raise" ? setTimeout(() => {
      const x = `amount-input-${t}${h || ""}`, g = document.querySelector(`#${x}`);
      g && (g.focus(), g.select());
    }, 100) : c && setTimeout(() => {
      c(l);
    }, 100));
  }, f = (l) => {
    const x = b.includes(l.value), g = n === l.value, p = (!x || u && l.value !== "all-in") && !(l.value === "all-in" && u);
    let r = "px-2 py-1 rounded text-xs font-medium transition-all flex-1 relative outline-none ";
    return l.value === "all-in" && u ? r += `${s("all-in", !0)} ring-2 ring-blue-400` : p ? r += "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50" : g ? r += `${s(l.value, !0)} ring-2 ring-blue-400` : r += s(l.value, !1), /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        disabled: p,
        onMouseDown: (y) => y.preventDefault(),
        onClick: () => o(l.value),
        title: `${l.label} (${l.shortcut})`,
        tabIndex: -1,
        className: r,
        children: /* @__PURE__ */ i("div", { className: "flex flex-col items-center justify-center leading-tight", children: [
          /* @__PURE__ */ e("div", { className: "text-xs font-medium", children: l.label }),
          /* @__PURE__ */ e("div", { className: "text-[10px] opacity-70 mt-0.5", children: l.shortcut })
        ] })
      },
      l.value
    );
  };
  return /* @__PURE__ */ i("div", { className: "space-y-0.5", children: [
    /* @__PURE__ */ e("div", { className: "text-xs text-gray-500 mb-0.5", children: "x | c | b | r | f | a | n" }),
    /* @__PURE__ */ e("div", { className: "flex gap-0.5", children: d.slice(0, 4).map((l) => f(l)) }),
    /* @__PURE__ */ e("div", { className: "flex gap-0.5", children: d.slice(4).map((l) => f(l)) })
  ] });
};
function Pt({
  playerId: t,
  selectedAmount: n,
  selectedAction: a,
  selectedUnit: b,
  suffix: u = "",
  isForcedAllIn: h = !1,
  isDisabled: c = !1,
  defaultUnit: d = "K",
  // FR-12: Validation props
  stage: s,
  actionLevel: o,
  players: f,
  playerData: l,
  sectionStacks: x,
  onAmountChange: g,
  onUnitChange: p,
  onTabComplete: r
}) {
  const [y, m] = $e(n || ""), v = rt(null);
  nt(() => {
    n != null && n !== "" && m(n);
  }, [n, t, u]), nt(() => {
    (a === "bet" || a === "raise") && v.current && !h && requestAnimationFrame(() => {
      v.current && (v.current.focus(), v.current.select());
    });
  }, [a, h, t]);
  const N = (j) => {
    const F = j.target.value.replace(/[^0-9.]/g, "");
    m(F), g && g(t, F, u);
  }, A = () => (g && g(t, y, u), !0), $ = (j) => {
    if (j.currentTarget.dataset.skipBlur === "true") {
      delete j.currentTarget.dataset.skipBlur;
      return;
    }
    A();
  }, S = (j) => {
    if (console.log(`🎹 [AmountInput] Key pressed: "${j.key}" for player ${t}${u}`), j.key === "Tab" && j.shiftKey) {
      console.log(`🔙 [AmountInput] Shift+Tab pressed for player ${t}${u}`), j.preventDefault(), A(), console.log("⚠️ [AmountInput] Shift+Tab - letting default behavior handle for now"), j.currentTarget.dataset.skipBlur = "true";
      return;
    }
    if (j.key === "Tab" && !j.shiftKey) {
      console.log(`➡️ [AmountInput] Tab pressed for player ${t}${u}`), j.preventDefault(), console.log("🔍 [AmountInput] Validating amount before navigation..."), A(), console.log("✅ [AmountInput] Validation passed"), r ? (console.log("🔄 [AmountInput] onTabComplete callback exists, calling it"), setTimeout(() => {
        console.log("🚀 [AmountInput] Executing onTabComplete callback"), r();
      }, 100)) : (console.log("⚠️ [AmountInput] WARNING: No onTabComplete callback provided!"), console.log("💡 [AmountInput] This means Tab navigation from amount input won't work")), j.currentTarget.dataset.skipBlur = "true";
      return;
    }
    j.key === "Enter" && (console.log(`⏎ [AmountInput] Enter key pressed for player ${t}${u}`), A(), console.log("✅ [AmountInput] Enter key - validation passed"), r && (console.log("🔄 [AmountInput] Calling onTabComplete on Enter"), setTimeout(() => {
      r();
    }, 100)));
  }, _ = `amount-input-${t}${u || ""}`, w = ["actual", "K", "Mil"], P = b || d, D = (j) => {
    p && p(t, j);
  }, C = c || h;
  return /* @__PURE__ */ e(je, { children: /* @__PURE__ */ i("div", { className: "flex flex-row items-center gap-1", children: [
    /* @__PURE__ */ e(
      "input",
      {
        ref: v,
        id: _,
        type: "text",
        placeholder: "000",
        value: y,
        onChange: N,
        onBlur: $,
        readOnly: C,
        disabled: C,
        onKeyDown: S,
        "data-amount-focus": `amount-${t}${u}`,
        className: `w-16 px-2 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500 ${C ? "bg-gray-100 cursor-not-allowed text-gray-600" : ""}`
      }
    ),
    /* @__PURE__ */ e("div", { className: "flex gap-0.5", children: w.map((j) => /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        onClick: () => D(j),
        disabled: C,
        className: `px-2 py-1 rounded text-xs font-medium transition-colors ${P === j ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"} ${C ? "opacity-50 cursor-not-allowed" : ""}`,
        children: j === "actual" ? "None" : j
      },
      j
    )) })
  ] }) });
}
const zn = ({
  pots: t,
  onConfirm: n,
  onCancel: a
}) => {
  const [b, u] = $e([]), [h, c] = $e([]), d = (l, x, g) => {
    u((p) => {
      const r = p.find((y) => y.potName === l);
      if (r)
        if (r.winnerNames.includes(g)) {
          const m = r.winnerNames.filter((v) => v !== g);
          return m.length === 0 ? p.filter((v) => v.potName !== l) : p.map(
            (v) => v.potName === l ? { ...v, winnerNames: m } : v
          );
        } else
          return p.map(
            (m) => m.potName === l ? { ...m, winnerNames: [...m.winnerNames, g] } : m
          );
      else
        return [...p, { potName: l, potType: x, winnerNames: [g] }];
    }), c([]);
  }, s = () => {
    const l = [];
    if (t.forEach((x) => {
      b.find((p) => p.potName === x.name) || l.push(`Please select a winner for ${x.name}`);
    }), l.length > 0) {
      c(l);
      return;
    }
    n(b);
  }, o = (l) => b.find((x) => x.potName === l)?.winnerNames || [], f = (l, x) => o(l).includes(x);
  return /* @__PURE__ */ e("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ i("div", { className: "bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6", children: [
    /* @__PURE__ */ i("div", { className: "mb-6", children: [
      /* @__PURE__ */ e("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "🏆 Select Winners" }),
      /* @__PURE__ */ e("p", { className: "text-gray-600", children: "Select winner(s) for each pot. Click multiple players to split the pot equally. Only eligible players can be selected." })
    ] }),
    h.length > 0 && /* @__PURE__ */ i("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg", children: [
      /* @__PURE__ */ e("h3", { className: "text-red-800 font-semibold mb-2", children: "⚠️ Please fix the following:" }),
      /* @__PURE__ */ e("ul", { className: "list-disc list-inside space-y-1", children: h.map((l, x) => /* @__PURE__ */ e("li", { className: "text-red-700 text-sm", children: l }, x)) })
    ] }),
    /* @__PURE__ */ e("div", { className: "space-y-6 mb-6", children: t.map((l) => {
      const x = o(l.name), g = x.length > 0 ? l.amount / x.length : 0;
      return /* @__PURE__ */ i(
        "div",
        {
          className: "border border-gray-300 rounded-lg p-4 bg-gray-50",
          children: [
            /* @__PURE__ */ i("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ i("div", { children: [
                /* @__PURE__ */ e("h3", { className: "text-lg font-semibold text-gray-900", children: l.name }),
                /* @__PURE__ */ i("p", { className: "text-sm text-gray-600", children: [
                  "Total: ",
                  /* @__PURE__ */ e("span", { className: "font-mono font-semibold", children: l.amount.toLocaleString() }),
                  " ",
                  "(",
                  l.percentage.toFixed(1),
                  "%)"
                ] }),
                x.length > 1 && /* @__PURE__ */ i("p", { className: "text-sm text-blue-600 font-semibold mt-1", children: [
                  "Split ",
                  x.length,
                  " ways: ",
                  g.toLocaleString(),
                  " each"
                ] })
              ] }),
              x.length > 0 && /* @__PURE__ */ i("div", { className: "text-green-600 font-semibold flex items-center", children: [
                /* @__PURE__ */ e("span", { className: "mr-2", children: "✓" }),
                x.length,
                " winner",
                x.length > 1 ? "s" : ""
              ] })
            ] }),
            x.length > 0 && /* @__PURE__ */ i("div", { className: "mb-3 p-2 bg-green-50 border border-green-200 rounded-lg", children: [
              /* @__PURE__ */ e("p", { className: "text-sm text-green-800 font-semibold mb-1", children: "Selected:" }),
              /* @__PURE__ */ e("div", { className: "flex flex-wrap gap-2", children: x.map((p) => /* @__PURE__ */ e("span", { className: "px-2 py-1 bg-green-600 text-white text-sm rounded-md", children: p }, p)) })
            ] }),
            /* @__PURE__ */ i("div", { children: [
              /* @__PURE__ */ e("p", { className: "text-sm text-gray-600 mb-2", children: x.length === 0 ? "Select winner(s):" : "Click to add/remove winners:" }),
              /* @__PURE__ */ e("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2", children: l.eligible.map((p) => {
                const r = f(l.name, p);
                return /* @__PURE__ */ e(
                  "button",
                  {
                    onClick: () => d(l.name, l.type, p),
                    className: `
                            px-4 py-2 rounded-lg font-medium transition-all
                            ${r ? "bg-green-600 text-white shadow-md scale-105" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"}
                          `,
                    children: p
                  },
                  p
                );
              }) })
            ] })
          ]
        },
        l.name
      );
    }) }),
    /* @__PURE__ */ i("div", { className: "mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg", children: [
      /* @__PURE__ */ e("h3", { className: "text-blue-900 font-semibold mb-2", children: "📊 Selection Summary" }),
      /* @__PURE__ */ e("div", { className: "space-y-2", children: t.map((l) => {
        const x = b.find((p) => p.potName === l.name), g = x && x.winnerNames.length > 0 ? l.amount / x.winnerNames.length : 0;
        return /* @__PURE__ */ i("div", { className: "text-sm", children: [
          /* @__PURE__ */ i("span", { className: "text-blue-800 font-medium", children: [
            l.name,
            ":"
          ] }),
          " ",
          x && x.winnerNames.length > 0 ? /* @__PURE__ */ i("div", { className: "ml-4 mt-1", children: [
            x.winnerNames.map((p, r) => /* @__PURE__ */ i("div", { className: "text-blue-900", children: [
              /* @__PURE__ */ e("span", { className: "font-semibold", children: p }),
              x.winnerNames.length > 1 && /* @__PURE__ */ i("span", { className: "text-blue-700 ml-2", children: [
                "(",
                g.toLocaleString(),
                ")"
              ] })
            ] }, p)),
            x.winnerNames.length > 1 && /* @__PURE__ */ i("div", { className: "text-blue-600 text-xs italic mt-1", children: [
              "Split ",
              x.winnerNames.length,
              " ways"
            ] })
          ] }) : /* @__PURE__ */ e("span", { className: "text-blue-600 italic", children: "Not selected" })
        ] }, l.name);
      }) })
    ] }),
    /* @__PURE__ */ i("div", { className: "flex justify-end space-x-3", children: [
      /* @__PURE__ */ e(
        "button",
        {
          onClick: a,
          className: "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          onClick: s,
          className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md",
          children: "Confirm Winners & Generate Next Hand"
        }
      )
    ] })
  ] }) });
};
function qn(t, n, a, b) {
  const u = {};
  return t.forEach((h) => {
    const c = h.stack;
    let d = 0;
    b && (d = b.find((o) => o.playerName === h.name)?.amount || 0), u[h.name] = c - d, console.log(`[calculateNewStacks] ${h.name}: ${c} - ${d} = ${u[h.name]}`);
  }), a.forEach((h) => {
    const c = n.find((f) => f.name === h.potName);
    if (!c) {
      console.error(`Pot ${h.potName} not found`);
      return;
    }
    const d = h.winnerNames;
    if (!d || d.length === 0) {
      console.error(`No winners selected for ${c.name}`);
      return;
    }
    const s = d.filter((f) => !c.eligible.includes(f));
    if (s.length > 0) {
      console.error(`Ineligible winners for ${c.name}: ${s.join(", ")}`);
      return;
    }
    const o = c.amount / d.length;
    console.log(`[calculateNewStacks] Splitting ${c.name} (${c.amount}) among ${d.length} winner(s): ${o.toFixed(2)} each`), d.forEach((f) => {
      u[f] += o, console.log(`[calculateNewStacks] ${f} receives ${o.toFixed(2)} from ${c.name}, new stack: ${u[f].toFixed(2)}`);
    });
  }), u;
}
const Ut = {
  2: ["Dealer", "BB"],
  // Heads-up: Dealer posts SB
  3: ["Dealer", "SB", "BB"],
  4: ["Dealer", "SB", "BB", "UTG"],
  5: ["Dealer", "SB", "BB", "UTG", "CO"],
  6: ["Dealer", "SB", "BB", "UTG", "MP", "CO"],
  7: ["Dealer", "SB", "BB", "UTG", "MP", "HJ", "CO"],
  8: ["Dealer", "SB", "BB", "UTG", "UTG+1", "MP", "HJ", "CO"],
  9: ["Dealer", "SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "HJ", "CO"]
};
function Jn(t, n) {
  const a = t.length, b = Ut[a];
  if (!b)
    throw new Error(`Unsupported player count: ${a}`);
  const u = t.findIndex((o) => o.position === "Dealer");
  if (u === -1)
    throw new Error("Dealer not found in current hand");
  const h = t[u], c = h.stack === 0;
  console.log(`🎯 [generateNextHand] Current dealer: ${h.name} (${h.position}), started with ${h.stack} chips`), console.log(`🎯 [generateNextHand] Dealer started with 0? ${c}`);
  const d = new Map(t.map((o) => [o.name, o.position])), s = [];
  for (let o = 0; o < a; o++) {
    const f = (u + 1 + o) % a, l = t[f], x = b[o], g = l.stack, p = n[l.name], r = p - g;
    s.push({
      name: l.name,
      position: x,
      stack: p,
      previousStack: g,
      netChange: r
    });
  }
  if (c && a >= 3) {
    console.log(`🚫 [generateNextHand] Removing ${h.name} (was Dealer with 0 chips)`);
    const o = s.filter((f) => f.name !== h.name);
    if (a === 3 && o.length === 2) {
      console.log("🎯 [generateNextHand] Transitioning from 3-player to 2-player (heads-up)");
      const f = o.find((x) => d.get(x.name) === "BB"), l = o.find((x) => d.get(x.name) === "SB");
      f && l ? (console.log(`🔄 [generateNextHand] Heads-up transition: ${f.name} (was BB) → Dealer, ${l.name} (was SB) → BB`), f.position = "Dealer", l.position = "BB") : console.error("⚠️ [generateNextHand] Could not find original BB/SB for heads-up transition");
    } else if (a >= 4) {
      const f = o.length, l = Ut[f];
      l && (console.log(`🔄 [generateNextHand] Reassigning positions for ${f} players`), o.forEach((x, g) => {
        x.position = l[g], console.log(`   ${x.name}: ${l[g]}`);
      }));
    }
    return console.log(`✅ [generateNextHand] Next hand has ${o.length} players (removed ${h.name})`), o;
  }
  return s;
}
function Xn(t, n) {
  const a = [], b = t.length, u = n.length;
  if (b !== u)
    return console.log(`⚠️ [validateButtonRotation] Player count changed from ${b} to ${u}, skipping rotation validation (0-chip dealer removed)`), {
      isValid: !0,
      errors: []
    };
  const h = t.find((s) => s.position === "SB"), c = t.find((s) => s.position === "BB"), d = t.find((s) => s.position === "Dealer");
  if (b === 2) {
    const s = n.find((f) => f.position === "Dealer"), o = n.find((f) => f.position === "BB");
    !s || !o ? a.push("Dealer or BB not found in next hand") : (c && s.name !== c.name && a.push(`Button rotation wrong: ${c.name} (prev BB) should be new Dealer, got ${s.name}`), d && o.name !== d.name && a.push(`Button rotation wrong: ${d.name} (prev Dealer) should be new BB, got ${o.name}`));
  } else {
    const s = n.find((o) => o.position === "Dealer");
    s ? h && s.name !== h.name && a.push(`Button rotation wrong: ${h.name} (prev SB) should be Dealer, got ${s.name}`) : a.push("No dealer found in next hand");
  }
  return {
    isValid: a.length === 0,
    errors: a
  };
}
function Yn(t, n) {
  const a = [], b = t.find((o) => o.position === "Dealer"), u = b && b.stack === 0;
  if (t.length !== n.length)
    if (u && t.length === n.length + 1) {
      console.log(`✅ [validateAllPlayersPresent] Player count decreased by 1 (${t.length} → ${n.length}), 0-chip dealer removed: ${b?.name}`);
      const o = new Set(t.map((x) => x.name)), f = new Set(n.map((x) => x.name)), l = Array.from(o).filter((x) => !f.has(x));
      if (l.length === 1 && l[0] === b?.name)
        return {
          isValid: !0,
          errors: []
        };
      a.push(`Expected only ${b?.name} to be removed, but missing: ${l.join(", ")}`);
    } else
      a.push(`Player count mismatch: ${t.length} current, ${n.length} next`);
  const h = new Set(t.map((o) => o.name)), c = new Set(n.map((o) => o.name)), d = Array.from(h).filter((o) => !c.has(o)), s = Array.from(c).filter((o) => !h.has(o));
  if (d.length > 0 || s.length > 0) {
    if (u && d.length === 1 && d[0] === b?.name && s.length === 0)
      return {
        isValid: !0,
        errors: []
      };
    a.push(`Players mismatch. Missing: ${d.join(", ")}, Extra: ${s.join(", ")}`);
  }
  return {
    isValid: a.length === 0,
    errors: a
  };
}
function Qn(t, n) {
  const a = [];
  return t.forEach((b) => {
    const u = n.find((h) => h.potName === b.name);
    if (!u)
      a.push(`No winner selected for ${b.name}`);
    else if (!u.winnerNames || u.winnerNames.length === 0)
      a.push(`No winners selected for ${b.name}`);
    else {
      const h = u.winnerNames.filter((c) => !b.eligible.includes(c));
      h.length > 0 && a.push(`Ineligible winners for ${b.name}: ${h.join(", ")}. Eligible: ${b.eligible.join(", ")}`);
    }
  }), {
    isValid: a.length === 0,
    errors: a
  };
}
function Zn(t) {
  const n = [];
  return t.forEach((a) => {
    a.stack < 0 && n.push(`${a.name} has negative stack: ${a.stack}`);
  }), {
    isValid: n.length === 0,
    errors: n
  };
}
function eo(t, n, a, b) {
  const u = [], h = Qn(a, b);
  u.push(...h.errors);
  const c = Xn(t, n);
  u.push(...c.errors);
  const d = Yn(t, n);
  u.push(...d.errors);
  const s = Zn(n);
  return u.push(...s.errors), {
    isValid: u.length === 0,
    errors: u
  };
}
function to(t, n, a, b) {
  console.log("🎯 Processing winners and generating next hand..."), console.log("Current players count:", t.length), console.log("Current players details:", t.map((s) => ({ id: s.id, name: s.name, position: s.position, stack: s.stack }))), console.log("Winner selections:", a), console.log("Player contributions:", b);
  const u = t.filter((s) => s.name && s.name.trim() !== "");
  u.length !== t.length && console.warn(`⚠️ Filtered out ${t.length - u.length} invalid players`);
  const h = qn(u, n, a, b);
  console.log("New stacks:", h);
  const c = Jn(u, h);
  console.log("Next hand:", c);
  const d = eo(u, c, n, a);
  return d.isValid ? console.log("✅ Validation passed") : console.error("❌ Validation failed:", d.errors), {
    nextHand: c,
    validation: d,
    newStacks: h
  };
}
const Ht = ({ player: t, isAllIn: n, isExcluded: a }) => /* @__PURE__ */ i("div", { className: `inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm transition-all hover:shadow-md ${a ? "bg-gray-100 text-gray-400 opacity-70" : n ? "bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-500 text-gray-900" : "bg-white text-gray-900 shadow-sm hover:-translate-y-0.5"}`, children: [
  /* @__PURE__ */ e("div", { className: "w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0", children: t.name[0] }),
  /* @__PURE__ */ e("span", { className: "text-sm", children: t.name }),
  n && !a && /* @__PURE__ */ e("span", { className: "text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-extrabold tracking-wide", children: "ALL-IN" }),
  a && /* @__PURE__ */ e("span", { className: "text-xs", children: "(excluded)" })
] }), no = ({ potInfo: t, isExpanded: n, onToggle: a, headerColorClasses: b, winners: u }) => {
  const h = t.potType === "main" ? "🏆" : t.potNumber === 1 ? "💼" : "💎", c = t.potType === "main" ? "Main Pot" : `Side Pot ${t.potNumber}`, d = t.potType === "main" ? "All active players eligible" : `Players above ${t.potNumber === 1 ? "1st" : "2nd"} all-in`, s = t.eligiblePlayers, o = t.excludedPlayers || [];
  return /* @__PURE__ */ i(
    "div",
    {
      className: `${b} p-5 cursor-pointer transition-opacity hover:opacity-95`,
      onClick: a,
      children: [
        /* @__PURE__ */ i("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ i("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ e("div", { className: "text-3xl drop-shadow-md", children: h }),
            /* @__PURE__ */ i("div", { children: [
              /* @__PURE__ */ i("div", { className: "flex items-center gap-3 mb-1", children: [
                /* @__PURE__ */ e("h3", { className: "text-2xl font-extrabold text-white drop-shadow-md", children: c }),
                u && u.length > 0 && /* @__PURE__ */ e("div", { className: "flex gap-1.5 flex-wrap", children: u.map((f) => /* @__PURE__ */ i(
                  "span",
                  {
                    className: "px-2.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded-md shadow-md border border-red-700",
                    children: [
                      "🏆 ",
                      f
                    ]
                  },
                  f
                )) })
              ] }),
              /* @__PURE__ */ e("div", { className: "text-sm text-white/95 font-semibold", children: d })
            ] })
          ] }),
          /* @__PURE__ */ i("div", { className: "flex items-center gap-6", children: [
            /* @__PURE__ */ i("div", { className: "text-right", children: [
              /* @__PURE__ */ i("div", { className: "text-3xl font-black text-white drop-shadow-lg", children: [
                "$",
                t.amount.toLocaleString()
              ] }),
              /* @__PURE__ */ i("div", { className: "text-xs text-white/90 font-semibold", children: [
                s.length,
                " player",
                s.length !== 1 ? "s" : ""
              ] })
            ] }),
            /* @__PURE__ */ e(
              "svg",
              {
                className: `w-6 h-6 text-white transition-transform duration-300 ${n ? "rotate-180" : ""}`,
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ e(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 3,
                    d: "M19 9l-7 7-7-7"
                  }
                )
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ i("div", { className: "flex items-center gap-3 flex-wrap p-3 bg-white/15 rounded-lg backdrop-blur-sm", children: [
          /* @__PURE__ */ e("span", { className: "text-xs font-bold text-white/95 uppercase tracking-wide", children: "Eligible:" }),
          /* @__PURE__ */ i("div", { className: "flex gap-2 flex-wrap flex-1", children: [
            s.map((f) => {
              const l = t.contributions.find((x) => x.playerId === f.id);
              return /* @__PURE__ */ e(
                Ht,
                {
                  player: f,
                  isAllIn: l?.isAllIn
                },
                f.id
              );
            }),
            o.map(({ player: f }) => /* @__PURE__ */ e(
              Ht,
              {
                player: f,
                isExcluded: !0
              },
              f.id
            ))
          ] })
        ] })
      ]
    }
  );
}, oo = ({ calculation: t }) => /* @__PURE__ */ i("div", { className: "bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500 rounded-xl p-5 mb-6", children: [
  /* @__PURE__ */ i("div", { className: "flex items-center gap-2 mb-3 text-blue-900 font-bold text-base", children: [
    /* @__PURE__ */ e("span", { children: "📊" }),
    /* @__PURE__ */ e("span", { children: "How this pot was calculated" })
  ] }),
  /* @__PURE__ */ e("div", { className: "bg-white font-mono text-sm p-3 rounded-lg mb-3 text-gray-900", children: t.formula.split(`
`).map((n, a) => /* @__PURE__ */ e("div", { className: "leading-relaxed", children: n.split(/(\$[\d,]+|\d+|[+\-×÷=]|\w+\s+\w+)/).map((b, u) => b.match(/\$[\d,]+|\d+/) ? /* @__PURE__ */ e("span", { className: "text-red-600 font-bold", children: b }, u) : b.match(/[+\-×÷=]/) ? /* @__PURE__ */ e("span", { className: "text-green-600 font-bold", children: b }, u) : /* @__PURE__ */ e("span", { children: b }, u)) }, a)) }),
  /* @__PURE__ */ e("div", { className: "bg-white text-blue-900 font-semibold text-sm px-3 py-2 rounded-md", children: t.result })
] }), ro = ({ streets: t }) => {
  const n = {
    preflop: { border: "border-l-4 border-purple-600", name: "Preflop" },
    flop: { border: "border-l-4 border-blue-600", name: "Flop" },
    turn: { border: "border-l-4 border-red-600", name: "Turn" },
    river: { border: "border-l-4 border-green-600", name: "River" }
  };
  return /* @__PURE__ */ i("div", { className: "border-t-2 border-gray-200 pt-5 mt-5", children: [
    /* @__PURE__ */ i("h4", { className: "text-base font-bold text-gray-900 mb-3 flex items-center gap-2", children: [
      /* @__PURE__ */ e("span", { children: "📈" }),
      /* @__PURE__ */ e("span", { children: "Contributions by Street" })
    ] }),
    /* @__PURE__ */ e("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: t.map((a) => {
      const b = n[a.street];
      return /* @__PURE__ */ i(
        "div",
        {
          className: `bg-white border-2 border-gray-200 ${b.border} rounded-lg p-3.5 transition-all hover:border-purple-600 hover:shadow-md`,
          children: [
            /* @__PURE__ */ e("div", { className: "text-sm font-bold text-gray-900 mb-2", children: b.name }),
            /* @__PURE__ */ i("div", { className: "text-xl font-extrabold text-green-600", children: [
              "$",
              a.amount.toLocaleString()
            ] }),
            /* @__PURE__ */ e("div", { className: "text-xs text-gray-500 mt-1", children: a.detail })
          ]
        },
        a.street
      );
    }) })
  ] });
}, so = ({ title: t, content: n }) => /* @__PURE__ */ i("div", { className: "bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3.5 mt-4", children: [
  /* @__PURE__ */ i("div", { className: "flex items-center gap-2 text-sm font-bold text-yellow-900 mb-2", children: [
    /* @__PURE__ */ e("span", { children: "ℹ️" }),
    /* @__PURE__ */ e("span", { children: t })
  ] }),
  /* @__PURE__ */ e("div", { className: "text-xs text-yellow-900 leading-relaxed", children: n })
] }), Kt = ({ potInfo: t, headerColorClasses: n, winners: a }) => {
  const [b, u] = $e(!1);
  return /* @__PURE__ */ i("div", { className: "bg-white rounded-2xl overflow-hidden shadow-2xl mb-5 transition-all hover:shadow-3xl hover:-translate-y-0.5", children: [
    /* @__PURE__ */ e(
      no,
      {
        potInfo: t,
        isExpanded: b,
        onToggle: () => u(!b),
        headerColorClasses: n,
        winners: a
      }
    ),
    /* @__PURE__ */ e(
      "div",
      {
        className: `overflow-hidden transition-all duration-400 ease-in-out ${b ? "max-h-[3000px]" : "max-h-0"}`,
        children: /* @__PURE__ */ i("div", { className: "p-6 bg-gray-50", children: [
          /* @__PURE__ */ e(oo, { calculation: t.calculation }),
          /* @__PURE__ */ e(ro, { streets: t.streetBreakdown }),
          /* @__PURE__ */ e(
            so,
            {
              title: `About ${t.potType === "main" ? "Main Pot" : `Side Pot ${t.potNumber}`}`,
              content: t.description
            }
          )
        ] })
      }
    )
  ] });
}, Bt = ({
  totalPot: t,
  mainPot: n,
  sidePots: a,
  players: b,
  currentPlayers: u,
  stackData: h,
  actions: c,
  contributedAmounts: d,
  playerData: s
}) => {
  const [o, f] = $e(!1), [l, x] = $e([]), [g, p] = $e(null), [r, y] = $e(""), [m, v] = $e(null), [N, A] = $e([]), [$, S] = $e(!1), [_, w] = $e(""), [P, D] = $e(!1), C = () => {
    const K = [];
    return K.push({
      name: "Main Pot",
      type: "main",
      amount: n.amount,
      eligible: n.eligiblePlayers.map((re) => re.name),
      percentage: n.amount / t * 100
    }), a.forEach((re) => {
      const q = re.potNumber || 1;
      K.push({
        name: `Side Pot ${q}`,
        type: `side${q}`,
        amount: re.amount,
        eligible: re.eligiblePlayers.map((Ne) => Ne.name),
        percentage: re.amount / t * 100
      });
    }), K;
  }, j = (K) => l.find((q) => q.potName === K)?.winnerNames, F = (K, re, q, Ne, Oe) => {
    const De = h.ante || 0, Me = h.smallBlind || 0, be = h.bigBlind || 0, pe = Oe.find((Ve) => Ve.name === K.name)?.position || "", V = pe === "SB", ae = pe === "BB", se = V ? Me : ae ? be : 0, _e = ae ? De : 0, Ee = Ne.get(K.name) || 0, Ie = Ee - se - _e;
    let We = 0;
    return re.forEach((Ve) => {
      if (Ve.winnerNames.includes(K.name)) {
        const Ge = q.find((qe) => qe.name === Ve.potName);
        Ge && (We += Ge.amount / Ve.winnerNames.length);
      }
    }), {
      previousPosition: pe,
      anteContribution: _e,
      // Only BB posts ante
      blindContribution: se,
      actionContribution: Ie,
      totalContribution: Ee,
      potWinnings: We,
      isBlindPosition: V || ae,
      blindType: V ? "SB" : ae ? "BB" : void 0
    };
  }, Y = (K) => {
    console.log("🏆 [WinnerConfirm] Winner selections:", K), console.log("🏆 [WinnerConfirm] Current players:", u), x(K);
    const re = C();
    console.log("🏆 [WinnerConfirm] Converted pots:", re);
    const q = /* @__PURE__ */ new Map();
    u.forEach((pe) => {
      const V = s[pe.id];
      if (!V) return;
      const ae = pe.position?.toLowerCase();
      let se = 0;
      ae === "sb" && typeof V.postedSB == "number" && (se += V.postedSB, console.log(`💰 [Blind] ${pe.name} (SB): ${se}`)), ae === "bb" && (typeof V.postedBB == "number" && (se += V.postedBB, console.log(`💰 [Blind] ${pe.name} (BB): ${V.postedBB}`)), typeof V.postedAnte == "number" && (se += V.postedAnte, console.log(`💰 [Ante] ${pe.name} (BB): ${V.postedAnte}`))), se > 0 && q.set(pe.name, se);
    }), Object.entries(d).forEach(([pe, V]) => {
      Object.entries(V).forEach(([ae, se]) => {
        const _e = parseInt(ae), Ee = u.find((Ie) => Ie.id === _e);
        if (Ee && se > 0) {
          const Ie = q.get(Ee.name) || 0;
          q.set(Ee.name, Ie + se), console.log(`💰 [Contribution] ${Ee.name}: +${se} from ${pe}, total: ${Ie + se}`);
        }
      });
    });
    const Ne = Array.from(q.entries()).map(([pe, V]) => ({
      playerName: pe,
      amount: V
    }));
    console.log("🏆 [WinnerConfirm] Player contributions:", Ne);
    const Oe = to(u, re, K, Ne);
    console.log("🏆 [WinnerConfirm] Next hand result:", Oe.nextHand), console.log("🏆 [WinnerConfirm] Validation:", Oe.validation);
    const De = Oe.nextHand.map((pe) => ({
      ...pe,
      breakdown: F(pe, K, re, q, u)
    }));
    p(De), v(Oe.validation);
    const Me = parseInt(h.handNumber?.replace(/[^0-9]/g, "") || "1") + 1, be = Oe.nextHand.map((pe) => ({ name: pe.name, position: pe.position, stack: pe.stack }));
    console.log("🏆 [WinnerConfirm] Player data for formatting:", be);
    const Te = Vn(
      Me.toString(),
      h.startedAt || "00:00:00",
      h.smallBlind || 0,
      h.bigBlind || 0,
      h.ante || 0,
      be
    );
    console.log("🏆 [WinnerConfirm] Formatted hand:", Te), y(Te), f(!1);
  }, ne = async () => {
    if (r)
      try {
        console.log("📋 [CopyNextHand] Copying next hand to clipboard..."), console.log("📋 [CopyNextHand] nextHandFormatted:", r), console.log("📋 [CopyNextHand] Type:", typeof r), console.log("📋 [CopyNextHand] Length:", r.length), await navigator.clipboard.writeText(r), console.log("💾 [CopyNextHand] Storing in state.generatedNextHand..."), c.setGeneratedNextHand(r), console.log("✅ [CopyNextHand] Stored successfully"), alert(`✅ Next hand copied to clipboard and ready to load!

Go to Stack Setup and click "Load Next Hand" button.`);
      } catch (K) {
        console.error("Failed to copy to clipboard:", K), alert("❌ Failed to copy to clipboard");
      }
  }, oe = async () => {
    if (r)
      try {
        console.log("🔄 [LoadNextHand] Loading next hand..."), await navigator.clipboard.writeText(r), console.log("💾 [LoadNextHand] Storing in state.generatedNextHand..."), c.setGeneratedNextHand(r), c.setStackData({ ...h, rawInput: r }), console.log("✅ [LoadNextHand] Stored in stackData.rawInput"), c.setCurrentView("stack"), console.log("✅ [LoadNextHand] Navigated to Stack Setup");
      } catch (K) {
        console.error("Failed to load next hand:", K), alert("❌ Failed to load next hand");
      }
  }, me = async () => {
    if (_)
      try {
        console.log("🔄 [LoadGSHand] Loading GS hand..."), await navigator.clipboard.writeText(_), c.setStackData({ ...h, rawInput: _ }), console.log("✅ [LoadGSHand] Stored GS hand in stackData.rawInput"), c.setCurrentView("stack"), console.log("✅ [LoadGSHand] Navigated to Stack Setup"), alert("✅ GS hand loaded in Stack Setup!");
      } catch (K) {
        console.error("Failed to load GS hand:", K), alert("❌ Failed to load GS hand");
      }
  }, Pe = async () => {
    try {
      const K = await navigator.clipboard.readText();
      if (!K.trim()) {
        alert("❌ Clipboard is empty");
        return;
      }
      w(K);
      const re = bt(r), q = bt(K);
      if (!re || !q) {
        alert("❌ Failed to parse one or both hands. Please check the format.");
        return;
      }
      const Ne = [];
      Ne.push({
        field: "Hand Number",
        expected: q.header.handNumber,
        actual: re.header.handNumber,
        match: q.header.handNumber === re.header.handNumber
      }), Ne.push({
        field: "Small Blind",
        expected: q.header.sb.toString(),
        actual: re.header.sb.toString(),
        match: q.header.sb === re.header.sb
      }), Ne.push({
        field: "Big Blind",
        expected: q.header.bb.toString(),
        actual: re.header.bb.toString(),
        match: q.header.bb === re.header.bb
      }), Ne.push({
        field: "Ante",
        expected: q.header.ante.toString(),
        actual: re.header.ante.toString(),
        match: q.header.ante === re.header.ante
      }), Ne.push({
        field: "Player Count",
        expected: q.players.length.toString(),
        actual: re.players.length.toString(),
        match: q.players.length === re.players.length
      });
      const Oe = Math.max(q.players.length, re.players.length);
      for (let De = 0; De < Oe; De++) {
        const Me = q.players[De], be = re.players[De];
        if (Me && be) {
          Ne.push({
            field: `Player ${De + 1} Name`,
            expected: Me.name,
            actual: be.name,
            match: Me.name === be.name
          });
          const Te = Me.position?.toLowerCase(), pe = be.position?.toLowerCase(), V = (ae) => ae ? ae === "dealer" || ae === "sb" || ae === "bb" : !1;
          (V(Te) || V(pe)) && Ne.push({
            field: `Player ${De + 1} Position`,
            expected: Me.position || "(none)",
            actual: be.position || "(none)",
            match: Me.position === be.position
          }), Ne.push({
            field: `Player ${De + 1} Stack`,
            expected: Me.stack.toLocaleString(),
            actual: be.stack.toLocaleString(),
            match: Me.stack === be.stack
          });
        } else Me ? Ne.push({
          field: `Player ${De + 1}`,
          expected: `${Me.name} (${Me.position || "no pos"}) ${Me.stack}`,
          actual: "(missing)",
          match: !1
        }) : be && Ne.push({
          field: `Player ${De + 1}`,
          expected: "(missing)",
          actual: `${be.name} (${be.position || "no pos"}) ${be.stack}`,
          match: !1
        });
      }
      A(Ne), S(!0);
    } catch (K) {
      console.error("Failed to paste and compare:", K), alert("❌ Failed to read from clipboard or compare hands");
    }
  }, Ae = async () => {
    const K = N.filter((q) => !q.match);
    if (K.length === 0) {
      alert("✅ No failures to copy - all fields match!");
      return;
    }
    const re = K.map((q) => `${q.field}: Expected "${q.expected}" but got "${q.actual}"`).join(`
`);
    try {
      await navigator.clipboard.writeText(re), alert(`✅ Copied ${K.length} failure(s) to clipboard!`);
    } catch (q) {
      console.error("Failed to copy failures:", q), alert("❌ Failed to copy to clipboard");
    }
  };
  return /* @__PURE__ */ i("div", { className: "max-w-4xl mx-auto p-5", children: [
    /* @__PURE__ */ i("div", { className: "bg-white rounded-2xl p-8 mb-8 shadow-2xl", children: [
      /* @__PURE__ */ e("h1", { className: "text-3xl font-extrabold text-gray-900 mb-2", children: "💰 Pot Calculation Display" }),
      /* @__PURE__ */ e("p", { className: "text-gray-600", children: "Clear breakdown of main pot and side pots" })
    ] }),
    /* @__PURE__ */ i("div", { className: "bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 mb-6 text-white shadow-2xl", children: [
      /* @__PURE__ */ i("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ e("div", { className: "text-lg font-semibold opacity-90", children: "Total Pot" }),
        /* @__PURE__ */ i("div", { className: "text-5xl font-black drop-shadow-lg", children: [
          "$",
          t.toLocaleString()
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "pt-4 border-t border-white/20 text-sm opacity-95", children: [
        "Main Pot: $",
        n.amount.toLocaleString(),
        a.map((K, re) => /* @__PURE__ */ i("span", { children: [
          " | ",
          "Side Pot ",
          K.potNumber,
          ": $",
          K.amount.toLocaleString()
        ] }, re))
      ] })
    ] }),
    /* @__PURE__ */ e(
      Kt,
      {
        potInfo: n,
        headerColorClasses: "bg-gradient-to-br from-yellow-400 to-yellow-500",
        winners: j("Main Pot")
      }
    ),
    a.map((K, re) => {
      const q = re === 0 ? "bg-gradient-to-br from-blue-400 to-blue-500" : "bg-gradient-to-br from-purple-400 to-purple-500", Ne = `Side Pot ${K.potNumber || 1}`;
      return /* @__PURE__ */ e(
        Kt,
        {
          potInfo: K,
          headerColorClasses: q,
          winners: j(Ne)
        },
        K.potNumber
      );
    }),
    /* @__PURE__ */ e("div", { className: "mt-8 mb-6", children: /* @__PURE__ */ e(
      "button",
      {
        onClick: () => f(!0),
        className: "w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold py-4 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg flex items-center justify-center text-lg",
        children: "🏆 Select Winners"
      }
    ) }),
    o && /* @__PURE__ */ e(
      zn,
      {
        pots: C(),
        onConfirm: Y,
        onCancel: () => f(!1)
      }
    ),
    g && /* @__PURE__ */ i("div", { className: "bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-6 mt-8", children: [
      /* @__PURE__ */ i(
        "div",
        {
          className: "flex justify-between items-center cursor-pointer mb-4",
          onClick: () => D(!P),
          children: [
            /* @__PURE__ */ e("h3", { className: "text-2xl font-bold text-purple-900", children: "🔄 Next Hand Generated" }),
            /* @__PURE__ */ e(
              "svg",
              {
                className: `w-6 h-6 text-purple-900 transition-transform duration-300 ${P ? "rotate-180" : ""}`,
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ e(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 3,
                    d: "M19 9l-7 7-7-7"
                  }
                )
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ i("div", { className: "mb-6 bg-white rounded-lg border-2 border-gray-300 p-4", children: [
        /* @__PURE__ */ e("h4", { className: "text-lg font-bold mb-2 text-gray-700", children: "📋 Formatted Next Hand:" }),
        /* @__PURE__ */ e("pre", { className: "font-mono text-xs leading-relaxed whitespace-pre-wrap text-gray-900", children: r })
      ] }),
      P && /* @__PURE__ */ i("div", { className: "transition-all duration-300 ease-in-out", children: [
        /* @__PURE__ */ e("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6", children: g.map((K) => {
          const re = K.breakdown;
          return re ? /* @__PURE__ */ i("div", { className: `p-4 rounded-lg ${K.stack > 0 ? "bg-green-100 border-green-400" : "bg-red-100 border-red-400"} border-2`, children: [
            /* @__PURE__ */ e("div", { className: "font-bold text-lg", children: K.name }),
            /* @__PURE__ */ i("div", { className: "text-sm mb-3", children: [
              re.previousPosition && /* @__PURE__ */ i("span", { className: "text-gray-600", children: [
                "Previous: ",
                /* @__PURE__ */ e("span", { className: "font-semibold", children: re.previousPosition }),
                /* @__PURE__ */ e("span", { className: "mx-1", children: "→" })
              ] }),
              /* @__PURE__ */ i("span", { className: "text-blue-600 font-semibold", children: [
                "Next: ",
                K.position
              ] })
            ] }),
            /* @__PURE__ */ i("div", { className: "bg-white rounded-lg p-3 mb-2 text-xs font-mono", children: [
              /* @__PURE__ */ e("div", { className: "font-bold text-gray-700 mb-2", children: "Stack Calculation:" }),
              /* @__PURE__ */ i("div", { className: "text-gray-900", children: [
                "Starting: ",
                /* @__PURE__ */ e("span", { className: "font-bold", children: K.previousStack.toLocaleString() })
              ] }),
              re.anteContribution > 0 && /* @__PURE__ */ i("div", { className: "text-red-600", children: [
                "- ",
                re.anteContribution.toLocaleString(),
                " (Ante)"
              ] }),
              re.blindContribution > 0 && /* @__PURE__ */ i("div", { className: "text-red-600", children: [
                "- ",
                re.blindContribution.toLocaleString(),
                " (",
                re.blindType,
                ")"
              ] }),
              re.actionContribution > 0 && /* @__PURE__ */ i("div", { className: "text-red-600", children: [
                "- ",
                re.actionContribution.toLocaleString(),
                " (Action)"
              ] }),
              /* @__PURE__ */ i("div", { className: "border-t border-gray-300 mt-1 pt-1 text-gray-700", children: [
                "= ",
                (K.previousStack - re.anteContribution - re.totalContribution).toLocaleString()
              ] }),
              re.potWinnings > 0 && /* @__PURE__ */ i(je, { children: [
                /* @__PURE__ */ i("div", { className: "text-green-600 font-bold mt-1", children: [
                  "+ ",
                  re.potWinnings.toLocaleString(),
                  " (Won)"
                ] }),
                /* @__PURE__ */ i("div", { className: "border-t-2 border-gray-400 mt-1 pt-1 text-gray-900 font-bold", children: [
                  "= ",
                  K.stack.toLocaleString()
                ] })
              ] }),
              re.potWinnings === 0 && /* @__PURE__ */ i("div", { className: "border-t-2 border-gray-400 mt-1 pt-1 text-gray-900 font-bold", children: [
                "Final: ",
                K.stack.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ i("div", { className: `text-center text-sm font-semibold ${K.netChange > 0 ? "text-green-700" : K.netChange < 0 ? "text-red-700" : "text-gray-600"}`, children: [
              "Net: ",
              K.netChange > 0 ? "+" : "",
              K.netChange.toLocaleString()
            ] })
          ] }, K.name) : null;
        }) }),
        m && /* @__PURE__ */ e("div", { className: `p-4 rounded-lg mb-4 ${m.isValid ? "bg-green-100" : "bg-red-100"}`, children: m.isValid ? /* @__PURE__ */ e("span", { className: "text-green-800 font-semibold", children: "✅ All validations passed" }) : /* @__PURE__ */ i("div", { children: [
          /* @__PURE__ */ e("span", { className: "text-red-800 font-semibold", children: "❌ Validation errors:" }),
          /* @__PURE__ */ e("ul", { className: "list-disc list-inside mt-2", children: m.errors.map((K, re) => /* @__PURE__ */ e("li", { className: "text-red-700 text-sm", children: K }, re)) })
        ] }) })
      ] }),
      /* @__PURE__ */ i("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [
        /* @__PURE__ */ e(
          "button",
          {
            onClick: ne,
            className: "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md",
            children: "📋 Copy Next Hand"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: oe,
            className: "px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md",
            children: "🔄 Load Next Hand"
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "mt-6 border-t-2 border-purple-300 pt-6", children: [
        /* @__PURE__ */ e("h4", { className: "text-lg font-bold mb-4", children: "🔍 Compare with Expected Hand" }),
        /* @__PURE__ */ e("div", { className: "mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg", children: /* @__PURE__ */ i("p", { className: "text-sm text-blue-800", children: [
          "💡 ",
          /* @__PURE__ */ e("span", { className: "font-semibold", children: "Tip:" }),
          ' Copy the GS output for generated next hand and click "Paste & Compare" below'
        ] }) }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: Pe,
            className: "w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md mb-4",
            children: "📋 Paste & Compare"
          }
        ),
        _ && /* @__PURE__ */ i("div", { className: "mb-4", children: [
          /* @__PURE__ */ e("label", { className: "font-semibold block mb-2 text-gray-700", children: "Pasted Expected Hand from GS Tool:" }),
          /* @__PURE__ */ e("pre", { className: "bg-gray-50 border-2 border-gray-300 rounded-lg p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto", children: _ }),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: me,
              className: "mt-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-md",
              children: "🔄 Load GS as Next Hand"
            }
          )
        ] }),
        $ && N.length > 0 && /* @__PURE__ */ i("div", { className: "mt-6", children: [
          /* @__PURE__ */ e("div", { className: `p-4 rounded-lg mb-4 ${N.every((K) => K.match) ? "bg-green-100 border-2 border-green-500" : "bg-red-100 border-2 border-red-500"}`, children: /* @__PURE__ */ i("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ i("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ e("span", { className: "text-3xl", children: N.every((K) => K.match) ? "✅" : "❌" }),
              /* @__PURE__ */ i("div", { children: [
                /* @__PURE__ */ e("h3", { className: "text-lg font-bold", children: N.every((K) => K.match) ? "Perfect Match!" : "Differences Found" }),
                /* @__PURE__ */ i("p", { className: "text-sm", children: [
                  N.filter((K) => K.match).length,
                  " of ",
                  N.length,
                  " fields match (",
                  Math.round(N.filter((K) => K.match).length / N.length * 100),
                  "%)"
                ] })
              ] })
            ] }),
            !N.every((K) => K.match) && /* @__PURE__ */ e(
              "button",
              {
                onClick: Ae,
                className: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md whitespace-nowrap",
                children: "📋 Copy Failures"
              }
            )
          ] }) }),
          /* @__PURE__ */ e("div", { className: "border-2 border-gray-300 rounded-lg overflow-hidden", children: /* @__PURE__ */ i("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ e("thead", { className: "bg-gray-200", children: /* @__PURE__ */ i("tr", { children: [
              /* @__PURE__ */ e("th", { className: "px-4 py-2 text-left font-bold", children: "Field" }),
              /* @__PURE__ */ e("th", { className: "px-4 py-2 text-left font-bold", children: "Expected" }),
              /* @__PURE__ */ e("th", { className: "px-4 py-2 text-left font-bold", children: "Actual" }),
              /* @__PURE__ */ e("th", { className: "px-4 py-2 text-center font-bold", children: "Status" })
            ] }) }),
            /* @__PURE__ */ e("tbody", { children: N.map((K, re) => /* @__PURE__ */ i(
              "tr",
              {
                className: `${K.match ? "bg-green-50" : "bg-red-50"} border-t border-gray-300`,
                children: [
                  /* @__PURE__ */ e("td", { className: "px-4 py-2 font-medium", children: K.field }),
                  /* @__PURE__ */ e("td", { className: "px-4 py-2 font-mono", children: K.expected }),
                  /* @__PURE__ */ e("td", { className: "px-4 py-2 font-mono", children: K.actual }),
                  /* @__PURE__ */ e("td", { className: "px-4 py-2 text-center", children: /* @__PURE__ */ e("span", { className: "text-xl", children: K.match ? "✅" : "❌" }) })
                ]
              },
              re
            )) })
          ] }) })
        ] })
      ] })
    ] })
  ] });
};
function ct(t) {
  if (!t) return "";
  const n = t.toLowerCase();
  return n === "d" || n === "btn" || n === "button" ? "dealer" : n === "u" || n === "utg" ? "utg" : n;
}
function ao(t, n) {
  if (!t) return 0;
  const a = typeof t == "string" ? parseFloat(t) : t;
  return isNaN(a) ? 0 : n === "K" ? a * 1e3 : n === "Mil" ? a * 1e6 : a;
}
function _t(t, n, a, b, u, h, c, d, s) {
  const o = `${t}_${n}`, f = n === "base" ? "" : n === "more" ? "_moreAction" : "_moreAction2";
  console.log(`
` + "═".repeat(60)), console.log(`🔄 PROCESSING (SYNC): ${t.toUpperCase()} - ${n.toUpperCase()}`), console.log(`   Section Key: "${o}"`), console.log("═".repeat(60));
  let l = a.filter((w) => w.name && w.stack > 0);
  const x = l.length;
  let g;
  t === "preflop" ? x === 2 ? g = ["sb", "dealer", "bb"] : x === 3 ? g = ["dealer", "sb", "bb"] : g = ["utg", "utg+1", "utg+2", "lj", "hj", "mp", "mp+1", "mp+2", "co", "dealer", "sb", "bb"] : x === 2 ? g = ["bb", "sb", "dealer"] : x === 3 ? g = ["sb", "bb", "dealer"] : g = ["sb", "bb", "utg", "utg+1", "utg+2", "lj", "hj", "mp", "mp+1", "mp+2", "co", "dealer"], l.sort((w, P) => {
    const D = ct(w.position).toLowerCase(), C = ct(P.position).toLowerCase(), j = g.indexOf(D), F = g.indexOf(C);
    return (j === -1 ? 999 : j) - (F === -1 ? 999 : F);
  }), console.log(`   👥 Initial player order: ${l.map((w) => `${w.name}(${w.position})`).join(" → ")}`);
  const p = {};
  if (t === "preflop" && n === "base")
    console.log(`
🎲 PREFLOP BASE - Building CURRENT stacks AFTER posting blinds`), a.forEach((w) => {
      if (!w.name || w.stack === 0) {
        p[w.id] = 0;
        return;
      }
      const P = b[w.id] || {}, D = ct(w.position);
      let C = w.stack;
      D === "sb" && P.postedSB && (C -= P.postedSB), D === "bb" && (P.postedBB && (C -= P.postedBB), P.postedAnte && (C -= P.postedAnte)), p[w.id] = C, console.log(`   ${w.name}: Current = ${C}`);
    });
  else if (n === "more" || n === "more2") {
    console.log(`
📋 MORE ACTION - Inheriting from previous section`);
    const P = `${t}_${n === "more" ? "base" : "more"}`, D = c[P];
    D && D.updated ? a.forEach((C) => {
      const j = D.updated[C.id];
      p[C.id] = j !== void 0 ? j : C.stack, console.log(`   ${C.name}: Current = ${p[C.id]} (from ${P}.updated)`);
    }) : (console.log("   ⚠️ Previous section not found - using initial stacks"), a.forEach((C) => {
      p[C.id] = C.stack;
    }));
  } else {
    console.log(`
🎴 ${t.toUpperCase()} BASE - Using current stacks from sectionStacks`);
    const w = c[o];
    w && w.current ? a.forEach((P) => {
      const D = w.current[P.id];
      p[P.id] = D !== void 0 ? D : P.stack, console.log(`   ${P.name}: Current = ${p[P.id]} (from ${o}.current)`);
    }) : (console.log("   ⚠️ Section data not found - using initial stacks as fallback"), a.forEach((P) => {
      p[P.id] = P.stack;
    }));
  }
  const r = {};
  if (n === "base")
    console.log(`
💰 BASE section - Loading posted blinds as already contributed`), t === "preflop" ? a.forEach((w) => {
      const P = b[w.id] || {}, D = ct(w.position);
      let C = 0;
      D === "sb" && P.postedSB ? C = P.postedSB : D === "bb" && P.postedBB && (C = P.postedBB), r[w.id] = C, C > 0 && console.log(`   💰 ${w.name} already contributed (blinds): ${C}`);
    }) : a.forEach((w) => {
      r[w.id] = 0;
    });
  else {
    if (console.log(`
📊 MORE/MORE2 section - loading CUMULATIVE previous contributions`), a.forEach((w) => {
      r[w.id] = 0;
    }), t === "preflop" && (console.log("   🎲 Adding posted blinds for preflop..."), a.forEach((w) => {
      const P = b[w.id] || {}, D = ct(w.position);
      D === "sb" && P.postedSB ? (r[w.id] += P.postedSB, console.log(`      ${w.name} (SB): +${P.postedSB} (posted blind)`)) : D === "bb" && P.postedBB && (r[w.id] += P.postedBB, console.log(`      ${w.name} (BB): +${P.postedBB} (posted blind)`));
    })), n === "more") {
      const w = `${t}_base`;
      console.log(`   📊 Adding contributions from ${w}...`), u[w] && a.forEach((P) => {
        const D = u[w][P.id] || 0;
        D > 0 && (r[P.id] += D, console.log(`      ${P.name}: +${D} from ${w}, total now: ${r[P.id]}`));
      });
    } else if (n === "more2") {
      const w = `${t}_base`, P = `${t}_more`;
      console.log(`   📊 Adding contributions from ${w} and ${P}...`), u[w] && a.forEach((D) => {
        const C = u[w][D.id] || 0;
        C > 0 && (r[D.id] += C, console.log(`      ${D.name}: +${C} from ${w}`));
      }), u[P] && a.forEach((D) => {
        const C = u[P][D.id] || 0;
        C > 0 && (r[D.id] += C, console.log(`      ${D.name}: +${C} from ${P}, total now: ${r[D.id]}`));
      });
    }
    console.log("   💰 FINAL cumulative contributions entering this section:"), a.forEach((w) => {
      r[w.id] > 0 && console.log(`      ${w.name}: ${r[w.id]}`);
    });
  }
  let y = 0;
  if (t === "preflop" && n === "base") {
    const w = a.find((P) => ct(P.position) === "bb");
    if (w) {
      const P = b[w.id];
      P && P.postedBB && (y = P.postedBB);
    }
  } else if (n === "more" || n === "more2") {
    const w = Object.values(r).filter((P) => P > 0);
    w.length > 0 && (y = Math.max(...w), console.log(`   🎯 More Action: Using cumulative max from alreadyContributedAmounts: ${y}`));
  }
  console.log(`   💰 Starting maxBetSoFar: ${y}`);
  const m = { ...b }, v = {}, N = {};
  a.forEach((w) => {
    N[w.id] = 0;
  }), l.forEach((w) => {
    const P = b[w.id] || {}, D = `${t}${f}Action`, C = `${t}${f}Amount`, j = `${t}${f}Unit`, F = P[D], Y = P[j] || s;
    console.log(`
🎲 Processing ${w.name}:`), console.log(`   action: ${F}`);
    const ne = p[w.id] || 0;
    let oe = 0;
    if (F === "call") {
      const me = r[w.id] || 0, Pe = y, Ae = Math.max(0, Pe - me);
      console.log("   📞 CALL ACTION:"), console.log(`      alreadyContributed (cumulative): ${me}`), console.log(`      maxBetSoFar (target): ${y}`), console.log(`      additionalNeeded: ${Ae}`), console.log(`      currentStack: ${ne}`);
      let K;
      ne >= Ae ? (K = Pe, oe = Ae, console.log("      ✅ Has enough chips")) : (K = me + ne, oe = ne, console.log("      🔴 NOT enough chips - going all-in"), m[w.id] = {
        ...m[w.id],
        [D]: "all-in"
      }), N[w.id] = oe;
      let re = K;
      Y === "K" ? re = K / 1e3 : Y === "Mil" && (re = K / 1e6), m[w.id] = {
        ...m[w.id],
        [C]: re.toString(),
        [j]: Y
      }, console.log(`      💾 Display amount: ${re} ${Y} (actual: ${oe})`), console.log(`      💾 Stored in ${C}: "${re}"`), console.log(`      💾 Stored in ${j}: "${Y}"`);
    } else if (F === "bet" || F === "raise") {
      const me = P[C];
      if (oe = ao(typeof me == "number" || typeof me == "string" ? me : void 0, Y), console.log(`   💵 ${F.toUpperCase()} ACTION: ${oe}`), oe > y) {
        const re = y;
        y = oe, console.log(`      🎯 Updated maxBetSoFar: ${re} → ${y}`);
      }
      const Ae = r[w.id] || 0, K = Math.max(0, oe - Ae);
      console.log(`      alreadyContributed: ${Ae}`), console.log(`      additionalNeeded: ${K}`), ne >= K ? N[w.id] = K : (N[w.id] = ne, console.log(`      🔴 Not enough for full ${F} - going all-in with ${ne}`), m[w.id] = {
        ...m[w.id],
        [D]: "all-in"
      });
    } else if (F === "all-in") {
      oe = ne, N[w.id] = oe, console.log(`   🔴 ALL-IN: ${oe}`);
      const Pe = (r[w.id] || 0) + oe;
      if (Pe > y) {
        const K = y;
        y = Pe, console.log(`      🎯 Updated maxBetSoFar: ${K} → ${y} (all-in total)`);
      }
      let Ae = Pe;
      Y === "K" ? Ae = Pe / 1e3 : Y === "Mil" && (Ae = Pe / 1e6), m[w.id] = {
        ...m[w.id],
        [C]: Ae,
        [j]: Y
      }, console.log(`      💾 Display amount: ${Ae} ${Y}`);
    } else (F === "fold" || F === "check" || F === "no action") && (N[w.id] = 0, console.log(`   ${F?.toUpperCase() || "NO ACTION"}: No contribution`));
    v[w.id] = ne - N[w.id], console.log(`   📊 Updated stack: ${ne} - ${N[w.id]} = ${v[w.id]}`);
  });
  const A = {
    ...u,
    [o]: N
  }, $ = {
    ...c,
    [o]: {
      initial: p,
      current: p,
      updated: v
    }
  }, S = {
    ...h,
    [o]: !0
  };
  console.log(`
🎰 Calling pot calculation...`);
  const _ = st(
    t,
    n,
    a,
    m,
    A,
    S,
    $,
    d,
    0
    // previousStreetPot - TODO: Add in PHASE 2
  );
  return console.log(`
` + "═".repeat(60)), console.log(`✅ PROCESSING COMPLETE: ${o}`), console.log("═".repeat(60)), {
    success: !0,
    potInfo: _,
    updatedPlayerData: m,
    updatedContributedAmounts: A,
    updatedSectionStacks: $,
    updatedProcessedSections: S
  };
}
function Qe(t, n) {
  if (!t) return 0;
  if (typeof t == "number") {
    const b = t;
    return isNaN(b) || b === 0 ? 0 : n === "K" ? b * 1e3 : n === "Mil" ? b * 1e6 : n === "actual" ? b : n === void 0 ? b < 1e3 ? (console.log(`   🔍 [convertAmount] Unit undefined, amount ${b} < 1000, inferring 'K' format → ${b * 1e3}`), b * 1e3) : (console.log(`   🔍 [convertAmount] Unit undefined, amount ${b} >= 1000, treating as actual value`), b) : b;
  }
  if (t.trim() === "") return 0;
  const a = parseFloat(t.trim());
  return isNaN(a) || a === 0 ? 0 : n === "K" ? a * 1e3 : n === "Mil" ? a * 1e6 : n === "actual" ? a : n === void 0 ? a < 1e3 ? (console.log(`   🔍 [convertAmount] Unit undefined, amount ${a} < 1000, inferring 'K' format → ${a * 1e3}`), a * 1e3) : (console.log(`   🔍 [convertAmount] Unit undefined, amount ${a} >= 1000, treating as actual value`), a) : a;
}
function io(t, n, a, b) {
  const u = b[t];
  if (!u) return !1;
  if (n === "preflop" && u.isForcedAllInPreflop) return !0;
  const h = `${n}Action`, c = `${n}_moreActionAction`;
  return a === "more" ? u[h] === "all-in" : a === "more2" ? u[h] === "all-in" || u[c] === "all-in" : !1;
}
function Vt(t, n, a, b) {
  const u = b[t];
  if (!u) return 0;
  let h = 0;
  const c = n === "preflop" ? (u.postedSB || 0) + (u.postedBB || 0) + (u.postedAnte || 0) : 0;
  console.log(`   🔍 [calculateCumulativeContribution] Player ${t} posted blinds/antes:`, c);
  const d = `${n}Action`, s = `${n}Amount`, o = `${n}Unit`, f = `${n}_moreActionAction`, l = `${n}_moreActionAmount`, x = `${n}_moreActionUnit`;
  if (a === "more") {
    const g = u[d];
    if (g && g !== "fold" && g !== "check" && g !== "no action") {
      console.log(`   🔍 [calculateCumulativeContribution] Player ${t} BASE action:`, g), console.log(`   🔍 [calculateCumulativeContribution] Player ${t} ${s}:`, u[s]), console.log(`   🔍 [calculateCumulativeContribution] Player ${t} ${o}:`, u[o]);
      const p = Qe(u[s], u[o]);
      console.log(`   🔍 [calculateCumulativeContribution] Player ${t} converted baseAmount:`, p, "(includes blinds)"), h = p;
    } else
      h = c, console.log(`   🔍 [calculateCumulativeContribution] Player ${t} no BASE action, using blinds only`);
  } else if (a === "more2") {
    const g = u[f];
    if (g && g !== "fold" && g !== "check" && g !== "no action") {
      const p = Qe(
        u[l],
        u[x]
      );
      console.log(`   🔍 [calculateCumulativeContribution] Player ${t} More Action 1 amount:`, p, "(TOTAL including BASE)"), h = p;
    } else {
      const p = u[d];
      if (p && p !== "fold" && p !== "check" && p !== "no action") {
        const r = Qe(u[s], u[o]);
        console.log(`   🔍 [calculateCumulativeContribution] Player ${t} BASE amount:`, r, "(includes blinds, no MA1 action)"), h = r;
      } else
        h = c, console.log(`   🔍 [calculateCumulativeContribution] Player ${t} no actions, using blinds only`);
    }
  }
  return console.log(`   🔍 [calculateCumulativeContribution] Player ${t} cumulative contribution:`, h), h;
}
function Wt(t, n, a, b) {
  const u = b[t];
  if (!u) return 0;
  console.log(`   🔍 [calculateContributionInActionLevel] Player ${t}, stage: ${n}, action level: ${a}`);
  const h = `${n}Action`, c = `${n}Amount`, d = `${n}Unit`, s = `${n}_moreActionAction`, o = `${n}_moreActionAmount`, f = `${n}_moreActionUnit`, l = `${n}_moreAction2Action`, x = `${n}_moreAction2Amount`, g = `${n}_moreAction2Unit`;
  if (a === "more") {
    const p = u[s];
    if (!p || p === "no action")
      return console.log(`   🔍 [calculateContributionInActionLevel] Player ${t} MA1: No action yet, contribution = 0`), 0;
    const r = Qe(
      u[o],
      u[f]
    ), y = u[h];
    let m = 0;
    y && y !== "fold" && y !== "check" && y !== "no action" ? m = Qe(u[c], u[d]) : m = n === "preflop" ? (u.postedSB || 0) + (u.postedBB || 0) + (u.postedAnte || 0) : 0;
    const v = r - m;
    return console.log(`   🔍 [calculateContributionInActionLevel] Player ${t} MA1: ${r} - ${m} = ${v}`), v;
  } else if (a === "more2") {
    const p = u[l];
    if (!p || p === "no action")
      return console.log(`   🔍 [calculateContributionInActionLevel] Player ${t} MA2: No action yet, contribution = 0`), 0;
    const r = Qe(
      u[x],
      u[g]
    ), y = u[s];
    let m = 0;
    if (y && y !== "fold" && y !== "check" && y !== "no action")
      m = Qe(
        u[o],
        u[f]
      );
    else {
      const N = u[h];
      N && N !== "fold" && N !== "check" && N !== "no action" ? m = Qe(u[c], u[d]) : m = n === "preflop" ? (u.postedSB || 0) + (u.postedBB || 0) + (u.postedAnte || 0) : 0;
    }
    const v = r - m;
    return console.log(`   🔍 [calculateContributionInActionLevel] Player ${t} MA2: ${r} - ${m} = ${v}`), v;
  }
  return 0;
}
function Gt(t, n, a, b) {
  let u = 0;
  console.log(`   🔍 [calculateMaxContribution] Stage: ${t}, Action level: ${n}`);
  const h = `${t}Action`, c = `${t}Amount`, d = `${t}Unit`, s = `${t}_moreActionAction`, o = `${t}_moreActionAmount`, f = `${t}_moreActionUnit`, l = `${t}_moreAction2Action`, x = `${t}_moreAction2Amount`, g = `${t}_moreAction2Unit`;
  for (const p of a) {
    if (!p.name) continue;
    const r = b[p.id];
    if (!r || r[h] === "fold" || r[s] === "fold" || r[l] === "fold") continue;
    let y = 0;
    const m = t === "preflop" ? (r.postedSB || 0) + (r.postedBB || 0) + (r.postedAnte || 0) : 0;
    console.log(`   🔍 [calculateMaxContribution] Player ${p.id} (${p.name}) blinds/antes: ${m}`);
    const v = r[h];
    if (v && v !== "fold" && v !== "check" && v !== "no action") {
      const N = Qe(r[c], r[d]);
      console.log(`   🔍 [calculateMaxContribution] Player ${p.id} BASE: ${v} ${r[c]}${r[d] || ""} = ${N} (includes blinds)`), y = N;
    } else
      y = m, console.log(`   🔍 [calculateMaxContribution] Player ${p.id} BASE: no action, using blinds only`);
    if (n === "more" || n === "more2") {
      const N = r[s];
      if (N && N !== "fold" && N !== "check" && N !== "no action") {
        console.log(`   🔍 [calculateMaxContribution] Player ${p.id} checking More Action 1 data:`), console.log(`      ${s}: "${N}"`), console.log(`      ${o}: "${r[o]}" (type: ${typeof r[o]})`), console.log(`      ${f}: "${r[f]}" (type: ${typeof r[f]})`);
        const A = Qe(
          r[o],
          r[f]
        );
        console.log(`   🔍 [calculateMaxContribution] Player ${p.id} More Action 1: ${N} ${r[o]}${r[f] || ""} = ${A} (TOTAL including BASE)`), y = A;
      }
    }
    if (n === "more2") {
      const N = r[l];
      if (N && N !== "fold" && N !== "check" && N !== "no action") {
        const A = Qe(
          r[x],
          r[g]
        );
        console.log(`   🔍 [calculateMaxContribution] Player ${p.id} More Action 2: ${N} ${r[x]}${r[g] || ""} = ${A} (TOTAL including BASE + MA1)`), y = A;
      }
    }
    console.log(`   🔍 [calculateMaxContribution] Player ${p.id} TOTAL contribution: ${y}`), u = Math.max(u, y);
  }
  return console.log(`   🔍 [calculateMaxContribution] MAX contribution: ${u}`), u;
}
function lo(t, n, a, b) {
  let u = 0;
  console.log(`   🔍 [calculateMaxContributionInActionLevel] Stage: ${t}, Action level: ${n}`);
  const h = `${t}Action`, c = `${t}_moreActionAction`, d = `${t}_moreActionAmount`, s = `${t}_moreActionUnit`, o = `${t}Amount`, f = `${t}Unit`, l = `${t}_moreAction2Action`, x = `${t}_moreAction2Amount`, g = `${t}_moreAction2Unit`;
  for (const p of a) {
    if (!p.name) continue;
    const r = b[p.id];
    if (!r || r[h] === "fold" || n === "more" && r[c] === "fold" || n === "more2" && (r[c] === "fold" || r[l] === "fold")) continue;
    let y = 0;
    if (n === "more") {
      const m = r[c];
      if (!m || m === "no action") {
        console.log(`   🔍 [calculateMaxContributionInActionLevel] Player ${p.id} (${p.name}) MA1: No action yet, skipping`);
        continue;
      }
      const v = Qe(
        r[d],
        r[s]
      ), N = r[h];
      let A = 0;
      N && N !== "fold" && N !== "check" && N !== "no action" ? A = Qe(r[o], r[f]) : A = t === "preflop" ? (r.postedSB || 0) + (r.postedBB || 0) + (r.postedAnte || 0) : 0, y = v - A, console.log(`   🔍 [calculateMaxContributionInActionLevel] Player ${p.id} (${p.name}) MA1 contribution: ${v} - ${A} = ${y}`);
    } else if (n === "more2") {
      const m = r[l];
      if (!m || m === "no action") {
        console.log(`   🔍 [calculateMaxContributionInActionLevel] Player ${p.id} (${p.name}) MA2: No action yet, skipping`);
        continue;
      }
      const v = Qe(
        r[x],
        r[g]
      ), N = r[c];
      let A = 0;
      if (N && N !== "fold" && N !== "check" && N !== "no action")
        A = Qe(
          r[d],
          r[s]
        );
      else {
        const $ = r[h];
        $ && $ !== "fold" && $ !== "check" && $ !== "no action" ? A = Qe(r[o], r[f]) : A = t === "preflop" ? (r.postedSB || 0) + (r.postedBB || 0) + (r.postedAnte || 0) : 0;
      }
      y = v - A, console.log(`   🔍 [calculateMaxContributionInActionLevel] Player ${p.id} (${p.name}) MA2 contribution: ${v} - ${A} = ${y}`);
    }
    u = Math.max(u, y);
  }
  return console.log(`   🔍 [calculateMaxContributionInActionLevel] MAX contribution in level: ${u}`), u;
}
function at(t, n, a, b, u) {
  console.log(`🔍 [checkPlayerNeedsToAct] Checking player ${t}, stage: ${n}, action level: ${a}`);
  const h = u[t];
  if (!h)
    return {
      needsToAct: !1,
      alreadyMatchedMaxBet: !1,
      alreadyAllIn: !1,
      cumulativeContribution: 0,
      maxContribution: 0
    };
  const c = `${n}Action`, d = `${n}_moreActionAction`, s = `${n}_moreAction2Action`;
  if (h[c] === "fold")
    return console.log(`   → Player ${t} has folded in BASE, does NOT need to act`), {
      needsToAct: !1,
      alreadyMatchedMaxBet: !1,
      alreadyAllIn: !1,
      cumulativeContribution: 0,
      maxContribution: 0
    };
  if (h[d] === "fold")
    return console.log(`   → Player ${t} has folded in More Action 1, does NOT need to act`), {
      needsToAct: !1,
      alreadyMatchedMaxBet: !1,
      alreadyAllIn: !1,
      cumulativeContribution: 0,
      maxContribution: 0
    };
  if (h[s] === "fold")
    return console.log(`   → Player ${t} has folded in More Action 2, does NOT need to act`), {
      needsToAct: !1,
      alreadyMatchedMaxBet: !1,
      alreadyAllIn: !1,
      cumulativeContribution: 0,
      maxContribution: 0
    };
  const o = io(t, n, a, u);
  if (console.log(`   Player ${t} all-in: ${o}`), o)
    return console.log(`   → Player ${t} is all-in, does NOT need to act`), {
      needsToAct: !1,
      alreadyMatchedMaxBet: !1,
      alreadyAllIn: !0,
      cumulativeContribution: 0,
      maxContribution: 0
    };
  let f, l;
  if (a === "more" || a === "more2") {
    if (console.log("   🎯 [MORE ACTION] Comparing action-level-specific contributions"), f = Wt(t, n, a, u), l = lo(n, a, b, u), console.log(`   Player ${t} contribution in ${a}: ${f}`), console.log(`   Max contribution in ${a}: ${l}`), f === 0 && l > 0) {
      const g = Vt(t, n, a, u);
      console.log(`   🔍 [MORE ACTION Call vs Re-raise Check] Stage: ${n}, Player ${t} has 0 in ${a}`), console.log(`      Player ${t} cumulative total (from BASE): ${g}`);
      let p = !1;
      for (const r of b) {
        if (!r.name || r.id === t) continue;
        const y = u[r.id];
        if (!y || y[c] === "fold" || y[d] === "fold" || a === "more2" && y[s] === "fold") continue;
        const m = Gt(n, a, [r], u);
        console.log(`      Player ${r.id} (${r.name}) cumulative total: ${m}`);
        const v = Wt(r.id, n, a, u);
        if (console.log(`      Player ${r.id} (${r.name}) contribution in ${a}: ${v}`), m > g) {
          console.log(`      ✅ RE-RAISE detected: ${r.name} (${m}) > Player ${t} (${g})`), p = !0;
          break;
        }
        if (m === g && v > 0) {
          console.log(`      ✅ RAISE in ${a} detected: ${r.name} contributed ${v} in this level`), p = !0;
          break;
        }
      }
      if (p)
        console.log(`   → ⚠️ RE-RAISE detected. Player ${t} NEEDS to act.`);
      else
        return console.log(`   → ✅ CALL detected (no re-raise). Player ${t} does NOT need to act.`), {
          needsToAct: !1,
          alreadyMatchedMaxBet: !0,
          alreadyAllIn: !1,
          cumulativeContribution: g,
          maxContribution: g
        };
    }
  } else
    console.log("   🎯 [BASE] Comparing cumulative contributions"), f = Vt(t, n, a, u), l = Gt(n, a, b, u), console.log(`   Player ${t} cumulative contribution: ${f}`), console.log(`   Max cumulative contribution: ${l}`);
  const x = f >= l;
  if (console.log(`   Player ${t} matched max bet: ${x} (${f} >= ${l})`), x) {
    if ((a === "more" || a === "more2") && l === 0 && f === 0) {
      const p = h[a === "more" ? d : s];
      if (!p || p === "no action")
        return console.log(`   → ⚠️ EDGE CASE: maxBet=0, player contribution=0, but player hasn't acted in ${a} yet. Player ${t} NEEDS to act.`), {
          needsToAct: !0,
          alreadyMatchedMaxBet: !1,
          alreadyAllIn: !1,
          cumulativeContribution: f,
          maxContribution: l
        };
      console.log(`   → Player ${t} already acted (${p}) with 0 contribution, does NOT need to act`);
    }
    return console.log(`   → Player ${t} already matched max bet, does NOT need to act`), {
      needsToAct: !1,
      alreadyMatchedMaxBet: !0,
      alreadyAllIn: !1,
      cumulativeContribution: f,
      maxContribution: l
    };
  }
  return console.log(`   → Player ${t} NEEDS to act (contribution ${f} < max ${l})`), {
    needsToAct: !0,
    alreadyMatchedMaxBet: !1,
    alreadyAllIn: !1,
    cumulativeContribution: f,
    maxContribution: l
  };
}
console.log("🔥🔥🔥 FOCUS MANAGEMENT MODULE LOADED - VERSION 2.0 - CACHE BUSTER 🔥🔥🔥");
function Et(t) {
  const { stage: n, actionLevel: a, players: b, playerData: u, hasMoreActionButton: h, hasCreateNextStreetButton: c } = t;
  console.log("🎯 [FocusReturn] ========================================"), console.log("🎯 [FocusReturn] Determining focus after Process Stack"), console.log(`🎯 [FocusReturn] Stage: ${n}, Level: ${a}`);
  const d = Ye(
    n,
    a,
    b,
    u
  );
  console.log(`🎯 [FocusReturn] Betting round complete: ${d.isComplete}, Reason: ${d.reason}`), setTimeout(() => {
    if (d.isComplete) {
      if (c) {
        const s = [
          "[data-create-flop-focus]",
          "[data-create-turn-focus]",
          "[data-create-river-focus]",
          "[data-create-next-street-focus]"
          // Fallback generic name
        ];
        for (const o of s) {
          const f = document.querySelector(o);
          if (f) {
            console.log('🎯 [FocusReturn] Round complete → Focusing "Create Next Street" button'), f.focus(), console.log("🎯 [FocusReturn] ========================================");
            return;
          }
        }
      }
      console.log('ℹ️ [FocusReturn] Round complete but no "Create Next Street" button (River final round)'), console.log("🎯 [FocusReturn] ========================================");
      return;
    }
    if (h) {
      const s = document.querySelector("[data-add-more-focus]");
      if (s) {
        console.log('🎯 [FocusReturn] Round incomplete → Focusing "Add More Action" button'), s.focus(), console.log("🎯 [FocusReturn] ========================================");
        return;
      }
    }
    console.warn('⚠️ [FocusReturn] Round incomplete but no "Add More Action" button available'), console.log("🎯 [FocusReturn] ========================================");
  }, 100);
}
const xt = "2.1";
console.log("[POT FORMATTER] Module loaded - v" + xt);
function Tt(t, n, a, b, u) {
  const { mainPot: h, sidePots: c, totalPot: d, deadMoneyBreakdown: s } = t, o = zt(
    h,
    "main",
    void 0,
    n,
    a,
    b,
    s,
    u
  ), f = c.map(
    (l, x) => zt(
      l,
      "side",
      x + 1,
      n,
      a,
      b,
      s,
      u
    )
  );
  return {
    totalPot: d,
    mainPot: o,
    sidePots: f,
    players: n.filter((l) => l.name),
    // Only include named players
    contributedAmounts: a
    // Pass through for next hand calculation
  };
}
function zt(t, n, a, b, u, h, c, d) {
  const s = b.filter(
    (p) => t.eligiblePlayers.some((r) => r.id === p.id)
  ), o = b.filter((p) => t.excludedPlayers.some((r) => r.id === p.id)).map((p) => ({
    player: p,
    reason: co(p, t.cappedAt)
  })), f = s.map((p) => ({
    playerId: p.id,
    amount: St(p.id, u, h),
    isAllIn: p.stack === 0
  })), l = uo(
    s.map((p) => p.id),
    u,
    h,
    n,
    t.amount,
    d,
    b
  ), x = fo(
    t,
    n,
    a,
    s,
    b,
    u,
    h,
    c,
    d
  ), g = go(t, n, a, s.length);
  return {
    potType: n,
    potNumber: a,
    amount: t.amount,
    eligiblePlayers: s,
    excludedPlayers: o.length > 0 ? o : void 0,
    contributions: f,
    streetBreakdown: l,
    calculation: x,
    description: g
  };
}
function co(t, n) {
  return t.stack === 0 ? `All-in for $${n.toLocaleString()}` : "Folded";
}
function St(t, n, a) {
  let b = 0;
  const u = ["preflop", "flop", "turn", "river"], h = a ? u.indexOf(a) : u.length - 1;
  for (const c in n)
    for (let d = 0; d <= h; d++) {
      const s = u[d];
      if (c.startsWith(s)) {
        const f = (n[c] || {})[t] || 0;
        b += f;
        break;
      }
    }
  return b;
}
function uo(t, n, a, b, u, h, c) {
  const d = ["preflop", "flop", "turn", "river"];
  if (a === "stack")
    return [];
  const s = d.indexOf(a);
  return b === "side" ? [{
    street: a,
    amount: u,
    detail: `${t.length} player${t.length !== 1 ? "s" : ""} eligible for this side pot`
  }] : d.slice(0, s + 1).map((o) => {
    let f = 0;
    const l = /* @__PURE__ */ new Set(), x = /* @__PURE__ */ new Map();
    for (const r in n)
      if (r.startsWith(o)) {
        const y = n[r] || {};
        for (const m in y) {
          const v = parseInt(m);
          if (!t.includes(v))
            continue;
          const N = y[v] || 0;
          N > 0 && (f += N, l.add(v), x.set(v, (x.get(v) || 0) + N));
        }
      }
    o === "preflop" && h && c && (console.log("🔍 [calculateStreetPot] Preflop blind check:", {
      street: o,
      blindAnte: h,
      players: c.map((r) => ({ name: r.name, position: r.position, stack: r.stack }))
    }), c.forEach((r) => {
      if (r.position === "SB" && h.sb > 0) {
        const y = Math.min(h.sb, r.stack);
        console.log(`🔍 [calculateStreetPot] SB player ${r.name}: blind=${h.sb}, stack=${r.stack}, posting=${y}`), y > 0 ? (console.log(`✅ [calculateStreetPot] Adding SB ${y} from ${r.name}`), f += y, l.add(r.id), x.set(r.id, (x.get(r.id) || 0) + y)) : console.log(`❌ [calculateStreetPot] NOT adding SB from ${r.name} (actualSBPosted = 0)`);
      } else if (r.position === "SB" && h.sb === 0)
        console.log(`❌ [calculateStreetPot] NOT adding SB from ${r.name} because SB is 0`);
      else if (r.position === "BB") {
        const y = h.bb + h.ante, m = Math.min(y, r.stack);
        console.log(`🔍 [calculateStreetPot] BB player ${r.name}: required=${y}, stack=${r.stack}, posting=${m}`), m > 0 ? (console.log(`✅ [calculateStreetPot] Adding BB+Ante ${m} from ${r.name}`), f += m, l.add(r.id), x.set(r.id, (x.get(r.id) || 0) + m)) : console.log(`❌ [calculateStreetPot] NOT adding BB+Ante from ${r.name} (actualBBPosted = 0)`);
      }
    }));
    const g = l.size, p = [];
    return c && c.forEach((r) => {
      const y = x.get(r.id) || 0;
      if (y > 0) {
        const m = `${r.name}${r.position ? ` (${r.position})` : ""}:`;
        p.push(m.padEnd(25) + `$${y.toLocaleString()}`);
      }
    }), {
      street: o,
      amount: f,
      detail: p.length > 0 ? p.join(`
`) : po(g, f)
    };
  });
}
function po(t, n) {
  return n === 0 ? "No contributions" : `${t} player${t !== 1 ? "s" : ""} contributed`;
}
function fo(t, n, a, b, u, h, c, d, s) {
  const o = [];
  if (n === "main") {
    const l = mo(
      u,
      b,
      h,
      d,
      s,
      c
    );
    o.push(...l);
  } else
    b.forEach((l) => {
      const x = St(l.id, h, c);
      if (x > 0) {
        const g = `${l.name}${l.position ? ` (${l.position})` : ""}:`;
        o.push(g.padEnd(25) + `$${x.toLocaleString()}`.padEnd(20));
      }
    });
  return {
    formula: o.join(`
`),
    variables: {},
    // No variables needed for simple display
    result: `Total = $${t.amount.toLocaleString()}`
  };
}
function mo(t, n, a, b, u, h) {
  console.log("📊 [generateContributionLines] Called with:", {
    allPlayers: t.map((g) => `${g.name} (${g.position})`),
    eligiblePlayers: n.map((g) => `${g.name} (${g.position})`),
    blindAnte: u,
    currentStreet: h
  });
  const c = [], d = ["preflop", "flop", "turn", "river"], s = h ? d.indexOf(h) : 0, o = t.find((g) => g.position === "SB"), f = t.find((g) => g.position === "BB");
  console.log("📊 [generateContributionLines] SB player:", o ? `${o.name} (${o.position})` : "none"), console.log("📊 [generateContributionLines] BB player:", f ? `${f.name} (${f.position})` : "none");
  const l = o && n.some((g) => g.id === o.id), x = f && n.some((g) => g.id === f.id);
  if (console.log("📊 [generateContributionLines] SB in pot:", l, "BB in pot:", x), f && !x) {
    const g = St(f.id, a, h);
    g > 0 && c.push("Posted (BB + Ante):".padEnd(25) + `$${g.toLocaleString()}`.padEnd(20));
  }
  if (f && x && u && u.ante > 0) {
    const g = Math.max(0, f.stack - u.bb), p = Math.min(u.ante, g);
    p > 0 && (c.push("Posted (Ante):".padEnd(25) + `$${p.toLocaleString()}`.padEnd(20)), console.log(`📊 [generateContributionLines] Posted (Ante): $${p} (BB in pot)`));
  }
  if (o && !l) {
    const g = St(o.id, a, h);
    console.log("🔍 [generateContributionLines] SB Check:", {
      sbPlayer: o?.name,
      sbInPot: l,
      blindAnte: u,
      blindAnteSB: u?.sb,
      actualSBPosted: g,
      shouldShow: g > 0
    }), g > 0 ? (console.log("✅ [generateContributionLines] Adding Posted (SB) line with actual amount:", g), c.push("Posted (SB):".padEnd(25) + `$${g.toLocaleString()}`.padEnd(20))) : console.log("❌ [generateContributionLines] NOT adding Posted (SB) line (actualSBPosted = 0)");
  }
  return t.forEach((g) => {
    let p = 0;
    for (const m in a)
      for (let v = 0; v <= s; v++) {
        const N = d[v];
        if (m.startsWith(N)) {
          const A = a[m] || {};
          p += A[g.id] || 0;
          break;
        }
      }
    const r = n.some((m) => m.id === g.id);
    let y = 0;
    if (u && r) {
      if (g.position === "SB") {
        const m = Math.min(u.sb, g.stack);
        p += m, console.log(`📊 [generateContributionLines] Adding SB ${m} for ${g.name} (in pot)`);
      } else if (g.position === "BB") {
        const m = Math.min(u.bb, g.stack);
        p += m;
        const v = Math.max(0, g.stack - u.bb);
        y = Math.min(u.ante, v), console.log(`📊 [generateContributionLines] Adding BB ${m} + tracking Ante ${y} for ${g.name} (in pot)`);
      }
    }
    if (p > 0) {
      const m = `${g.name}${g.position ? ` (${g.position})` : ""}:`;
      c.push(m.padEnd(25) + `$${p.toLocaleString()}`.padEnd(20)), console.log(`📊 [generateContributionLines] Added player line: "${m.padEnd(25)}$${p.toLocaleString()}"`);
    }
    if (g.position === "BB" && r && y > 0) {
      const m = "Ante (BB):";
      c.push(m.padEnd(25) + `$${y.toLocaleString()}`.padEnd(20)), console.log(`📊 [generateContributionLines] Added ante line: "${m.padEnd(25)}$${y.toLocaleString()}"`);
    }
  }), console.log("📊 [generateContributionLines] Generated lines:", c), c;
}
function go(t, n, a, b) {
  if (n === "main")
    return `The main pot is capped at the smallest all-in amount ($${t.cappedAt.toLocaleString()}). ${b} player${b !== 1 ? "s" : ""} contributed this amount, making the main pot $${t.amount.toLocaleString()}. Any contributions above this threshold go into side pots.`;
  {
    const u = t.excludedPlayers.length;
    return `This side pot contains contributions from players who put in more than the previous cap. ${u} player${u !== 1 ? "s were" : " was"} excluded because they didn't contribute enough to be eligible for this pot.`;
  }
}
console.log("[PreFlopView] Using pot formatter version:", xt);
const ho = ({
  state: t,
  actions: n,
  formatStack: a,
  onClearAll: b,
  onExport: u,
  cardManagement: h,
  potCalculation: c,
  onBackToTournament: d
}) => {
  const {
    players: s,
    playerData: o,
    currentView: f,
    visibleActionLevels: l,
    defaultUnit: x,
    stackData: g,
    processedSections: p,
    sectionStacks: r,
    contributedAmounts: y,
    potsByStage: m
  } = t, {
    setCurrentView: v,
    setDefaultUnit: N,
    setPlayerData: A,
    setProcessedSections: $,
    setSectionStacks: S,
    setContributedAmounts: _,
    setPotsByStage: w
  } = n, P = ["actual", "K", "Mil"], [D, C] = Xe.useState({}), [j, F] = Xe.useState({}), [Y, ne] = Xe.useState(!0), [oe, me] = Xe.useState(!0), [Pe, Ae] = Xe.useState(!1), [K, re] = Xe.useState(""), [q, Ne] = Xe.useState(null), [Oe, De] = Xe.useState(!1);
  Xe.useEffect(() => {
    l.preflop;
    const H = JSON.stringify(
      s.filter((we) => we.name).map((we) => {
        const le = o[we.id] || {};
        return {
          id: we.id,
          preflopAction: le.preflopAction,
          preflopAmount: le.preflopAmount,
          preflopUnit: le.preflopUnit,
          preflop_moreActionAction: le.preflop_moreActionAction,
          preflop_moreActionAmount: le.preflop_moreActionAmount,
          preflop_moreActionUnit: le.preflop_moreActionUnit,
          preflop_moreAction2Action: le.preflop_moreAction2Action,
          preflop_moreAction2Amount: le.preflop_moreAction2Amount,
          preflop_moreAction2Unit: le.preflop_moreAction2Unit
        };
      })
    );
    K && H !== K && (console.log("🔄 [PreFlopView] PlayerData changed, invalidating processed state"), Ae(!1));
  }, [o, s, K]), Xe.useEffect(() => {
    const H = l.preflop || ["base"], we = H[H.length - 1], le = Ye("preflop", we, s, o);
    console.log(`🔄 [PreFlopView useEffect] Current level: ${we}, Round complete: ${le.isComplete}, Reason: ${le.reason}, Processed: ${Pe}`), ne(!Pe || le.isComplete), me(!Pe || !le.isComplete);
  }, [o, l.preflop, s, Pe]);
  const Me = (H) => H && {
    "♠": "text-gray-900",
    "♣": "text-green-700",
    "♥": "text-red-600",
    "♦": "text-blue-600"
  }[H] || "text-gray-500", be = () => f === "stack" ? "Stack Setup" : f.includes("-more2") ? "Preflop - More Action 2" : f.includes("-more") ? "Preflop - More Action 1" : "Preflop", Te = (H) => {
    N(H);
  }, pe = () => /* @__PURE__ */ i("div", { className: "flex gap-2", children: [
    /* @__PURE__ */ e(
      "button",
      {
        onClick: () => v("stack"),
        className: "px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400 transition-colors",
        children: "← Stack"
      }
    ),
    /* @__PURE__ */ e(
      "button",
      {
        disabled: !0,
        className: "px-3 py-1 bg-gray-200 text-gray-400 rounded text-xs font-medium cursor-not-allowed",
        children: "Flop →"
      }
    )
  ] }), V = () => {
    const H = {
      UTG: 1,
      "UTG+1": 2,
      "UTG+2": 3,
      LJ: 4,
      MP: 5,
      HJ: 6,
      CO: 7,
      Dealer: 8,
      SB: 9,
      BB: 10,
      "": 999
    };
    return s.filter((we) => {
      if (!we.name) return !1;
      const le = o[we.id];
      return le ? !(le.preflopAction === "fold" || le.preflop_moreActionAction === "fold" || le.preflop_moreAction2Action === "fold") : !0;
    }).sort((we, le) => {
      const Re = H[we.position] || 999, L = H[le.position] || 999;
      return Re - L;
    });
  }, ae = () => s.filter((H) => {
    if (!H.name) return !1;
    const we = o[H.id];
    return we ? we.preflopAction === "fold" || we.preflop_moreActionAction === "fold" || we.preflop_moreAction2Action === "fold" : !1;
  }), se = () => {
    const H = l.preflop || ["base"], we = H[H.length - 1];
    if (Ye("preflop", we, s, o).isComplete) {
      alert("Betting round complete. Please create Flop instead."), ne(!0), setTimeout(() => {
        const B = document.querySelector("[data-create-flop-focus]");
        B && B.focus();
      }, 100);
      return;
    }
    if (H.length >= 3) {
      alert("Maximum 3 action levels per street reached");
      return;
    }
    const Re = H.length === 1 ? "more" : "more2";
    Ae(!1), console.log("🔄 [PreFlopView] Invalidated processed state (adding More Action)"), n.setVisibleActionLevels({
      ...l,
      preflop: [...H, Re]
    });
    const L = Re === "more" ? "_moreAction" : "_moreAction2", J = V(), ke = { ...o };
    J.forEach((B) => {
      ke[B.id] = {
        ...ke[B.id],
        [`preflop${L}Action`]: "no action",
        [`preflop${L}Amount`]: "",
        [`preflop${L}Unit`]: x
      };
    }), n.setPlayerData(ke);
    const E = `preflop_${Re === "more" ? "base" : "more"}`, z = `preflop_${Re}`, k = { ...r };
    k[z] = {
      initial: {},
      current: {},
      updated: {}
    }, J.forEach((B) => {
      const W = r[E]?.updated?.[B.id] ?? B.stack;
      k[z].initial[B.id] = W, k[z].current[B.id] = W, k[z].updated[B.id] = W;
    }), n.setSectionStacks(k), console.log(`✅ Copied "Now" stacks from ${E} to ${z}:`, k[z]), setTimeout(() => {
      if (J.length > 0) {
        const W = `${J[0].id}-preflop${L}`, T = document.querySelector(`[data-action-focus="${W}"]`);
        T && T.focus();
      }
    }, 100);
  }, _e = () => {
    const H = l.preflop || ["base"], we = H[H.length - 1];
    for (const L of H) {
      const J = `preflop_${L}`;
      if (!p[J]) {
        alert(`Cannot create Flop. You must click "Process Stack - Preflop" first to process the ${L === "base" ? "base" : L === "more" ? "More Action 1" : "More Action 2"} round.`);
        return;
      }
    }
    const le = Ye("preflop", we, s, o);
    if (!le.isComplete) {
      const L = le.pendingPlayers ? le.pendingPlayers.map((J) => s.find((ke) => ke.id === J)?.name).filter(Boolean).join(", ") : "some players";
      alert(
        `Cannot create Flop. Betting round is not complete.

Reason: ${le.reason}
Pending players: ${L}`
      );
      return;
    }
    n.setCurrentView("flop"), l.flop || n.setVisibleActionLevels({
      ...l,
      flop: ["base"]
    });
    const Re = { ...r };
    Re.flop_base = {
      initial: {},
      current: {},
      updated: {}
    }, V().forEach((L) => {
      let J = L.stack;
      r.preflop_more2?.updated?.[L.id] !== void 0 ? J = r.preflop_more2.updated[L.id] : r.preflop_more?.updated?.[L.id] !== void 0 ? J = r.preflop_more.updated[L.id] : r.preflop_base?.updated?.[L.id] !== void 0 && (J = r.preflop_base.updated[L.id]), Re.flop_base.initial[L.id] = L.stack, Re.flop_base.current[L.id] = J, Re.flop_base.updated[L.id] = J;
    }), n.setSectionStacks(Re), console.log("✅ [handleCreateFlop] Copied preflop final stacks to flop_base");
  }, Ee = (H, we) => {
    const le = o[H.id] || {};
    if (we === "base") {
      let Re = H.stack;
      const L = H.position.toLowerCase();
      return L === "sb" && le.postedSB && (Re -= le.postedSB), L === "bb" && (le.postedBB && (Re -= le.postedBB), le.postedAnte && (Re -= le.postedAnte)), Re;
    } else {
      const Re = `preflop_${we}`, L = r[Re];
      if (L && L.initial && L.initial[H.id] !== void 0)
        return L.initial[H.id];
      const M = r[`preflop_${we === "more" ? "base" : "more"}`];
      return M && M.updated && M.updated[H.id] !== void 0 ? M.updated[H.id] : H.stack;
    }
  }, Ie = (H, we) => {
    const le = we === "" ? "base" : we === "_moreAction" ? "more" : "more2";
    if (console.log(`🎯 [getAvailableActionsForPlayer] Called for playerId=${H}, suffix="${we}", actionLevel="${le}"`), le === "base") {
      const W = s.filter((fe) => fe.name).length;
      console.log(`🎯 [getAvailableActionsForPlayer] Total players at table: ${W}`);
      const T = s.find((fe) => fe.id === H);
      if (!T)
        return console.log(`❌ [getAvailableActionsForPlayer] Player ${H} NOT FOUND - returning []`), [];
      if (console.log(`🎯 [getAvailableActionsForPlayer] Player ${H} is ${T.name} (${T.position})`), (r?.preflop_base?.initial?.[H] || T.stack) === 0)
        return console.log(`🚫 [getAvailableActionsForPlayer] Player ${T.name} has 0 chips - returning ['fold'] only (highlighted but not disabled)`), ["fold"];
      if (o[H]?.allInFromPrevious === !0)
        return console.log(`🎯 [getAvailableActionsForPlayer] Player ${T.name} is all-in from previous street - returning ['all-in']`), ["all-in"];
      let I;
      W === 2 ? I = ["SB", "Dealer", "BB"] : W === 3 ? I = ["Dealer", "SB", "BB"] : I = ["UTG", "UTG+1", "UTG+2", "MP", "MP+1", "MP+2", "LJ", "HJ", "CO", "Dealer", "SB", "BB"], console.log(`🎯 [getAvailableActionsForPlayer] Action order for ${W} players: ${I.join(" → ")}`);
      const X = I.indexOf(T.position);
      if (console.log(`🎯 [getAvailableActionsForPlayer] ${T.name} (${T.position}) is at index ${X} in action order`), X === -1)
        return console.log(`❌ [getAvailableActionsForPlayer] ${T.name} position "${T.position}" NOT IN action order - returning []`), [];
      for (let fe = 0; fe < X; fe++) {
        const ie = I[fe], ye = s.find((ce) => ce.position === ie && ce.name);
        if (ye) {
          if ((r?.preflop_base?.initial?.[ye.id] || ye.stack) === 0) {
            console.log(`🔍 [Turn Check] ${T.name} (${T.position}) skipping 0-chip player ${ye.name} (${ie})`);
            continue;
          }
          const xe = o[ye.id]?.preflopAction, de = o[ye.id]?.allInFromPrevious === !0;
          if (console.log(`🔍 [Turn Check] ${T.name} (${T.position}) checking prev player ${ye.name} (${ie}): action="${xe}", isAllIn=${de}`), xe === "no action" && !de)
            return console.log(`❌ [Turn Check] ${T.name} BLOCKED - ${ye.name} has 'no action'`), [];
        }
      }
      console.log(`✅ [Turn Check] ${T.name} (${T.position}) - all previous players have acted, buttons ENABLED`);
      const G = /* @__PURE__ */ new Map();
      for (const fe of s) {
        if (!fe.name) continue;
        let ie = 0;
        const ye = o[fe.id]?.postedSB || 0, ce = o[fe.id]?.postedBB || 0;
        ie = ye + ce;
        const xe = o[fe.id]?.preflopAction, de = o[fe.id]?.preflopAmount, Ce = o[fe.id]?.preflopUnit, ge = Ce && Ce !== "undefined" ? Ce : g.unit;
        if (console.log(`   🔍 [Contribution Calc] ${fe.name} (${fe.position}): action="${xe}", amount=${de}, postedSB=${ye}, postedBB=${ce}, contribution=${ie}`), xe && xe !== "no action" && xe !== "fold" && xe !== "none" && xe !== void 0) {
          let Be = de || 0;
          ge === "K" ? Be = (de || 0) * 1e3 : ge === "Mil" && (Be = (de || 0) * 1e6), ie = Be || ie, console.log(`   → Using action amount: ${de}${ge || ""} = ${ie}`);
        } else
          console.log(`   → Using blind: ${ie}`);
        G.set(fe.id, ie);
      }
      const Z = G.get(H) || 0, he = Math.max(...G.values());
      console.log(`🎯 [getAvailableActionsForPlayer] ${T.name} contribution: ${Z}, max contribution: ${he}`), console.log("🎯 [getAvailableActionsForPlayer] All contributions:", Array.from(G.entries()).map(([fe, ie]) => `${s.find((ce) => ce.id === fe)?.name}=${ie}`).join(", "));
      const te = [];
      return Z >= he && (console.log(`✅ [getAvailableActionsForPlayer] ${T.name} can CHECK (${Z} >= ${he})`), te.push("check")), Z < he && (console.log(`✅ [getAvailableActionsForPlayer] ${T.name} can CALL (${Z} < ${he})`), te.push("call")), te.push("raise"), te.push("fold"), te.push("all-in"), te.push("no action"), console.log(`🎯 [getAvailableActionsForPlayer] Returning actions for ${T.name}:`, te), te;
    }
    const Re = V(), L = Re.findIndex((B) => B.id === H);
    if (L === -1)
      return [];
    const J = at(H, "preflop", le, s, o);
    if (J.alreadyAllIn)
      return console.log(`🔒 [getAvailableActionsForPlayer] Player ${H} is all-in, showing locked state`), ["all-in"];
    const ke = `preflop${we}Action`, M = o[H]?.[ke];
    if (M && M !== "no action")
      return le === "more2" ? ["call", "all-in", "fold", "no action"] : ["call", "raise", "all-in", "fold", "no action"];
    if (L === 0)
      return le === "more2" ? ["call", "all-in", "fold", "no action"] : ["call", "raise", "all-in", "fold", "no action"];
    const E = Re[L - 1], k = o[E.id]?.[ke];
    return !k || k === "no action" ? [] : J.alreadyMatchedMaxBet ? (console.log(`✅ [getAvailableActionsForPlayer] Player ${H} already matched max bet, no action required`), []) : (console.log(`▶️  [getAvailableActionsForPlayer] Player ${H} needs to act`), le === "more2" ? ["call", "all-in", "fold", "no action"] : ["call", "raise", "all-in", "fold", "no action"]);
  }, We = (H, we) => {
    const le = we === "" ? "base" : we === "_moreAction" ? "more" : "more2";
    console.log(`🔍 [navigateAfterAction] Player ${H}, suffix: "${we}", actionLevel: ${le}`);
    const Re = Ye("preflop", le, s, o);
    console.log("🔍 [navigateAfterAction] Betting round complete:", Re), Re.isComplete ? (console.log("✅ [navigateAfterAction] Round complete, navigating to Process Stack"), setTimeout(() => {
      const L = document.querySelector("[data-process-stack-focus]");
      L && L.focus();
    }, 100)) : (console.log("➡️ [navigateAfterAction] Round not complete, finding next player who needs to act"), setTimeout(() => {
      const L = V(), J = L.findIndex((ke) => ke.id === H);
      if (le === "more" || le === "more2") {
        let ke = !1;
        for (let M = J + 1; M < L.length; M++) {
          const E = L[M], z = at(E.id, "preflop", le, s, o);
          if (console.log(`🔍 [navigateAfterAction] Checking player ${E.name} (${E.id}):`, z), z.needsToAct) {
            console.log(`✅ [navigateAfterAction] Found player who needs to act: ${E.name}`);
            const k = `[data-action-focus="${E.id}-preflop${we}"]`, B = document.querySelector(k);
            B && B.focus(), ke = !0;
            break;
          } else
            z.alreadyAllIn ? console.log(`⏭️ [navigateAfterAction] Auto-skip ${E.name} (all-in)`) : z.alreadyMatchedMaxBet && console.log(`⏭️ [navigateAfterAction] Auto-skip ${E.name} (matched max bet)`);
        }
        if (!ke) {
          console.log("🏁 [navigateAfterAction] All remaining players auto-skipped, navigating to Process Stack");
          const M = document.querySelector("[data-process-stack-focus]");
          M && M.focus();
        }
      } else {
        const ke = s.filter((B) => B.name).length;
        let M;
        ke === 2 ? M = ["SB", "Dealer", "BB"] : ke === 3 ? M = ["Dealer", "SB", "BB"] : M = ["UTG", "UTG+1", "UTG+2", "MP", "MP+1", "MP+2", "LJ", "HJ", "CO", "Dealer", "SB", "BB"];
        const E = s.find((B) => B.id === H);
        if (!E) {
          console.log("❌ [navigateAfterAction] Current player not found");
          return;
        }
        const z = M.indexOf(E.position);
        console.log(`🔍 [navigateAfterAction] Current player ${E.name} (${E.position}) at index ${z} in action order`);
        let k = !1;
        for (let B = z + 1; B < M.length; B++) {
          const W = M[B], T = s.find((O) => O.position === W && O.name);
          if (T) {
            const O = `[data-card-focus="${T.id}-1-preflop${we}"]`;
            console.log(`🎯 [navigateAfterAction] Next player: ${T.name} (${T.position}), looking for ${O}`);
            const ee = document.querySelector(O);
            if (ee) {
              console.log(`✅ [navigateAfterAction] Found next element, focusing on ${T.name}`), ee.focus(), k = !0;
              break;
            } else
              console.log(`❌ [navigateAfterAction] Next element not found for ${T.name}`);
          }
        }
        if (!k) {
          console.log("🏁 [navigateAfterAction] No more players in action order, navigating to Process Stack");
          const B = document.querySelector("[data-process-stack-focus]");
          B && B.focus();
        }
      }
    }, 100));
  }, Ve = () => {
    const H = l.preflop || ["base"];
    if (H.length === 1) return;
    const we = H.slice(0, -1);
    n.setVisibleActionLevels({
      ...l,
      preflop: we
    });
  }, Ge = () => {
    console.log("🔄 Processing Stack - Preflop...");
    const H = l.preflop || ["base"];
    console.log("🔍 [ProcessStack] Running FR-12 validation for all raise/bet amounts..."), console.log("📋 Current visible levels:", H), console.log("✅ Processed sections:", p);
    const we = [];
    if (H.forEach((le) => {
      const Re = `preflop_${le}`;
      if (console.log(`
🔍 Checking section: ${Re}`), console.log(`   - Is processed? ${p[Re]}`), p[Re]) {
        console.log(`⏭️  Skipping validation for ${Re} (already processed)`);
        return;
      }
      console.log(`✔️  Validating ${Re}...`);
      const L = le === "base" ? "" : le === "more" ? "_moreAction" : "_moreAction2", J = s.filter((E) => E.name).length;
      let ke;
      J === 2 ? ke = ["SB", "Dealer", "BB"] : J === 3 ? ke = ["Dealer", "SB", "BB"] : ke = ["UTG", "UTG+1", "UTG+2", "LJ", "MP", "MP+1", "MP+2", "HJ", "CO", "Dealer", "SB", "BB"];
      const M = ke.map((E) => s.find((z) => z.position === E)).filter((E) => E !== void 0);
      M.forEach((E, z) => {
        if (!E.name) return;
        const k = o[E.id] || {}, B = `preflop${L}Action`, W = `preflop${L}Amount`, T = k[B], O = k[W];
        if (T === "bet" || T === "raise") {
          const ee = parseFloat(O);
          if (!O || O.trim() === "" || isNaN(ee) || ee <= 0) {
            we.push(`${E.name} (PreFlop ${le.toUpperCase()}): Missing or invalid raise amount`);
            return;
          }
          const I = M.slice(0, z);
          let X = 0;
          le === "base" ? I.forEach((Z) => {
            if (!Z.name) return;
            const he = o[Z.id] || {}, te = he[B], fe = he[W];
            if (te === "bet" || te === "raise") {
              const ie = parseFloat(fe);
              isNaN(ie) || (X = Math.max(X, ie * 1e3));
            }
          }) : M.forEach((Z) => {
            if (!Z.name || Z.id === E.id) return;
            const he = o[Z.id] || {}, te = he.preflopAction, fe = he.preflopAmount;
            let ie = 0;
            if (te === "bet" || te === "raise") {
              const de = parseFloat(fe);
              isNaN(de) || (ie = de * 1e3);
            }
            const ye = he[B], ce = he[W];
            let xe = ie;
            if (ye === "bet" || ye === "raise") {
              const de = parseFloat(ce);
              isNaN(de) || (xe = de * 1e3);
            }
            X = Math.max(X, xe);
          });
          const G = ee * 1e3;
          X > 0 && G <= X && we.push(
            `${E.name} (PreFlop ${le.toUpperCase()}): Raise amount (${ee}) must be greater than current max bet (${X / 1e3})`
          );
        }
      });
    }), we.length > 0) {
      alert(
        `Cannot Process Stack - Raise/Bet Validation Failed:

` + we.join(`

`) + `

Please correct the amounts and try again.`
      ), console.error("❌ [ProcessStack] FR-12 Validation errors:", we);
      return;
    }
    console.log("✅ [ProcessStack] All raise/bet amounts passed FR-12 validation");
    try {
      let le = { ...o };
      if (H.includes("base") && (s.forEach((O) => {
        if (!O.name) return;
        const ee = le[O.id] || {}, I = "preflopAction";
        ee[I] || (le = {
          ...le,
          [O.id]: {
            ...ee,
            [I]: "fold"
          }
        });
      }), A(le), console.log("✅ Normalized base level actions (undefined → fold)"), s.filter((O) => O.name).every((O) => (le[O.id] || {}).preflopAction === "fold"))) {
        alert("❌ No players to process - all players have folded."), console.error("❌ [ProcessStack] All players folded - nothing to process");
        return;
      }
      let Re = le, L = y, J = p, ke = r, M = null;
      H.forEach((T) => {
        const O = T === "base" ? "base" : T === "more" ? "more" : "more2";
        console.log(`
📍 Processing level: ${O}`);
        const ee = _t(
          "preflop",
          T,
          s,
          Re,
          L,
          J,
          ke,
          {
            bigBlind: g.bigBlind,
            smallBlind: g.smallBlind,
            ante: g.ante
          },
          x
        );
        Re = ee.updatedPlayerData, L = ee.updatedContributedAmounts, J = ee.updatedProcessedSections, ke = ee.updatedSectionStacks, A(ee.updatedPlayerData), _(ee.updatedContributedAmounts), $(ee.updatedProcessedSections), S(ee.updatedSectionStacks), console.log(`✅ Processed ${O}: Updated player data and stacks`);
        const I = `preflop_${O}`, X = st(
          "preflop",
          T,
          s,
          ee.updatedPlayerData,
          ee.updatedContributedAmounts,
          ee.updatedProcessedSections,
          ee.updatedSectionStacks,
          {
            bigBlind: g.bigBlind,
            smallBlind: g.smallBlind,
            ante: g.ante
          },
          0
          // previousStreetPot (0 for preflop)
        );
        w((G) => ({
          ...G,
          [I]: X
        })), M = X, console.log(`💰 Calculated pot for ${O}:`, X.totalPot), console.log(`   Main Pot: ${X.mainPot.amount}`), X.sidePots.length > 0 && X.sidePots.forEach((G, Z) => {
          console.log(`   Side Pot ${Z + 1}: ${G.amount}`);
        });
      }), console.log(`
✅ Process Stack Complete - Total Pot: ${M.totalPot}`);
      const E = JSON.stringify(
        s.filter((T) => T.name).map((T) => {
          const O = Re[T.id] || {};
          return {
            id: T.id,
            preflopAction: O.preflopAction,
            preflopAmount: O.preflopAmount,
            preflopUnit: O.preflopUnit,
            preflop_moreActionAction: O.preflop_moreActionAction,
            preflop_moreActionAmount: O.preflop_moreActionAmount,
            preflop_moreActionUnit: O.preflop_moreActionUnit,
            preflop_moreAction2Action: O.preflop_moreAction2Action,
            preflop_moreAction2Amount: O.preflop_moreAction2Amount,
            preflop_moreAction2Unit: O.preflop_moreAction2Unit
          };
        })
      );
      Ae(!0), re(E), console.log("✅ [PreFlopView] Set hasProcessedCurrentState to true"), console.log("🔥🔥🔥 CACHE BUSTER V3 - PROCESS STACK CLICKED 🔥🔥🔥");
      const z = H[H.length - 1];
      console.log(`🎯 [PreFlop processStack] About to check round completion for level: ${z}`);
      const k = Ye(
        "preflop",
        z,
        s,
        Re
      );
      if (console.log(`🎯 [PreFlop processStack] Round complete result: ${k.isComplete}, Reason: ${k.reason}`), k.isComplete && M) {
        console.log("💰 [PreFlopView] latestContributedAmounts:", L), console.log("💰 [PreFlopView] finalPotInfo:", M);
        const T = Tt(
          M,
          s,
          L,
          "preflop",
          {
            sb: g.smallBlind || 0,
            bb: g.bigBlind || 0,
            ante: g.ante || 0
          }
        );
        Ne(T), De(!0), console.log("💰 [PreFlopView] Pot display data prepared:", T);
      } else
        De(!1);
      ne(k.isComplete), console.log(`🎯 [PreFlop] Betting round complete: ${k.isComplete}, Add More Action disabled: ${k.isComplete}`);
      const B = (z === "base" || z === "more") && !k.isComplete;
      Et({
        stage: "preflop",
        actionLevel: z,
        players: s,
        playerData: Re,
        hasMoreActionButton: B,
        hasCreateNextStreetButton: !0
      });
    } catch (le) {
      console.error("❌ Error processing stack:", le), alert(`Error processing stack: ${le instanceof Error ? le.message : String(le)}`);
    }
  };
  Xe.useEffect(() => {
    const H = l.preflop || ["base"];
    if (H.length === 1 && H[0] === "base") {
      const le = {
        UTG: 1,
        "UTG+1": 2,
        "UTG+2": 3,
        LJ: 4,
        MP: 5,
        HJ: 6,
        CO: 7,
        Dealer: 8,
        SB: 9,
        BB: 10,
        "": 999
      }, L = s.filter((J) => J.name).sort((J, ke) => {
        const M = le[J.position] || 999, E = le[ke.position] || 999;
        return M - E;
      })[0];
      L && setTimeout(() => {
        const J = `[data-card-focus="${L.id}-1-preflop"]`, ke = document.querySelector(J);
        ke && ke.focus();
      }, 100);
    }
  }, []);
  const qe = ({ playerId: H, suffix: we, children: le, action: Re, onActionSelect: L }) => {
    const [J, ke] = Xe.useState(!1), M = (E) => {
      const z = E.key.toLowerCase(), k = {
        f: "fold",
        c: "call",
        a: "all-in",
        x: "check",
        b: "bet",
        r: "raise",
        n: "no action"
      };
      if (k[z]) {
        E.preventDefault(), E.stopPropagation();
        const B = k[z];
        L(B), B === "bet" || B === "raise" ? setTimeout(() => {
          const W = `amount-input-${H}${we || ""}`, T = document.querySelector(`#${W}`);
          T && (T.focus(), T.select());
        }, 100) : We(H, we);
        return;
      }
      if (E.key === "Tab" && !E.shiftKey) {
        if (console.log(`➡️ [ActionContainer] Tab pressed for player ${H}${we}, action: ${Re}`), E.preventDefault(), Re === "bet" || Re === "raise") {
          console.log("💰 [ActionContainer] Bet/Raise action, focusing amount input");
          const B = `amount-input-${H}${we || ""}`, W = document.querySelector(`#${B}`);
          if (W) {
            W.focus(), W.select();
            return;
          }
        }
        console.log("🔍 [ActionContainer] Tab from action, checking round completion"), We(H, we);
        return;
      }
      if (E.key === "Tab" && E.shiftKey) {
        E.preventDefault();
        const B = `[data-card-focus="${H}-2-preflop${we}"]`, W = document.querySelector(B);
        W && W.focus();
        return;
      }
    };
    return /* @__PURE__ */ e(
      "div",
      {
        "data-action-focus": `${H}-preflop${we}`,
        tabIndex: 0,
        onKeyDown: M,
        onFocus: () => ke(!0),
        onBlur: () => ke(!1),
        className: `rounded p-2 transition-all outline-none ${J ? "border-2 border-blue-400 bg-blue-50 ring-2 ring-blue-500" : "border-2 border-gray-300 bg-gray-50"}`,
        children: le
      }
    );
  };
  m && Object.keys(m).some((H) => H.startsWith("preflop"));
  const Ze = m && Object.keys(m).some((H) => H.startsWith("flop")), Fe = m && Object.keys(m).some((H) => H.startsWith("turn")), Je = m && Object.keys(m).some((H) => H.startsWith("river"));
  return /* @__PURE__ */ e("div", { className: "p-2 max-w-full mx-auto bg-gray-50 min-h-screen", children: /* @__PURE__ */ i("div", { className: "bg-white rounded-lg shadow-lg p-3", children: [
    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-2 pb-2 border-b border-gray-100", children: /* @__PURE__ */ i(
      "button",
      {
        onClick: () => {
          if (d)
            d();
          else {
            const H = localStorage.getItem("lastTournamentId") || "1";
            window.open(`/tpro.html?view=handHistory&tournamentId=${H}`, "_blank");
          }
        },
        className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors",
        children: [
          /* @__PURE__ */ e("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }),
          /* @__PURE__ */ e("span", { children: d ? "Back to Tournament" : "Back to Hand History" })
        ]
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "flex gap-2 mb-3 border-b border-gray-200 pb-2", children: [
      /* @__PURE__ */ e(
        "button",
        {
          onClick: () => v("stack"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "Stack"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-blue-600 text-white",
          disabled: !0,
          children: "Pre-flop"
        }
      ),
      Ze && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => v("flop"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "Flop"
        }
      ),
      Fe && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => v("turn"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "Turn"
        }
      ),
      Je && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => v("river"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "River"
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "flex justify-between items-center mb-3", children: [
      /* @__PURE__ */ e("h1", { className: "text-lg font-bold text-gray-800", children: be() }),
      /* @__PURE__ */ i("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ e("label", { className: "text-xs font-medium text-gray-700", children: "Unit:" }),
          /* @__PURE__ */ e("div", { className: "flex gap-0.5", children: P.map((H) => /* @__PURE__ */ e(
            "button",
            {
              onClick: () => Te(H),
              className: `px-1 py-0.5 rounded text-xs font-medium transition-colors ${x === H ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`,
              children: H
            },
            H
          )) })
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: b,
            className: "px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors",
            children: "Clear"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: u,
            className: "px-2 py-0.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors",
            children: "Export"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e("div", { className: "mb-3 p-2 bg-gray-100 rounded", children: /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ e("div", { children: pe() }),
      /* @__PURE__ */ e("div", { className: "flex items-center gap-2", children: ae().length > 0 && /* @__PURE__ */ i("div", { className: "text-xs text-gray-600", children: [
        "Folded: ",
        ae().length
      ] }) })
    ] }) }),
    /* @__PURE__ */ e("div", { className: "space-y-4", style: { overflowX: "auto", overflowY: "visible" }, children: l.preflop?.map((H, we) => {
      const le = H === "base" ? "" : H === "more" ? "_moreAction" : "_moreAction2", Re = H === "base" ? "BASE ACTIONS" : H === "more" ? "MORE ACTION 1" : "MORE ACTION 2", L = H === "base" ? "bg-white" : H === "more" ? "bg-blue-50" : "bg-green-50", J = H === "base" ? "border-gray-300" : H === "more" ? "border-blue-300" : "border-green-300", ke = {
        UTG: 1,
        "UTG+1": 2,
        "UTG+2": 3,
        LJ: 4,
        MP: 5,
        HJ: 6,
        CO: 7,
        Dealer: 8,
        SB: 9,
        BB: 10,
        "": 999
        // Empty position goes last
      }, M = s.filter((E) => {
        if (!E.name) return !1;
        if (H === "base") return !0;
        const z = o[E.id] || {};
        if (H === "more") {
          const k = z.preflopAction;
          return console.log(`  ${E.name} base action:`, k), k && k !== "fold" && k !== "no action";
        }
        if (H === "more2") {
          const k = z.preflopAction, B = z.preflop_moreActionAction;
          return console.log(`  ${E.name} base action:`, k, ", more1 action:", B), k && k !== "fold" && k !== "no action" && B !== "fold";
        }
        return !0;
      }).sort((E, z) => {
        const k = ke[E.position] || 999, B = ke[z.position] || 999;
        return k - B;
      });
      return M.length === 0 && H !== "base" ? null : /* @__PURE__ */ i("div", { className: "mb-6", children: [
        /* @__PURE__ */ e(
          "div",
          {
            className: `${L} border-2 ${J} rounded-t-lg px-3 py-2`,
            children: /* @__PURE__ */ i("h3", { className: "text-sm font-bold text-gray-800", children: [
              Re,
              " - ",
              be()
            ] })
          }
        ),
        /* @__PURE__ */ i(
          "table",
          {
            className: `w-full border-collapse border-2 ${J}`,
            style: { overflow: "visible" },
            children: [
              /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ i("tr", { className: L, children: [
                /* @__PURE__ */ e(
                  "th",
                  {
                    className: `border ${J} px-3 py-2 text-left text-sm font-medium text-gray-700`,
                    children: "Player"
                  }
                ),
                /* @__PURE__ */ e(
                  "th",
                  {
                    className: `border ${J} px-4 py-2 text-center text-sm font-medium text-gray-700 w-40`,
                    children: "Stack"
                  }
                ),
                H === "base" && /* @__PURE__ */ e(
                  "th",
                  {
                    className: `border ${J} px-3 py-2 text-center text-sm font-medium text-gray-700`,
                    children: "Card 1"
                  }
                ),
                H === "base" && /* @__PURE__ */ e(
                  "th",
                  {
                    className: `border ${J} px-3 py-2 text-center text-sm font-medium text-gray-700`,
                    children: "Card 2"
                  }
                ),
                /* @__PURE__ */ e(
                  "th",
                  {
                    className: `border ${J} px-3 py-2 text-center text-sm font-medium text-gray-700`,
                    children: "Action"
                  }
                ),
                /* @__PURE__ */ e(
                  "th",
                  {
                    className: `border ${J} px-4 py-2 text-center text-sm font-medium text-gray-700 w-32`,
                    children: "Amount/Unit"
                  }
                )
              ] }) }),
              /* @__PURE__ */ e("tbody", { children: M.map((E) => {
                const z = o[E.id] || {}, k = `preflop${le}Action`, B = `preflop${le}Amount`, W = `preflop${le}Unit`;
                let T = z[k] || void 0;
                !T && H === "base" && (T = "fold");
                const O = z[B] || "", ee = z[W] || x;
                return /* @__PURE__ */ i("tr", { className: L, children: [
                  /* @__PURE__ */ i(
                    "td",
                    {
                      className: `border ${J} px-2 py-2 text-sm`,
                      children: [
                        /* @__PURE__ */ i("div", { className: "font-medium text-gray-800", children: [
                          E.name,
                          E.position && /* @__PURE__ */ i("span", { className: "text-blue-600", children: [
                            " (",
                            E.position,
                            ")"
                          ] })
                        ] }),
                        H === "base" && z.card1 && z.card2 && /* @__PURE__ */ i("div", { className: "mt-1 text-lg font-bold", children: [
                          /* @__PURE__ */ i("span", { className: Me(z.card1.suit), children: [
                            z.card1.rank,
                            z.card1.suit
                          ] }),
                          " ",
                          /* @__PURE__ */ i("span", { className: Me(z.card2.suit), children: [
                            z.card2.rank,
                            z.card2.suit
                          ] })
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ e(
                    "td",
                    {
                      className: `border ${J} px-2 py-2 text-xs relative`,
                      children: (() => {
                        const I = `${E.id}-${H}`, X = D[I] || !1, G = `preflop_${H}`, Z = p[G], he = E.stack, te = r[G]?.updated?.[E.id] ?? (Z ? Ee(E, H) : null);
                        console.log(`🔍 [PreFlopView] Player ${E.id} ${H}:`, {
                          sectionKey: G,
                          hasProcessedStack: Z,
                          sectionStacksValue: r[G]?.updated?.[E.id],
                          currentStack: te
                        });
                        const fe = te !== null && te === 0;
                        return /* @__PURE__ */ i(je, { children: [
                          /* @__PURE__ */ i("div", { className: "space-y-1", children: [
                            /* @__PURE__ */ i("div", { className: "flex items-center justify-between bg-blue-50 rounded px-2 py-1 border border-blue-200", children: [
                              /* @__PURE__ */ e("span", { className: "text-[10px] text-blue-600", children: "Start:" }),
                              /* @__PURE__ */ e("span", { className: "text-xs font-bold text-blue-900", children: a(he) })
                            ] }),
                            /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                              /* @__PURE__ */ i("div", { className: `flex-1 flex items-center justify-between rounded px-2 py-1 border ${fe ? "bg-red-50 border-2 border-red-400" : "bg-green-50 border-green-200"}`, children: [
                                /* @__PURE__ */ e("span", { className: `text-[10px] ${fe ? "text-red-700 font-bold" : "text-green-600"}`, children: "Now:" }),
                                te !== null ? /* @__PURE__ */ e("span", { className: `text-xs font-bold ${fe ? "text-red-900" : "text-green-900"}`, children: a(te) }) : /* @__PURE__ */ e("span", { className: "text-xs font-bold text-gray-400", children: "-" })
                              ] }),
                              te !== null && /* @__PURE__ */ e(
                                "button",
                                {
                                  onMouseDown: (ie) => {
                                    ie.preventDefault();
                                  },
                                  onClick: (ie) => {
                                    ie.preventDefault(), ie.stopPropagation();
                                    const ye = !X;
                                    if (C((ce) => ({
                                      ...ce,
                                      [I]: ye
                                    })), ye) {
                                      const xe = ie.currentTarget.getBoundingClientRect(), de = 600, Ce = 460, ge = window.innerHeight - xe.bottom, Be = xe.top, R = ge < de && Be > ge, Q = xe.left + xe.width / 2, U = Ce / 2, ue = Q - U, Se = window.innerWidth - (Q + U);
                                      let Le = "center", ve = 0;
                                      ue < 10 ? (Le = "left", ve = xe.left) : Se < 10 ? (Le = "right", ve = xe.right) : (Le = "center", ve = Q), F((Ue) => ({
                                        ...Ue,
                                        [I]: R ? "above" : "below",
                                        [`${I}_horizontal`]: Le,
                                        [`${I}_left`]: ve
                                      }));
                                    }
                                  },
                                  className: "px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-[10px] font-semibold rounded shadow-md hover:shadow-lg transition-all duration-200",
                                  title: "Show stack history",
                                  children: /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })
                                }
                              )
                            ] })
                          ] }),
                          X && te !== null && (() => {
                            const ie = j[I] || "below", ye = j[`${I}_horizontal`] || "center", ce = typeof j[`${I}_left`] == "number" ? j[`${I}_left`] : 0, xe = ie === "above" ? "absolute z-[100] bottom-full mb-2" : "absolute z-[100] mt-2";
                            let de = "";
                            ye === "center" ? de = "transform -translate-x-1/2" : ye === "right" && (de = "transform -translate-x-full");
                            const Ce = `${xe} ${de}`;
                            return /* @__PURE__ */ e(
                              "div",
                              {
                                "data-stack-history-card": I,
                                className: Ce,
                                style: {
                                  minWidth: "400px",
                                  maxWidth: "460px",
                                  left: `${ce}px`
                                },
                                children: /* @__PURE__ */ i("div", { className: `bg-gradient-to-br rounded-xl shadow-2xl border-2 overflow-hidden ${fe ? "from-red-50 to-orange-50 border-red-400" : "from-white to-blue-50 border-blue-300"}`, children: [
                                  /* @__PURE__ */ i("div", { className: `bg-gradient-to-r px-3 py-2 flex items-center justify-between ${fe ? "from-red-600 to-red-700" : "from-blue-600 to-blue-700"}`, children: [
                                    /* @__PURE__ */ i("div", { className: "flex items-center gap-2", children: [
                                      /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }),
                                      /* @__PURE__ */ i("h3", { className: "text-white font-bold text-xs", children: [
                                        "Stack History - ",
                                        E.name,
                                        " ",
                                        fe && "(ALL-IN)"
                                      ] })
                                    ] }),
                                    /* @__PURE__ */ e(
                                      "button",
                                      {
                                        onClick: () => {
                                          C((ge) => ({
                                            ...ge,
                                            [I]: !1
                                          }));
                                        },
                                        className: `text-white transition-colors ${fe ? "hover:text-red-200" : "hover:text-blue-200"}`,
                                        children: /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
                                      }
                                    )
                                  ] }),
                                  /* @__PURE__ */ i("div", { className: "p-3 space-y-2 max-h-96 overflow-y-auto", children: [
                                    /* @__PURE__ */ i("div", { className: "bg-blue-50 rounded-lg p-2 border border-blue-200", children: [
                                      /* @__PURE__ */ e("div", { className: "font-bold text-blue-900 text-xs mb-2 pb-1 border-b border-blue-300", children: "PREFLOP" }),
                                      (() => {
                                        const ge = typeof z.preflopAction == "string" ? z.preflopAction : "", Be = E.stack, R = r.preflop_base?.updated?.[E.id] ?? Be, Q = Be - R, U = H === "base", ue = z.postedSB || 0, Se = z.postedBB || 0, Le = z.postedAnte || 0, ve = ue + Se + Le, Ue = Q - ve, Ke = ve > 0 && (ge === "raise" || ge === "call" || ge === "all-in");
                                        return /* @__PURE__ */ i("div", { className: `rounded-lg p-2 mb-1 border shadow-sm ${U ? "bg-yellow-50 border-l-4 border-yellow-400" : "bg-white border-gray-200"}`, children: [
                                          /* @__PURE__ */ i("div", { className: "flex items-center justify-between mb-1", children: [
                                            /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-gray-600 uppercase tracking-wide", children: "BASE" }),
                                            /* @__PURE__ */ e("span", { className: `px-2 py-0.5 text-[9px] font-semibold rounded-full ${U ? "bg-yellow-200 text-yellow-800" : "bg-gray-100 text-gray-600"}`, children: U ? "Active" : "Complete" })
                                          ] }),
                                          Ke ? (
                                            // Show detailed breakdown for blinds/antes + action
                                            /* @__PURE__ */ i("div", { className: "space-y-1", children: [
                                              Le > 0 && /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs bg-orange-50 rounded px-2 py-1", children: [
                                                /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                                  /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Be) }),
                                                  /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3 text-orange-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                                  /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Be - Le) })
                                                ] }),
                                                /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                                  /* @__PURE__ */ i("span", { className: "text-orange-600 text-[10px]", children: [
                                                    "-",
                                                    a(Le)
                                                  ] }),
                                                  /* @__PURE__ */ e("span", { className: "px-1.5 py-0.5 text-[10px] font-semibold rounded bg-orange-100 text-orange-700", children: "ante" })
                                                ] })
                                              ] }),
                                              /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs bg-purple-50 rounded px-2 py-1", children: [
                                                /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                                  /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Be - Le) }),
                                                  /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3 text-purple-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                                  /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(R) })
                                                ] }),
                                                /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                                  /* @__PURE__ */ i("span", { className: "text-purple-600 text-[10px]", children: [
                                                    "-",
                                                    a(ue + Se + Ue)
                                                  ] }),
                                                  /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${ge === "all-in" ? "bg-red-600 text-white" : ge === "raise" ? "bg-purple-100 text-purple-700" : ge === "call" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`, children: ge })
                                                ] })
                                              ] })
                                            ] })
                                          ) : (
                                            // Original single-line display for no blinds/antes or no action
                                            /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                              /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                                /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Be) }),
                                                /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                                /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(R) })
                                              ] }),
                                              /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: ge && ge !== "no action" && ge !== "check" ? /* @__PURE__ */ i(je, { children: [
                                                /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                                  "-",
                                                  a(Q)
                                                ] }),
                                                /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${ge === "all-in" ? "bg-red-600 text-white" : ge === "raise" ? "bg-purple-100 text-purple-700" : ge === "call" ? "bg-blue-100 text-blue-700" : ge === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: ge })
                                              ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                            ] })
                                          )
                                        ] });
                                      })(),
                                      (H === "more" || H === "more2") && (() => {
                                        const ge = typeof z.preflop_moreActionAction == "string" ? z.preflop_moreActionAction : "", Be = r.preflop_base?.updated?.[E.id] ?? E.stack, R = r.preflop_more?.updated?.[E.id] ?? Be, Q = Be - R, U = H === "more";
                                        return /* @__PURE__ */ i("div", { className: `rounded-lg p-2 mb-1 border shadow-sm ${U ? "bg-yellow-50 border-l-4 border-yellow-400" : "bg-white border-gray-200"}`, children: [
                                          /* @__PURE__ */ i("div", { className: "flex items-center justify-between mb-1", children: [
                                            /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-gray-600 uppercase tracking-wide", children: "More Action 1" }),
                                            /* @__PURE__ */ e("span", { className: `px-2 py-0.5 text-[9px] font-semibold rounded-full ${U ? "bg-yellow-200 text-yellow-800" : "bg-gray-100 text-gray-600"}`, children: U ? "Active" : "Complete" })
                                          ] }),
                                          /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                            /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                              /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Be) }),
                                              /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                              /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(R) })
                                            ] }),
                                            /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: ge && ge !== "no action" && ge !== "check" ? /* @__PURE__ */ i(je, { children: [
                                              /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                                "-",
                                                a(Q)
                                              ] }),
                                              /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${ge === "all-in" ? "bg-red-600 text-white" : ge === "raise" ? "bg-purple-100 text-purple-700" : ge === "call" ? "bg-blue-100 text-blue-700" : ge === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: ge })
                                            ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                          ] })
                                        ] });
                                      })(),
                                      H === "more2" && (() => {
                                        const ge = typeof z.preflop_moreAction2Action == "string" ? z.preflop_moreAction2Action : "", Be = r.preflop_more?.updated?.[E.id] ?? E.stack, R = r.preflop_more2?.updated?.[E.id] ?? Be, Q = Be - R;
                                        return /* @__PURE__ */ i("div", { className: "bg-yellow-50 rounded-lg p-2 border-l-4 border-yellow-400 shadow-sm", children: [
                                          /* @__PURE__ */ i("div", { className: "flex items-center justify-between mb-1", children: [
                                            /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-yellow-800 uppercase tracking-wide", children: "More Action 2" }),
                                            /* @__PURE__ */ e("span", { className: "px-2 py-0.5 bg-yellow-200 text-yellow-800 text-[9px] font-semibold rounded-full", children: "Active" })
                                          ] }),
                                          /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                            /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                              /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Be) }),
                                              /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                              /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(R) })
                                            ] }),
                                            /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: ge && ge !== "no action" && ge !== "check" ? /* @__PURE__ */ i(je, { children: [
                                              /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                                "-",
                                                a(Q)
                                              ] }),
                                              /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${ge === "all-in" ? "bg-red-600 text-white" : ge === "raise" ? "bg-purple-100 text-purple-700" : ge === "call" ? "bg-blue-100 text-blue-700" : ge === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: ge })
                                            ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                          ] })
                                        ] });
                                      })()
                                    ] }),
                                    /* @__PURE__ */ i("div", { className: `rounded-lg p-3 border-2 shadow-md ${fe ? "bg-gradient-to-r from-gray-50 to-red-50 border-red-300" : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300"}`, children: [
                                      /* @__PURE__ */ i("div", { className: "text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2 pb-2 border-b-2 border-gray-300 flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" }) }),
                                        "Summary"
                                      ] }),
                                      /* @__PURE__ */ i("div", { className: "space-y-2", children: [
                                        /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
                                          /* @__PURE__ */ e("span", { className: "text-[10px] text-gray-600", children: "Starting Stack:" }),
                                          /* @__PURE__ */ e("span", { className: "text-xs font-bold text-blue-600", children: a(he) })
                                        ] }),
                                        /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
                                          /* @__PURE__ */ e("span", { className: "text-[10px] text-gray-600", children: "Total Contributed:" }),
                                          /* @__PURE__ */ e("span", { className: "text-xs font-bold text-red-600", children: a(he - te) })
                                        ] }),
                                        /* @__PURE__ */ i("div", { className: "flex justify-between items-center pt-2 border-t border-gray-300", children: [
                                          /* @__PURE__ */ e("span", { className: "text-[10px] text-gray-700 font-bold", children: "Remaining Stack:" }),
                                          /* @__PURE__ */ e("span", { className: `text-sm font-bold ${fe ? "text-red-600" : "text-green-600"}`, children: a(te) })
                                        ] })
                                      ] })
                                    ] })
                                  ] })
                                ] })
                              }
                            );
                          })()
                        ] });
                      })()
                    }
                  ),
                  H === "base" && /* @__PURE__ */ e("td", { className: `border ${J} px-2 py-1`, children: /* @__PURE__ */ e(
                    It,
                    {
                      playerId: E.id,
                      cardNumber: 1,
                      currentCard: z.card1 || null,
                      dataCardFocus: `${E.id}-1-preflop${le}`,
                      onCardChange: (I, X, G) => {
                        h.updatePlayerCard(I, X, G);
                      },
                      isCardAvailable: (I, X, G, Z) => {
                        const he = o[I]?.[`card${X}`];
                        return h.checkCardAvailable(G, Z, he);
                      },
                      areAllSuitsTaken: (I, X, G) => {
                        const Z = o[I]?.[`card${X}`];
                        return h.checkAllSuitsTaken(G, Z);
                      }
                    }
                  ) }),
                  H === "base" && /* @__PURE__ */ e("td", { className: `border ${J} px-2 py-1`, children: /* @__PURE__ */ e(
                    It,
                    {
                      playerId: E.id,
                      cardNumber: 2,
                      currentCard: z.card2 || null,
                      dataCardFocus: `${E.id}-2-preflop${le}`,
                      onCardChange: (I, X, G) => {
                        h.updatePlayerCard(I, X, G);
                      },
                      isCardAvailable: (I, X, G, Z) => {
                        const he = o[I]?.[`card${X}`];
                        return h.checkCardAvailable(G, Z, he);
                      },
                      areAllSuitsTaken: (I, X, G) => {
                        const Z = o[I]?.[`card${X}`];
                        return h.checkAllSuitsTaken(G, Z);
                      }
                    }
                  ) }),
                  /* @__PURE__ */ e("td", { className: `border ${J} px-2 py-1`, children: (() => {
                    const I = Ie(E.id, le), X = le === "" ? "base" : le === "_moreAction" ? "more" : "more2";
                    if ((X === "more" || X === "more2") && I.length === 0)
                      return !T || T === "no action" ? /* @__PURE__ */ e("div", { className: "text-xs text-gray-500 text-center py-2", children: "No action required" }) : /* @__PURE__ */ e("div", { className: "text-xs text-gray-500 text-center py-2", children: "No action required" });
                    const G = (X === "more" || X === "more2") && I.length === 1 && I[0] === "all-in";
                    return /* @__PURE__ */ e(
                      qe,
                      {
                        playerId: E.id,
                        suffix: le,
                        action: T,
                        onActionSelect: (Z) => {
                          n.setPlayerData({
                            ...o,
                            [E.id]: {
                              ...o[E.id],
                              [k]: Z
                            }
                          });
                        },
                        children: /* @__PURE__ */ e(
                          Ct,
                          {
                            playerId: E.id,
                            selectedAction: T,
                            suffix: le,
                            onActionClick: (Z) => {
                              n.setPlayerData({
                                ...o,
                                [E.id]: {
                                  ...o[E.id],
                                  [k]: Z
                                }
                              });
                            },
                            onActionComplete: (Z) => {
                              We(E.id, le);
                            },
                            availableActions: I,
                            isAllInLocked: G
                          }
                        )
                      }
                    );
                  })() }),
                  /* @__PURE__ */ e("td", { className: `border ${J} px-1 py-1`, children: /* @__PURE__ */ e(
                    Pt,
                    {
                      playerId: E.id,
                      selectedAmount: O,
                      selectedAction: T,
                      selectedUnit: ee,
                      suffix: le,
                      stage: "preflop",
                      actionLevel: H,
                      players: s,
                      playerData: o,
                      sectionStacks: r,
                      onAmountChange: (I, X) => {
                        n.setPlayerData({
                          ...o,
                          [I]: {
                            ...o[I],
                            [B]: X
                          }
                        });
                      },
                      onUnitChange: (I, X) => {
                        n.setPlayerData({
                          ...o,
                          [I]: {
                            ...o[I],
                            [W]: X
                          }
                        });
                      },
                      onTabComplete: () => {
                        console.log(`🔔 [PreFlopView] onTabComplete called for player ${E.id}${le}`), We(E.id, le);
                      },
                      isDisabled: !T || T === "fold" || T === "check" || T === "no action"
                    }
                  ) })
                ] }, E.id);
              }) })
            ]
          }
        ),
        /* @__PURE__ */ e(
          "div",
          {
            className: `${L} border-2 border-t-0 ${J} rounded-b-lg px-3 py-2`,
            children: /* @__PURE__ */ i("div", { className: "text-xs text-gray-600", children: [
              M.length,
              " player",
              M.length !== 1 ? "s" : ""
            ] })
          }
        )
      ] }, H);
    }) }),
    /* @__PURE__ */ i("div", { className: "mt-4 flex gap-3 justify-center flex-wrap", children: [
      /* @__PURE__ */ i(
        "button",
        {
          onClick: Ge,
          "data-process-stack-focus": !0,
          tabIndex: 0,
          onKeyDown: (H) => {
            if (H.key === "Tab" && !H.shiftKey) {
              H.preventDefault();
              const we = document.querySelector("[data-add-more-focus]");
              we && we.focus();
            }
          },
          className: "px-6 py-3 bg-yellow-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-yellow-600 transition-colors flex items-center gap-2",
          children: [
            /* @__PURE__ */ e("span", { children: "⚡" }),
            "Process Stack - Preflop"
          ]
        }
      ),
      l.preflop && l.preflop.length > 1 && /* @__PURE__ */ i(
        "button",
        {
          onClick: Ve,
          className: "px-6 py-3 bg-red-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-red-700 transition-colors flex items-center gap-2",
          children: [
            /* @__PURE__ */ e("span", { children: "🗑️" }),
            "Delete More Action ",
            l.preflop.length - 1
          ]
        }
      ),
      /* @__PURE__ */ i(
        "button",
        {
          onClick: se,
          "data-add-more-focus": !0,
          tabIndex: 0,
          onKeyDown: (H) => {
            if (H.key === "Tab" && !H.shiftKey) {
              H.preventDefault();
              const we = document.querySelector("[data-create-flop-focus]");
              we && we.focus();
            }
          },
          disabled: Y || l.preflop && l.preflop.length >= 3,
          className: "px-6 py-3 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
          children: [
            /* @__PURE__ */ e("span", { children: "+" }),
            "Add More Action ",
            l.preflop ? l.preflop.length : 1
          ]
        }
      ),
      /* @__PURE__ */ i(
        "button",
        {
          onClick: _e,
          "data-create-flop-focus": !0,
          tabIndex: 0,
          disabled: oe,
          className: "px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
          children: [
            /* @__PURE__ */ e("span", { children: "→" }),
            "Create Flop"
          ]
        }
      )
    ] }),
    Oe && q && /* @__PURE__ */ i("div", { className: "mt-8 mb-8", children: [
      /* @__PURE__ */ e("div", { className: "bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-xl p-4", children: /* @__PURE__ */ i("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ i("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e("span", { className: "text-3xl", children: "💰" }),
          /* @__PURE__ */ i("div", { children: [
            /* @__PURE__ */ e("h2", { className: "text-2xl font-bold text-white", children: "Pot Distribution" }),
            /* @__PURE__ */ e("p", { className: "text-sm text-white/90 mt-1", children: "PREFLOP betting round complete" })
          ] })
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => De(!1),
            className: "text-white/80 hover:text-white text-3xl font-bold leading-none px-2 transition-colors",
            "aria-label": "Close pot display",
            children: "×"
          }
        )
      ] }) }),
      /* @__PURE__ */ e("div", { className: "bg-gray-100 rounded-b-xl p-6 shadow-xl", children: /* @__PURE__ */ e(
        Bt,
        {
          totalPot: q.totalPot,
          mainPot: q.mainPot,
          sidePots: q.sidePots,
          players: q.players,
          currentPlayers: t.players,
          stackData: t.stackData,
          actions: n,
          contributedAmounts: q.contributedAmounts,
          playerData: t.playerData
        }
      ) })
    ] })
  ] }) });
}, dt = cn(({
  stage: t,
  cardNumber: n,
  label: a,
  currentCard: b,
  onCardChange: u,
  isCardAvailable: h,
  areAllSuitsTaken: c = () => !1,
  autoSelect: d = !1
}, s) => {
  const [o, f] = $e(null), l = () => {
    console.log("🔄 [CommunityCardSelector] ========================================"), console.log(`🔄 [CommunityCardSelector] Moving to next element from ${a}`);
    const $ = s?.current;
    if (!$) {
      console.log("❌ [CommunityCardSelector] Current element ref is null!");
      return;
    }
    const S = Array.from(document.querySelectorAll("[data-community-card]")), _ = S.indexOf($);
    if (console.log(`📊 [CommunityCardSelector] Current index: ${_}, Total cards: ${S.length}`), _ < S.length - 1) {
      const w = S[_ + 1], P = w.getAttribute("data-community-card");
      console.log(`➡️ [CommunityCardSelector] Moving to next card: ${P}`), w.focus(), console.log("✅ [CommunityCardSelector] Focused next card");
    } else {
      console.log("🎯 [CommunityCardSelector] All cards complete, finding first player action");
      const w = Array.from(document.querySelectorAll("[data-action-focus]"));
      if (console.log(`🔍 [CommunityCardSelector] Found ${w.length} action elements`), w.length > 0) {
        const P = w[0], D = P.getAttribute("data-action-focus");
        console.log(`🎯 [CommunityCardSelector] First action element: ${D}`);
        const C = P.hasAttribute("disabled") || P.getAttribute("tabindex") === "-1";
        if (console.log(`❓ [CommunityCardSelector] First player disabled/all-in? ${C}`), !C)
          console.log(`✅ [CommunityCardSelector] Focusing first player action: ${D}`), P.focus();
        else if (console.log("⏭️ [CommunityCardSelector] First player is all-in, checking second player"), w.length > 1) {
          const j = w[1], F = j.getAttribute("data-action-focus");
          console.log(`✅ [CommunityCardSelector] Focusing second player action: ${F}`), j.focus();
        } else
          console.log("❌ [CommunityCardSelector] No second player available");
      } else
        console.log("❌ [CommunityCardSelector] No action elements found!");
    }
    console.log("🔄 [CommunityCardSelector] ========================================");
  }, x = ["A", "2", "3", "4", "5", "6", "7", "8", "9"], g = ["K", "Q", "J", "10"], p = ["♠", "♥", "♦", "♣"], r = {
    "♠": "text-gray-900",
    "♣": "text-green-700",
    "♥": "text-red-600",
    "♦": "text-blue-600"
  }, y = b?.rank || o, m = b?.suit, v = ($) => {
    const S = $ === "10" ? "T" : $;
    if (b?.rank === S) {
      u(t, n, null), f(null);
      return;
    }
    const _ = b?.suit;
    _ && h(S, _) ? (u(t, n, {
      rank: S,
      suit: _
    }), f(null), setTimeout(() => l(), 50)) : (f(S), u(t, n, null));
  }, N = ($) => {
    const S = b?.rank || o;
    if (!S)
      return;
    const _ = h(S, $), w = b?.suit === $;
    !_ && !w || (w ? (u(t, n, null), o && f(S)) : (u(t, n, {
      rank: S,
      suit: $
    }), f(null), setTimeout(() => l(), 50)));
  }, A = ($) => {
    const S = $.key.toLowerCase();
    if ($.key === "Tab" && !$.shiftKey) {
      $.preventDefault(), $.stopPropagation(), l();
      return;
    }
    if ($.key === "Tab" && $.shiftKey) {
      console.log(`⬅️ [CommunityCardSelector] Shift+Tab pressed on ${a}`), $.preventDefault(), $.stopPropagation();
      return;
    }
    const _ = {
      a: "A",
      k: "K",
      q: "Q",
      j: "J",
      t: "10",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9"
    };
    if (_[S]) {
      $.preventDefault(), $.stopPropagation(), console.log(`🎴 [CommunityCardSelector] Rank shortcut: ${_[S]}`), v(_[S]);
      return;
    }
    const w = {
      d: "♦",
      c: "♣",
      h: "♥",
      s: "♠"
    };
    if (w[S]) {
      $.preventDefault(), $.stopPropagation(), console.log(`🃏 [CommunityCardSelector] Suit shortcut: ${w[S]}`), N(w[S]);
      return;
    }
  };
  return /* @__PURE__ */ i(
    "div",
    {
      ref: s,
      tabIndex: 0,
      "data-community-card": `${t}-${n}`,
      onKeyDown: A,
      className: "rounded p-2 transition-all border-2 border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      children: [
        /* @__PURE__ */ e("div", { className: "text-xs font-semibold mb-0.5 flex items-center justify-between", children: /* @__PURE__ */ i("div", { children: [
          /* @__PURE__ */ i("span", { className: "text-gray-700", children: [
            a,
            ": "
          ] }),
          /* @__PURE__ */ e("span", { className: "text-blue-600", children: y === "T" ? "10" : y || "?" }),
          m && /* @__PURE__ */ e("span", { className: `${r[m]} ml-0.5`, children: m })
        ] }) }),
        /* @__PURE__ */ e("div", { className: "flex gap-0.5 mb-0.5 items-center", children: x.map(($) => {
          const S = $ === "10" ? "T" : $, _ = c(S), w = y === S, P = _ && !w;
          return /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              disabled: P,
              tabIndex: -1,
              onMouseDown: (D) => {
                D.preventDefault(), P || v($);
              },
              className: `w-6 h-6 rounded text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${P ? "bg-gray-100 text-gray-300 line-through cursor-not-allowed opacity-50" : w ? "bg-blue-800 text-white hover:bg-blue-900" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`,
              children: $
            },
            $
          );
        }) }),
        /* @__PURE__ */ i("div", { className: "flex gap-0.5 items-center", children: [
          g.map(($) => {
            const S = $ === "10" ? "T" : $, _ = c(S), w = y === S, P = _ && !w;
            return /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                disabled: P,
                tabIndex: -1,
                onMouseDown: (D) => {
                  D.preventDefault(), P || v($);
                },
                className: `w-6 h-6 rounded text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${P ? "bg-gray-100 text-gray-300 line-through cursor-not-allowed opacity-50" : w ? "bg-blue-800 text-white hover:bg-blue-900" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`,
                children: $ === "10" ? "T" : $
              },
              $
            );
          }),
          /* @__PURE__ */ e("div", { className: "border-l border-blue-300 h-6 mx-1" }),
          /* @__PURE__ */ e("div", { className: "flex gap-0.5", children: p.map(($) => {
            const S = y ? h(y, $) : !0, _ = m === $;
            return /* @__PURE__ */ e(
              "button",
              {
                type: "button",
                disabled: !y || !S && !_,
                tabIndex: -1,
                onMouseDown: (P) => {
                  P.preventDefault(), y && (S || _) && N($);
                },
                className: `w-6 h-6 rounded text-sm font-bold flex items-center justify-center cursor-pointer transition-colors ${y ? _ ? "bg-blue-800 text-white hover:bg-blue-900" : S ? `bg-gray-200 hover:bg-gray-300 ${r[$]}` : "bg-gray-100 text-gray-300 line-through cursor-not-allowed opacity-50" : "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50"}`,
                children: $
              },
              $
            );
          }) })
        ] })
      ]
    }
  );
});
dt.displayName = "CommunityCardSelector";
console.log("[FlopView] Using pot formatter version:", xt);
const bo = ({
  state: t,
  actions: n,
  formatStack: a,
  onClearAll: b,
  onExport: u,
  cardManagement: h,
  potCalculation: c,
  onBackToTournament: d
}) => {
  const {
    players: s,
    playerData: o,
    currentView: f,
    visibleActionLevels: l,
    defaultUnit: x,
    stackData: g,
    processedSections: p,
    sectionStacks: r,
    contributedAmounts: y,
    potsByStage: m,
    communityCards: v,
    autoSelectCards: N
  } = t, {
    setCurrentView: A,
    setDefaultUnit: $,
    setPlayerData: S,
    setProcessedSections: _,
    setSectionStacks: w,
    setContributedAmounts: P,
    setPotsByStage: D,
    addActionLevel: C,
    removeActionLevel: j
  } = n, F = ["actual", "K", "Mil"], Y = rt(null), ne = rt(null), oe = rt(null), [me, Pe] = $e({}), [Ae, K] = $e({}), [re, q] = $e(!1), [Ne, Oe] = $e(!0), [De, Me] = $e(!1), [be, Te] = $e(""), [pe, V] = $e(null), [ae, se] = $e(!1);
  Xe.useEffect(() => {
    l.flop;
    const k = JSON.stringify(
      s.map((B) => {
        const W = o[B.id] || {};
        return {
          id: B.id,
          flopAction: W.flopAction,
          flopAmount: W.flopAmount,
          flopUnit: W.flopUnit,
          flop_moreActionAction: W.flop_moreActionAction,
          flop_moreActionAmount: W.flop_moreActionAmount,
          flop_moreActionUnit: W.flop_moreActionUnit,
          flop_moreAction2Action: W.flop_moreAction2Action,
          flop_moreAction2Amount: W.flop_moreAction2Amount,
          flop_moreAction2Unit: W.flop_moreAction2Unit
        };
      })
    );
    be && k !== be && (console.log("🔄 [FlopView] PlayerData changed, invalidating processed state"), Me(!1));
  }, [o, s, be]), Xe.useEffect(() => {
    const k = l.flop || ["base"], B = k[k.length - 1], W = Ye("flop", B, s, o);
    console.log(`🔄 [FlopView useEffect] Current level: ${B}, Round complete: ${W.isComplete}, Reason: ${W.reason}, Processed: ${De}`), q(W.isComplete || !De), Oe(!W.isComplete || !De);
  }, [o, l.flop, s, De]), nt(() => {
    const k = !v.flop.card1 && !v.flop.card2 && !v.flop.card3;
    N && k && h.autoSelectCommunityCards("flop");
  }, []), nt(() => {
    console.log("[FlopView] Setting initial focus to first card selector"), Y.current && Y.current.focus();
  }, []);
  const _e = {
    "♠": "text-gray-900",
    "♣": "text-green-700",
    "♥": "text-red-600",
    "♦": "text-blue-600"
  }, Ee = (k, B) => r.preflop_more2?.updated?.[k.id] !== void 0 ? r.preflop_more2.updated[k.id] : r.preflop_more?.updated?.[k.id] !== void 0 ? r.preflop_more.updated[k.id] : r.preflop_base?.updated?.[k.id] !== void 0 ? r.preflop_base.updated[k.id] : k.stack, Ie = () => f.includes("-more2") ? "Flop - More Action 2" : f.includes("-more") ? "Flop - More Action 1" : "Flop", We = (k) => {
    $(k);
  }, Ve = () => /* @__PURE__ */ i("div", { className: "flex gap-2", children: [
    /* @__PURE__ */ e(
      "button",
      {
        onClick: () => A("preflop"),
        className: "px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400 transition-colors",
        children: "← Preflop"
      }
    ),
    /* @__PURE__ */ e(
      "button",
      {
        onClick: Je,
        className: "px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors",
        children: "Create Turn →"
      }
    )
  ] }), Ge = () => s.filter((k) => {
    if (!k.name) return !1;
    const B = o[k.id];
    return B ? !(B.preflopAction === "fold" || B.preflop_moreActionAction === "fold" || B.preflop_moreAction2Action === "fold") : !0;
  }).sort((k, B) => {
    const W = Re[k.position] || 999, T = Re[B.position] || 999;
    return W - T;
  }), qe = () => s.filter((k) => {
    if (!k.name) return !1;
    const B = o[k.id];
    return B ? B.preflopAction === "fold" || B.preflop_moreActionAction === "fold" || B.preflop_moreAction2Action === "fold" : !1;
  }), Ze = () => m?.preflop_more2 ? m.preflop_more2.totalPot : m?.preflop_more ? m.preflop_more.totalPot : m?.preflop_base ? m.preflop_base.totalPot : 0, Fe = () => {
    console.log("🔄 Processing Stack - Flop...");
    const k = l.flop || ["base"], B = Ze();
    console.log(`💰 Previous street pot (from preflop): ${B}`), console.log("🔍 [ProcessStack] Running FR-12 validation for all raise/bet amounts..."), console.log("📋 Current visible levels:", k), console.log("✅ Processed sections:", p);
    const W = [];
    if (k.forEach((T) => {
      const O = `flop_${T}`;
      if (console.log(`
🔍 Checking section: ${O}`), console.log(`   - Is processed? ${p[O]}`), p[O]) {
        console.log(`⏭️  Skipping validation for ${O} (already processed)`);
        return;
      }
      console.log(`✔️  Validating ${O}...`);
      const ee = T === "base" ? "" : T === "more" ? "_moreAction" : "_moreAction2", I = s.filter((Z) => Z.name).length;
      let X;
      I === 2 ? X = ["BB", "SB", "Dealer"] : I === 3 ? X = ["SB", "BB", "Dealer"] : X = ["SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "MP+1", "MP+2", "LJ", "HJ", "CO", "Dealer"];
      const G = X.map((Z) => s.find((he) => he.position === Z)).filter((Z) => Z !== void 0);
      G.forEach((Z, he) => {
        if (!Z.name) return;
        const te = o[Z.id] || {}, fe = `flop${ee}Action`, ie = `flop${ee}Amount`, ye = `flop${ee}Unit`, ce = te[fe], xe = te[ie], de = te[ye];
        if (ce === "bet" || ce === "raise") {
          const Ce = parseFloat(xe);
          if (!xe || xe.trim() === "" || isNaN(Ce) || Ce <= 0) {
            W.push(`${Z.name} (Flop ${T.toUpperCase()}): Missing or invalid raise amount`);
            return;
          }
          const ge = G.slice(0, he);
          let Be = 0;
          T === "base" ? ge.forEach((U) => {
            if (!U.name) return;
            const ue = o[U.id] || {}, Se = ue[fe], Le = ue[ie], ve = ue[ye];
            if (Se === "bet" || Se === "raise") {
              const Ue = parseFloat(Le);
              isNaN(Ue) || (Be = Math.max(Be, Ue * (ve === "K" ? 1e3 : 1)));
            }
          }) : G.forEach((U) => {
            if (!U.name || U.id === Z.id) return;
            const ue = o[U.id] || {}, Se = ue.flopAction, Le = ue.flopAmount, ve = ue.flopUnit;
            let Ue = 0;
            if (Se === "bet" || Se === "raise") {
              const tt = parseFloat(Le);
              isNaN(tt) || (Ue = tt * (ve === "K" ? 1e3 : 1));
            }
            const Ke = ue[fe], ze = ue[ie], et = ue[ye];
            let ot = Ue;
            if (Ke === "bet" || Ke === "raise") {
              const tt = parseFloat(ze);
              isNaN(tt) || (ot = tt * (et === "K" ? 1e3 : 1));
            }
            Be = Math.max(Be, ot);
          });
          const Q = Ce * (de === "K" ? 1e3 : 1);
          Be > 0 && Q <= Be && W.push(
            `${Z.name} (Flop ${T.toUpperCase()}): Raise amount (${Ce}) must be greater than current max bet (${Be / 1e3})`
          );
        }
      });
    }), W.length > 0) {
      alert(
        `Cannot Process Stack - Raise/Bet Validation Failed:

` + W.join(`

`) + `

Please correct the amounts and try again.`
      ), console.error("❌ [ProcessStack] FR-12 Validation errors:", W);
      return;
    }
    console.log("✅ [ProcessStack] All raise/bet amounts passed FR-12 validation");
    try {
      let T = { ...o };
      k.includes("base") && (s.forEach((ce) => {
        if (!ce.name) return;
        const xe = T[ce.id] || {}, de = "flopAction";
        xe[de] || (T = {
          ...T,
          [ce.id]: {
            ...xe,
            [de]: "fold"
          }
        });
      }), S(T));
      let O = T, ee = y, I = p, X = r, G = null;
      k.forEach((ce) => {
        const xe = ce === "base" ? "base" : ce === "more" ? "more" : "more2";
        console.log(`
📍 Processing level: ${xe}`);
        const de = _t(
          "flop",
          ce,
          s,
          O,
          ee,
          I,
          X,
          {
            bigBlind: g.bigBlind,
            smallBlind: g.smallBlind,
            ante: g.ante
          },
          x
        );
        O = de.updatedPlayerData, ee = de.updatedContributedAmounts, I = de.updatedProcessedSections, X = de.updatedSectionStacks, S(de.updatedPlayerData), P(de.updatedContributedAmounts), _(de.updatedProcessedSections), w(de.updatedSectionStacks);
        const Ce = `flop_${xe}`, ge = st(
          "flop",
          ce,
          s,
          de.updatedPlayerData,
          de.updatedContributedAmounts,
          de.updatedProcessedSections,
          de.updatedSectionStacks,
          {
            bigBlind: g.bigBlind,
            smallBlind: g.smallBlind,
            ante: g.ante
          },
          B
        );
        D((Be) => ({
          ...Be,
          [Ce]: ge
        })), G = ge, console.log(`💰 Calculated pot for ${xe}:`, ge.totalPot);
      }), console.log(`
✅ Process Stack Complete - Total Pot: ${G.totalPot}`);
      const Z = JSON.stringify(
        s.map((ce) => {
          const xe = O[ce.id] || {};
          return {
            id: ce.id,
            flopAction: xe.flopAction,
            flopAmount: xe.flopAmount,
            flopUnit: xe.flopUnit,
            flop_moreActionAction: xe.flop_moreActionAction,
            flop_moreActionAmount: xe.flop_moreActionAmount,
            flop_moreActionUnit: xe.flop_moreActionUnit,
            flop_moreAction2Action: xe.flop_moreAction2Action,
            flop_moreAction2Amount: xe.flop_moreAction2Amount,
            flop_moreAction2Unit: xe.flop_moreAction2Unit
          };
        })
      );
      Me(!0), Te(Z), console.log("✅ [FlopView] Set hasProcessedCurrentState to true");
      const he = k[k.length - 1];
      console.log("🔍 [FlopView] Before checkBettingRoundComplete:"), console.log("   Current Level:", he), console.log("   Players:", s.map((ce) => ({ id: ce.id, name: ce.name, stack: ce.stack }))), console.log("   Player Data:", O);
      const te = Ye(
        "flop",
        he,
        s,
        O
      );
      if (console.log("🔍 [FlopView] After checkBettingRoundComplete:", te), te.isComplete && G) {
        const ce = Tt(
          G,
          s,
          ee,
          "flop"
        );
        V(ce), se(!0);
      } else
        se(!1);
      console.log(`🎯 [Flop handleProcessStack] Current level: ${he}, Round complete: ${te.isComplete}, Reason: ${te.reason}`), console.log("🎯 [Flop handleProcessStack] Pending players:", te.pendingPlayers);
      const fe = te.isComplete;
      console.log(`🎯 [Flop handleProcessStack] Setting isAddMoreActionDisabled to: ${fe}`), console.log(`🎯 [Flop handleProcessStack] Breakdown: isComplete=${te.isComplete}`), q(fe);
      const ie = (he === "base" || he === "more") && !te.isComplete;
      Et({
        stage: "flop",
        actionLevel: he,
        players: s,
        playerData: O,
        hasMoreActionButton: ie,
        hasCreateNextStreetButton: !0
      });
    } catch (T) {
      console.error("❌ Error processing stack:", T), alert(`Error processing stack: ${T instanceof Error ? T.message : String(T)}`);
    }
  }, Je = () => {
    n.setCurrentView("turn"), l.turn || n.setVisibleActionLevels({
      ...l,
      turn: ["base"]
    });
    const k = { ...r };
    k.turn_base = {
      initial: {},
      current: {},
      updated: {}
    }, Ge().forEach((B) => {
      let W = B.stack;
      r.flop_more2?.updated?.[B.id] !== void 0 ? W = r.flop_more2.updated[B.id] : r.flop_more?.updated?.[B.id] !== void 0 ? W = r.flop_more.updated[B.id] : r.flop_base?.updated?.[B.id] !== void 0 && (W = r.flop_base.updated[B.id]), k.turn_base.initial[B.id] = B.stack, k.turn_base.current[B.id] = W, k.turn_base.updated[B.id] = W;
    }), n.setSectionStacks(k), console.log("✅ [handleCreateTurn] Copied flop final stacks to turn_base");
  }, H = () => {
    const k = l.flop || ["base"], B = k[k.length - 1];
    if (Ye("flop", B, s, o).isComplete) {
      alert("Betting round complete. Please create Turn instead."), q(!0), setTimeout(() => {
        const T = document.querySelector("[data-create-turn-focus]");
        T && T.focus();
      }, 100);
      return;
    }
    if (k.includes("more"))
      if (k.includes("more2"))
        alert("Maximum action levels reached (BASE + More Action 1 + More Action 2)");
      else {
        C("flop", "more2"), console.log("[FlopView] Added More Action 2"), Me(!1), console.log("🔄 [FlopView] Invalidated processed state (added More Action 2)");
        const T = "flop_more", O = "flop_more2", ee = { ...r };
        ee[O] = {
          initial: {},
          current: {},
          updated: {}
        }, Ge().forEach((I) => {
          const X = r[T]?.updated?.[I.id] ?? I.stack;
          ee[O].initial[I.id] = I.stack, ee[O].current[I.id] = X, ee[O].updated[I.id] = X;
        }), w(ee), console.log(`✅ Copied "Now" stacks from ${T} to ${O}`);
      }
    else {
      C("flop", "more"), console.log("[FlopView] Added More Action 1"), Me(!1), console.log("🔄 [FlopView] Invalidated processed state (added More Action 1)");
      const T = "flop_base", O = "flop_more", ee = { ...r };
      ee[O] = {
        initial: {},
        current: {},
        updated: {}
      }, Ge().forEach((I) => {
        const X = r[T]?.updated?.[I.id] ?? I.stack;
        ee[O].initial[I.id] = I.stack, ee[O].current[I.id] = X, ee[O].updated[I.id] = X;
      }), w(ee), console.log(`✅ Copied "Now" stacks from ${T} to ${O}`);
    }
  }, Re = s.filter((k) => k.name && k.stack > 0).length === 2 ? {
    // Heads-up postflop: BB acts first, SB/Dealer acts last
    BB: 1,
    SB: 2,
    Dealer: 2,
    // In heads-up, SB is also Dealer
    "": 999
  } : {
    // 3+ players postflop: Standard order (SB first, Dealer last)
    SB: 1,
    BB: 2,
    UTG: 3,
    "UTG+1": 4,
    "UTG+2": 5,
    MP: 6,
    HJ: 7,
    "MP+1": 8,
    "MP+2": 9,
    CO: 10,
    Dealer: 11,
    "": 999
  }, L = (k, B) => {
    const W = B === "" ? "base" : B === "_moreAction" ? "more" : "more2";
    if (console.log(`🎯 [FlopView getAvailableActionsForPlayer] Called for playerId=${k}, suffix="${B}", actionLevel="${W}"`), W === "base") {
      const te = Ge(), ie = s.filter((Q) => Q.name).length;
      console.log(`🎯 [FlopView] Original player count: ${ie}, Active players: ${te.length}`);
      const ye = s.find((Q) => Q.id === k);
      if (!ye)
        return console.log(`❌ [FlopView] Player ${k} NOT FOUND - returning []`), [];
      if (console.log(`🎯 [FlopView] Player ${k} is ${ye.name} (${ye.position})`), o[k]?.allInFromPrevious === !0)
        return ["all-in"];
      let xe;
      ie === 2 ? xe = ["BB", "SB", "Dealer"] : ie === 3 ? xe = ["SB", "BB", "Dealer"] : xe = ["SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "MP+1", "MP+2", "LJ", "HJ", "CO", "Dealer"], console.log(`🎯 [FlopView] Action order for ${ie} players: ${xe.join(" → ")}`);
      const de = xe.indexOf(ye.position);
      if (console.log(`🎯 [FlopView] ${ye.name} (${ye.position}) is at index ${de} in action order`), de === -1)
        return console.log(`❌ [FlopView] ${ye.name} position "${ye.position}" NOT IN action order - returning []`), [];
      for (let Q = 0; Q < de; Q++) {
        const U = xe[Q], ue = s.find((Se) => Se.position === U && Se.name);
        if (ue) {
          if (o[ue.id]?.preflopAction === "fold")
            continue;
          const Le = o[ue.id]?.flopAction, ve = o[ue.id]?.allInFromPrevious === !0;
          if (!Le && !ve)
            return [];
          if (Le === "no action" && !ve)
            return [];
        }
      }
      const Ce = /* @__PURE__ */ new Map();
      for (const Q of s) {
        if (!Q.name) continue;
        let U = 0;
        if (Q.id !== k) {
          const ue = o[Q.id]?.flopAction, Se = o[Q.id]?.flopAmount;
          ue && ue !== "no action" && ue !== "fold" && (U = Se || 0);
        }
        Ce.set(Q.id, U);
      }
      const ge = 0, Be = Math.max(...Ce.values()), R = [];
      return ge >= Be && R.push("check"), ge < Be && R.push("call"), Be === 0 && R.push("bet"), Be > 0 && R.push("raise"), ge < Be && R.push("fold"), R.push("all-in"), R.push("no action"), R;
    }
    const T = Ge(), O = T.findIndex((te) => te.id === k);
    if (O === -1)
      return [];
    const ee = at(k, "flop", W, s, o);
    if (ee.alreadyAllIn)
      return console.log(`🔒 [getAvailableActionsForPlayer] Player ${k} is all-in, showing locked state`), ["all-in"];
    const I = `flop${B}Action`, X = o[k]?.[I];
    if (X && X !== "no action")
      return ["call", "raise", "all-in", "fold"];
    if (O === 0)
      return ["call", "raise", "all-in", "fold"];
    const G = T[O - 1], he = o[G.id]?.[I];
    return !he || he === "no action" ? [] : ee.alreadyMatchedMaxBet ? (console.log(`✅ [getAvailableActionsForPlayer] Player ${k} already matched max bet, no action required`), []) : (console.log(`▶️  [getAvailableActionsForPlayer] Player ${k} needs to act`), ["call", "raise", "all-in", "fold"]);
  }, J = (k, B) => {
    const W = B === "" ? "base" : B === "_moreAction" ? "more" : "more2";
    console.log(`🔍 [navigateAfterAction] Player ${k}, suffix: "${B}", actionLevel: ${W}`);
    const T = Ye("flop", W, s, o);
    console.log("🔍 [navigateAfterAction] Betting round complete:", T), T.isComplete ? (console.log("✅ [navigateAfterAction] Round complete, navigating to Process Stack"), setTimeout(() => {
      const O = document.querySelector("[data-process-stack-focus]");
      O && O.focus();
    }, 100)) : (console.log("➡️ [navigateAfterAction] Round not complete, finding next player who needs to act"), setTimeout(() => {
      const O = Ge(), ee = O.findIndex((I) => I.id === k);
      if (W === "more" || W === "more2") {
        let I = !1;
        for (let X = ee + 1; X < O.length; X++) {
          const G = O[X], Z = at(G.id, "flop", W, s, o);
          if (console.log(`🔍 [navigateAfterAction] Checking player ${G.name} (${G.id}):`, Z), Z.needsToAct) {
            console.log(`✅ [navigateAfterAction] Found player who needs to act: ${G.name}`);
            const he = `[data-action-focus="${G.id}-flop${B}"]`, te = document.querySelector(he);
            te && te.focus(), I = !0;
            break;
          } else
            Z.alreadyAllIn ? console.log(`⏭️ [navigateAfterAction] Auto-skip ${G.name} (all-in)`) : Z.alreadyMatchedMaxBet && console.log(`⏭️ [navigateAfterAction] Auto-skip ${G.name} (matched max bet)`);
        }
        if (!I) {
          console.log("🏁 [navigateAfterAction] All remaining players auto-skipped, navigating to Process Stack");
          const X = document.querySelector("[data-process-stack-focus]");
          X && X.focus();
        }
      } else {
        const I = s.filter((te) => te.name).length;
        let X;
        I === 2 ? X = ["BB", "SB", "Dealer"] : I === 3 ? X = ["SB", "BB", "Dealer"] : X = ["SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "MP+1", "MP+2", "LJ", "HJ", "CO", "Dealer"];
        const G = s.find((te) => te.id === k);
        if (!G) {
          console.log("❌ [navigateAfterAction] Current player not found");
          return;
        }
        const Z = X.indexOf(G.position);
        console.log(`🔍 [navigateAfterAction] Current player ${G.name} (${G.position}) at index ${Z} in action order`);
        let he = !1;
        for (let te = Z + 1; te < X.length; te++) {
          const fe = X[te], ie = s.find((ye) => ye.position === fe && ye.name);
          if (ie)
            if (o[ie.id]?.preflopAction === "fold" || o[ie.id]?.preflop_moreActionAction === "fold" || o[ie.id]?.preflop_moreAction2Action === "fold")
              console.log(`⏭️ [navigateAfterAction] Skipping ${ie.name} (folded in previous street)`);
            else {
              const ce = `[data-action-focus="${ie.id}-flop${B}"]`;
              console.log(`🎯 [navigateAfterAction] Next active player: ${ie.name} (${ie.position}), looking for ${ce}`);
              const xe = document.querySelector(ce);
              if (xe) {
                console.log(`✅ [navigateAfterAction] Found next element, focusing on ${ie.name}`), xe.focus(), he = !0;
                break;
              } else
                console.log(`❌ [navigateAfterAction] Next element not found for ${ie.name}`);
            }
        }
        if (!he) {
          console.log("🏁 [navigateAfterAction] No more active players, navigating to Process Stack");
          const te = document.querySelector("[data-process-stack-focus]");
          te && te.focus();
        }
      }
    }, 100));
  }, ke = ({ playerId: k, suffix: B, action: W, children: T }) => {
    const [O, ee] = Xe.useState(!1), I = (X) => {
      if (!X.shiftKey && !X.ctrlKey && !X.metaKey) {
        const G = X.key.toLowerCase(), he = {
          f: "fold",
          c: W === "bet" || W === "raise" ? "call" : "check",
          k: "check",
          b: "bet",
          r: "raise",
          a: "all-in",
          n: "no action"
        }[G];
        if (he) {
          X.preventDefault();
          const te = B === "" ? "flopAction" : B === "_moreAction" ? "flop_moreActionAction" : "flop_moreAction2Action";
          n.setPlayerData({
            ...o,
            [k]: {
              ...o[k],
              [te]: he
            }
          }), he === "bet" || he === "raise" ? setTimeout(() => {
            const fe = `amount-input-${k}${B || ""}`, ie = document.querySelector(`#${fe}`);
            ie && (ie.focus(), ie.select());
          }, 100) : J(k, B);
          return;
        }
      }
      if (X.key === "Tab" && !X.shiftKey) {
        if (console.log(`➡️ [ActionContainer] Tab pressed for player ${k}${B}, action: ${W}`), X.preventDefault(), W === "bet" || W === "raise") {
          console.log("💰 [ActionContainer] Bet/Raise action, focusing amount input");
          const G = `amount-input-${k}${B || ""}`, Z = document.querySelector(`#${G}`);
          if (Z) {
            Z.focus(), Z.select();
            return;
          }
        }
        console.log("🔍 [ActionContainer] Tab from action, checking round completion"), J(k, B);
        return;
      }
    };
    return /* @__PURE__ */ e(
      "div",
      {
        "data-action-focus": `${k}-flop${B}`,
        tabIndex: 0,
        onKeyDown: I,
        onFocus: () => ee(!0),
        onBlur: () => ee(!1),
        className: `rounded p-2 transition-all outline-none ${O ? "border-2 border-blue-400 bg-blue-50 ring-2 ring-blue-500" : "border-2 border-gray-300 bg-gray-50"}`,
        children: T
      }
    );
  }, M = m && Object.keys(m).some((k) => k.startsWith("preflop"));
  m && Object.keys(m).some((k) => k.startsWith("flop"));
  const E = m && Object.keys(m).some((k) => k.startsWith("turn")), z = m && Object.keys(m).some((k) => k.startsWith("river"));
  return /* @__PURE__ */ e("div", { className: "p-2 max-w-full mx-auto bg-gray-50 min-h-screen", children: /* @__PURE__ */ i("div", { className: "bg-white rounded-lg shadow-lg p-3", children: [
    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-2 pb-2 border-b border-gray-100", children: /* @__PURE__ */ i(
      "button",
      {
        onClick: () => {
          if (d)
            d();
          else {
            const k = localStorage.getItem("lastTournamentId") || "1";
            window.open(`/tpro.html?view=handHistory&tournamentId=${k}`, "_blank");
          }
        },
        className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors",
        children: [
          /* @__PURE__ */ e("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }),
          /* @__PURE__ */ e("span", { children: d ? "Back to Tournament" : "Back to Hand History" })
        ]
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "flex gap-2 mb-3 border-b border-gray-200 pb-2", children: [
      /* @__PURE__ */ e(
        "button",
        {
          onClick: () => A("stack"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "Stack"
        }
      ),
      M && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => A("preflop"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "Pre-flop"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-blue-600 text-white",
          disabled: !0,
          children: "Flop"
        }
      ),
      E && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => A("turn"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "Turn"
        }
      ),
      z && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => A("river"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "River"
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "flex justify-between items-center mb-3", children: [
      /* @__PURE__ */ e("h1", { className: "text-lg font-bold text-gray-800", children: Ie() }),
      /* @__PURE__ */ i("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ e("label", { className: "text-xs font-medium text-gray-700", children: "Unit:" }),
          /* @__PURE__ */ e("div", { className: "flex gap-0.5", children: F.map((k) => /* @__PURE__ */ e(
            "button",
            {
              onClick: () => We(k),
              className: `px-1 py-0.5 rounded text-xs font-medium transition-colors ${x === k ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`,
              children: k
            },
            k
          )) })
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: b,
            className: "px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors",
            children: "Clear"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: u,
            className: "px-2 py-0.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors",
            children: "Export"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "mb-3 p-3 bg-green-100 border-2 border-green-300 rounded", children: [
      /* @__PURE__ */ i("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ e("div", { className: "text-sm font-bold text-gray-800", children: "Flop Community Cards" }),
        N && /* @__PURE__ */ e(
          "button",
          {
            onClick: () => h.autoSelectCommunityCards("flop"),
            className: "px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors",
            children: "Auto-Select Cards"
          }
        )
      ] }),
      /* @__PURE__ */ e("div", { className: "flex gap-3 mb-3 justify-center", children: [1, 2, 3].map((k) => {
        const B = v.flop[`card${k}`];
        return /* @__PURE__ */ i("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ i("div", { className: "text-xs font-semibold text-gray-700 mb-1", children: [
            "Flop ",
            k
          ] }),
          /* @__PURE__ */ e("div", { className: `w-20 h-28 rounded-lg border-2 shadow-md flex flex-col items-center justify-center transition-all ${B ? "bg-white border-green-500" : "bg-gray-50 border-gray-300"}`, children: B ? /* @__PURE__ */ i(je, { children: [
            /* @__PURE__ */ e("div", { className: "text-4xl font-bold text-gray-900", children: B.rank === "T" ? "10" : B.rank }),
            /* @__PURE__ */ e("div", { className: `text-4xl ${_e[B.suit]}`, children: B.suit })
          ] }) : /* @__PURE__ */ e("div", { className: "text-4xl font-bold text-gray-300", children: "?" }) })
        ] }, k);
      }) }),
      /* @__PURE__ */ i("div", { className: "flex gap-3 items-center justify-center", children: [
        /* @__PURE__ */ e(
          dt,
          {
            ref: Y,
            stage: "flop",
            cardNumber: 1,
            label: "Flop 1",
            currentCard: v.flop.card1,
            onCardChange: h.updateCommunityCard,
            isCardAvailable: (k, B) => h.checkCardAvailable(k, B, v.flop.card1),
            autoSelect: N
          }
        ),
        /* @__PURE__ */ e(
          dt,
          {
            ref: ne,
            stage: "flop",
            cardNumber: 2,
            label: "Flop 2",
            currentCard: v.flop.card2,
            onCardChange: h.updateCommunityCard,
            isCardAvailable: (k, B) => h.checkCardAvailable(k, B, v.flop.card2),
            autoSelect: N
          }
        ),
        /* @__PURE__ */ e(
          dt,
          {
            ref: oe,
            stage: "flop",
            cardNumber: 3,
            label: "Flop 3",
            currentCard: v.flop.card3,
            onCardChange: h.updateCommunityCard,
            isCardAvailable: (k, B) => h.checkCardAvailable(k, B, v.flop.card3),
            autoSelect: N
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e("div", { className: "mb-3 p-2 bg-gray-100 rounded", children: /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ e("div", { children: Ve() }),
      /* @__PURE__ */ e("div", { className: "flex items-center gap-2", children: qe().length > 0 && /* @__PURE__ */ i("div", { className: "text-xs text-gray-600", children: [
        "Folded: ",
        qe().length
      ] }) })
    ] }) }),
    /* @__PURE__ */ e("div", { className: "space-y-4", style: { overflowX: "auto", overflowY: "visible" }, children: l.flop?.map((k) => {
      const B = k === "base" ? "" : k === "more" ? "_moreAction" : "_moreAction2", W = k === "base" ? "BASE ACTIONS" : k === "more" ? "MORE ACTION 1" : "MORE ACTION 2", T = k === "base" ? "bg-white" : k === "more" ? "bg-blue-50" : "bg-green-50", O = k === "base" ? "border-gray-300" : k === "more" ? "border-blue-300" : "border-green-300", ee = Ge().filter((I) => {
        if (k === "base") return !0;
        const X = o[I.id];
        return X ? k === "more" ? X.flopAction !== "fold" : k === "more2" ? X.flopAction !== "fold" && X.flop_moreActionAction !== "fold" : !0 : !0;
      }).sort((I, X) => {
        const G = Re[I.position] || 999, Z = Re[X.position] || 999;
        return G - Z;
      });
      return ee.length === 0 && k !== "base" ? null : /* @__PURE__ */ i("div", { className: "mb-6", children: [
        /* @__PURE__ */ e("div", { className: `${T} border-2 ${O} rounded-t-lg px-3 py-2`, children: /* @__PURE__ */ i("h3", { className: "text-sm font-bold text-gray-800", children: [
          W,
          " - ",
          Ie()
        ] }) }),
        /* @__PURE__ */ i("table", { className: `w-full border-collapse border-2 ${O}`, style: { overflow: "visible" }, children: [
          /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ i("tr", { className: T, children: [
            /* @__PURE__ */ e("th", { className: `border ${O} px-3 py-2 text-left text-sm font-medium text-gray-700`, children: "Player" }),
            /* @__PURE__ */ e("th", { className: `border ${O} px-4 py-2 text-center text-sm font-medium text-gray-700 w-32`, children: "Stack" }),
            /* @__PURE__ */ e("th", { className: `border ${O} px-3 py-2 text-center text-sm font-medium text-gray-700`, children: "Action" }),
            /* @__PURE__ */ e("th", { className: `border ${O} px-4 py-2 text-center text-sm font-medium text-gray-700 w-32`, children: "Amount/Unit" })
          ] }) }),
          /* @__PURE__ */ e("tbody", { children: ee.map((I, X) => {
            const G = o[I.id] || {}, Z = `flop${B}Action`, he = `flop${B}Amount`, te = `flop${B}Unit`, fe = G[Z] || "", ie = G[he] || "", ye = G[te] || x, ce = `${I.id}-flop-${k}`, xe = me[ce] || !1, de = `flop_${k}`, Ce = p[de], ge = I.stack, Be = r[de]?.updated?.[I.id] ?? (Ce ? ge : null), R = Be !== null && Be === 0;
            return /* @__PURE__ */ i("tr", { className: T, children: [
              /* @__PURE__ */ i("td", { className: `border ${O} px-3 py-2 text-sm font-medium text-gray-800`, children: [
                I.name,
                I.position && /* @__PURE__ */ i("span", { className: "ml-2 text-xs text-blue-600", children: [
                  "(",
                  I.position,
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ i("td", { className: `border ${O} px-2 py-2 text-center relative`, style: { overflow: "visible" }, children: [
                /* @__PURE__ */ i("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ i("div", { className: "flex items-center justify-between bg-blue-50 rounded px-2 py-1 border border-blue-200", children: [
                    /* @__PURE__ */ e("span", { className: "text-[10px] text-blue-600", children: "Start:" }),
                    /* @__PURE__ */ e("span", { className: "text-xs font-bold text-blue-900", children: a(ge) })
                  ] }),
                  /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ i("div", { className: `flex-1 flex items-center justify-between rounded px-2 py-1 border ${R ? "bg-red-50 border-2 border-red-400" : "bg-green-50 border-green-200"}`, children: [
                      /* @__PURE__ */ e("span", { className: `text-[10px] ${R ? "text-red-700 font-bold" : "text-green-600"}`, children: "Now:" }),
                      Be !== null ? /* @__PURE__ */ e("span", { className: `text-xs font-bold ${R ? "text-red-900" : "text-green-900"}`, children: a(Be) }) : /* @__PURE__ */ e("span", { className: "text-xs font-bold text-gray-400", children: "-" })
                    ] }),
                    Be !== null && /* @__PURE__ */ e(
                      "button",
                      {
                        onMouseDown: (Q) => {
                          console.log("[FlopView] History button mousedown - preventing default to avoid blur"), Q.preventDefault();
                        },
                        onClick: (Q) => {
                          console.log("[FlopView] History button clicked"), console.log("[FlopView] e.preventDefault() called"), Q.preventDefault(), console.log("[FlopView] e.stopPropagation() called"), Q.stopPropagation(), console.log("[FlopView] Event propagation stopped");
                          const U = !xe;
                          if (console.log("[FlopView] isExpanding:", U), Pe((ue) => ({
                            ...ue,
                            [ce]: U
                          })), U) {
                            const Se = Q.currentTarget.getBoundingClientRect();
                            console.log("[FlopView] Button position:", {
                              top: Se.top,
                              bottom: Se.bottom,
                              left: Se.left,
                              right: Se.right
                            });
                            const Le = 600, ve = 460, Ue = window.innerHeight - Se.bottom, Ke = Se.top;
                            console.log("[FlopView] Space calculation:", {
                              viewportHeight: window.innerHeight,
                              spaceBelow: Ue,
                              spaceAbove: Ke,
                              estimatedPopupHeight: Le
                            });
                            const ze = Ue < Le && Ke > Ue;
                            let et;
                            ze ? et = Math.max(10, Se.top - Le - 8) : et = Se.bottom + 8;
                            const ot = Se.left + Se.width / 2, tt = ve / 2, pt = ot - tt, sn = window.innerWidth - (ot + tt);
                            let vt = "center", yt = ot;
                            pt < 10 ? (vt = "left", yt = Math.max(10, Se.left)) : sn < 10 && (vt = "right", yt = Math.min(window.innerWidth - 10, Se.right)), console.log("[FlopView] Positioning decision:", {
                              shouldPositionAbove: ze,
                              finalPosition: ze ? "above" : "below",
                              topPosition: et,
                              horizontalAlign: vt,
                              leftOffset: yt
                            }), K((an) => ({
                              ...an,
                              [ce]: ze ? "above" : "below",
                              [`${ce}_top`]: et,
                              [`${ce}_horizontal`]: vt,
                              [`${ce}_left`]: yt
                            }));
                          }
                        },
                        className: "px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-[10px] font-semibold rounded shadow-md hover:shadow-lg transition-all duration-200",
                        title: "Show stack history",
                        children: /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })
                      }
                    )
                  ] })
                ] }),
                xe && Be !== null && (() => {
                  Ae[ce];
                  const Q = Ae[`${ce}_top`] || 0, U = Ae[`${ce}_horizontal`] || "center", ue = Ae[`${ce}_left`] || 0;
                  let Se = "";
                  U === "center" ? Se = "transform -translate-x-1/2" : U === "right" && (Se = "transform -translate-x-full");
                  const Le = `fixed z-[9999] ${Se}`;
                  return /* @__PURE__ */ e(
                    "div",
                    {
                      "data-stack-history-card": ce,
                      className: Le,
                      style: {
                        minWidth: "400px",
                        maxWidth: "460px",
                        top: `${Q}px`,
                        left: `${ue}px`,
                        maxHeight: "calc(100vh - 20px)",
                        overflowY: "auto"
                      },
                      children: /* @__PURE__ */ i("div", { className: `bg-gradient-to-br rounded-xl shadow-2xl border-2 overflow-hidden ${R ? "from-red-50 to-orange-50 border-red-400" : "from-white to-blue-50 border-blue-300"}`, children: [
                        /* @__PURE__ */ i("div", { className: `bg-gradient-to-r px-3 py-2 flex items-center justify-between ${R ? "from-red-600 to-red-700" : "from-blue-600 to-blue-700"}`, children: [
                          /* @__PURE__ */ i("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }),
                            /* @__PURE__ */ i("h3", { className: "text-white font-bold text-xs", children: [
                              I.name,
                              " - Stack History (Flop ",
                              k.toUpperCase(),
                              ")"
                            ] })
                          ] }),
                          /* @__PURE__ */ e(
                            "button",
                            {
                              onClick: () => Pe((ve) => ({
                                ...ve,
                                [ce]: !1
                              })),
                              className: "text-white hover:text-gray-200 transition-colors",
                              children: /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
                            }
                          )
                        ] }),
                        /* @__PURE__ */ i("div", { className: "p-3 space-y-2", children: [
                          (() => {
                            const ve = typeof G.preflopAction == "string" ? G.preflopAction : "", Ke = I.stack - (G.postedSB || 0) - (G.postedBB || 0), ze = r.preflop_base?.updated?.[I.id] ?? Ke, et = Ke - ze;
                            return /* @__PURE__ */ i("div", { className: "bg-indigo-50 rounded-lg p-2 border-l-4 border-indigo-400 shadow-sm", children: [
                              /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-indigo-800 uppercase tracking-wide", children: "PreFlop BASE" }) }),
                              /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                  /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Ke) }),
                                  /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                  /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(ze) })
                                ] }),
                                /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: ve && ve !== "no action" && ve !== "check" ? /* @__PURE__ */ i(je, { children: [
                                  /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                    "-",
                                    a(et)
                                  ] }),
                                  /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${ve === "all-in" ? "bg-red-600 text-white" : ve === "raise" ? "bg-purple-100 text-purple-700" : ve === "call" ? "bg-blue-100 text-blue-700" : ve === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: ve })
                                ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                              ] })
                            ] });
                          })(),
                          r.preflop_more && (() => {
                            const ve = typeof G.preflop_moreActionAction == "string" ? G.preflop_moreActionAction : "", Ue = r.preflop_base?.updated?.[I.id] ?? I.stack, Ke = r.preflop_more?.updated?.[I.id] ?? Ue, ze = Ue - Ke;
                            return /* @__PURE__ */ i("div", { className: "bg-teal-50 rounded-lg p-2 border-l-4 border-teal-400 shadow-sm", children: [
                              /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-teal-800 uppercase tracking-wide", children: "PreFlop MA1" }) }),
                              /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                  /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Ue) }),
                                  /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                  /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Ke) })
                                ] }),
                                /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: ve && ve !== "no action" && ve !== "check" ? /* @__PURE__ */ i(je, { children: [
                                  /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                    "-",
                                    a(ze)
                                  ] }),
                                  /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${ve === "all-in" ? "bg-red-600 text-white" : ve === "raise" ? "bg-purple-100 text-purple-700" : ve === "call" ? "bg-blue-100 text-blue-700" : ve === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: ve })
                                ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                              ] })
                            ] });
                          })(),
                          r.preflop_more2 && (() => {
                            const ve = typeof G.preflop_moreAction2Action == "string" ? G.preflop_moreAction2Action : "", Ue = r.preflop_more?.updated?.[I.id] ?? I.stack, Ke = r.preflop_more2?.updated?.[I.id] ?? Ue, ze = Ue - Ke;
                            return /* @__PURE__ */ i("div", { className: "bg-cyan-50 rounded-lg p-2 border-l-4 border-cyan-400 shadow-sm", children: [
                              /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-cyan-800 uppercase tracking-wide", children: "PreFlop MA2" }) }),
                              /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                  /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Ue) }),
                                  /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                  /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Ke) })
                                ] }),
                                /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: ve && ve !== "no action" && ve !== "check" ? /* @__PURE__ */ i(je, { children: [
                                  /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                    "-",
                                    a(ze)
                                  ] }),
                                  /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${ve === "all-in" ? "bg-red-600 text-white" : ve === "raise" ? "bg-purple-100 text-purple-700" : ve === "call" ? "bg-blue-100 text-blue-700" : ve === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: ve })
                                ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                              ] })
                            ] });
                          })(),
                          (() => {
                            const ve = typeof G.flopAction == "string" ? G.flopAction : "", Ue = Ee(I), Ke = r.flop_base?.updated?.[I.id] ?? Ue, ze = Ue - Ke;
                            return /* @__PURE__ */ i("div", { className: "bg-gray-50 rounded-lg p-2 border-l-4 border-gray-400 shadow-sm", children: [
                              /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-gray-800 uppercase tracking-wide", children: "FLOP BASE" }) }),
                              /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                  /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Ue) }),
                                  /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                  /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Ke) })
                                ] }),
                                /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: ve && ve !== "no action" && ve !== "check" ? /* @__PURE__ */ i(je, { children: [
                                  /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                    "-",
                                    a(ze)
                                  ] }),
                                  /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${ve === "all-in" ? "bg-red-600 text-white" : ve === "raise" ? "bg-purple-100 text-purple-700" : ve === "call" ? "bg-blue-100 text-blue-700" : ve === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: ve })
                                ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                              ] })
                            ] });
                          })(),
                          l.flop.includes("more") && (() => {
                            const ve = typeof G.flop_moreActionAction == "string" ? G.flop_moreActionAction : "", Ue = r.flop_base?.updated?.[I.id] ?? Ee(I), Ke = r.flop_more?.updated?.[I.id] ?? Ue, ze = Ue - Ke;
                            return /* @__PURE__ */ i("div", { className: "bg-purple-50 rounded-lg p-2 border-l-4 border-purple-400 shadow-sm", children: [
                              /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-purple-800 uppercase tracking-wide", children: "More Action 1" }) }),
                              /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                  /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Ue) }),
                                  /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                  /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Ke) })
                                ] }),
                                /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: ve && ve !== "no action" && ve !== "check" ? /* @__PURE__ */ i(je, { children: [
                                  /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                    "-",
                                    a(ze)
                                  ] }),
                                  /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${ve === "all-in" ? "bg-red-600 text-white" : ve === "raise" ? "bg-purple-100 text-purple-700" : ve === "call" ? "bg-blue-100 text-blue-700" : ve === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: ve })
                                ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                              ] })
                            ] });
                          })(),
                          l.flop.includes("more2") && (() => {
                            const ve = typeof G.flop_moreAction2Action == "string" ? G.flop_moreAction2Action : "", Ue = r.flop_more?.updated?.[I.id] ?? I.stack, Ke = r.flop_more2?.updated?.[I.id] ?? Ue, ze = Ue - Ke;
                            return /* @__PURE__ */ i("div", { className: "bg-yellow-50 rounded-lg p-2 border-l-4 border-yellow-400 shadow-sm", children: [
                              /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-yellow-800 uppercase tracking-wide", children: "More Action 2" }) }),
                              /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                  /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Ue) }),
                                  /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                  /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Ke) })
                                ] }),
                                /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: ve && ve !== "no action" && ve !== "check" ? /* @__PURE__ */ i(je, { children: [
                                  /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                    "-",
                                    a(ze)
                                  ] }),
                                  /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${ve === "all-in" ? "bg-red-600 text-white" : ve === "raise" ? "bg-purple-100 text-purple-700" : ve === "call" ? "bg-blue-100 text-blue-700" : ve === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: ve })
                                ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                              ] })
                            ] });
                          })(),
                          /* @__PURE__ */ i("div", { className: `rounded-lg p-3 border-2 shadow-md ${R ? "bg-gradient-to-r from-gray-50 to-red-50 border-red-300" : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300"}`, children: [
                            /* @__PURE__ */ i("div", { className: "text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2 pb-2 border-b-2 border-gray-300 flex items-center gap-1", children: [
                              /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" }) }),
                              "Summary"
                            ] }),
                            /* @__PURE__ */ i("div", { className: "space-y-2", children: [
                              /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
                                /* @__PURE__ */ e("span", { className: "text-[10px] text-gray-600", children: "Starting Stack:" }),
                                /* @__PURE__ */ e("span", { className: "text-xs font-bold text-blue-600", children: a(ge) })
                              ] }),
                              /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
                                /* @__PURE__ */ e("span", { className: "text-[10px] text-gray-600", children: "Total Contributed:" }),
                                /* @__PURE__ */ e("span", { className: "text-xs font-bold text-red-600", children: a(ge - Be) })
                              ] }),
                              /* @__PURE__ */ i("div", { className: "flex justify-between items-center pt-2 border-t border-gray-300", children: [
                                /* @__PURE__ */ e("span", { className: "text-[10px] text-gray-700 font-bold", children: "Remaining Stack:" }),
                                /* @__PURE__ */ e("span", { className: `text-sm font-bold ${R ? "text-red-600" : "text-green-600"}`, children: a(Be) })
                              ] })
                            ] })
                          ] })
                        ] })
                      ] })
                    }
                  );
                })()
              ] }),
              /* @__PURE__ */ e("td", { className: `border ${O} px-2 py-1`, children: /* @__PURE__ */ e(ke, { playerId: I.id, suffix: B, action: fe, children: /* @__PURE__ */ e(
                Ct,
                {
                  playerId: I.id,
                  selectedAction: fe,
                  suffix: B,
                  onActionClick: (Q) => {
                    n.setPlayerData({
                      ...o,
                      [I.id]: {
                        ...o[I.id],
                        [Z]: Q
                      }
                    }), J(I.id, B);
                  },
                  availableActions: L(I.id, B)
                }
              ) }) }),
              /* @__PURE__ */ e("td", { className: `border ${O} px-1 py-1`, children: /* @__PURE__ */ e(
                Pt,
                {
                  playerId: I.id,
                  selectedAmount: ie,
                  selectedUnit: ye,
                  selectedAction: fe,
                  suffix: B,
                  stage: "flop",
                  actionLevel: k,
                  players: s,
                  playerData: o,
                  sectionStacks: r,
                  onAmountChange: (Q, U) => {
                    console.log(`💰 [FlopView] Amount changed for player ${Q}: ${U}`), n.setPlayerData({
                      ...o,
                      [Q]: {
                        ...o[Q],
                        [he]: U
                      }
                    });
                  },
                  onUnitChange: (Q, U) => {
                    console.log(`🔢 [FlopView] Unit changed for player ${Q}: ${U}`), n.setPlayerData({
                      ...o,
                      [Q]: {
                        ...o[Q],
                        [te]: U
                      }
                    });
                  },
                  onTabComplete: () => {
                    console.log(`🔄 [FlopView] onTabComplete called for player ${I.id}${B}`), console.log(`📍 [FlopView] Calling navigateAfterAction(${I.id}, "${B}")`), J(I.id, B);
                  },
                  isDisabled: !fe || fe === "fold" || fe === "check" || fe === "no action"
                }
              ) })
            ] }, I.id);
          }) })
        ] }),
        /* @__PURE__ */ e("div", { className: `${T} border-2 border-t-0 ${O} rounded-b-lg px-3 py-2`, children: /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ i("div", { className: "text-xs text-gray-600", children: [
            ee.length,
            " player",
            ee.length !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ i("div", { className: "flex gap-2", children: [
            k === l.flop[l.flop.length - 1] && (() => {
              const I = l.flop && l.flop.length >= 3, X = re || I;
              return console.log(`🔘 [FlopView Button Render] actionLevel: ${k}, isAddMoreActionDisabled: ${re}, isMaxLevels: ${I}, Final disabled: ${X}`), /* @__PURE__ */ i(
                "button",
                {
                  onClick: H,
                  "data-add-more-focus": !0,
                  disabled: X,
                  className: "px-6 py-3 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                  children: [
                    /* @__PURE__ */ e("span", { children: "+" }),
                    "Add More Action ",
                    l.flop ? l.flop.length : 1
                  ]
                }
              );
            })(),
            /* @__PURE__ */ i(
              "button",
              {
                onClick: Je,
                disabled: Ne,
                className: "px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                children: [
                  /* @__PURE__ */ e("span", { children: "→" }),
                  "Create Turn"
                ]
              }
            )
          ] })
        ] }) })
      ] }, k);
    }) }),
    /* @__PURE__ */ e("div", { className: "mt-4 flex gap-3 justify-center flex-wrap", children: /* @__PURE__ */ i(
      "button",
      {
        "data-process-stack-focus": !0,
        onClick: Fe,
        className: "px-6 py-3 bg-yellow-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-yellow-600 transition-colors flex items-center gap-2",
        children: [
          /* @__PURE__ */ e("span", { children: "⚡" }),
          "Process Stack - Flop"
        ]
      }
    ) }),
    ae && pe && /* @__PURE__ */ i("div", { className: "mt-8 mb-8", children: [
      /* @__PURE__ */ e("div", { className: "bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-xl p-4", children: /* @__PURE__ */ i("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ i("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e("span", { className: "text-3xl", children: "💰" }),
          /* @__PURE__ */ i("div", { children: [
            /* @__PURE__ */ e("h2", { className: "text-2xl font-bold text-white", children: "Pot Distribution" }),
            /* @__PURE__ */ e("p", { className: "text-sm text-white/90 mt-1", children: "FLOP betting round complete" })
          ] })
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => se(!1),
            className: "text-white/80 hover:text-white text-3xl font-bold leading-none px-2 transition-colors",
            "aria-label": "Close pot display",
            children: "×"
          }
        )
      ] }) }),
      /* @__PURE__ */ e("div", { className: "bg-gray-100 rounded-b-xl p-6 shadow-xl", children: /* @__PURE__ */ e(
        Bt,
        {
          totalPot: pe.totalPot,
          mainPot: pe.mainPot,
          sidePots: pe.sidePots,
          players: pe.players,
          currentPlayers: t.players,
          stackData: t.stackData,
          actions: n,
          contributedAmounts: pe.contributedAmounts,
          playerData: t.playerData
        }
      ) })
    ] })
  ] }) });
};
console.log("[TurnView] Using pot formatter version:", xt);
const xo = ({
  state: t,
  actions: n,
  formatStack: a,
  onClearAll: b,
  onExport: u,
  cardManagement: h,
  potCalculation: c,
  onBackToTournament: d
}) => {
  const {
    players: s,
    playerData: o,
    currentView: f,
    visibleActionLevels: l,
    defaultUnit: x,
    stackData: g,
    processedSections: p,
    sectionStacks: r,
    contributedAmounts: y,
    potsByStage: m,
    communityCards: v,
    autoSelectCards: N
  } = t, {
    setCurrentView: A,
    setDefaultUnit: $,
    setPlayerData: S,
    setProcessedSections: _,
    setSectionStacks: w,
    setContributedAmounts: P,
    setPotsByStage: D,
    addActionLevel: C
  } = n, j = ["actual", "K", "Mil"], [F, Y] = $e({}), [ne, oe] = $e({}), [me, Pe] = $e(!1), [Ae, K] = $e(!0), [re, q] = $e(!1), [Ne, Oe] = $e(""), [De, Me] = $e(null), [be, Te] = $e(!1);
  Xe.useEffect(() => {
    l.turn;
    const M = JSON.stringify(
      s.map((E) => {
        const z = o[E.id] || {};
        return {
          id: E.id,
          turnAction: z.turnAction,
          turnAmount: z.turnAmount,
          turnUnit: z.turnUnit,
          turn_moreActionAction: z.turn_moreActionAction,
          turn_moreActionAmount: z.turn_moreActionAmount,
          turn_moreActionUnit: z.turn_moreActionUnit,
          turn_moreAction2Action: z.turn_moreAction2Action,
          turn_moreAction2Amount: z.turn_moreAction2Amount,
          turn_moreAction2Unit: z.turn_moreAction2Unit
        };
      })
    );
    Ne && M !== Ne && (console.log("🔄 [TurnView] PlayerData changed, invalidating processed state"), q(!1));
  }, [o, s, Ne]), Xe.useEffect(() => {
    const M = l.turn || ["base"], E = M[M.length - 1], z = Ye("turn", E, s, o);
    console.log(`🔄 [TurnView useEffect] Current level: ${E}, Round complete: ${z.isComplete}, Reason: ${z.reason}, Processed: ${re}`), Pe(z.isComplete || !re), K(!z.isComplete || !re);
  }, [o, l.turn, s, re]);
  const pe = rt(null), V = {
    "♠": "text-gray-900",
    "♣": "text-green-700",
    "♥": "text-red-600",
    "♦": "text-blue-600"
  };
  nt(() => {
    const M = !v.turn.card1;
    N && M && h.autoSelectCommunityCards("turn");
  }, []), nt(() => {
    pe.current && pe.current.focus();
  }, []);
  const ae = () => f.includes("-more2") ? "Turn - More Action 2" : f.includes("-more") ? "Turn - More Action 1" : "Turn", se = (M) => {
    $(M);
  }, _e = () => /* @__PURE__ */ i("div", { className: "flex gap-2", children: [
    /* @__PURE__ */ e(
      "button",
      {
        onClick: () => A("flop"),
        className: "px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400 transition-colors",
        children: "← Flop"
      }
    ),
    /* @__PURE__ */ e(
      "button",
      {
        onClick: Je,
        className: "px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors",
        children: "Create River →"
      }
    )
  ] }), We = s.filter((M) => M.name && M.stack > 0).length === 2 ? {
    // Heads-up postflop: BB acts first, SB/Dealer acts last
    BB: 1,
    SB: 2,
    Dealer: 2,
    // In heads-up, SB is also Dealer
    "": 999
  } : {
    // 3+ players postflop: Standard order (SB first, Dealer last)
    SB: 1,
    BB: 2,
    UTG: 3,
    "UTG+1": 4,
    "UTG+2": 5,
    MP: 6,
    HJ: 7,
    "MP+1": 8,
    "MP+2": 9,
    CO: 10,
    Dealer: 11,
    "": 999
  }, Ve = () => s.filter((M) => {
    if (!M.name) return !1;
    const E = o[M.id];
    return E ? !(E.preflopAction === "fold" || E.preflop_moreActionAction === "fold" || E.preflop_moreAction2Action === "fold" || E.flopAction === "fold" || E.flop_moreActionAction === "fold" || E.flop_moreAction2Action === "fold") : !0;
  }).sort((M, E) => {
    const z = We[M.position] || 999, k = We[E.position] || 999;
    return z - k;
  }), Ge = () => s.filter((M) => {
    if (!M.name) return !1;
    const E = o[M.id];
    return E ? E.preflopAction === "fold" || E.preflop_moreActionAction === "fold" || E.preflop_moreAction2Action === "fold" || E.flopAction === "fold" || E.flop_moreActionAction === "fold" || E.flop_moreAction2Action === "fold" : !1;
  }), qe = (M, E) => r.flop_more2?.updated?.[M.id] !== void 0 ? r.flop_more2.updated[M.id] : r.flop_more?.updated?.[M.id] !== void 0 ? r.flop_more.updated[M.id] : r.flop_base?.updated?.[M.id] !== void 0 ? r.flop_base.updated[M.id] : M.stack - (o[M.id]?.postedSB || 0) - (o[M.id]?.postedBB || 0) - (o[M.id]?.postedAnte || 0), Ze = () => m?.flop_more2 ? m.flop_more2.totalPot : m?.flop_more ? m.flop_more.totalPot : m?.flop_base ? m.flop_base.totalPot : 0, Fe = () => {
    console.log("🔄 Processing Stack - Turn...");
    const M = l.turn || ["base"], E = Ze();
    console.log(`💰 Previous street pot (from flop): ${E}`), console.log("🔍 [ProcessStack] Running FR-12 validation for all raise/bet amounts..."), console.log("📋 Current visible levels:", M), console.log("✅ Processed sections:", p);
    const z = [];
    if (M.forEach((k) => {
      const B = `turn_${k}`;
      if (console.log(`
🔍 Checking section: ${B}`), console.log(`   - Is processed? ${p[B]}`), p[B]) {
        console.log(`⏭️  Skipping validation for ${B} (already processed)`);
        return;
      }
      console.log(`✔️  Validating ${B}...`);
      const W = k === "base" ? "" : k === "more" ? "_moreAction" : "_moreAction2", T = s.filter((I) => I.name).length;
      let O;
      T === 2 ? O = ["BB", "SB", "Dealer"] : T === 3 ? O = ["SB", "BB", "Dealer"] : O = ["SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "MP+1", "MP+2", "LJ", "HJ", "CO", "Dealer"];
      const ee = O.map((I) => s.find((X) => X.position === I)).filter((I) => I !== void 0);
      ee.forEach((I, X) => {
        if (!I.name) return;
        const G = o[I.id] || {}, Z = `turn${W}Action`, he = `turn${W}Amount`, te = `turn${W}Unit`, fe = G[Z], ie = G[he], ye = G[te];
        if (fe === "bet" || fe === "raise") {
          const ce = parseFloat(ie);
          if (!ie || ie.trim() === "" || isNaN(ce) || ce <= 0) {
            z.push(`${I.name} (Turn ${k.toUpperCase()}): Missing or invalid raise amount`);
            return;
          }
          const xe = ee.slice(0, X);
          let de = 0;
          k === "base" ? xe.forEach((Be) => {
            if (!Be.name) return;
            const R = o[Be.id] || {}, Q = R[Z], U = R[he], ue = R[te];
            if (Q === "bet" || Q === "raise") {
              const Se = parseFloat(U);
              isNaN(Se) || (de = Math.max(de, Se * (ue === "K" ? 1e3 : 1)));
            }
          }) : ee.forEach((Be) => {
            if (!Be.name || Be.id === I.id) return;
            const R = o[Be.id] || {}, Q = R.turnAction, U = R.turnAmount, ue = R.turnUnit;
            let Se = 0;
            if (Q === "bet" || Q === "raise") {
              const ze = parseFloat(U);
              isNaN(ze) || (Se = ze * (ue === "K" ? 1e3 : 1));
            }
            const Le = R[Z], ve = R[he], Ue = R[te];
            let Ke = Se;
            if (Le === "bet" || Le === "raise") {
              const ze = parseFloat(ve);
              isNaN(ze) || (Ke = ze * (Ue === "K" ? 1e3 : 1));
            }
            de = Math.max(de, Ke);
          });
          const ge = ce * (ye === "K" ? 1e3 : 1);
          de > 0 && ge <= de && z.push(
            `${I.name} (Turn ${k.toUpperCase()}): Raise amount (${ce}) must be greater than current max bet (${de / 1e3})`
          );
        }
      });
    }), z.length > 0) {
      alert(
        `Cannot Process Stack - Raise/Bet Validation Failed:

` + z.join(`

`) + `

Please correct the amounts and try again.`
      ), console.error("❌ [ProcessStack] FR-12 Validation errors:", z);
      return;
    }
    console.log("✅ [ProcessStack] All raise/bet amounts passed FR-12 validation");
    try {
      let k = { ...o };
      M.includes("base") && (s.forEach((te) => {
        if (!te.name) return;
        const fe = k[te.id] || {}, ie = "turnAction";
        fe[ie] || (k = {
          ...k,
          [te.id]: {
            ...fe,
            [ie]: "fold"
          }
        });
      }), S(k), console.log("✅ Normalized base level actions (undefined → fold)"));
      let B = k, W = y, T = p, O = r, ee = null;
      M.forEach((te) => {
        const fe = te === "base" ? "base" : te === "more" ? "more" : "more2";
        console.log(`
📍 Processing level: ${fe}`);
        const ie = _t(
          "turn",
          te,
          s,
          B,
          W,
          T,
          O,
          {
            bigBlind: g.bigBlind,
            smallBlind: g.smallBlind,
            ante: g.ante
          },
          x
        );
        B = ie.updatedPlayerData, W = ie.updatedContributedAmounts, T = ie.updatedProcessedSections, O = ie.updatedSectionStacks, S(ie.updatedPlayerData), P(ie.updatedContributedAmounts), _(ie.updatedProcessedSections), w(ie.updatedSectionStacks), console.log(`✅ Processed ${fe}: Updated player data and stacks`);
        const ye = `turn_${fe}`, ce = ie.updatedContributedAmounts.turn_base || {}, xe = Object.keys(ce).some(
          (Ce) => (ce[parseInt(Ce)] || 0) > 0
        );
        let de;
        if (!xe && E > 0) {
          let Ce = m?.flop_more2 || m?.flop_more || m?.flop_base;
          Ce ? (console.log("🔄 [Turn] No new contributions, preserving Flop pot structure"), console.log(`   Main Pot: ${Ce.mainPot.amount}`), Ce.sidePots.length > 0 && Ce.sidePots.forEach((ge, Be) => {
            console.log(`   Side Pot ${Be + 1}: ${ge.amount}`);
          }), de = Ce) : (console.log("⚠️ [Turn] No Flop pot structure found, calculating normally"), de = st(
            "turn",
            te,
            s,
            ie.updatedPlayerData,
            ie.updatedContributedAmounts,
            ie.updatedProcessedSections,
            ie.updatedSectionStacks,
            {
              bigBlind: g.bigBlind,
              smallBlind: g.smallBlind,
              ante: g.ante
            },
            E
          ));
        } else
          de = st(
            "turn",
            te,
            s,
            ie.updatedPlayerData,
            ie.updatedContributedAmounts,
            ie.updatedProcessedSections,
            ie.updatedSectionStacks,
            {
              bigBlind: g.bigBlind,
              smallBlind: g.smallBlind,
              ante: g.ante
            },
            E
            // Carry forward from flop
          );
        D((Ce) => ({
          ...Ce,
          [ye]: de
        })), ee = de, console.log(`💰 Calculated pot for ${fe}:`, de.totalPot), console.log(`   Main Pot: ${de.mainPot.amount}`), de.sidePots.length > 0 && de.sidePots.forEach((Ce, ge) => {
          console.log(`   Side Pot ${ge + 1}: ${Ce.amount}`);
        });
      }), console.log(`
✅ Process Stack Complete - Total Pot: ${ee.totalPot}`);
      const I = JSON.stringify(
        s.map((te) => {
          const fe = B[te.id] || {};
          return {
            id: te.id,
            turnAction: fe.turnAction,
            turnAmount: fe.turnAmount,
            turnUnit: fe.turnUnit,
            turn_moreActionAction: fe.turn_moreActionAction,
            turn_moreActionAmount: fe.turn_moreActionAmount,
            turn_moreActionUnit: fe.turn_moreActionUnit,
            turn_moreAction2Action: fe.turn_moreAction2Action,
            turn_moreAction2Amount: fe.turn_moreAction2Amount,
            turn_moreAction2Unit: fe.turn_moreAction2Unit
          };
        })
      );
      q(!0), Oe(I), console.log("✅ [TurnView] Set hasProcessedCurrentState to true");
      const X = M[M.length - 1], G = Ye(
        "turn",
        X,
        s,
        B
      );
      if (G.isComplete && ee) {
        const te = Tt(
          ee,
          s,
          W,
          "turn"
        );
        Me(te), Te(!0), console.log("💰 [TurnView] Pot display data prepared:", te);
      } else
        Te(!1);
      Pe(G.isComplete), console.log(`🎯 [Turn] Betting round complete: ${G.isComplete}, Add More Action disabled: ${G.isComplete}`);
      const Z = (X === "base" || X === "more") && !G.isComplete;
      Et({
        stage: "turn",
        actionLevel: X,
        players: s,
        playerData: B,
        hasMoreActionButton: Z,
        hasCreateNextStreetButton: !0
      });
    } catch (k) {
      console.error("❌ Error processing stack:", k), alert(`Error processing stack: ${k instanceof Error ? k.message : String(k)}`);
    }
  }, Je = () => {
    n.setCurrentView("river"), l.river || n.setVisibleActionLevels({
      ...l,
      river: ["base"]
    });
    const M = { ...r };
    M.river_base = {
      initial: {},
      current: {},
      updated: {}
    }, Ve().forEach((E) => {
      let z = E.stack;
      r.turn_more2?.updated?.[E.id] !== void 0 ? z = r.turn_more2.updated[E.id] : r.turn_more?.updated?.[E.id] !== void 0 ? z = r.turn_more.updated[E.id] : r.turn_base?.updated?.[E.id] !== void 0 && (z = r.turn_base.updated[E.id]), M.river_base.initial[E.id] = E.stack, M.river_base.current[E.id] = z, M.river_base.updated[E.id] = z;
    }), n.setSectionStacks(M), console.log("✅ [handleCreateRiver] Copied turn final stacks to river_base");
  }, H = () => {
    const M = l.turn || ["base"], E = M[M.length - 1];
    if (Ye("turn", E, s, o).isComplete) {
      alert("Betting round complete. Please create River instead."), Pe(!0), setTimeout(() => {
        const k = document.querySelector("[data-create-river-focus]");
        k && k.focus();
      }, 100);
      return;
    }
    if (M.includes("more"))
      if (M.includes("more2"))
        alert("Maximum action levels reached (BASE + More Action 1 + More Action 2)");
      else {
        C("turn", "more2"), console.log("[TurnView] Added More Action 2"), q(!1), console.log("🔄 [TurnView] Invalidated processed state (added More Action 2)");
        const k = "turn_more", B = "turn_more2", W = { ...r };
        W[B] = {
          initial: {},
          current: {},
          updated: {}
        }, Ve().forEach((T) => {
          const O = r[k]?.updated?.[T.id] ?? T.stack;
          W[B].initial[T.id] = T.stack, W[B].current[T.id] = O, W[B].updated[T.id] = O;
        }), w(W), console.log(`✅ Copied "Now" stacks from ${k} to ${B}`);
      }
    else {
      C("turn", "more"), console.log("[TurnView] Added More Action 1"), q(!1), console.log("🔄 [TurnView] Invalidated processed state (added More Action 1)");
      const k = "turn_base", B = "turn_more", W = { ...r };
      W[B] = {
        initial: {},
        current: {},
        updated: {}
      }, Ve().forEach((T) => {
        const O = r[k]?.updated?.[T.id] ?? T.stack;
        W[B].initial[T.id] = T.stack, W[B].current[T.id] = O, W[B].updated[T.id] = O;
      }), w(W), console.log(`✅ Copied "Now" stacks from ${k} to ${B}`);
    }
  }, we = (M, E) => {
    const z = E === "" ? "base" : E === "_moreAction" ? "more" : "more2";
    if (z === "base") {
      Ve();
      const he = s.filter((ge) => ge.name).length, te = s.find((ge) => ge.id === M);
      if (!te) return [];
      if (o[M]?.allInFromPrevious === !0)
        return ["all-in"];
      let ie;
      he === 2 ? ie = ["BB", "SB", "Dealer"] : he === 3 ? ie = ["SB", "BB", "Dealer"] : ie = ["SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "MP+1", "MP+2", "LJ", "HJ", "CO", "Dealer"];
      const ye = ie.indexOf(te.position);
      if (ye === -1)
        return [];
      for (let ge = 0; ge < ye; ge++) {
        const Be = ie[ge], R = s.find((Q) => Q.position === Be && Q.name);
        if (R) {
          const Q = o[R.id]?.preflopAction, U = o[R.id]?.flopAction;
          if (Q === "fold" || U === "fold")
            continue;
          const ue = o[R.id]?.turnAction, Se = o[R.id]?.allInFromPrevious === !0;
          if (!ue && !Se)
            return [];
          if (ue === "no action" && !Se)
            return [];
        }
      }
      const ce = /* @__PURE__ */ new Map();
      for (const ge of s) {
        if (!ge.name) continue;
        let Be = 0;
        if (ge.id !== M) {
          const R = o[ge.id]?.turnAction, Q = o[ge.id]?.turnAmount;
          R && R !== "no action" && R !== "fold" && (Be = Q || 0);
        }
        ce.set(ge.id, Be);
      }
      const xe = 0, de = Math.max(...ce.values()), Ce = [];
      return xe >= de && Ce.push("check"), xe < de && Ce.push("call"), de === 0 && Ce.push("bet"), de > 0 && Ce.push("raise"), xe < de && Ce.push("fold"), Ce.push("all-in"), Ce.push("no action"), Ce;
    }
    const k = Ve(), B = k.findIndex((Z) => Z.id === M);
    if (console.log(`🎯 [TurnView MORE ACTION] Checking player ${M}, actionLevel: ${z}, suffix: ${E}`), console.log("🎯 [TurnView MORE ACTION] Active players:", k.map((Z) => `${Z.name} (${Z.position})`)), console.log(`🎯 [TurnView MORE ACTION] Current player index: ${B}`), B === -1)
      return console.log(`❌ [TurnView MORE ACTION] Player ${M} not found in active players`), [];
    const W = s.find((Z) => Z.id === M);
    console.log(`🎯 [TurnView MORE ACTION] Current player: ${W?.name} (${W?.position})`);
    const T = at(M, "turn", z, s, o);
    if (T.alreadyAllIn)
      return console.log(`🔒 [TurnView MORE ACTION] Player ${W?.name} is already all-in`), ["all-in"];
    const O = `turn${E}Action`, ee = o[M]?.[O];
    if (console.log(`🎯 [TurnView MORE ACTION] Player ${W?.name} action: ${ee}`), ee && ee !== "no action")
      return console.log(`✅ [TurnView MORE ACTION] Player ${W?.name} has acted, allowing modification`), ["call", "raise", "all-in", "fold"];
    if (B === 0)
      return console.log(`✅ [TurnView MORE ACTION] Player ${W?.name} is first, enabling buttons`), ["call", "raise", "all-in", "fold"];
    const I = k[B - 1], G = o[I.id]?.[O];
    return console.log(`🔍 [TurnView MORE ACTION] Previous player: ${I.name} (${I.position})`), console.log(`🔍 [TurnView MORE ACTION] Previous player action: ${G}`), !G || G === "no action" ? (console.log(`❌ [TurnView MORE ACTION] Previous player ${I.name} hasn't acted, disabling buttons for ${W?.name}`), []) : (console.log(`✅ [TurnView MORE ACTION] Previous player ${I.name} has acted, checking if ${W?.name} needs to act`), T.alreadyMatchedMaxBet ? [] : ["call", "raise", "all-in", "fold"]);
  }, le = (M, E) => {
    const z = E === "" ? "base" : E === "_moreAction" ? "more" : "more2";
    Ye("turn", z, s, o).isComplete ? setTimeout(() => {
      const B = document.querySelector("[data-process-stack-focus]");
      B && B.focus();
    }, 100) : setTimeout(() => {
      const B = Ve(), W = B.findIndex((T) => T.id === M);
      if (z === "more" || z === "more2") {
        let T = !1;
        for (let O = W + 1; O < B.length; O++) {
          const ee = B[O];
          if (at(ee.id, "turn", z, s, o).needsToAct) {
            const X = `[data-action-focus="${ee.id}-turn${E}"]`, G = document.querySelector(X);
            G && G.focus(), T = !0;
            break;
          }
        }
        if (!T) {
          const O = document.querySelector("[data-process-stack-focus]");
          O && O.focus();
        }
      } else {
        const T = W + 1;
        if (T < B.length) {
          const ee = `[data-action-focus="${B[T].id}-turn${E}"]`, I = document.querySelector(ee);
          I && I.focus();
        } else {
          const O = document.querySelector("[data-process-stack-focus]");
          O && O.focus();
        }
      }
    }, 100);
  }, Re = ({ playerId: M, suffix: E, action: z, children: k }) => {
    const [B, W] = Xe.useState(!1), T = (O) => {
      if (!O.shiftKey && !O.ctrlKey && !O.metaKey) {
        const ee = O.key.toLowerCase(), X = {
          f: "fold",
          c: z === "bet" || z === "raise" ? "call" : "check",
          k: "check",
          b: "bet",
          r: "raise",
          a: "all-in",
          n: "no action"
        }[ee];
        if (X) {
          O.preventDefault();
          const G = E === "" ? "turnAction" : E === "_moreAction" ? "turn_moreActionAction" : "turn_moreAction2Action";
          n.setPlayerData({
            ...o,
            [M]: {
              ...o[M],
              [G]: X
            }
          }), X === "bet" || X === "raise" ? setTimeout(() => {
            const Z = `amount-input-${M}${E || ""}`, he = document.querySelector(`#${Z}`);
            he && (he.focus(), he.select());
          }, 100) : le(M, E);
          return;
        }
      }
      if (O.key === "Tab" && !O.shiftKey) {
        if (O.preventDefault(), z === "bet" || z === "raise") {
          const ee = `amount-input-${M}${E || ""}`, I = document.querySelector(`#${ee}`);
          if (I) {
            I.focus(), I.select();
            return;
          }
        }
        le(M, E);
        return;
      }
    };
    return /* @__PURE__ */ e(
      "div",
      {
        "data-action-focus": `${M}-turn${E}`,
        tabIndex: 0,
        onKeyDown: T,
        onFocus: () => W(!0),
        onBlur: () => W(!1),
        className: `rounded p-2 transition-all outline-none ${B ? "border-2 border-blue-400 bg-blue-50 ring-2 ring-blue-500" : "border-2 border-gray-300 bg-gray-50"}`,
        children: k
      }
    );
  }, L = m && Object.keys(m).some((M) => M.startsWith("preflop")), J = m && Object.keys(m).some((M) => M.startsWith("flop"));
  m && Object.keys(m).some((M) => M.startsWith("turn"));
  const ke = m && Object.keys(m).some((M) => M.startsWith("river"));
  return /* @__PURE__ */ e("div", { className: "p-2 max-w-full mx-auto bg-gray-50 min-h-screen", children: /* @__PURE__ */ i("div", { className: "bg-white rounded-lg shadow-lg p-3", children: [
    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-2 pb-2 border-b border-gray-100", children: /* @__PURE__ */ i(
      "button",
      {
        onClick: () => {
          if (d)
            d();
          else {
            const M = localStorage.getItem("lastTournamentId") || "1";
            window.open(`/tpro.html?view=handHistory&tournamentId=${M}`, "_blank");
          }
        },
        className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors",
        children: [
          /* @__PURE__ */ e("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }),
          /* @__PURE__ */ e("span", { children: d ? "Back to Tournament" : "Back to Hand History" })
        ]
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "flex gap-2 mb-3 border-b border-gray-200 pb-2", children: [
      /* @__PURE__ */ e(
        "button",
        {
          onClick: () => A("stack"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "Stack"
        }
      ),
      L && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => A("preflop"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "Pre-flop"
        }
      ),
      J && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => A("flop"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "Flop"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-blue-600 text-white",
          disabled: !0,
          children: "Turn"
        }
      ),
      ke && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => A("river"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "River"
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "flex justify-between items-center mb-3", children: [
      /* @__PURE__ */ e("h1", { className: "text-lg font-bold text-gray-800", children: ae() }),
      /* @__PURE__ */ i("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ e("label", { className: "text-xs font-medium text-gray-700", children: "Unit:" }),
          /* @__PURE__ */ e("div", { className: "flex gap-0.5", children: j.map((M) => /* @__PURE__ */ e(
            "button",
            {
              onClick: () => se(M),
              className: `px-1 py-0.5 rounded text-xs font-medium transition-colors ${x === M ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`,
              children: M
            },
            M
          )) })
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: b,
            className: "px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors",
            children: "Clear"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: u,
            className: "px-2 py-0.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors",
            children: "Export"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "mb-3 p-3 bg-orange-100 border-2 border-orange-300 rounded", children: [
      /* @__PURE__ */ i("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ e("div", { className: "text-sm font-bold text-gray-800", children: "Turn Community Cards" }),
        N && /* @__PURE__ */ e(
          "button",
          {
            onClick: () => h.autoSelectCommunityCards("turn"),
            className: "px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition-colors",
            children: "Auto-Select Turn Card"
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "flex gap-3 mb-3 justify-center items-center", children: [
        /* @__PURE__ */ e("div", { className: "flex gap-2 opacity-60", children: [1, 2, 3].map((M) => {
          const E = v.flop[`card${M}`];
          return /* @__PURE__ */ i("div", { className: "flex flex-col items-center", children: [
            /* @__PURE__ */ i("div", { className: "text-xs font-semibold text-gray-600 mb-1", children: [
              "Flop ",
              M
            ] }),
            /* @__PURE__ */ e("div", { className: `w-16 h-24 rounded-lg border-2 shadow-sm flex flex-col items-center justify-center ${E ? "bg-gray-50 border-gray-300" : "bg-gray-100 border-gray-300"}`, children: E ? /* @__PURE__ */ i(je, { children: [
              /* @__PURE__ */ e("div", { className: "text-3xl font-bold text-gray-900", children: E.rank === "T" ? "10" : E.rank }),
              /* @__PURE__ */ e("div", { className: `text-3xl ${V[E.suit]}`, children: E.suit })
            ] }) : /* @__PURE__ */ e("div", { className: "text-3xl font-bold text-gray-300", children: "?" }) })
          ] }, M);
        }) }),
        /* @__PURE__ */ e("div", { className: "w-px h-24 bg-orange-300" }),
        /* @__PURE__ */ i("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ e("div", { className: "text-xs font-semibold text-orange-700 mb-1", children: "Turn" }),
          /* @__PURE__ */ e("div", { className: `w-20 h-28 rounded-lg border-2 shadow-md flex flex-col items-center justify-center transition-all ${v.turn.card1 ? "bg-white border-orange-500 ring-2 ring-orange-300" : "bg-gray-50 border-gray-300"}`, children: v.turn.card1 ? /* @__PURE__ */ i(je, { children: [
            /* @__PURE__ */ e("div", { className: "text-4xl font-bold text-gray-900", children: v.turn.card1.rank === "T" ? "10" : v.turn.card1.rank }),
            /* @__PURE__ */ e("div", { className: `text-4xl ${V[v.turn.card1.suit]}`, children: v.turn.card1.suit })
          ] }) : /* @__PURE__ */ e("div", { className: "text-4xl font-bold text-gray-300", children: "?" }) })
        ] })
      ] }),
      /* @__PURE__ */ e("div", { className: "flex gap-3 items-center justify-center", children: /* @__PURE__ */ e(
        dt,
        {
          ref: pe,
          stage: "turn",
          cardNumber: 1,
          label: "Turn Card",
          currentCard: v.turn.card1,
          onCardChange: h.updateCommunityCard,
          isCardAvailable: (M, E) => h.checkCardAvailable(M, E, v.turn.card1),
          autoSelect: N
        }
      ) })
    ] }),
    /* @__PURE__ */ e("div", { className: "mb-3 p-2 bg-gray-100 rounded", children: /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ e("div", { children: _e() }),
      /* @__PURE__ */ e("div", { className: "flex items-center gap-2", children: Ge().length > 0 && /* @__PURE__ */ i("div", { className: "text-xs text-gray-600", children: [
        "Folded: ",
        Ge().length
      ] }) })
    ] }) }),
    /* @__PURE__ */ e("div", { className: "space-y-4", style: { overflowX: "auto", overflowY: "visible" }, children: l.turn?.map((M) => {
      const E = M === "base" ? "" : M === "more" ? "_moreAction" : "_moreAction2", z = M === "base" ? "BASE ACTIONS" : M === "more" ? "MORE ACTION 1" : "MORE ACTION 2", k = M === "base" ? "bg-white" : M === "more" ? "bg-blue-50" : "bg-green-50", B = M === "base" ? "border-gray-300" : M === "more" ? "border-blue-300" : "border-green-300", W = Ve().filter((T) => {
        if (M === "base") return !0;
        const O = o[T.id];
        return O ? M === "more" ? O.turnAction !== "fold" : M === "more2" ? O.turnAction !== "fold" && O.turn_moreActionAction !== "fold" : !0 : !0;
      }).sort((T, O) => {
        const ee = We[T.position] || 999, I = We[O.position] || 999;
        return ee - I;
      });
      return W.length === 0 && M !== "base" ? null : /* @__PURE__ */ i("div", { className: "mb-6", children: [
        /* @__PURE__ */ e(
          "div",
          {
            className: `${k} border-2 ${B} rounded-t-lg px-3 py-2`,
            children: /* @__PURE__ */ i("h3", { className: "text-sm font-bold text-gray-800", children: [
              z,
              " - ",
              ae()
            ] })
          }
        ),
        /* @__PURE__ */ i(
          "table",
          {
            className: `w-full border-collapse border-2 ${B}`,
            style: { overflow: "visible" },
            children: [
              /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ i("tr", { className: k, children: [
                /* @__PURE__ */ e(
                  "th",
                  {
                    className: `border ${B} px-3 py-2 text-left text-sm font-medium text-gray-700`,
                    children: "Player"
                  }
                ),
                /* @__PURE__ */ e(
                  "th",
                  {
                    className: `border ${B} px-4 py-2 text-center text-sm font-medium text-gray-700 w-32`,
                    children: "Stack"
                  }
                ),
                /* @__PURE__ */ e(
                  "th",
                  {
                    className: `border ${B} px-3 py-2 text-center text-sm font-medium text-gray-700`,
                    children: "Action"
                  }
                ),
                /* @__PURE__ */ e(
                  "th",
                  {
                    className: `border ${B} px-4 py-2 text-center text-sm font-medium text-gray-700 w-32`,
                    children: "Amount/Unit"
                  }
                )
              ] }) }),
              /* @__PURE__ */ e("tbody", { children: W.map((T) => {
                const O = o[T.id] || {}, ee = `turn${E}Action`, I = `turn${E}Amount`, X = `turn${E}Unit`, G = O[ee] || "", Z = O[I] || "", he = O[X] || x;
                return /* @__PURE__ */ i("tr", { className: k, children: [
                  /* @__PURE__ */ i(
                    "td",
                    {
                      className: `border ${B} px-3 py-2 text-sm font-medium text-gray-800`,
                      children: [
                        T.name,
                        T.position && /* @__PURE__ */ i("span", { className: "ml-2 text-xs text-blue-600", children: [
                          "(",
                          T.position,
                          ")"
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ e("td", { className: `border ${B} px-2 py-2 text-center relative`, style: { overflow: "visible" }, children: (() => {
                    const te = `${T.id}-turn-${M}`, fe = F[te] || !1, ie = `turn_${M}`, ye = p[ie], ce = T.stack, xe = r[ie]?.updated?.[T.id] ?? (ye ? ce : null), de = xe !== null && xe === 0;
                    return /* @__PURE__ */ i(je, { children: [
                      /* @__PURE__ */ i("div", { className: "space-y-1", children: [
                        /* @__PURE__ */ i("div", { className: "flex items-center justify-between bg-blue-50 rounded px-2 py-1 border border-blue-200", children: [
                          /* @__PURE__ */ e("span", { className: "text-[10px] text-blue-600", children: "Start:" }),
                          /* @__PURE__ */ e("span", { className: "text-xs font-bold text-blue-900", children: a(ce) })
                        ] }),
                        /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                          /* @__PURE__ */ i("div", { className: `flex-1 flex items-center justify-between rounded px-2 py-1 border ${de ? "bg-red-50 border-2 border-red-400" : "bg-green-50 border-green-200"}`, children: [
                            /* @__PURE__ */ e("span", { className: `text-[10px] ${de ? "text-red-700 font-bold" : "text-green-600"}`, children: "Now:" }),
                            xe !== null ? /* @__PURE__ */ e("span", { className: `text-xs font-bold ${de ? "text-red-900" : "text-green-900"}`, children: a(xe) }) : /* @__PURE__ */ e("span", { className: "text-xs font-bold text-gray-400", children: "-" })
                          ] }),
                          xe !== null && /* @__PURE__ */ e(
                            "button",
                            {
                              onMouseDown: (Ce) => {
                                Ce.preventDefault();
                              },
                              onClick: (Ce) => {
                                Ce.preventDefault(), Ce.stopPropagation();
                                const ge = !fe;
                                if (Y((Be) => ({
                                  ...Be,
                                  [te]: ge
                                })), ge) {
                                  const R = Ce.currentTarget.getBoundingClientRect(), Q = 600, U = 460, ue = window.innerHeight - R.bottom, Se = R.top, Le = ue < Q && Se > ue;
                                  let ve;
                                  Le ? ve = Math.max(10, R.top - Q - 8) : ve = R.bottom + 8;
                                  const Ue = R.left + R.width / 2, Ke = U / 2, ze = Ue - Ke, et = window.innerWidth - (Ue + Ke);
                                  let ot = "center", tt = Ue;
                                  ze < 10 ? (ot = "left", tt = Math.max(10, R.left)) : et < 10 && (ot = "right", tt = Math.min(window.innerWidth - 10, R.right)), oe((pt) => ({
                                    ...pt,
                                    [te]: Le ? "above" : "below",
                                    [`${te}_top`]: ve,
                                    [`${te}_horizontal`]: ot,
                                    [`${te}_left`]: tt
                                  }));
                                }
                              },
                              className: "px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-[10px] font-semibold rounded shadow-md hover:shadow-lg transition-all duration-200",
                              title: "Show stack history",
                              children: /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })
                            }
                          )
                        ] })
                      ] }),
                      fe && xe !== null && (() => {
                        ne[te];
                        const Ce = ne[`${te}_top`] || 0, ge = ne[`${te}_horizontal`] || "center", Be = ne[`${te}_left`] || 0;
                        let R = "";
                        ge === "center" ? R = "transform -translate-x-1/2" : ge === "right" && (R = "transform -translate-x-full");
                        const Q = `fixed z-[9999] ${R}`;
                        return /* @__PURE__ */ e(
                          "div",
                          {
                            "data-stack-history-card": te,
                            className: Q,
                            style: {
                              minWidth: "400px",
                              maxWidth: "460px",
                              top: `${Ce}px`,
                              left: `${Be}px`,
                              maxHeight: "calc(100vh - 20px)",
                              overflowY: "auto"
                            },
                            children: /* @__PURE__ */ i("div", { className: `bg-gradient-to-br rounded-xl shadow-2xl border-2 overflow-hidden ${de ? "from-red-50 to-orange-50 border-red-400" : "from-white to-blue-50 border-blue-300"}`, children: [
                              /* @__PURE__ */ i("div", { className: `bg-gradient-to-r px-3 py-2 flex items-center justify-between ${de ? "from-red-600 to-red-700" : "from-blue-600 to-blue-700"}`, children: [
                                /* @__PURE__ */ i("div", { className: "flex items-center gap-2", children: [
                                  /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }),
                                  /* @__PURE__ */ i("h3", { className: "text-white font-bold text-xs", children: [
                                    T.name,
                                    " - Stack History (Turn ",
                                    M.toUpperCase(),
                                    ") ",
                                    de && "(ALL-IN)"
                                  ] })
                                ] }),
                                /* @__PURE__ */ e(
                                  "button",
                                  {
                                    onClick: () => Y((U) => ({
                                      ...U,
                                      [te]: !1
                                    })),
                                    className: `text-white transition-colors ${de ? "hover:text-red-200" : "hover:text-blue-200"}`,
                                    children: /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
                                  }
                                )
                              ] }),
                              /* @__PURE__ */ i("div", { className: "p-3 space-y-2", children: [
                                (() => {
                                  const U = typeof O.preflopAction == "string" ? O.preflopAction : "", Se = T.stack - (O.postedSB || 0) - (O.postedBB || 0), Le = r.preflop_base?.updated?.[T.id] ?? Se, ve = Se - Le;
                                  return /* @__PURE__ */ i("div", { className: "bg-indigo-50 rounded-lg p-2 border-l-4 border-indigo-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-indigo-800 uppercase tracking-wide", children: "PreFlop BASE" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Se) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Le) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: U && U !== "no action" && U !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(ve)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${U === "all-in" ? "bg-red-600 text-white" : U === "raise" ? "bg-purple-100 text-purple-700" : U === "call" ? "bg-blue-100 text-blue-700" : U === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: U })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                r.preflop_more && (() => {
                                  const U = typeof O.preflop_moreActionAction == "string" ? O.preflop_moreActionAction : "", ue = r.preflop_base?.updated?.[T.id] ?? T.stack, Se = r.preflop_more?.updated?.[T.id] ?? ue, Le = ue - Se;
                                  return /* @__PURE__ */ i("div", { className: "bg-teal-50 rounded-lg p-2 border-l-4 border-teal-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-teal-800 uppercase tracking-wide", children: "PreFlop MA1" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(ue) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Se) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: U && U !== "no action" && U !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(Le)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${U === "all-in" ? "bg-red-600 text-white" : U === "raise" ? "bg-purple-100 text-purple-700" : U === "call" ? "bg-blue-100 text-blue-700" : U === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: U })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                r.preflop_more2 && (() => {
                                  const U = typeof O.preflop_moreAction2Action == "string" ? O.preflop_moreAction2Action : "", ue = r.preflop_more?.updated?.[T.id] ?? T.stack, Se = r.preflop_more2?.updated?.[T.id] ?? ue, Le = ue - Se;
                                  return /* @__PURE__ */ i("div", { className: "bg-cyan-50 rounded-lg p-2 border-l-4 border-cyan-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-cyan-800 uppercase tracking-wide", children: "PreFlop MA2" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(ue) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Se) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: U && U !== "no action" && U !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(Le)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${U === "all-in" ? "bg-red-600 text-white" : U === "raise" ? "bg-purple-100 text-purple-700" : U === "call" ? "bg-blue-100 text-blue-700" : U === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: U })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                r.flop_base && (() => {
                                  const U = typeof O.flopAction == "string" ? O.flopAction : "", ue = qe(T), Se = r.flop_base?.updated?.[T.id] ?? ue, Le = ue - Se;
                                  return /* @__PURE__ */ i("div", { className: "bg-gray-50 rounded-lg p-2 border-l-4 border-gray-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-gray-800 uppercase tracking-wide", children: "FLOP BASE" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(ue) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Se) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: U && U !== "no action" && U !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(Le)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${U === "all-in" ? "bg-red-600 text-white" : U === "raise" ? "bg-purple-100 text-purple-700" : U === "call" ? "bg-blue-100 text-blue-700" : U === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: U })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                r.flop_more && (() => {
                                  const U = typeof O.flop_moreActionAction == "string" ? O.flop_moreActionAction : "", ue = r.flop_base?.updated?.[T.id] ?? T.stack, Se = r.flop_more?.updated?.[T.id] ?? ue, Le = ue - Se;
                                  return /* @__PURE__ */ i("div", { className: "bg-purple-50 rounded-lg p-2 border-l-4 border-purple-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-purple-800 uppercase tracking-wide", children: "FLOP MA1" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(ue) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Se) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: U && U !== "no action" && U !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(Le)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${U === "all-in" ? "bg-red-600 text-white" : U === "raise" ? "bg-purple-100 text-purple-700" : U === "call" ? "bg-blue-100 text-blue-700" : U === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: U })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                r.flop_more2 && (() => {
                                  const U = typeof O.flop_moreAction2Action == "string" ? O.flop_moreAction2Action : "", ue = r.flop_more?.updated?.[T.id] ?? T.stack, Se = r.flop_more2?.updated?.[T.id] ?? ue, Le = ue - Se;
                                  return /* @__PURE__ */ i("div", { className: "bg-yellow-50 rounded-lg p-2 border-l-4 border-yellow-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-yellow-800 uppercase tracking-wide", children: "FLOP MA2" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(ue) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Se) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: U && U !== "no action" && U !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(Le)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${U === "all-in" ? "bg-red-600 text-white" : U === "raise" ? "bg-purple-100 text-purple-700" : U === "call" ? "bg-blue-100 text-blue-700" : U === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: U })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                (() => {
                                  const U = typeof O.turnAction == "string" ? O.turnAction : "", ue = qe(T), Se = r.turn_base?.updated?.[T.id] ?? ue, Le = ue - Se;
                                  return /* @__PURE__ */ i("div", { className: "bg-orange-50 rounded-lg p-2 border-l-4 border-orange-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-orange-800 uppercase tracking-wide", children: "TURN BASE" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(ue) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Se) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: U && U !== "no action" && U !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(Le)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${U === "all-in" ? "bg-red-600 text-white" : U === "raise" ? "bg-purple-100 text-purple-700" : U === "call" ? "bg-blue-100 text-blue-700" : U === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: U })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                l.turn.includes("more") && (() => {
                                  const U = typeof O.turn_moreActionAction == "string" ? O.turn_moreActionAction : "", ue = r.turn_base?.updated?.[T.id] ?? T.stack, Se = r.turn_more?.updated?.[T.id] ?? ue, Le = ue - Se;
                                  return /* @__PURE__ */ i("div", { className: "bg-pink-50 rounded-lg p-2 border-l-4 border-pink-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-pink-800 uppercase tracking-wide", children: "TURN MA1" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(ue) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Se) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: U && U !== "no action" && U !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(Le)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${U === "all-in" ? "bg-red-600 text-white" : U === "raise" ? "bg-purple-100 text-purple-700" : U === "call" ? "bg-blue-100 text-blue-700" : U === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: U })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                l.turn.includes("more2") && (() => {
                                  const U = typeof O.turn_moreAction2Action == "string" ? O.turn_moreAction2Action : "", ue = r.turn_more?.updated?.[T.id] ?? T.stack, Se = r.turn_more2?.updated?.[T.id] ?? ue, Le = ue - Se;
                                  return /* @__PURE__ */ i("div", { className: "bg-lime-50 rounded-lg p-2 border-l-4 border-lime-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-lime-800 uppercase tracking-wide", children: "TURN MA2" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(ue) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(Se) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: U && U !== "no action" && U !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(Le)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${U === "all-in" ? "bg-red-600 text-white" : U === "raise" ? "bg-purple-100 text-purple-700" : U === "call" ? "bg-blue-100 text-blue-700" : U === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: U })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                /* @__PURE__ */ i("div", { className: `rounded-lg p-3 border-2 shadow-md ${de ? "bg-gradient-to-r from-gray-50 to-red-50 border-red-300" : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300"}`, children: [
                                  /* @__PURE__ */ i("div", { className: "text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2 pb-2 border-b-2 border-gray-300 flex items-center gap-1", children: [
                                    /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" }) }),
                                    "Summary"
                                  ] }),
                                  /* @__PURE__ */ i("div", { className: "space-y-2", children: [
                                    /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
                                      /* @__PURE__ */ e("span", { className: "text-[10px] text-gray-600", children: "Starting Stack:" }),
                                      /* @__PURE__ */ e("span", { className: "text-xs font-bold text-blue-600", children: a(ce) })
                                    ] }),
                                    /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
                                      /* @__PURE__ */ e("span", { className: "text-[10px] text-gray-600", children: "Total Contributed:" }),
                                      /* @__PURE__ */ e("span", { className: "text-xs font-bold text-red-600", children: a(ce - xe) })
                                    ] }),
                                    /* @__PURE__ */ i("div", { className: "flex justify-between items-center pt-2 border-t border-gray-300", children: [
                                      /* @__PURE__ */ e("span", { className: "text-[10px] text-gray-700 font-bold", children: "Remaining Stack:" }),
                                      /* @__PURE__ */ e("span", { className: `text-sm font-bold ${de ? "text-red-600" : "text-green-600"}`, children: a(xe) })
                                    ] })
                                  ] })
                                ] })
                              ] })
                            ] })
                          }
                        );
                      })()
                    ] });
                  })() }),
                  /* @__PURE__ */ e("td", { className: `border ${B} px-2 py-1`, children: /* @__PURE__ */ e(Re, { playerId: T.id, suffix: E, action: G, children: /* @__PURE__ */ e(
                    Ct,
                    {
                      playerId: T.id,
                      selectedAction: G,
                      suffix: E,
                      onActionClick: (te) => {
                        n.setPlayerData({
                          ...o,
                          [T.id]: {
                            ...o[T.id],
                            [ee]: te
                          }
                        }), le(T.id, E);
                      },
                      availableActions: we(T.id, E)
                    }
                  ) }) }),
                  /* @__PURE__ */ e("td", { className: `border ${B} px-1 py-1`, children: /* @__PURE__ */ e(
                    Pt,
                    {
                      playerId: T.id,
                      selectedAmount: Z,
                      selectedAction: G,
                      selectedUnit: he,
                      suffix: E,
                      stage: "turn",
                      actionLevel: M,
                      players: s,
                      playerData: o,
                      sectionStacks: r,
                      onAmountChange: (te, fe) => {
                        n.setPlayerData({
                          ...o,
                          [te]: {
                            ...o[te],
                            [I]: fe
                          }
                        });
                      },
                      onUnitChange: (te, fe) => {
                        n.setPlayerData({
                          ...o,
                          [te]: {
                            ...o[te],
                            [X]: fe
                          }
                        });
                      },
                      onTabComplete: () => {
                        console.log(`🔔 [TurnView] onTabComplete called for player ${T.id}`), le(T.id, E);
                      },
                      isDisabled: !G || G === "fold" || G === "check" || G === "no action"
                    }
                  ) })
                ] }, T.id);
              }) })
            ]
          }
        ),
        /* @__PURE__ */ e(
          "div",
          {
            className: `${k} border-2 border-t-0 ${B} rounded-b-lg px-3 py-2`,
            children: /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ i("div", { className: "text-xs text-gray-600", children: [
                W.length,
                " player",
                W.length !== 1 ? "s" : ""
              ] }),
              /* @__PURE__ */ i("div", { className: "flex gap-2", children: [
                M === l.turn[l.turn.length - 1] && /* @__PURE__ */ i(
                  "button",
                  {
                    onClick: H,
                    "data-add-more-focus": !0,
                    disabled: me || l.turn && l.turn.length >= 3,
                    className: "px-6 py-3 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                    children: [
                      /* @__PURE__ */ e("span", { children: "+" }),
                      "Add More Action ",
                      l.turn ? l.turn.length : 1
                    ]
                  }
                ),
                /* @__PURE__ */ i(
                  "button",
                  {
                    onClick: Je,
                    disabled: Ae,
                    className: "px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                    children: [
                      /* @__PURE__ */ e("span", { children: "→" }),
                      "Create River"
                    ]
                  }
                )
              ] })
            ] })
          }
        )
      ] }, M);
    }) }),
    /* @__PURE__ */ e("div", { className: "mt-4 flex gap-3 justify-center flex-wrap", children: /* @__PURE__ */ i(
      "button",
      {
        onClick: Fe,
        "data-process-stack-focus": !0,
        className: "px-6 py-3 bg-yellow-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-yellow-600 transition-colors flex items-center gap-2",
        children: [
          /* @__PURE__ */ e("span", { children: "⚡" }),
          "Process Stack - Turn"
        ]
      }
    ) }),
    be && De && /* @__PURE__ */ i("div", { className: "mt-8 mb-8", children: [
      /* @__PURE__ */ e("div", { className: "bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-xl p-4", children: /* @__PURE__ */ i("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ i("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e("span", { className: "text-3xl", children: "💰" }),
          /* @__PURE__ */ i("div", { children: [
            /* @__PURE__ */ e("h2", { className: "text-2xl font-bold text-white", children: "Pot Distribution" }),
            /* @__PURE__ */ e("p", { className: "text-sm text-white/90 mt-1", children: "TURN betting round complete" })
          ] })
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => Te(!1),
            className: "text-white/80 hover:text-white text-3xl font-bold leading-none px-2 transition-colors",
            "aria-label": "Close pot display",
            children: "×"
          }
        )
      ] }) }),
      /* @__PURE__ */ e("div", { className: "bg-gray-100 rounded-b-xl p-6 shadow-xl", children: /* @__PURE__ */ e(
        Bt,
        {
          totalPot: De.totalPot,
          mainPot: De.mainPot,
          sidePots: De.sidePots,
          players: De.players,
          currentPlayers: t.players,
          stackData: t.stackData,
          actions: n,
          contributedAmounts: De.contributedAmounts,
          playerData: t.playerData
        }
      ) })
    ] })
  ] }) });
};
console.log("[RiverView] Using pot formatter version:", xt);
const vo = ({
  state: t,
  actions: n,
  formatStack: a,
  onClearAll: b,
  onExport: u,
  cardManagement: h,
  potCalculation: c,
  onBackToTournament: d
}) => {
  const {
    players: s,
    playerData: o,
    currentView: f,
    visibleActionLevels: l,
    defaultUnit: x,
    stackData: g,
    processedSections: p,
    sectionStacks: r,
    contributedAmounts: y,
    potsByStage: m,
    communityCards: v,
    autoSelectCards: N
  } = t, {
    setCurrentView: A,
    setDefaultUnit: $,
    setPlayerData: S,
    setProcessedSections: _,
    setSectionStacks: w,
    setContributedAmounts: P,
    setPotsByStage: D,
    addActionLevel: C
  } = n, j = ["actual", "K", "Mil"], [F, Y] = $e({}), [ne, oe] = $e({}), [me, Pe] = $e(!1), [Ae, K] = $e(!1), [re, q] = $e(""), [Ne, Oe] = $e(null), [De, Me] = $e(!1);
  Xe.useEffect(() => {
    l.river;
    const L = JSON.stringify(
      s.map((J) => {
        const ke = o[J.id] || {};
        return {
          id: J.id,
          riverAction: ke.riverAction,
          riverAmount: ke.riverAmount,
          riverUnit: ke.riverUnit,
          river_moreActionAction: ke.river_moreActionAction,
          river_moreActionAmount: ke.river_moreActionAmount,
          river_moreActionUnit: ke.river_moreActionUnit,
          river_moreAction2Action: ke.river_moreAction2Action,
          river_moreAction2Amount: ke.river_moreAction2Amount,
          river_moreAction2Unit: ke.river_moreAction2Unit
        };
      })
    );
    re && L !== re && (console.log("🔄 [RiverView] PlayerData changed, invalidating processed state"), K(!1));
  }, [o, s, re]), Xe.useEffect(() => {
    const L = l.river || ["base"], J = L[L.length - 1], ke = Ye("river", J, s, o);
    console.log(`🔄 [RiverView useEffect] Current level: ${J}, Round complete: ${ke.isComplete}, Reason: ${ke.reason}, Processed: ${Ae}`), Pe(ke.isComplete || !Ae);
  }, [o, l.river, s, Ae]);
  const be = rt(null), Te = {
    "♠": "text-gray-900",
    "♣": "text-green-700",
    "♥": "text-red-600",
    "♦": "text-blue-600"
  };
  nt(() => {
    const L = !v.river.card1;
    N && L && h.autoSelectCommunityCards("river");
  }, []), nt(() => {
    console.log("[RiverView] Setting initial focus to river card selector"), be.current && be.current.focus();
  }, []);
  const pe = () => f.includes("-more2") ? "River - More Action 2" : f.includes("-more") ? "River - More Action 1" : "River", V = (L) => {
    $(L);
  }, ae = () => /* @__PURE__ */ e("div", { className: "flex gap-2", children: /* @__PURE__ */ e(
    "button",
    {
      onClick: () => A("turn"),
      className: "px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400 transition-colors",
      children: "← Turn"
    }
  ) }), Ee = s.filter((L) => L.name && L.stack > 0).length === 2 ? {
    // Heads-up postflop: BB acts first, SB/Dealer acts last
    BB: 1,
    SB: 2,
    Dealer: 2,
    // In heads-up, SB is also Dealer
    "": 999
  } : {
    // 3+ players postflop: Standard order (SB first, Dealer last)
    SB: 1,
    BB: 2,
    UTG: 3,
    "UTG+1": 4,
    "UTG+2": 5,
    MP: 6,
    HJ: 7,
    "MP+1": 8,
    "MP+2": 9,
    CO: 10,
    Dealer: 11,
    "": 999
  }, Ie = () => s.filter((L) => {
    if (!L.name) return !1;
    const J = o[L.id];
    return J ? !(J.preflopAction === "fold" || J.preflop_moreActionAction === "fold" || J.preflop_moreAction2Action === "fold" || J.flopAction === "fold" || J.flop_moreActionAction === "fold" || J.flop_moreAction2Action === "fold" || J.turnAction === "fold" || J.turn_moreActionAction === "fold" || J.turn_moreAction2Action === "fold") : !0;
  }).sort((L, J) => {
    const ke = Ee[L.position] || 999, M = Ee[J.position] || 999;
    return ke - M;
  }), We = () => s.filter((L) => {
    if (!L.name) return !1;
    const J = o[L.id];
    return J ? J.preflopAction === "fold" || J.preflop_moreActionAction === "fold" || J.preflop_moreAction2Action === "fold" || J.flopAction === "fold" || J.flop_moreActionAction === "fold" || J.flop_moreAction2Action === "fold" || J.turnAction === "fold" || J.turn_moreActionAction === "fold" || J.turn_moreAction2Action === "fold" : !1;
  }), Ve = (L, J) => r.turn_more2?.updated?.[L.id] !== void 0 ? r.turn_more2.updated[L.id] : r.turn_more?.updated?.[L.id] !== void 0 ? r.turn_more.updated[L.id] : r.turn_base?.updated?.[L.id] !== void 0 ? r.turn_base.updated[L.id] : L.stack - (o[L.id]?.postedSB || 0) - (o[L.id]?.postedBB || 0) - (o[L.id]?.postedAnte || 0), Ge = () => m?.turn_more2 ? m.turn_more2.totalPot : m?.turn_more ? m.turn_more.totalPot : m?.turn_base ? m.turn_base.totalPot : 0, qe = () => {
    console.log("🔄 Processing Stack - River...");
    const L = l.river || ["base"], J = Ge();
    console.log(`💰 Previous street pot (from turn): ${J}`), console.log("🔍 [ProcessStack] Running FR-12 validation for all raise/bet amounts..."), console.log("📋 Current visible levels:", L), console.log("✅ Processed sections:", p);
    const ke = [];
    if (L.forEach((M) => {
      const E = `river_${M}`;
      if (console.log(`
🔍 Checking section: ${E}`), console.log(`   - Is processed? ${p[E]}`), p[E]) {
        console.log(`⏭️  Skipping validation for ${E} (already processed)`);
        return;
      }
      console.log(`✔️  Validating ${E}...`);
      const z = M === "base" ? "" : M === "more" ? "_moreAction" : "_moreAction2", k = s.filter((T) => T.name).length;
      let B;
      k === 2 ? B = ["BB", "SB", "Dealer"] : k === 3 ? B = ["SB", "BB", "Dealer"] : B = ["SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "MP+1", "MP+2", "LJ", "HJ", "CO", "Dealer"];
      const W = B.map((T) => s.find((O) => O.position === T)).filter((T) => T !== void 0);
      W.forEach((T, O) => {
        if (!T.name) return;
        const ee = o[T.id] || {}, I = `river${z}Action`, X = `river${z}Amount`, G = `river${z}Unit`, Z = ee[I], he = ee[X], te = ee[G];
        if (Z === "bet" || Z === "raise") {
          const fe = parseFloat(he);
          if (!he || he.trim() === "" || isNaN(fe) || fe <= 0) {
            ke.push(`${T.name} (River ${M.toUpperCase()}): Missing or invalid raise amount`);
            return;
          }
          const ie = W.slice(0, O);
          let ye = 0;
          M === "base" ? ie.forEach((de) => {
            if (!de.name) return;
            const Ce = o[de.id] || {}, ge = Ce[I], Be = Ce[X], R = Ce[G];
            if (ge === "bet" || ge === "raise") {
              const Q = parseFloat(Be);
              isNaN(Q) || (ye = Math.max(ye, Q * (R === "K" ? 1e3 : 1)));
            }
          }) : W.forEach((de) => {
            if (!de.name || de.id === T.id) return;
            const Ce = o[de.id] || {}, ge = Ce.riverAction, Be = Ce.riverAmount, R = Ce.riverUnit;
            let Q = 0;
            if (ge === "bet" || ge === "raise") {
              const ve = parseFloat(Be);
              isNaN(ve) || (Q = ve * (R === "K" ? 1e3 : 1));
            }
            const U = Ce[I], ue = Ce[X], Se = Ce[G];
            let Le = Q;
            if (U === "bet" || U === "raise") {
              const ve = parseFloat(ue);
              isNaN(ve) || (Le = ve * (Se === "K" ? 1e3 : 1));
            }
            ye = Math.max(ye, Le);
          });
          const xe = fe * (te === "K" ? 1e3 : 1);
          ye > 0 && xe <= ye && ke.push(
            `${T.name} (River ${M.toUpperCase()}): Raise amount (${fe}) must be greater than current max bet (${ye / 1e3})`
          );
        }
      });
    }), ke.length > 0) {
      alert(
        `Cannot Process Stack - Raise/Bet Validation Failed:

` + ke.join(`

`) + `

Please correct the amounts and try again.`
      ), console.error("❌ [ProcessStack] FR-12 Validation errors:", ke);
      return;
    }
    console.log("✅ [ProcessStack] All raise/bet amounts passed FR-12 validation");
    try {
      let M = { ...o };
      L.includes("base") && (s.forEach((G) => {
        if (!G.name) return;
        const Z = M[G.id] || {}, he = "riverAction";
        Z[he] || (M = {
          ...M,
          [G.id]: {
            ...Z,
            [he]: "fold"
          }
        });
      }), S(M), console.log("✅ Normalized base level actions (undefined → fold)"));
      let E = M, z = y, k = p, B = r, W = null;
      L.forEach((G) => {
        const Z = G === "base" ? "base" : G === "more" ? "more" : "more2";
        console.log(`
📍 Processing level: ${Z}`);
        const he = _t(
          "river",
          G,
          s,
          E,
          z,
          k,
          B,
          {
            bigBlind: g.bigBlind,
            smallBlind: g.smallBlind,
            ante: g.ante
          },
          x
        );
        E = he.updatedPlayerData, z = he.updatedContributedAmounts, k = he.updatedProcessedSections, B = he.updatedSectionStacks, S(he.updatedPlayerData), P(he.updatedContributedAmounts), _(he.updatedProcessedSections), w(he.updatedSectionStacks), console.log(`✅ Processed ${Z}: Updated player data and stacks`);
        const te = `river_${Z}`, fe = he.updatedContributedAmounts.river_base || {}, ie = Object.keys(fe).some(
          (ce) => (fe[parseInt(ce)] || 0) > 0
        );
        let ye;
        if (!ie && J > 0) {
          let ce = m?.turn_more2 || m?.turn_more || m?.turn_base;
          ce ? (console.log("🔄 [River] No new contributions, preserving Turn pot structure"), console.log(`   Main Pot: ${ce.mainPot.amount}`), ce.sidePots.length > 0 && ce.sidePots.forEach((xe, de) => {
            console.log(`   Side Pot ${de + 1}: ${xe.amount}`);
          }), ye = ce) : (console.log("⚠️ [River] No Turn pot structure found, calculating normally"), ye = st(
            "river",
            G,
            s,
            he.updatedPlayerData,
            he.updatedContributedAmounts,
            he.updatedProcessedSections,
            he.updatedSectionStacks,
            {
              bigBlind: g.bigBlind,
              smallBlind: g.smallBlind,
              ante: g.ante
            },
            J
          ));
        } else
          ye = st(
            "river",
            G,
            s,
            he.updatedPlayerData,
            he.updatedContributedAmounts,
            he.updatedProcessedSections,
            he.updatedSectionStacks,
            {
              bigBlind: g.bigBlind,
              smallBlind: g.smallBlind,
              ante: g.ante
            },
            J
            // Carry forward from turn
          );
        D((ce) => ({
          ...ce,
          [te]: ye
        })), W = ye, console.log(`💰 Calculated pot for ${Z}:`, ye.totalPot), console.log(`   Main Pot: ${ye.mainPot.amount}`), ye.sidePots.length > 0 && ye.sidePots.forEach((ce, xe) => {
          console.log(`   Side Pot ${xe + 1}: ${ce.amount}`);
        });
      }), console.log(`
✅ Process Stack Complete - Total Pot: ${W.totalPot}`);
      const T = JSON.stringify(
        s.map((G) => {
          const Z = E[G.id] || {};
          return {
            id: G.id,
            riverAction: Z.riverAction,
            riverAmount: Z.riverAmount,
            riverUnit: Z.riverUnit,
            river_moreActionAction: Z.river_moreActionAction,
            river_moreActionAmount: Z.river_moreActionAmount,
            river_moreActionUnit: Z.river_moreActionUnit,
            river_moreAction2Action: Z.river_moreAction2Action,
            river_moreAction2Amount: Z.river_moreAction2Amount,
            river_moreAction2Unit: Z.river_moreAction2Unit
          };
        })
      );
      K(!0), q(T), console.log("✅ [RiverView] Set hasProcessedCurrentState to true");
      const O = L[L.length - 1], ee = Ye(
        "river",
        O,
        s,
        E
      );
      if (ee.isComplete && W) {
        const G = Tt(
          W,
          s,
          z,
          "river"
        );
        Oe(G), Me(!0), console.log("💰 [RiverView] Pot display data prepared:", G);
      } else
        Me(!1);
      Pe(ee.isComplete), console.log(`🎯 [River] Betting round complete: ${ee.isComplete}, Add More Action disabled: ${ee.isComplete}`);
      const I = (O === "base" || O === "more") && !ee.isComplete;
      Et({
        stage: "river",
        actionLevel: O,
        players: s,
        playerData: E,
        hasMoreActionButton: I,
        hasCreateNextStreetButton: !1
      });
    } catch (M) {
      console.error("❌ Error processing stack:", M), alert(`Error processing stack: ${M instanceof Error ? M.message : String(M)}`);
    }
  }, Ze = () => {
    const L = l.river || ["base"], J = L[L.length - 1];
    if (Ye("river", J, s, o).isComplete) {
      alert("Betting round complete. River is the final street - no more actions needed."), Pe(!0);
      return;
    }
    if (L.includes("more"))
      if (L.includes("more2"))
        alert("Maximum action levels reached (BASE + More Action 1 + More Action 2)");
      else {
        C("river", "more2"), console.log("[RiverView] Added More Action 2"), K(!1), console.log("🔄 [RiverView] Invalidated processed state (added More Action 2)");
        const M = "river_more", E = "river_more2", z = { ...r };
        z[E] = {
          initial: {},
          current: {},
          updated: {}
        }, Ie().forEach((k) => {
          const B = r[M]?.updated?.[k.id] ?? k.stack;
          z[E].initial[k.id] = k.stack, z[E].current[k.id] = B, z[E].updated[k.id] = B;
        }), w(z), console.log(`✅ Copied "Now" stacks from ${M} to ${E}`);
      }
    else {
      C("river", "more"), console.log("[RiverView] Added More Action 1"), K(!1), console.log("🔄 [RiverView] Invalidated processed state (added More Action 1)");
      const M = "river_base", E = "river_more", z = { ...r };
      z[E] = {
        initial: {},
        current: {},
        updated: {}
      }, Ie().forEach((k) => {
        const B = r[M]?.updated?.[k.id] ?? k.stack;
        z[E].initial[k.id] = k.stack, z[E].current[k.id] = B, z[E].updated[k.id] = B;
      }), w(z), console.log(`✅ Copied "Now" stacks from ${M} to ${E}`);
    }
  }, Fe = (L, J) => {
    const ke = J === "" ? "base" : J === "_moreAction" ? "more" : "more2";
    if (ke === "base") {
      Ie();
      const I = s.filter((ce) => ce.name).length, X = s.find((ce) => ce.id === L);
      if (!X) return [];
      if (o[L]?.allInFromPrevious === !0)
        return ["all-in"];
      let Z;
      I === 2 ? Z = ["BB", "SB", "Dealer"] : I === 3 ? Z = ["SB", "BB", "Dealer"] : Z = ["SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "MP+1", "MP+2", "LJ", "HJ", "CO", "Dealer"];
      const he = Z.indexOf(X.position);
      if (he === -1)
        return [];
      for (let ce = 0; ce < he; ce++) {
        const xe = Z[ce], de = s.find((Ce) => Ce.position === xe && Ce.name);
        if (de) {
          const Ce = o[de.id]?.preflopAction, ge = o[de.id]?.flopAction, Be = o[de.id]?.turnAction;
          if (Ce === "fold" || ge === "fold" || Be === "fold")
            continue;
          const R = o[de.id]?.riverAction, Q = o[de.id]?.allInFromPrevious === !0;
          if (!R && !Q)
            return [];
          if (R === "no action" && !Q)
            return [];
        }
      }
      const te = /* @__PURE__ */ new Map();
      for (const ce of s) {
        if (!ce.name) continue;
        let xe = 0;
        if (ce.id !== L) {
          const de = o[ce.id]?.riverAction, Ce = o[ce.id]?.riverAmount;
          de && de !== "no action" && de !== "fold" && (xe = Ce || 0);
        }
        te.set(ce.id, xe);
      }
      const fe = 0, ie = Math.max(...te.values()), ye = [];
      return fe >= ie && ye.push("check"), fe < ie && ye.push("call"), ie === 0 && ye.push("bet"), ie > 0 && ye.push("raise"), fe < ie && ye.push("fold"), ye.push("all-in"), ye.push("no action"), ye;
    }
    const M = Ie(), E = M.findIndex((ee) => ee.id === L);
    if (E === -1)
      return [];
    const z = at(L, "river", ke, s, o);
    if (z.alreadyAllIn)
      return console.log(`🔒 [getAvailableActionsForPlayer] Player ${L} is all-in, showing locked state`), ["all-in"];
    const k = `river${J}Action`, B = o[L]?.[k];
    if (B && B !== "no action")
      return ["call", "raise", "all-in", "fold"];
    if (E === 0)
      return ["call", "raise", "all-in", "fold"];
    const W = M[E - 1], O = o[W.id]?.[k];
    return !O || O === "no action" ? [] : z.alreadyMatchedMaxBet ? (console.log(`✅ [getAvailableActionsForPlayer] Player ${L} already matched max bet, no action required`), []) : (console.log(`▶️  [getAvailableActionsForPlayer] Player ${L} needs to act`), ["call", "raise", "all-in", "fold"]);
  }, Je = (L, J) => {
    const ke = J === "" ? "base" : J === "_moreAction" ? "more" : "more2";
    Ye("river", ke, s, o).isComplete ? setTimeout(() => {
      const E = document.querySelector("[data-process-stack-focus]");
      E && E.focus();
    }, 100) : setTimeout(() => {
      const E = Ie(), z = E.findIndex((k) => k.id === L);
      if (ke === "more" || ke === "more2") {
        let k = !1;
        for (let B = z + 1; B < E.length; B++) {
          const W = E[B];
          if (at(W.id, "river", ke, s, o).needsToAct) {
            const O = `[data-action-focus="${W.id}-river${J}"]`, ee = document.querySelector(O);
            ee && ee.focus(), k = !0;
            break;
          }
        }
        if (!k) {
          const B = document.querySelector("[data-process-stack-focus]");
          B && B.focus();
        }
      } else {
        const k = z + 1;
        if (k < E.length) {
          const W = `[data-action-focus="${E[k].id}-river${J}"]`, T = document.querySelector(W);
          T && T.focus();
        } else {
          const B = document.querySelector("[data-process-stack-focus]");
          B && B.focus();
        }
      }
    }, 100);
  }, H = ({ playerId: L, suffix: J, action: ke, children: M }) => {
    const [E, z] = Xe.useState(!1), k = (B) => {
      if (!B.shiftKey && !B.ctrlKey && !B.metaKey) {
        const W = B.key.toLowerCase(), O = {
          f: "fold",
          c: ke === "bet" || ke === "raise" ? "call" : "check",
          k: "check",
          b: "bet",
          r: "raise",
          a: "all-in",
          n: "no action"
        }[W];
        if (O) {
          B.preventDefault();
          const ee = J === "" ? "riverAction" : J === "_moreAction" ? "river_moreActionAction" : "river_moreAction2Action";
          n.setPlayerData({
            ...o,
            [L]: {
              ...o[L],
              [ee]: O
            }
          }), O === "bet" || O === "raise" ? setTimeout(() => {
            const I = `amount-input-${L}${J || ""}`, X = document.querySelector(`#${I}`);
            X && (X.focus(), X.select());
          }, 100) : Je(L, J);
          return;
        }
      }
      if (B.key === "Tab" && !B.shiftKey) {
        if (B.preventDefault(), ke === "bet" || ke === "raise") {
          const W = `amount-input-${L}${J || ""}`, T = document.querySelector(`#${W}`);
          if (T) {
            T.focus(), T.select();
            return;
          }
        }
        Je(L, J);
        return;
      }
    };
    return /* @__PURE__ */ e(
      "div",
      {
        "data-action-focus": `${L}-river${J}`,
        tabIndex: 0,
        onKeyDown: k,
        onFocus: () => z(!0),
        onBlur: () => z(!1),
        className: `rounded p-2 transition-all outline-none ${E ? "border-2 border-blue-400 bg-blue-50 ring-2 ring-blue-500" : "border-2 border-gray-300 bg-gray-50"}`,
        children: M
      }
    );
  }, we = m && Object.keys(m).some((L) => L.startsWith("preflop")), le = m && Object.keys(m).some((L) => L.startsWith("flop")), Re = m && Object.keys(m).some((L) => L.startsWith("turn"));
  return m && Object.keys(m).some((L) => L.startsWith("river")), /* @__PURE__ */ e("div", { className: "p-2 max-w-full mx-auto bg-gray-50 min-h-screen", children: /* @__PURE__ */ i("div", { className: "bg-white rounded-lg shadow-lg p-3", children: [
    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-2 pb-2 border-b border-gray-100", children: /* @__PURE__ */ i(
      "button",
      {
        onClick: () => {
          if (d)
            d();
          else {
            const L = localStorage.getItem("lastTournamentId") || "1";
            window.open(`/tpro.html?view=handHistory&tournamentId=${L}`, "_blank");
          }
        },
        className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors",
        children: [
          /* @__PURE__ */ e("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }),
          /* @__PURE__ */ e("span", { children: d ? "Back to Tournament" : "Back to Hand History" })
        ]
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "flex gap-2 mb-3 border-b border-gray-200 pb-2", children: [
      /* @__PURE__ */ e(
        "button",
        {
          onClick: () => A("stack"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "Stack"
        }
      ),
      we && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => A("preflop"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "Pre-flop"
        }
      ),
      le && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => A("flop"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "Flop"
        }
      ),
      Re && /* @__PURE__ */ e(
        "button",
        {
          onClick: () => A("turn"),
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300",
          children: "Turn"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: "px-4 py-2 rounded-t text-sm font-medium transition-colors bg-blue-600 text-white",
          disabled: !0,
          children: "River"
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "flex justify-between items-center mb-3", children: [
      /* @__PURE__ */ e("h1", { className: "text-lg font-bold text-gray-800", children: pe() }),
      /* @__PURE__ */ i("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ e("label", { className: "text-xs font-medium text-gray-700", children: "Unit:" }),
          /* @__PURE__ */ e("div", { className: "flex gap-0.5", children: j.map((L) => /* @__PURE__ */ e(
            "button",
            {
              onClick: () => V(L),
              className: `px-1 py-0.5 rounded text-xs font-medium transition-colors ${x === L ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`,
              children: L
            },
            L
          )) })
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: b,
            className: "px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors",
            children: "Clear"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: u,
            className: "px-2 py-0.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors",
            children: "Export"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "mb-3 p-3 bg-purple-100 border-2 border-purple-300 rounded", children: [
      /* @__PURE__ */ i("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ e("div", { className: "text-sm font-bold text-gray-800", children: "River Community Cards" }),
        N && /* @__PURE__ */ e(
          "button",
          {
            onClick: () => h.autoSelectCommunityCards("river"),
            className: "px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors",
            children: "Auto-Select River Card"
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "flex gap-3 mb-3 justify-center items-center", children: [
        /* @__PURE__ */ i("div", { className: "flex gap-2 opacity-60", children: [
          [1, 2, 3].map((L) => {
            const J = v.flop[`card${L}`];
            return /* @__PURE__ */ i("div", { className: "flex flex-col items-center", children: [
              /* @__PURE__ */ i("div", { className: "text-xs font-semibold text-gray-600 mb-1", children: [
                "Flop ",
                L
              ] }),
              /* @__PURE__ */ e("div", { className: `w-16 h-24 rounded-lg border-2 shadow-sm flex flex-col items-center justify-center ${J ? "bg-gray-50 border-gray-300" : "bg-gray-100 border-gray-300"}`, children: J ? /* @__PURE__ */ i(je, { children: [
                /* @__PURE__ */ e("div", { className: "text-3xl font-bold text-gray-900", children: J.rank === "T" ? "10" : J.rank }),
                /* @__PURE__ */ e("div", { className: `text-3xl ${Te[J.suit]}`, children: J.suit })
              ] }) : /* @__PURE__ */ e("div", { className: "text-3xl font-bold text-gray-300", children: "?" }) })
            ] }, `flop-${L}`);
          }),
          /* @__PURE__ */ i("div", { className: "flex flex-col items-center", children: [
            /* @__PURE__ */ e("div", { className: "text-xs font-semibold text-gray-600 mb-1", children: "Turn" }),
            /* @__PURE__ */ e("div", { className: `w-16 h-24 rounded-lg border-2 shadow-sm flex flex-col items-center justify-center ${v.turn.card1 ? "bg-gray-50 border-gray-300" : "bg-gray-100 border-gray-300"}`, children: v.turn.card1 ? /* @__PURE__ */ i(je, { children: [
              /* @__PURE__ */ e("div", { className: "text-3xl font-bold text-gray-900", children: v.turn.card1.rank === "T" ? "10" : v.turn.card1.rank }),
              /* @__PURE__ */ e("div", { className: `text-3xl ${Te[v.turn.card1.suit]}`, children: v.turn.card1.suit })
            ] }) : /* @__PURE__ */ e("div", { className: "text-3xl font-bold text-gray-300", children: "?" }) })
          ] })
        ] }),
        /* @__PURE__ */ e("div", { className: "w-px h-24 bg-purple-300" }),
        /* @__PURE__ */ i("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ e("div", { className: "text-xs font-semibold text-purple-700 mb-1", children: "River" }),
          /* @__PURE__ */ e("div", { className: `w-20 h-28 rounded-lg border-2 shadow-md flex flex-col items-center justify-center transition-all ${v.river.card1 ? "bg-white border-purple-500 ring-2 ring-purple-300" : "bg-gray-50 border-gray-300"}`, children: v.river.card1 ? /* @__PURE__ */ i(je, { children: [
            /* @__PURE__ */ e("div", { className: "text-4xl font-bold text-gray-900", children: v.river.card1.rank === "T" ? "10" : v.river.card1.rank }),
            /* @__PURE__ */ e("div", { className: `text-4xl ${Te[v.river.card1.suit]}`, children: v.river.card1.suit })
          ] }) : /* @__PURE__ */ e("div", { className: "text-4xl font-bold text-gray-300", children: "?" }) })
        ] })
      ] }),
      /* @__PURE__ */ e("div", { className: "flex gap-3 items-center justify-center", children: /* @__PURE__ */ e(
        dt,
        {
          ref: be,
          stage: "river",
          cardNumber: 1,
          label: "River Card",
          currentCard: v.river.card1,
          onCardChange: h.updateCommunityCard,
          isCardAvailable: (L, J) => h.checkCardAvailable(L, J, v.river.card1),
          autoSelect: N
        }
      ) })
    ] }),
    /* @__PURE__ */ e("div", { className: "mb-3 p-2 bg-gray-100 rounded", children: /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ e("div", { children: ae() }),
      /* @__PURE__ */ e("div", { className: "flex items-center gap-2", children: We().length > 0 && /* @__PURE__ */ i("div", { className: "text-xs text-gray-600", children: [
        "Folded: ",
        We().length
      ] }) })
    ] }) }),
    /* @__PURE__ */ e("div", { className: "space-y-4", style: { overflowX: "auto", overflowY: "visible" }, children: l.river?.map((L) => {
      const J = L === "base" ? "" : L === "more" ? "_moreAction" : "_moreAction2", ke = L === "base" ? "BASE ACTIONS" : L === "more" ? "MORE ACTION 1" : "MORE ACTION 2", M = L === "base" ? "bg-white" : L === "more" ? "bg-blue-50" : "bg-green-50", E = L === "base" ? "border-gray-300" : L === "more" ? "border-blue-300" : "border-green-300", z = Ie().filter((k) => {
        if (L === "base") return !0;
        const B = o[k.id];
        return B ? L === "more" ? B.riverAction !== "fold" : L === "more2" ? B.riverAction !== "fold" && B.river_moreActionAction !== "fold" : !0 : !0;
      }).sort((k, B) => {
        const W = Ee[k.position] || 999, T = Ee[B.position] || 999;
        return W - T;
      });
      return z.length === 0 && L !== "base" ? null : /* @__PURE__ */ i("div", { className: "mb-6", children: [
        /* @__PURE__ */ e(
          "div",
          {
            className: `${M} border-2 ${E} rounded-t-lg px-3 py-2`,
            children: /* @__PURE__ */ i("h3", { className: "text-sm font-bold text-gray-800", children: [
              ke,
              " - ",
              pe()
            ] })
          }
        ),
        /* @__PURE__ */ i(
          "table",
          {
            className: `w-full border-collapse border-2 ${E}`,
            style: { overflow: "visible" },
            children: [
              /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ i("tr", { className: M, children: [
                /* @__PURE__ */ e(
                  "th",
                  {
                    className: `border ${E} px-3 py-2 text-left text-sm font-medium text-gray-700`,
                    children: "Player"
                  }
                ),
                /* @__PURE__ */ e(
                  "th",
                  {
                    className: `border ${E} px-4 py-2 text-center text-sm font-medium text-gray-700 w-32`,
                    children: "Stack"
                  }
                ),
                /* @__PURE__ */ e(
                  "th",
                  {
                    className: `border ${E} px-3 py-2 text-center text-sm font-medium text-gray-700`,
                    children: "Action"
                  }
                ),
                /* @__PURE__ */ e(
                  "th",
                  {
                    className: `border ${E} px-4 py-2 text-center text-sm font-medium text-gray-700 w-32`,
                    children: "Amount/Unit"
                  }
                )
              ] }) }),
              /* @__PURE__ */ e("tbody", { children: z.map((k) => {
                const B = o[k.id] || {}, W = `river${J}Action`, T = `river${J}Amount`, O = `river${J}Unit`, ee = B[W] || "", I = B[T] || "", X = B[O] || x;
                return /* @__PURE__ */ i("tr", { className: M, children: [
                  /* @__PURE__ */ i(
                    "td",
                    {
                      className: `border ${E} px-3 py-2 text-sm font-medium text-gray-800`,
                      children: [
                        k.name,
                        k.position && /* @__PURE__ */ i("span", { className: "ml-2 text-xs text-blue-600", children: [
                          "(",
                          k.position,
                          ")"
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ e("td", { className: `border ${E} px-2 py-2 text-center relative`, style: { overflow: "visible" }, children: (() => {
                    const G = `${k.id}-river-${L}`, Z = F[G] || !1, he = `river_${L}`, te = p[he], fe = k.stack, ie = r[he]?.updated?.[k.id] ?? (te ? fe : null), ye = ie !== null && ie === 0;
                    return /* @__PURE__ */ i(je, { children: [
                      /* @__PURE__ */ i("div", { className: "space-y-1", children: [
                        /* @__PURE__ */ i("div", { className: "flex items-center justify-between bg-blue-50 rounded px-2 py-1 border border-blue-200", children: [
                          /* @__PURE__ */ e("span", { className: "text-[10px] text-blue-600", children: "Start:" }),
                          /* @__PURE__ */ e("span", { className: "text-xs font-bold text-blue-900", children: a(fe) })
                        ] }),
                        /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                          /* @__PURE__ */ i("div", { className: `flex-1 flex items-center justify-between rounded px-2 py-1 border ${ye ? "bg-red-50 border-2 border-red-400" : "bg-green-50 border-green-200"}`, children: [
                            /* @__PURE__ */ e("span", { className: `text-[10px] ${ye ? "text-red-700 font-bold" : "text-green-600"}`, children: "Now:" }),
                            ie !== null ? /* @__PURE__ */ e("span", { className: `text-xs font-bold ${ye ? "text-red-900" : "text-green-900"}`, children: a(ie) }) : /* @__PURE__ */ e("span", { className: "text-xs font-bold text-gray-400", children: "-" })
                          ] }),
                          ie !== null && /* @__PURE__ */ e(
                            "button",
                            {
                              onMouseDown: (ce) => {
                                ce.preventDefault();
                              },
                              onClick: (ce) => {
                                ce.preventDefault(), ce.stopPropagation();
                                const xe = !Z;
                                if (Y((de) => ({
                                  ...de,
                                  [G]: xe
                                })), xe) {
                                  const Ce = ce.currentTarget.getBoundingClientRect(), ge = 600, Be = 460, R = window.innerHeight - Ce.bottom, Q = Ce.top, U = R < ge && Q > R, ue = Ce.left + Ce.width / 2, Se = Be / 2, Le = ue - Se, ve = window.innerWidth - (ue + Se);
                                  let Ue = "center", Ke = 0;
                                  Le < 10 ? (Ue = "left", Ke = Ce.left) : ve < 10 ? (Ue = "right", Ke = Ce.right) : (Ue = "center", Ke = ue), oe((ze) => ({
                                    ...ze,
                                    [G]: U ? "above" : "below",
                                    [`${G}_horizontal`]: Ue,
                                    [`${G}_left`]: Ke
                                  }));
                                }
                              },
                              className: "px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-[10px] font-semibold rounded shadow-md hover:shadow-lg transition-all duration-200",
                              title: "Show stack history",
                              children: /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })
                            }
                          )
                        ] })
                      ] }),
                      Z && ie !== null && (() => {
                        const ce = ne[G] || "below", xe = ne[`${G}_horizontal`] || "center", de = ne[`${G}_left`] || 0, Ce = ce === "above" ? "absolute z-[100] bottom-full mb-2" : "absolute z-[100] mt-2";
                        let ge = "";
                        xe === "center" ? ge = "transform -translate-x-1/2" : xe === "right" && (ge = "transform -translate-x-full");
                        const Be = `${Ce} ${ge}`;
                        return /* @__PURE__ */ e(
                          "div",
                          {
                            "data-stack-history-card": G,
                            className: Be,
                            style: {
                              minWidth: "400px",
                              maxWidth: "460px",
                              left: `${de}px`
                            },
                            children: /* @__PURE__ */ i("div", { className: `bg-gradient-to-br rounded-xl shadow-2xl border-2 overflow-hidden ${ye ? "from-red-50 to-orange-50 border-red-400" : "from-white to-blue-50 border-blue-300"}`, children: [
                              /* @__PURE__ */ i("div", { className: `bg-gradient-to-r px-3 py-2 flex items-center justify-between ${ye ? "from-red-600 to-red-700" : "from-blue-600 to-blue-700"}`, children: [
                                /* @__PURE__ */ i("div", { className: "flex items-center gap-2", children: [
                                  /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }),
                                  /* @__PURE__ */ i("h3", { className: "text-white font-bold text-xs", children: [
                                    k.name,
                                    " - Stack History (River ",
                                    L.toUpperCase(),
                                    ") ",
                                    ye && "(ALL-IN)"
                                  ] })
                                ] }),
                                /* @__PURE__ */ e(
                                  "button",
                                  {
                                    onClick: () => Y((R) => ({
                                      ...R,
                                      [G]: !1
                                    })),
                                    className: `text-white transition-colors ${ye ? "hover:text-red-200" : "hover:text-blue-200"}`,
                                    children: /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
                                  }
                                )
                              ] }),
                              /* @__PURE__ */ i("div", { className: "p-3 space-y-2", children: [
                                (() => {
                                  const R = typeof B.preflopAction == "string" ? B.preflopAction : "", U = k.stack - (B.postedSB || 0) - (B.postedBB || 0), ue = r.preflop_base?.updated?.[k.id] ?? U, Se = U - ue;
                                  return /* @__PURE__ */ i("div", { className: "bg-indigo-50 rounded-lg p-2 border-l-4 border-indigo-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-indigo-800 uppercase tracking-wide", children: "PreFlop BASE" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(U) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(ue) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: R && R !== "no action" && R !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(Se)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${R === "all-in" ? "bg-red-600 text-white" : R === "raise" ? "bg-purple-100 text-purple-700" : R === "call" ? "bg-blue-100 text-blue-700" : R === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: R })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                r.preflop_more && (() => {
                                  const R = typeof B.preflop_moreActionAction == "string" ? B.preflop_moreActionAction : "", Q = r.preflop_base?.updated?.[k.id] ?? k.stack, U = r.preflop_more?.updated?.[k.id] ?? Q, ue = Q - U;
                                  return /* @__PURE__ */ i("div", { className: "bg-teal-50 rounded-lg p-2 border-l-4 border-teal-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-teal-800 uppercase tracking-wide", children: "PreFlop MA1" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Q) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(U) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: R && R !== "no action" && R !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(ue)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${R === "all-in" ? "bg-red-600 text-white" : R === "raise" ? "bg-purple-100 text-purple-700" : R === "call" ? "bg-blue-100 text-blue-700" : R === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: R })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                r.preflop_more2 && (() => {
                                  const R = typeof B.preflop_moreAction2Action == "string" ? B.preflop_moreAction2Action : "", Q = r.preflop_more?.updated?.[k.id] ?? k.stack, U = r.preflop_more2?.updated?.[k.id] ?? Q, ue = Q - U;
                                  return /* @__PURE__ */ i("div", { className: "bg-cyan-50 rounded-lg p-2 border-l-4 border-cyan-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-cyan-800 uppercase tracking-wide", children: "PreFlop MA2" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Q) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(U) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: R && R !== "no action" && R !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(ue)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${R === "all-in" ? "bg-red-600 text-white" : R === "raise" ? "bg-purple-100 text-purple-700" : R === "call" ? "bg-blue-100 text-blue-700" : R === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: R })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                r.flop_base && (() => {
                                  const R = typeof B.flopAction == "string" ? B.flopAction : "", Q = Ve(k), U = r.flop_base?.updated?.[k.id] ?? Q, ue = Q - U;
                                  return /* @__PURE__ */ i("div", { className: "bg-gray-50 rounded-lg p-2 border-l-4 border-gray-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-gray-800 uppercase tracking-wide", children: "FLOP BASE" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Q) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(U) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: R && R !== "no action" && R !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(ue)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${R === "all-in" ? "bg-red-600 text-white" : R === "raise" ? "bg-purple-100 text-purple-700" : R === "call" ? "bg-blue-100 text-blue-700" : R === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: R })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                r.flop_more && (() => {
                                  const R = typeof B.flop_moreActionAction == "string" ? B.flop_moreActionAction : "", Q = r.flop_base?.updated?.[k.id] ?? k.stack, U = r.flop_more?.updated?.[k.id] ?? Q, ue = Q - U;
                                  return /* @__PURE__ */ i("div", { className: "bg-purple-50 rounded-lg p-2 border-l-4 border-purple-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-purple-800 uppercase tracking-wide", children: "FLOP MA1" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Q) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(U) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: R && R !== "no action" && R !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(ue)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${R === "all-in" ? "bg-red-600 text-white" : R === "raise" ? "bg-purple-100 text-purple-700" : R === "call" ? "bg-blue-100 text-blue-700" : R === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: R })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                r.flop_more2 && (() => {
                                  const R = typeof B.flop_moreAction2Action == "string" ? B.flop_moreAction2Action : "", Q = r.flop_more?.updated?.[k.id] ?? k.stack, U = r.flop_more2?.updated?.[k.id] ?? Q, ue = Q - U;
                                  return /* @__PURE__ */ i("div", { className: "bg-yellow-50 rounded-lg p-2 border-l-4 border-yellow-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-yellow-800 uppercase tracking-wide", children: "FLOP MA2" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Q) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(U) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: R && R !== "no action" && R !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(ue)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${R === "all-in" ? "bg-red-600 text-white" : R === "raise" ? "bg-purple-100 text-purple-700" : R === "call" ? "bg-blue-100 text-blue-700" : R === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: R })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                r.turn_base && (() => {
                                  const R = typeof B.turnAction == "string" ? B.turnAction : "", Q = Ve(k), U = r.turn_base?.updated?.[k.id] ?? Q, ue = Q - U;
                                  return /* @__PURE__ */ i("div", { className: "bg-orange-50 rounded-lg p-2 border-l-4 border-orange-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-orange-800 uppercase tracking-wide", children: "TURN BASE" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Q) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(U) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: R && R !== "no action" && R !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(ue)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${R === "all-in" ? "bg-red-600 text-white" : R === "raise" ? "bg-purple-100 text-purple-700" : R === "call" ? "bg-blue-100 text-blue-700" : R === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: R })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                r.turn_more && (() => {
                                  const R = typeof B.turn_moreActionAction == "string" ? B.turn_moreActionAction : "", Q = r.turn_base?.updated?.[k.id] ?? k.stack, U = r.turn_more?.updated?.[k.id] ?? Q, ue = Q - U;
                                  return /* @__PURE__ */ i("div", { className: "bg-pink-50 rounded-lg p-2 border-l-4 border-pink-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-pink-800 uppercase tracking-wide", children: "TURN MA1" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Q) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(U) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: R && R !== "no action" && R !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(ue)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${R === "all-in" ? "bg-red-600 text-white" : R === "raise" ? "bg-purple-100 text-purple-700" : R === "call" ? "bg-blue-100 text-blue-700" : R === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: R })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                r.turn_more2 && (() => {
                                  const R = typeof B.turn_moreAction2Action == "string" ? B.turn_moreAction2Action : "", Q = r.turn_more?.updated?.[k.id] ?? k.stack, U = r.turn_more2?.updated?.[k.id] ?? Q, ue = Q - U;
                                  return /* @__PURE__ */ i("div", { className: "bg-lime-50 rounded-lg p-2 border-l-4 border-lime-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-lime-800 uppercase tracking-wide", children: "TURN MA2" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Q) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(U) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: R && R !== "no action" && R !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(ue)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${R === "all-in" ? "bg-red-600 text-white" : R === "raise" ? "bg-purple-100 text-purple-700" : R === "call" ? "bg-blue-100 text-blue-700" : R === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: R })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                (() => {
                                  const R = typeof B.riverAction == "string" ? B.riverAction : "", Q = Ve(k), U = r.river_base?.updated?.[k.id] ?? Q, ue = Q - U;
                                  return /* @__PURE__ */ i("div", { className: "bg-emerald-50 rounded-lg p-2 border-l-4 border-emerald-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-emerald-800 uppercase tracking-wide", children: "RIVER BASE" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Q) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(U) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: R && R !== "no action" && R !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(ue)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${R === "all-in" ? "bg-red-600 text-white" : R === "raise" ? "bg-purple-100 text-purple-700" : R === "call" ? "bg-blue-100 text-blue-700" : R === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: R })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                l.river.includes("more") && (() => {
                                  const R = typeof B.river_moreActionAction == "string" ? B.river_moreActionAction : "", Q = r.river_base?.updated?.[k.id] ?? k.stack, U = r.river_more?.updated?.[k.id] ?? Q, ue = Q - U;
                                  return /* @__PURE__ */ i("div", { className: "bg-sky-50 rounded-lg p-2 border-l-4 border-sky-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-sky-800 uppercase tracking-wide", children: "RIVER MA1" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Q) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(U) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: R && R !== "no action" && R !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(ue)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${R === "all-in" ? "bg-red-600 text-white" : R === "raise" ? "bg-purple-100 text-purple-700" : R === "call" ? "bg-blue-100 text-blue-700" : R === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: R })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                l.river.includes("more2") && (() => {
                                  const R = typeof B.river_moreAction2Action == "string" ? B.river_moreAction2Action : "", Q = r.river_more?.updated?.[k.id] ?? k.stack, U = r.river_more2?.updated?.[k.id] ?? Q, ue = Q - U;
                                  return /* @__PURE__ */ i("div", { className: "bg-violet-50 rounded-lg p-2 border-l-4 border-violet-400 shadow-sm", children: [
                                    /* @__PURE__ */ e("div", { className: "flex items-center justify-between mb-1", children: /* @__PURE__ */ e("span", { className: "text-[10px] font-bold text-violet-800 uppercase tracking-wide", children: "RIVER MA2" }) }),
                                    /* @__PURE__ */ i("div", { className: "flex items-center justify-between text-xs", children: [
                                      /* @__PURE__ */ i("div", { className: "flex items-center gap-1", children: [
                                        /* @__PURE__ */ e("span", { className: "text-gray-600", children: a(Q) }),
                                        /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) }),
                                        /* @__PURE__ */ e("span", { className: "font-bold text-gray-800", children: a(U) })
                                      ] }),
                                      /* @__PURE__ */ e("div", { className: "flex items-center gap-1", children: R && R !== "no action" && R !== "check" ? /* @__PURE__ */ i(je, { children: [
                                        /* @__PURE__ */ i("span", { className: "text-gray-500 text-[10px]", children: [
                                          "-",
                                          a(ue)
                                        ] }),
                                        /* @__PURE__ */ e("span", { className: `px-1.5 py-0.5 text-[10px] font-semibold rounded ${R === "all-in" ? "bg-red-600 text-white" : R === "raise" ? "bg-purple-100 text-purple-700" : R === "call" ? "bg-blue-100 text-blue-700" : R === "bet" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`, children: R })
                                      ] }) : /* @__PURE__ */ e("span", { className: "text-gray-400 text-[10px]", children: "no action" }) })
                                    ] })
                                  ] });
                                })(),
                                /* @__PURE__ */ i("div", { className: `rounded-lg p-3 border-2 shadow-md ${ye ? "bg-gradient-to-r from-gray-50 to-red-50 border-red-300" : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300"}`, children: [
                                  /* @__PURE__ */ i("div", { className: "text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2 pb-2 border-b-2 border-gray-300 flex items-center gap-1", children: [
                                    /* @__PURE__ */ e("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" }) }),
                                    "Summary"
                                  ] }),
                                  /* @__PURE__ */ i("div", { className: "space-y-2", children: [
                                    /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
                                      /* @__PURE__ */ e("span", { className: "text-[10px] text-gray-600", children: "Starting Stack:" }),
                                      /* @__PURE__ */ e("span", { className: "text-xs font-bold text-blue-600", children: a(fe) })
                                    ] }),
                                    /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
                                      /* @__PURE__ */ e("span", { className: "text-[10px] text-gray-600", children: "Total Contributed:" }),
                                      /* @__PURE__ */ e("span", { className: "text-xs font-bold text-red-600", children: a(fe - ie) })
                                    ] }),
                                    /* @__PURE__ */ i("div", { className: "flex justify-between items-center pt-2 border-t border-gray-300", children: [
                                      /* @__PURE__ */ e("span", { className: "text-[10px] text-gray-700 font-bold", children: "Remaining Stack:" }),
                                      /* @__PURE__ */ e("span", { className: `text-sm font-bold ${ye ? "text-red-600" : "text-green-600"}`, children: a(ie) })
                                    ] })
                                  ] })
                                ] })
                              ] })
                            ] })
                          }
                        );
                      })()
                    ] });
                  })() }),
                  /* @__PURE__ */ e("td", { className: `border ${E} px-2 py-1`, children: /* @__PURE__ */ e(H, { playerId: k.id, suffix: J, action: ee, children: /* @__PURE__ */ e(
                    Ct,
                    {
                      playerId: k.id,
                      selectedAction: ee,
                      suffix: J,
                      onActionClick: (G) => {
                        n.setPlayerData({
                          ...o,
                          [k.id]: {
                            ...o[k.id],
                            [W]: G
                          }
                        }), Je(k.id, J);
                      },
                      availableActions: Fe(k.id, J)
                    }
                  ) }) }),
                  /* @__PURE__ */ e("td", { className: `border ${E} px-1 py-1`, children: /* @__PURE__ */ e(
                    Pt,
                    {
                      playerId: k.id,
                      selectedAmount: I,
                      selectedAction: ee,
                      selectedUnit: X,
                      suffix: J,
                      stage: "river",
                      actionLevel: L,
                      players: s,
                      playerData: o,
                      sectionStacks: r,
                      onAmountChange: (G, Z) => {
                        n.setPlayerData({
                          ...o,
                          [G]: {
                            ...o[G],
                            [T]: Z
                          }
                        });
                      },
                      onUnitChange: (G, Z) => {
                        n.setPlayerData({
                          ...o,
                          [G]: {
                            ...o[G],
                            [O]: Z
                          }
                        });
                      },
                      onTabComplete: () => {
                        console.log(`🔔 [RiverView] onTabComplete called for player ${k.id}`), Je(k.id, J);
                      },
                      isDisabled: !ee || ee === "fold" || ee === "check" || ee === "no action"
                    }
                  ) })
                ] }, k.id);
              }) })
            ]
          }
        ),
        /* @__PURE__ */ e(
          "div",
          {
            className: `${M} border-2 border-t-0 ${E} rounded-b-lg px-3 py-2`,
            children: /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ i("div", { className: "text-xs text-gray-600", children: [
                z.length,
                " player",
                z.length !== 1 ? "s" : ""
              ] }),
              /* @__PURE__ */ e("div", { className: "flex gap-2", children: L === l.river[l.river.length - 1] && /* @__PURE__ */ i(
                "button",
                {
                  onClick: Ze,
                  "data-add-more-focus": !0,
                  disabled: me || l.river && l.river.length >= 3,
                  className: "px-6 py-3 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                  children: [
                    /* @__PURE__ */ e("span", { children: "+" }),
                    "Add More Action ",
                    l.river ? l.river.length : 1
                  ]
                }
              ) })
            ] })
          }
        )
      ] }, L);
    }) }),
    /* @__PURE__ */ e("div", { className: "mt-4 flex gap-3 justify-center flex-wrap", children: /* @__PURE__ */ i(
      "button",
      {
        onClick: qe,
        "data-process-stack-focus": !0,
        className: "px-6 py-3 bg-yellow-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-yellow-600 transition-colors flex items-center gap-2",
        children: [
          /* @__PURE__ */ e("span", { children: "⚡" }),
          "Process Stack - River"
        ]
      }
    ) }),
    De && Ne && /* @__PURE__ */ i("div", { className: "mt-8 mb-8", children: [
      /* @__PURE__ */ e("div", { className: "bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-xl p-4", children: /* @__PURE__ */ i("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ i("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e("span", { className: "text-3xl", children: "💰" }),
          /* @__PURE__ */ i("div", { children: [
            /* @__PURE__ */ e("h2", { className: "text-2xl font-bold text-white", children: "Pot Distribution" }),
            /* @__PURE__ */ e("p", { className: "text-sm text-white/90 mt-1", children: "RIVER betting round complete" })
          ] })
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => Me(!1),
            className: "text-white/80 hover:text-white text-3xl font-bold leading-none px-2 transition-colors",
            "aria-label": "Close pot display",
            children: "×"
          }
        )
      ] }) }),
      /* @__PURE__ */ e("div", { className: "bg-gray-100 rounded-b-xl p-6 shadow-xl", children: /* @__PURE__ */ e(
        Bt,
        {
          totalPot: Ne.totalPot,
          mainPot: Ne.mainPot,
          sidePots: Ne.sidePots,
          players: Ne.players,
          currentPlayers: t.players,
          stackData: t.stackData,
          actions: n,
          contributedAmounts: Ne.contributedAmounts,
          playerData: t.playerData
        }
      ) })
    ] })
  ] }) });
}, Ho = ({ generatedHand: t, expectedHand: n, onClose: a }) => {
  const [b, u] = $e(n || ""), [h, c] = $e([]), [d, s] = $e(!1), o = () => {
    const p = bt(t), r = bt(b);
    if (!p || !r) {
      alert("Failed to parse one or both hands. Please check the format.");
      return;
    }
    const y = [];
    y.push({
      field: "Hand Number",
      expected: r.header.handNumber,
      actual: p.header.handNumber,
      match: r.header.handNumber === p.header.handNumber
    }), y.push({
      field: "Small Blind",
      expected: r.header.sb.toString(),
      actual: p.header.sb.toString(),
      match: r.header.sb === p.header.sb
    }), y.push({
      field: "Big Blind",
      expected: r.header.bb.toString(),
      actual: p.header.bb.toString(),
      match: r.header.bb === p.header.bb
    }), y.push({
      field: "Ante",
      expected: r.header.ante.toString(),
      actual: p.header.ante.toString(),
      match: r.header.ante === p.header.ante
    }), y.push({
      field: "Player Count",
      expected: r.players.length.toString(),
      actual: p.players.length.toString(),
      match: r.players.length === p.players.length
    });
    const m = Math.max(r.players.length, p.players.length);
    for (let v = 0; v < m; v++) {
      const N = r.players[v], A = p.players[v];
      if (N && A) {
        y.push({
          field: `Player ${v + 1} Name`,
          expected: N.name,
          actual: A.name,
          match: N.name === A.name
        });
        const $ = N.position?.toLowerCase(), S = A.position?.toLowerCase(), _ = (w) => w ? w === "dealer" || w === "sb" || w === "bb" : !1;
        (_($) || _(S)) && y.push({
          field: `Player ${v + 1} Position`,
          expected: N.position || "(none)",
          actual: A.position || "(none)",
          match: N.position === A.position
        }), y.push({
          field: `Player ${v + 1} Stack`,
          expected: N.stack.toLocaleString(),
          actual: A.stack.toLocaleString(),
          match: N.stack === A.stack
        });
      } else N ? y.push({
        field: `Player ${v + 1}`,
        expected: `${N.name} (${N.position || "no pos"}) ${N.stack}`,
        actual: "(missing)",
        match: !1
      }) : A && y.push({
        field: `Player ${v + 1}`,
        expected: "(missing)",
        actual: `${A.name} (${A.position || "no pos"}) ${A.stack}`,
        match: !1
      });
    }
    c(y), s(!0);
  }, f = h.every((p) => p.match), l = h.filter((p) => p.match).length, x = h.length, g = async () => {
    const p = h.filter((y) => !y.match);
    if (p.length === 0) {
      alert("✅ No failures to copy - all fields match!");
      return;
    }
    const r = p.map((y) => `${y.field}: Expected "${y.expected}" but got "${y.actual}"`).join(`
`);
    try {
      await navigator.clipboard.writeText(r), alert(`✅ Copied ${p.length} failure(s) to clipboard!

You can paste this into a single Google Sheets cell.`);
    } catch (y) {
      console.error("Failed to copy failures:", y), alert("❌ Failed to copy to clipboard");
    }
  };
  return /* @__PURE__ */ e("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ i("div", { className: "bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ i("div", { className: "bg-gradient-to-r from-purple-600 to-indigo-600 p-6", children: [
      /* @__PURE__ */ i("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ i("h2", { className: "text-2xl font-bold text-white flex items-center gap-3", children: [
          /* @__PURE__ */ e("span", { children: "🔍" }),
          /* @__PURE__ */ e("span", { children: "Hand Comparison Tool" })
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: a,
            className: "text-white hover:text-gray-200 text-3xl font-bold leading-none",
            children: "×"
          }
        )
      ] }),
      /* @__PURE__ */ e("p", { className: "text-white/90 mt-2 text-sm", children: "Compare the generated next hand with expected output from another tool" })
    ] }),
    /* @__PURE__ */ e("div", { className: "flex-1 overflow-y-auto p-6", children: /* @__PURE__ */ i("div", { className: "space-y-6", children: [
      /* @__PURE__ */ i("div", { children: [
        /* @__PURE__ */ e("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: "Generated Hand (Our Tool)" }),
        /* @__PURE__ */ e("pre", { className: "bg-gray-100 border-2 border-gray-300 rounded-lg p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap", children: t })
      ] }),
      /* @__PURE__ */ i("div", { children: [
        /* @__PURE__ */ e("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: "Expected Hand (From Other Tool)" }),
        /* @__PURE__ */ e(
          "textarea",
          {
            value: b,
            onChange: (p) => u(p.target.value),
            className: "w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-xs leading-relaxed resize-y",
            rows: 15,
            placeholder: "Paste the expected hand output here..."
          }
        )
      ] }),
      /* @__PURE__ */ e("div", { className: "flex justify-center", children: /* @__PURE__ */ e(
        "button",
        {
          onClick: o,
          className: "px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl",
          children: "🔍 Compare Hands"
        }
      ) }),
      d && /* @__PURE__ */ i("div", { className: "mt-6", children: [
        /* @__PURE__ */ e("div", { className: `p-4 rounded-lg mb-4 ${f ? "bg-green-100 border-2 border-green-500" : "bg-red-100 border-2 border-red-500"}`, children: /* @__PURE__ */ i("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ i("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ e("span", { className: "text-3xl", children: f ? "✅" : "❌" }),
            /* @__PURE__ */ i("div", { children: [
              /* @__PURE__ */ e("h3", { className: "text-lg font-bold", children: f ? "Perfect Match!" : "Differences Found" }),
              /* @__PURE__ */ i("p", { className: "text-sm", children: [
                l,
                " of ",
                x,
                " fields match (",
                Math.round(l / x * 100),
                "%)"
              ] })
            ] })
          ] }),
          !f && /* @__PURE__ */ e(
            "button",
            {
              onClick: g,
              className: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md whitespace-nowrap",
              children: "📋 Copy Failures Only"
            }
          )
        ] }) }),
        /* @__PURE__ */ e("div", { className: "border-2 border-gray-300 rounded-lg overflow-hidden", children: /* @__PURE__ */ i("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ e("thead", { className: "bg-gray-200", children: /* @__PURE__ */ i("tr", { children: [
            /* @__PURE__ */ e("th", { className: "px-4 py-2 text-left font-bold", children: "Field" }),
            /* @__PURE__ */ e("th", { className: "px-4 py-2 text-left font-bold", children: "Expected" }),
            /* @__PURE__ */ e("th", { className: "px-4 py-2 text-left font-bold", children: "Actual" }),
            /* @__PURE__ */ e("th", { className: "px-4 py-2 text-center font-bold", children: "Status" })
          ] }) }),
          /* @__PURE__ */ e("tbody", { children: h.map((p, r) => /* @__PURE__ */ i(
            "tr",
            {
              className: `${p.match ? "bg-green-50" : "bg-red-50"} border-t border-gray-300`,
              children: [
                /* @__PURE__ */ e("td", { className: "px-4 py-2 font-medium", children: p.field }),
                /* @__PURE__ */ e("td", { className: "px-4 py-2 font-mono", children: p.expected }),
                /* @__PURE__ */ e("td", { className: "px-4 py-2 font-mono", children: p.actual }),
                /* @__PURE__ */ e("td", { className: "px-4 py-2 text-center", children: /* @__PURE__ */ e("span", { className: "text-xl", children: p.match ? "✅" : "❌" }) })
              ]
            },
            r
          )) })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ e("div", { className: "bg-gray-100 px-6 py-4 flex justify-end gap-3", children: /* @__PURE__ */ e(
      "button",
      {
        onClick: a,
        className: "px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold",
        children: "Close"
      }
    ) })
  ] }) });
}, Ko = ({
  isOpen: t,
  title: n,
  message: a,
  onClose: b,
  inputRef: u
}) => {
  const h = rt(null);
  nt(() => {
    t && h.current && h.current.focus();
  }, [t]);
  const c = () => {
    b(), setTimeout(() => {
      u?.current && (u.current.focus(), u.current.select());
    }, 100);
  }, d = (s) => {
    s.key === "Enter" && (s.preventDefault(), c());
  };
  return t ? /* @__PURE__ */ e(
    "div",
    {
      className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
      onClick: c,
      children: /* @__PURE__ */ i(
        "div",
        {
          className: "bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden",
          onClick: (s) => s.stopPropagation(),
          children: [
            /* @__PURE__ */ e("div", { className: "bg-red-500 px-6 py-4", children: /* @__PURE__ */ i("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ e("div", { className: "text-white text-2xl", children: "⚠️" }),
              /* @__PURE__ */ e("h2", { className: "text-xl font-bold text-white", children: n })
            ] }) }),
            /* @__PURE__ */ e("div", { className: "px-6 py-6", children: /* @__PURE__ */ e("p", { className: "text-gray-700 text-base leading-relaxed whitespace-pre-line", children: a }) }),
            /* @__PURE__ */ e("div", { className: "bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200", children: /* @__PURE__ */ e(
              "button",
              {
                ref: h,
                onClick: c,
                onKeyDown: d,
                className: "px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors",
                children: "OK"
              }
            ) })
          ]
        }
      )
    }
  ) : null;
};
function yo(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var kt = { exports: {} }, Ao = kt.exports, qt;
function wo() {
  return qt || (qt = 1, (function(t, n) {
    (function(b, u) {
      t.exports = u();
    })(Ao, function() {
      return (
        /******/
        (function() {
          var a = {
            /***/
            "./packages/@logrocket/console/src/index.js": (
              /*!**************************************************!*\
                !*** ./packages/@logrocket/console/src/index.js ***!
                \**************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = void 0;
                var f = o(s(
                  /*! ./registerConsole */
                  "./packages/@logrocket/console/src/registerConsole.js"
                )), l = f.default;
                d.default = l;
              })
            ),
            /***/
            "./packages/@logrocket/console/src/registerConsole.js": (
              /*!************************************************************!*\
                !*** ./packages/@logrocket/console/src/registerConsole.js ***!
                \************************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = g;
                var f = o(s(
                  /*! @babel/runtime/helpers/typeof */
                  "./node_modules/@babel/runtime/helpers/typeof.js"
                )), l = o(s(
                  /*! @logrocket/utils/src/enhanceFunc */
                  "./packages/@logrocket/utils/src/enhanceFunc.ts"
                )), x = s(
                  /*! @logrocket/exceptions */
                  "./packages/@logrocket/exceptions/src/index.js"
                );
                function g(p) {
                  var r = [], y = ["log", "warn", "info", "error", "debug"];
                  return y.forEach(function(m) {
                    r.push((0, l.default)(console, m, function() {
                      for (var v = arguments.length, N = new Array(v), A = 0; A < v; A++)
                        N[A] = arguments[A];
                      p.addEvent("lr.core.LogEvent", function() {
                        var $ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, S = $.isEnabled;
                        if ((0, f.default)(S) === "object" && S[m] === !1 || S === !1)
                          return null;
                        if (m === "error" && $.shouldAggregateConsoleErrors)
                          if (N && N.length >= 2 && N[0] === "ERROR") {
                            var _ = "";
                            try {
                              _ = " ".concat(N[1]);
                            } catch {
                            }
                            x.Capture.captureMessage(p, "".concat(N[0]).concat(_), N, {}, !0);
                          } else
                            x.Capture.captureMessage(p, N[0], N, {}, !0);
                        return {
                          logLevel: m.toUpperCase(),
                          args: N
                        };
                      });
                    }));
                  }), function() {
                    r.forEach(function(m) {
                      return m();
                    });
                  };
                }
              })
            ),
            /***/
            "./packages/@logrocket/exceptions/src/Capture.js": (
              /*!*******************************************************!*\
                !*** ./packages/@logrocket/exceptions/src/Capture.js ***!
                \*******************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.captureMessage = g, d.captureException = p;
                var f = s(
                  /*! @logrocket/utils/src/scrubException */
                  "./packages/@logrocket/utils/src/scrubException.ts"
                ), l = o(s(
                  /*! @logrocket/utils/src/TraceKit */
                  "./packages/@logrocket/utils/src/TraceKit.js"
                )), x = o(s(
                  /*! ./stackTraceFromError */
                  "./packages/@logrocket/exceptions/src/stackTraceFromError.js"
                ));
                function g(r, y, m) {
                  var v = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, N = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !1, A = {
                    exceptionType: N ? "CONSOLE" : "MESSAGE",
                    message: y,
                    messageArgs: m,
                    browserHref: window.location ? window.location.href : ""
                  };
                  (0, f.scrubException)(A, v), r.addEvent("lr.core.Exception", function() {
                    return A;
                  });
                }
                function p(r, y) {
                  var m = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, v = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : null, N = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : "WINDOW", A = v || l.default.computeStackTrace(y), $ = {
                    exceptionType: N,
                    errorType: A.name,
                    message: A.message,
                    browserHref: window.location ? window.location.href : ""
                  };
                  (0, f.scrubException)($, m);
                  var S = {
                    _stackTrace: (0, x.default)(A)
                  };
                  r.addEvent("lr.core.Exception", function() {
                    return $;
                  }, S);
                }
              })
            ),
            /***/
            "./packages/@logrocket/exceptions/src/index.js": (
              /*!*****************************************************!*\
                !*** ./packages/@logrocket/exceptions/src/index.js ***!
                \*****************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                ), f = s(
                  /*! @babel/runtime/helpers/typeof */
                  "./node_modules/@babel/runtime/helpers/typeof.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), Object.defineProperty(d, "registerExceptions", {
                  enumerable: !0,
                  get: function() {
                    return l.default;
                  }
                }), d.Capture = void 0;
                var l = o(s(
                  /*! ./registerExceptions */
                  "./packages/@logrocket/exceptions/src/registerExceptions.js"
                )), x = p(s(
                  /*! ./Capture */
                  "./packages/@logrocket/exceptions/src/Capture.js"
                ));
                d.Capture = x;
                function g(r) {
                  if (typeof WeakMap != "function") return null;
                  var y = /* @__PURE__ */ new WeakMap(), m = /* @__PURE__ */ new WeakMap();
                  return (g = function(N) {
                    return N ? m : y;
                  })(r);
                }
                function p(r, y) {
                  if (r && r.__esModule)
                    return r;
                  if (r === null || f(r) !== "object" && typeof r != "function")
                    return { default: r };
                  var m = g(y);
                  if (m && m.has(r))
                    return m.get(r);
                  var v = {}, N = Object.defineProperty && Object.getOwnPropertyDescriptor;
                  for (var A in r)
                    if (A !== "default" && Object.prototype.hasOwnProperty.call(r, A)) {
                      var $ = N ? Object.getOwnPropertyDescriptor(r, A) : null;
                      $ && ($.get || $.set) ? Object.defineProperty(v, A, $) : v[A] = r[A];
                    }
                  return v.default = r, m && m.set(r, v), v;
                }
              })
            ),
            /***/
            "./packages/@logrocket/exceptions/src/raven/raven.js": (
              /*!***********************************************************!*\
                !*** ./packages/@logrocket/exceptions/src/raven/raven.js ***!
                \***********************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = void 0;
                var f = o(s(
                  /*! @babel/runtime/helpers/classCallCheck */
                  "./node_modules/@babel/runtime/helpers/classCallCheck.js"
                )), l = o(s(
                  /*! @babel/runtime/helpers/createClass */
                  "./node_modules/@babel/runtime/helpers/createClass.js"
                )), x = o(s(
                  /*! @logrocket/utils/src/TraceKit */
                  "./packages/@logrocket/utils/src/TraceKit.js"
                )), g = Object.prototype;
                function p(A) {
                  return A === void 0;
                }
                function r(A) {
                  return typeof A == "function";
                }
                function y(A, $) {
                  return g.hasOwnProperty.call(A, $);
                }
                function m(A, $, S, _) {
                  var w = A[$];
                  A[$] = S(w), _ && _.push([A, $, w]);
                }
                var v = typeof window < "u" ? window : typeof s.g < "u" ? s.g : typeof self < "u" ? self : {};
                v.document;
                var N = /* @__PURE__ */ (function() {
                  function A($) {
                    var S = $.captureException;
                    (0, f.default)(this, A), this._errorHandler = this._errorHandler.bind(this), this._ignoreOnError = 0, this._wrappedBuiltIns = [], this.captureException = S, x.default.report.subscribe(this._errorHandler), this._instrumentTryCatch();
                  }
                  return (0, l.default)(A, [{
                    key: "uninstall",
                    value: function() {
                      x.default.report.unsubscribe(this._errorHandler);
                      for (var S; this._wrappedBuiltIns.length; ) {
                        S = this._wrappedBuiltIns.shift();
                        var _ = S[0], w = S[1], P = S[2];
                        _[w] = P;
                      }
                    }
                  }, {
                    key: "_errorHandler",
                    value: function(S) {
                      this._ignoreOnError || this.captureException(S);
                    }
                  }, {
                    key: "_ignoreNextOnError",
                    value: function() {
                      var S = this;
                      this._ignoreOnError += 1, setTimeout(function() {
                        S._ignoreOnError -= 1;
                      });
                    }
                    /*
                     * Wrap code within a context so Handler can capture errors
                     * reliably across domains that is executed immediately.
                     *
                     * @param {object} options A specific set of options for this context [optional]
                     * @param {function} func The callback to be immediately executed within the context
                     * @param {array} args An array of arguments to be called with the callback [optional]
                     */
                  }, {
                    key: "context",
                    value: function(S, _, w) {
                      return r(S) && (w = _ || [], _ = S, S = void 0), this.wrap(S, _).apply(this, w);
                    }
                  }, {
                    key: "wrap",
                    value: (
                      /*
                       * Wrap code within a context and returns back a new function to be executed
                       *
                       * @param {object} options A specific set of options for this context [optional]
                       * @param {function} func The function to be wrapped in a new context
                       * @param {function} func A function to call before the try/catch wrapper [optional, private]
                       * @return {function} The newly wrapped functions with a context
                       */
                      function(S, _, w) {
                        var P = this;
                        if (p(_) && !r(S))
                          return S;
                        if (r(S) && (_ = S, S = void 0), !r(_))
                          return _;
                        try {
                          if (_.__lr__)
                            return _;
                          if (_.__lr_wrapper__)
                            return _.__lr_wrapper__;
                          if (!Object.isExtensible(_))
                            return _;
                        } catch {
                          return _;
                        }
                        function D() {
                          var j = [], F = arguments.length, Y = !S || S && S.deep !== !1;
                          for (w && r(w) && w.apply(this, arguments); F--; )
                            j[F] = Y ? P.wrap(S, arguments[F]) : arguments[F];
                          try {
                            return _.apply(this, j);
                          } catch (ne) {
                            throw P._ignoreNextOnError(), P.captureException(x.default.computeStackTrace(ne), S), ne;
                          }
                        }
                        for (var C in _)
                          y(_, C) && (D[C] = _[C]);
                        return D.prototype = _.prototype, _.__lr_wrapper__ = D, D.__lr__ = !0, D.__inner__ = _, D;
                      }
                    )
                  }, {
                    key: "_instrumentTryCatch",
                    value: (
                      /**
                       * Install any queued plugins
                       */
                      function() {
                        var S = this, _ = S._wrappedBuiltIns;
                        function w(F) {
                          return function(Y, ne) {
                            for (var oe = new Array(arguments.length), me = 0; me < oe.length; ++me)
                              oe[me] = arguments[me];
                            var Pe = oe[0];
                            return r(Pe) && (oe[0] = S.wrap(Pe)), F.apply ? F.apply(this, oe) : F(oe[0], oe[1]);
                          };
                        }
                        function P(F) {
                          var Y = v[F] && v[F].prototype;
                          Y && Y.hasOwnProperty && Y.hasOwnProperty("addEventListener") && (m(Y, "addEventListener", function(ne) {
                            return function(oe, me, Pe, Ae) {
                              try {
                                me && me.handleEvent && (me.handleEvent = S.wrap(me.handleEvent));
                              } catch {
                              }
                              var K;
                              return ne.call(this, oe, S.wrap(me, void 0, K), Pe, Ae);
                            };
                          }, _), m(
                            Y,
                            "removeEventListener",
                            function(ne) {
                              return function(oe, me, Pe, Ae) {
                                try {
                                  var K = me?.__lr_wrapper__;
                                  K && ne.call(this, oe, K, Pe, Ae);
                                } catch {
                                }
                                return ne.call(this, oe, me, Pe, Ae);
                              };
                            },
                            // undefined is provided here to skip tracking for uninstall.
                            // Once our removeEventListener is installed, it can't be uninstalled.
                            // We always need to support removing logrocket wrapped event handlers (event
                            // handlers added when logrocket was installed) even after SDK shutdown.
                            void 0
                          ));
                        }
                        m(v, "setTimeout", w, _), m(v, "setInterval", w, _), v.requestAnimationFrame && m(v, "requestAnimationFrame", function(F) {
                          return function(Y) {
                            return F(S.wrap(Y));
                          };
                        }, _);
                        for (var D = ["EventTarget", "Window", "Node", "ApplicationCache", "AudioTrackList", "ChannelMergerNode", "CryptoOperation", "EventSource", "FileReader", "HTMLUnknownElement", "IDBDatabase", "IDBRequest", "IDBTransaction", "KeyOperation", "MediaController", "MessagePort", "ModalWindow", "Notification", "SVGElementInstance", "Screen", "TextTrack", "TextTrackCue", "TextTrackList", "WebSocket", "WebSocketWorker", "Worker", "XMLHttpRequest", "XMLHttpRequestEventTarget", "XMLHttpRequestUpload"], C = 0; C < D.length; C++)
                          P(D[C]);
                        var j = v.jQuery || v.$;
                        j && j.fn && j.fn.ready && m(j.fn, "ready", function(F) {
                          return function(Y) {
                            return F.call(this, S.wrap(Y));
                          };
                        }, _);
                      }
                    )
                  }]), A;
                })();
                d.default = N;
              })
            ),
            /***/
            "./packages/@logrocket/exceptions/src/registerExceptions.js": (
              /*!******************************************************************!*\
                !*** ./packages/@logrocket/exceptions/src/registerExceptions.js ***!
                \******************************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                ), f = s(
                  /*! @babel/runtime/helpers/typeof */
                  "./node_modules/@babel/runtime/helpers/typeof.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = r;
                var l = o(s(
                  /*! ./raven/raven */
                  "./packages/@logrocket/exceptions/src/raven/raven.js"
                )), x = p(s(
                  /*! ./Capture */
                  "./packages/@logrocket/exceptions/src/Capture.js"
                ));
                function g(y) {
                  if (typeof WeakMap != "function") return null;
                  var m = /* @__PURE__ */ new WeakMap(), v = /* @__PURE__ */ new WeakMap();
                  return (g = function(A) {
                    return A ? v : m;
                  })(y);
                }
                function p(y, m) {
                  if (y && y.__esModule)
                    return y;
                  if (y === null || f(y) !== "object" && typeof y != "function")
                    return { default: y };
                  var v = g(m);
                  if (v && v.has(y))
                    return v.get(y);
                  var N = {}, A = Object.defineProperty && Object.getOwnPropertyDescriptor;
                  for (var $ in y)
                    if ($ !== "default" && Object.prototype.hasOwnProperty.call(y, $)) {
                      var S = A ? Object.getOwnPropertyDescriptor(y, $) : null;
                      S && (S.get || S.set) ? Object.defineProperty(N, $, S) : N[$] = y[$];
                    }
                  return N.default = y, v && v.set(y, N), N;
                }
                function r(y) {
                  var m = new l.default({
                    captureException: function(A) {
                      x.captureException(y, null, null, A);
                    }
                  }), v = function(A) {
                    A.reason instanceof Error ? x.captureException(y, A.reason, null, null, "UNHANDLED_REJECTION") : y.addEvent("lr.core.Exception", function() {
                      return {
                        exceptionType: "UNHANDLED_REJECTION",
                        message: A.reason || "Unhandled Promise rejection"
                      };
                    });
                  };
                  return window.addEventListener("unhandledrejection", v), function() {
                    window.removeEventListener("unhandledrejection", v), m.uninstall();
                  };
                }
              })
            ),
            /***/
            "./packages/@logrocket/exceptions/src/stackTraceFromError.js": (
              /*!*******************************************************************!*\
                !*** ./packages/@logrocket/exceptions/src/stackTraceFromError.js ***!
                \*******************************************************************/
              /***/
              (function(c, d) {
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = s;
                function s(o) {
                  function f(l) {
                    return l === null ? void 0 : l;
                  }
                  return o.stack ? o.stack.map(function(l) {
                    return {
                      lineNumber: f(l.line),
                      columnNumber: f(l.column),
                      fileName: f(l.url),
                      functionName: f(l.func)
                    };
                  }) : void 0;
                }
              })
            ),
            /***/
            "./packages/@logrocket/network/src/fetchIntercept.js": (
              /*!***********************************************************!*\
                !*** ./packages/@logrocket/network/src/fetchIntercept.js ***!
                \***********************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = void 0;
                var f = o(s(
                  /*! @babel/runtime/helpers/toConsumableArray */
                  "./node_modules/@babel/runtime/helpers/toConsumableArray.js"
                )), l = s(
                  /*! ./registerXHR */
                  "./packages/@logrocket/network/src/registerXHR.js"
                ), x = [];
                function g(m, v) {
                  for (var N = x.reduce(function(w, P) {
                    return [P].concat(w);
                  }, []), A = arguments.length, $ = new Array(A > 2 ? A - 2 : 0), S = 2; S < A; S++)
                    $[S - 2] = arguments[S];
                  var _ = Promise.resolve($);
                  return N.forEach(function(w) {
                    var P = w.request, D = w.requestError;
                    (P || D) && (_ = _.then(function(C) {
                      return P.apply(void 0, [v].concat((0, f.default)(C)));
                    }, function(C) {
                      return D.apply(void 0, [v].concat((0, f.default)(C)));
                    }));
                  }), _ = _.then(function(w) {
                    (0, l.setActive)(!1);
                    var P, D;
                    try {
                      P = m.apply(void 0, (0, f.default)(w));
                    } catch (C) {
                      D = C;
                    }
                    if ((0, l.setActive)(!0), D)
                      throw D;
                    return P;
                  }), N.forEach(function(w) {
                    var P = w.response, D = w.responseError;
                    (P || D) && (_ = _.then(function(C) {
                      return P(v, C);
                    }, function(C) {
                      return D && D(v, C);
                    }));
                  }), _;
                }
                function p(m) {
                  if (!(!m.fetch || !m.Promise)) {
                    var v = m.fetch.polyfill;
                    m.fetch = /* @__PURE__ */ (function(N) {
                      var A = 0;
                      return function() {
                        for (var $ = arguments.length, S = new Array($), _ = 0; _ < $; _++)
                          S[_] = arguments[_];
                        return g.apply(void 0, [N, A++].concat(S));
                      };
                    })(m.fetch), v && (m.fetch.polyfill = v);
                  }
                }
                var r = !1, y = {
                  register: function(v) {
                    return r || (r = !0, p(window)), x.push(v), function() {
                      var N = x.indexOf(v);
                      N >= 0 && x.splice(N, 1);
                    };
                  },
                  clear: function() {
                    x = [];
                  }
                };
                d.default = y;
              })
            ),
            /***/
            "./packages/@logrocket/network/src/index.js": (
              /*!**************************************************!*\
                !*** ./packages/@logrocket/network/src/index.js ***!
                \**************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = N;
                var f = o(s(
                  /*! @babel/runtime/helpers/defineProperty */
                  "./node_modules/@babel/runtime/helpers/defineProperty.js"
                )), l = o(s(
                  /*! @babel/runtime/helpers/typeof */
                  "./node_modules/@babel/runtime/helpers/typeof.js"
                )), x = o(s(
                  /*! ./registerFetch */
                  "./packages/@logrocket/network/src/registerFetch.js"
                )), g = s(
                  /*! ./registerIonic */
                  "./packages/@logrocket/network/src/registerIonic.ts"
                ), p = o(s(
                  /*! ./registerNetworkInformation */
                  "./packages/@logrocket/network/src/registerNetworkInformation.js"
                )), r = o(s(
                  /*! ./registerXHR */
                  "./packages/@logrocket/network/src/registerXHR.js"
                )), y = o(s(
                  /*! @logrocket/utils/src/mapValues */
                  "./packages/@logrocket/utils/src/mapValues.ts"
                ));
                function m(A, $) {
                  var S = Object.keys(A);
                  if (Object.getOwnPropertySymbols) {
                    var _ = Object.getOwnPropertySymbols(A);
                    $ && (_ = _.filter(function(w) {
                      return Object.getOwnPropertyDescriptor(A, w).enumerable;
                    })), S.push.apply(S, _);
                  }
                  return S;
                }
                function v(A) {
                  for (var $ = 1; $ < arguments.length; $++) {
                    var S = arguments[$] != null ? arguments[$] : {};
                    $ % 2 ? m(Object(S), !0).forEach(function(_) {
                      (0, f.default)(A, _, S[_]);
                    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(A, Object.getOwnPropertyDescriptors(S)) : m(Object(S)).forEach(function(_) {
                      Object.defineProperty(A, _, Object.getOwnPropertyDescriptor(S, _));
                    });
                  }
                  return A;
                }
                function N(A) {
                  var $ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
                    isReactNative: !1,
                    isDisabled: !1
                  };
                  if ($?.isDisabled === !0)
                    return function() {
                    };
                  var S = $.isReactNative, _ = $.shouldAugmentNPS, w = $.shouldParseXHRBlob, P = {}, D = function(Ae) {
                    var K = 4096e3, re = Ae;
                    if ((0, l.default)(Ae) === "object" && Ae != null) {
                      var q = Object.getPrototypeOf(Ae);
                      (q === Object.prototype || q === null) && (re = JSON.stringify(Ae));
                    }
                    if (re && re.length && re.length > K && typeof re == "string") {
                      var Ne = re.substring(0, 1e3);
                      return "".concat(Ne, ` ... LogRocket truncating to first 1000 characters.
      Keep data under 4MB to prevent truncation. https://docs.logrocket.com/reference/network`);
                    }
                    return Ae;
                  }, C = function(Ae, K) {
                    var re = K.method;
                    A.addEvent("lr.network.RequestEvent", function() {
                      var q = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, Ne = q.isEnabled, Oe = Ne === void 0 ? !0 : Ne, De = q.requestSanitizer, Me = De === void 0 ? function(V) {
                        return V;
                      } : De;
                      if (!Oe)
                        return null;
                      var be = null;
                      try {
                        be = Me(v(v({}, K), {}, {
                          reqId: Ae
                        }));
                      } catch (V) {
                        console.error(V);
                      }
                      if (be) {
                        var Te = be.url;
                        if (typeof document < "u" && typeof document.createElement == "function") {
                          var pe = document.createElement("a");
                          pe.href = be.url, Te = pe.href;
                        }
                        return {
                          reqId: Ae,
                          // default
                          url: Te,
                          // sanitized
                          headers: (0, y.default)(be.headers, function(V) {
                            return "".concat(V);
                          }),
                          body: D(be.body),
                          // sanitized
                          method: re,
                          // default
                          referrer: be.referrer || void 0,
                          // sanitized
                          mode: be.mode || void 0,
                          // sanitized
                          credentials: be.credentials || void 0
                          // sanitized
                        };
                      }
                      return P[Ae] = !0, null;
                    });
                  }, j = function(Ae, K) {
                    var re = K.method, q = K.status, Ne = K.responseType;
                    A.addEvent("lr.network.ResponseEvent", function() {
                      var Oe = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, De = Oe.isEnabled, Me = De === void 0 ? !0 : De, be = Oe.responseSanitizer, Te = be === void 0 ? function(V) {
                        return V;
                      } : be;
                      if (Me) {
                        if (P[Ae])
                          return delete P[Ae], null;
                      } else return null;
                      var pe = null;
                      try {
                        pe = Te(v(v({}, K), {}, {
                          reqId: Ae
                        }));
                      } catch (V) {
                        console.error(V);
                      }
                      return pe ? {
                        reqId: Ae,
                        // default
                        responseType: Ne,
                        status: pe.status,
                        // sanitized
                        headers: (0, y.default)(pe.headers, function(V) {
                          return "".concat(V);
                        }),
                        body: D(pe.body),
                        // sanitized
                        method: re
                        // default
                      } : {
                        reqId: Ae,
                        // default
                        responseType: Ne,
                        status: q,
                        // default
                        headers: {},
                        // redacted
                        body: null,
                        // redacted
                        method: re
                        // default
                      };
                    });
                  }, F = function(Ae) {
                    return A.isDisabled || P[Ae] === !0;
                  }, Y = (0, x.default)({
                    addRequest: C,
                    addResponse: j,
                    isIgnored: F
                  }), ne = (0, r.default)({
                    addRequest: C,
                    addResponse: j,
                    isIgnored: F,
                    logger: A,
                    shouldAugmentNPS: _,
                    shouldParseXHRBlob: w
                  }), oe = (0, g.registerIonic)({
                    addRequest: C,
                    addResponse: j,
                    isIgnored: F
                  }), me = S ? function() {
                  } : (0, p.default)(A);
                  return function() {
                    me(), Y(), ne(), oe();
                  };
                }
              })
            ),
            /***/
            "./packages/@logrocket/network/src/registerFetch.js": (
              /*!**********************************************************!*\
                !*** ./packages/@logrocket/network/src/registerFetch.js ***!
                \**********************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = v;
                var f = o(s(
                  /*! @babel/runtime/helpers/defineProperty */
                  "./node_modules/@babel/runtime/helpers/defineProperty.js"
                )), l = o(s(
                  /*! @logrocket/utils/src/mapValues */
                  "./packages/@logrocket/utils/src/mapValues.ts"
                )), x = o(s(
                  /*! ./fetchIntercept */
                  "./packages/@logrocket/network/src/fetchIntercept.js"
                ));
                function g(N, A) {
                  var $ = Object.keys(N);
                  if (Object.getOwnPropertySymbols) {
                    var S = Object.getOwnPropertySymbols(N);
                    A && (S = S.filter(function(_) {
                      return Object.getOwnPropertyDescriptor(N, _).enumerable;
                    })), $.push.apply($, S);
                  }
                  return $;
                }
                function p(N) {
                  for (var A = 1; A < arguments.length; A++) {
                    var $ = arguments[A] != null ? arguments[A] : {};
                    A % 2 ? g(Object($), !0).forEach(function(S) {
                      (0, f.default)(N, S, $[S]);
                    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(N, Object.getOwnPropertyDescriptors($)) : g(Object($)).forEach(function(S) {
                      Object.defineProperty(N, S, Object.getOwnPropertyDescriptor($, S));
                    });
                  }
                  return N;
                }
                function r(N) {
                  if (N == null || typeof N.forEach != "function")
                    return N;
                  var A = {};
                  return N.forEach(function($, S) {
                    A[S] ? A[S] = "".concat(A[S], ",").concat($) : A[S] = "".concat($);
                  }), A;
                }
                var y = function(A) {
                  return (0, l.default)(r(A), function($) {
                    return "".concat($);
                  });
                };
                function m() {
                  var N = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
                  return {
                    url: N.url,
                    headers: y(N.headers),
                    method: N.method && N.method.toUpperCase(),
                    referrer: N.referrer || void 0,
                    mode: N.mode || void 0,
                    credentials: N.credentials || void 0
                  };
                }
                function v(N) {
                  var A = N.addRequest, $ = N.addResponse, S = N.isIgnored, _ = "fetch-", w = {}, P = x.default.register({
                    request: function(C) {
                      for (var j = arguments.length, F = new Array(j > 1 ? j - 1 : 0), Y = 1; Y < j; Y++)
                        F[Y - 1] = arguments[Y];
                      var ne;
                      if (typeof Request < "u" && F[0] instanceof Request) {
                        var oe;
                        try {
                          oe = F[0].clone().text();
                        } catch (me) {
                          oe = Promise.resolve("LogRocket fetch error: ".concat(me.message));
                        }
                        ne = oe.then(function(me) {
                          return p(p({}, m(F[0])), {}, {
                            body: me
                          });
                        }, function(me) {
                          return p(p({}, m(F[0])), {}, {
                            body: "LogRocket fetch error: ".concat(me.message)
                          });
                        });
                      } else
                        ne = Promise.resolve(p(p({}, m(F[1])), {}, {
                          url: "".concat(F[0]),
                          body: (F[1] || {}).body
                        }));
                      return ne.then(function(me) {
                        return w[C] = me.method, A("".concat(_).concat(C), me), F;
                      });
                    },
                    requestError: function(C, j) {
                      return Promise.reject(j);
                    },
                    response: function(C, j) {
                      var F, Y;
                      if (S("".concat(_).concat(C)))
                        return j;
                      if (j.headers.get("content-type") === "text/event-stream")
                        Y = Promise.resolve("LogRocket skipped consuming an event-stream body.");
                      else {
                        try {
                          F = j.clone();
                        } catch (Ae) {
                          var ne = {
                            url: j.url,
                            responseType: j.type.toUpperCase(),
                            status: j.status,
                            headers: y(j.headers),
                            body: "LogRocket fetch error: ".concat(Ae.message),
                            method: w[C]
                          };
                          return delete w[C], $("".concat(_).concat(C), ne), j;
                        }
                        try {
                          if (window.TextDecoder && F.body) {
                            var oe = F.body.getReader(), me = new window.TextDecoder("utf-8"), Pe = "";
                            Y = oe.read().then(function Ae(K) {
                              var re = K.done, q = K.value;
                              if (re)
                                return Pe;
                              var Ne = q ? me.decode(q, {
                                stream: !0
                              }) : "";
                              return Pe += Ne, oe.read().then(Ae);
                            });
                          } else
                            Y = F.text();
                        } catch (Ae) {
                          Y = Promise.resolve("LogRocket error reading body: ".concat(Ae.message));
                        }
                      }
                      return Y.catch(function(Ae) {
                        if (!(Ae.name === "AbortError" && Ae instanceof DOMException))
                          return "LogRocket error reading body: ".concat(Ae.message);
                      }).then(function(Ae) {
                        var K = {
                          url: j.url,
                          responseType: j.type.toUpperCase(),
                          status: j.status,
                          headers: y(j.headers),
                          body: Ae,
                          method: w[C]
                        };
                        delete w[C], $("".concat(_).concat(C), K);
                      }), j;
                    },
                    responseError: function(C, j) {
                      var F = {
                        url: void 0,
                        status: 0,
                        headers: {},
                        body: "".concat(j)
                      };
                      return $("".concat(_).concat(C), F), Promise.reject(j);
                    }
                  });
                  return P;
                }
              })
            ),
            /***/
            "./packages/@logrocket/network/src/registerIonic.ts": (
              /*!**********************************************************!*\
                !*** ./packages/@logrocket/network/src/registerIonic.ts ***!
                \**********************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.mergeHeaders = oe, d.serializeQueryParams = q, d.appendQueryParamsString = Ne, d.processData = Me, d.registerIonic = pe;
                var f = o(s(
                  /*! @babel/runtime/helpers/defineProperty */
                  "./node_modules/@babel/runtime/helpers/defineProperty.js"
                )), l = o(s(
                  /*! @babel/runtime/helpers/typeof */
                  "./node_modules/@babel/runtime/helpers/typeof.js"
                )), x = o(s(
                  /*! @babel/runtime/helpers/toConsumableArray */
                  "./node_modules/@babel/runtime/helpers/toConsumableArray.js"
                )), g = o(s(
                  /*! @logrocket/utils/src/protectFunc */
                  "./packages/@logrocket/utils/src/protectFunc.ts"
                ));
                function p(V, ae) {
                  var se = typeof Symbol < "u" && V[Symbol.iterator] || V["@@iterator"];
                  if (!se) {
                    if (Array.isArray(V) || (se = r(V)) || ae) {
                      se && (V = se);
                      var _e = 0, Ee = function() {
                      };
                      return { s: Ee, n: function() {
                        return _e >= V.length ? { done: !0 } : { done: !1, value: V[_e++] };
                      }, e: function(qe) {
                        throw qe;
                      }, f: Ee };
                    }
                    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
                  }
                  var Ie = !0, We = !1, Ve;
                  return { s: function() {
                    se = se.call(V);
                  }, n: function() {
                    var qe = se.next();
                    return Ie = qe.done, qe;
                  }, e: function(qe) {
                    We = !0, Ve = qe;
                  }, f: function() {
                    try {
                      !Ie && se.return != null && se.return();
                    } finally {
                      if (We) throw Ve;
                    }
                  } };
                }
                function r(V, ae) {
                  if (V) {
                    if (typeof V == "string") return y(V, ae);
                    var se = Object.prototype.toString.call(V).slice(8, -1);
                    if (se === "Object" && V.constructor && (se = V.constructor.name), se === "Map" || se === "Set") return Array.from(V);
                    if (se === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(se)) return y(V, ae);
                  }
                }
                function y(V, ae) {
                  (ae == null || ae > V.length) && (ae = V.length);
                  for (var se = 0, _e = new Array(ae); se < ae; se++)
                    _e[se] = V[se];
                  return _e;
                }
                function m(V, ae) {
                  var se = Object.keys(V);
                  if (Object.getOwnPropertySymbols) {
                    var _e = Object.getOwnPropertySymbols(V);
                    ae && (_e = _e.filter(function(Ee) {
                      return Object.getOwnPropertyDescriptor(V, Ee).enumerable;
                    })), se.push.apply(se, _e);
                  }
                  return se;
                }
                function v(V) {
                  for (var ae = 1; ae < arguments.length; ae++) {
                    var se = arguments[ae] != null ? arguments[ae] : {};
                    ae % 2 ? m(Object(se), !0).forEach(function(_e) {
                      (0, f.default)(V, _e, se[_e]);
                    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(V, Object.getOwnPropertyDescriptors(se)) : m(Object(se)).forEach(function(_e) {
                      Object.defineProperty(V, _e, Object.getOwnPropertyDescriptor(se, _e));
                    });
                  }
                  return V;
                }
                var N = /* @__PURE__ */ new Set(["get", "put", "post", "patch", "head", "delete", "options", "upload", "download"]), A = /* @__PURE__ */ new Set(["urlencoded", "json", "utf8"]), $ = /* @__PURE__ */ new Set(["raw", "multipart"]), S = "ionic-", _ = /* @__PURE__ */ new Set(["desktop", "mobileweb", "pwa"]), w = /* @__PURE__ */ new Set(["FormData"]), P = /* @__PURE__ */ new Set(), D = /* @__PURE__ */ new Set(["string"]), C = /* @__PURE__ */ new Set(["string", "array"]), j = {
                  utf8: D,
                  urlencoded: /* @__PURE__ */ new Set(["object"]),
                  json: /* @__PURE__ */ new Set(["array", "object"]),
                  raw: /* @__PURE__ */ new Set(["Uint8Array", "ArrayBuffer"]),
                  default: P
                };
                function F(V, ae, se) {
                  if (typeof ae != "string")
                    throw new Error("".concat(se, " must be one of: ").concat((0, x.default)(V).join(", ")));
                  if (ae = ae.trim().toLowerCase(), !V.has(ae))
                    throw new Error("".concat(se, " must be one of: ").concat((0, x.default)(V).join(", ")));
                  return ae;
                }
                function Y(V, ae, se) {
                  if ((0, l.default)(V) !== "object")
                    throw new Error(se);
                  for (var _e = 0, Ee = Object.keys(V); _e < Ee.length; _e++) {
                    var Ie = Ee[_e];
                    if (!ae.has((0, l.default)(V[Ie])))
                      throw new Error(se);
                  }
                  return V;
                }
                function ne(V, ae) {
                  var se = new URL(V), _e = se.host;
                  return ae.getHeaders(_e) || null;
                }
                function oe(V, ae) {
                  return v(v({}, V), ae);
                }
                function me(V, ae, se) {
                  var _e = se.getHeaders("*") || {}, Ee = ne(V, se) || {};
                  return oe(oe(_e, Ee), ae);
                }
                function Pe(V, ae) {
                  return ae ? encodeURIComponent(V) : V;
                }
                function Ae(V, ae, se) {
                  return V.length ? se ? "".concat(encodeURIComponent(V), "[").concat(encodeURIComponent(ae), "]") : "".concat(V, "[").concat(ae, "]") : se ? encodeURIComponent(ae) : ae;
                }
                function K(V, ae, se) {
                  var _e = [], Ee = p(ae), Ie;
                  try {
                    for (Ee.s(); !(Ie = Ee.n()).done; ) {
                      var We = Ie.value;
                      if (Array.isArray(We)) {
                        _e.push(K("".concat(V, "[]"), We, se));
                        continue;
                      } else if ((0, l.default)(We) === "object") {
                        _e.push(re("".concat(V, "[]").concat(We), se, void 0));
                        continue;
                      }
                      _e.push("".concat(Ae(V, "", se), "=").concat(Pe(We, se)));
                    }
                  } catch (Ve) {
                    Ee.e(Ve);
                  } finally {
                    Ee.f();
                  }
                  return _e.join("&");
                }
                function re(V, ae, se) {
                  var _e = [];
                  for (var Ee in ae)
                    if (ae.hasOwnProperty(Ee)) {
                      var Ie = V.length ? "".concat(V, "[").concat(Ee, "]") : Ee;
                      if (Array.isArray(ae[Ee])) {
                        _e.push(K(Ie, ae[Ee], se));
                        continue;
                      } else if ((0, l.default)(ae[Ee]) === "object" && ae[Ee] !== null) {
                        _e.push(re(Ie, ae[Ee], se));
                        continue;
                      }
                      _e.push("".concat(Ae(V, Ee, se), "=").concat(Pe(ae[Ee], se)));
                    }
                  return _e.join("&");
                }
                function q(V, ae) {
                  return re("", V, ae);
                }
                function Ne(V, ae) {
                  if (!V.length || !ae.length)
                    return V;
                  var se = new URL(V), _e = se.host, Ee = se.pathname, Ie = se.search, We = se.hash, Ve = se.protocol;
                  return "".concat(Ve, "//").concat(_e).concat(Ee).concat(Ie.length ? "".concat(Ie, "&").concat(ae) : "?".concat(ae)).concat(We);
                }
                function Oe(V) {
                  return j[V] || j.default;
                }
                function De(V) {
                  return V === "multipart" ? w : P;
                }
                function Me(V, ae) {
                  var se = (0, l.default)(V), _e = Oe(ae), Ee = De(ae);
                  if (Ee.size > 0) {
                    var Ie = !1;
                    if (Ee.forEach(function(We) {
                      s.g[We] && V instanceof s.g[We] && (Ie = !0);
                    }), !Ie)
                      throw new Error("INSTANCE_TYPE_MISMATCH_DATA ".concat((0, x.default)(Ee).join(", ")));
                  }
                  if (Ee.size === 0 && !_e.has(se))
                    throw new Error("TYPE_MISMATCH_DATA ".concat((0, x.default)(_e).join(", ")));
                  switch (ae) {
                    case "utf8":
                      return V;
                    default:
                      return JSON.stringify(V, void 0, 2);
                  }
                }
                function be(V, ae) {
                  V = V || {};
                  var se, _e = V.data;
                  try {
                    se = F(A, V.serializer || ae.getDataSerializer(), "serializer / data payload type");
                  } catch {
                    se = F($, V.serializer || ae.getDataSerializer(), "serializer / data payload type"), _e = {};
                  }
                  return {
                    data: _e,
                    filePath: V.filePath,
                    followRedirect: V.followRedirect,
                    headers: Y(V.headers || {}, D, "Invalid header type, must be string"),
                    method: F(N, V.method || N[0], "method"),
                    name: V.name,
                    params: Y(V.params || {}, C, "Invalid param, must be of type string or array"),
                    responseType: V.responseType,
                    serializer: se,
                    connectTimeout: V.connectTimeout,
                    readTimeout: V.readTimeout,
                    timeout: V.timeout
                  };
                }
                var Te = 0;
                function pe(V) {
                  var ae, se, _e, Ee = V.addRequest, Ie = V.addResponse, We = V.isIgnored, Ve = (ae = window.cordova) === null || ae === void 0 || (se = ae.plugin) === null || se === void 0 ? void 0 : se.http, Ge = {}, qe = !1;
                  if (typeof Ve > "u")
                    return function() {
                    };
                  var Ze = (_e = window.ionic) === null || _e === void 0 ? void 0 : _e.platforms;
                  if (typeof Ze < "u" && typeof Ze.some == "function" && Ze.some(function(H) {
                    return _.has(H);
                  }))
                    return function() {
                    };
                  var Fe = Ve.sendRequest, Je = (0, g.default)(function(H, we, le) {
                    if (!We("".concat(S).concat(le)))
                      try {
                        var Re = {
                          url: H.url || "",
                          status: H.status < 600 && H.status >= 100 ? H.status : 0,
                          headers: H.headers || {},
                          body: we ? H.data : H.error,
                          method: Ge[le].toUpperCase()
                        };
                        Ie("".concat(S).concat(le), Re);
                      } catch (J) {
                        var L = {
                          url: H.url || "",
                          status: H.status < 600 && H.status >= 100 ? H.status : 0,
                          headers: H.headers || {},
                          body: "LogRocket fetch error: ".concat(J.message),
                          method: Ge[le].toUpperCase()
                        };
                        Ie("".concat(S).concat(le), L);
                      }
                  });
                  return Ve.sendRequest = function(H, we, le, Re) {
                    var L = ++Te, J = function(O) {
                      qe || (Je(O, !0, L), delete Ge[L]), le(O);
                    }, ke = function(O) {
                      qe || (Je(O, !1, L), delete Ge[L]), Re(O);
                    };
                    if (!qe)
                      try {
                        var M = be(we, Ve), E = Ne(H, re("", M.params, !0)), z = me(H, M.headers, Ve), k = M.method || "get";
                        Ge[L] = k;
                        var B = {
                          url: E,
                          method: k.toUpperCase(),
                          headers: z || {},
                          // only applicable on post, put or patch methods
                          body: Me(M.data || {}, M.serializer)
                        };
                        Ee("".concat(S).concat(L), B);
                      } catch (T) {
                        var W = {
                          url: H,
                          method: (we.method || "get").toUpperCase(),
                          headers: {},
                          body: "LogRocket fetch error: ".concat(T.message)
                        };
                        Ee("".concat(S).concat(L), W);
                      }
                    return Fe(H, we, J, ke);
                  }, function() {
                    qe = !0, Ve.sendRequest = Fe, Ge = {};
                  };
                }
              })
            ),
            /***/
            "./packages/@logrocket/network/src/registerNetworkInformation.js": (
              /*!***********************************************************************!*\
                !*** ./packages/@logrocket/network/src/registerNetworkInformation.js ***!
                \***********************************************************************/
              /***/
              (function(c, d) {
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = o;
                var s = {
                  "slow-2g": "SLOW2G",
                  "2g": "TWOG",
                  "3g": "THREEG",
                  "4g": "FOURG"
                };
                function o(f) {
                  var l = void 0;
                  function x() {
                    var g = {
                      online: window.navigator.onLine,
                      effectiveType: "UNKOWN"
                    };
                    window.navigator.onLine ? window.navigator.connection && window.navigator.connection.effectiveType && (g.effectiveType = s[window.navigator.connection.effectiveType] || "UNKNOWN") : g.effectiveType = "NONE", !(l && g.online === l.online && g.effectiveType === l.effectiveType) && (l = g, f.addEvent("lr.network.NetworkStatusEvent", function() {
                      var p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = p.isEnabled, y = r === void 0 ? !0 : r;
                      return y ? g : null;
                    }));
                  }
                  return setTimeout(x), window.navigator.connection && typeof window.navigator.connection.addEventListener == "function" && window.navigator.connection.addEventListener("change", x), window.addEventListener("online", x), window.addEventListener("offline", x), function() {
                    window.removeEventListener("offline", x), window.removeEventListener("online", x), window.navigator.connection && typeof window.navigator.connection.removeEventListener == "function" && window.navigator.connection.removeEventListener("change", x);
                  };
                }
              })
            ),
            /***/
            "./packages/@logrocket/network/src/registerXHR.js": (
              /*!********************************************************!*\
                !*** ./packages/@logrocket/network/src/registerXHR.js ***!
                \********************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.setActive = m, d.default = N;
                var f = o(s(
                  /*! @logrocket/utils/src/mapValues */
                  "./packages/@logrocket/utils/src/mapValues.ts"
                )), l = o(s(
                  /*! @logrocket/utils/src/enhanceFunc */
                  "./packages/@logrocket/utils/src/enhanceFunc.ts"
                )), x = o(s(
                  /*! @logrocket/utils/src/protectFunc */
                  "./packages/@logrocket/utils/src/protectFunc.ts"
                )), g = o(s(
                  /*! @logrocket/utils/src/startsWith */
                  "./packages/@logrocket/utils/src/startsWith.js"
                )), p = s(
                  /*! @logrocket/utils/src/constants/nps */
                  "./packages/@logrocket/utils/src/constants/nps.js"
                ), r = s(
                  /*! @logrocket/utils/src/constants/statusCodes */
                  "./packages/@logrocket/utils/src/constants/statusCodes.ts"
                ), y = !0;
                function m(A) {
                  y = A;
                }
                var v = 0;
                function N(A) {
                  var $ = A.addRequest, S = A.addResponse, _ = A.isIgnored, w = A.logger, P = A.shouldAugmentNPS, D = P === void 0 ? !0 : P, C = A.shouldParseXHRBlob, j = C === void 0 ? !1 : C, F = XMLHttpRequest, Y = /* @__PURE__ */ new WeakMap(), ne = !1, oe = "xhr-";
                  return window._lrXMLHttpRequest = XMLHttpRequest, XMLHttpRequest = function(Pe, Ae) {
                    var K = new F(Pe, Ae);
                    if (!y)
                      return K;
                    Y.set(K, {
                      xhrId: ++v,
                      requestHeaders: {},
                      sent: !1,
                      done: !1
                    });
                    var re = K.open;
                    function q() {
                      for (var be = arguments.length, Te = new Array(be), pe = 0; pe < be; pe++)
                        Te[pe] = arguments[pe];
                      try {
                        var V = Te[1];
                        if (window.URL && typeof window.URL == "function" && V.search(p.WOOTRIC_RESPONSES_REGEX) === 0) {
                          var ae = new window.URL(w.recordingURL);
                          ae.searchParams.set("nps", "wootric");
                          var se = new window.URL(V), _e = se.searchParams.get("response[text]"), Ee = _e ? "".concat(_e, `

`) : "";
                          se.searchParams.set("response[text]", "".concat(Ee, "<").concat(ae.href, "|View LogRocket session>")), Te[1] = se.href;
                        }
                      } catch {
                      }
                      return re.apply(this, Te);
                    }
                    var Ne = K.send;
                    function Oe() {
                      for (var be = arguments.length, Te = new Array(be), pe = 0; pe < be; pe++)
                        Te[pe] = arguments[pe];
                      try {
                        var V = Y.get(K);
                        if (window.URL && typeof window.URL == "function" && V && V.url && V.url.search(p.DELIGHTED_RESPONSES_REGEX) === 0 && Te.length && Te[0].indexOf(p.DELIGHTED_FEEDBACK_PREFIX) !== -1) {
                          var ae = new window.URL(w.recordingURL);
                          ae.searchParams.set("nps", "delighted");
                          var se = encodeURIComponent(ae.href), _e = Te[0].split("&").map(function(Ee) {
                            if ((0, g.default)(Ee, p.DELIGHTED_FEEDBACK_PREFIX)) {
                              var Ie = Ee === p.DELIGHTED_FEEDBACK_PREFIX;
                              return "".concat(Ee).concat(Ie ? "" : `

`, "<").concat(se, "|View LogRocket session>");
                            }
                            return Ee;
                          }).join("&");
                          Te[0] = _e;
                        }
                      } catch {
                      }
                      return Ne.apply(this, Te);
                    }
                    D && (K.open = q, K.send = Oe);
                    var De = function() {
                      var Te;
                      if (!ne) {
                        var pe = Y.get(K);
                        if (!(!pe || _("".concat(oe).concat(pe.xhrId))) && !(!pe.sent || !pe.done)) {
                          var V = pe.status || r.XHR_CUSTOM_STATUS_CODES.error;
                          V === r.XHR_CUSTOM_STATUS_CODES.error && ((Te = window.navigator) === null || Te === void 0 ? void 0 : Te.onLine) === !1 && (V = r.XHR_CUSTOM_STATUS_CODES.offline);
                          var ae = {
                            url: pe.url,
                            status: V,
                            headers: pe.responseHeaders,
                            body: pe.responseBody,
                            method: (pe.method || "").toUpperCase()
                          };
                          if (j && ae.body instanceof Blob) {
                            var se = new FileReader();
                            se.readAsText(ae.body), se.onload = function() {
                              try {
                                ae.body = JSON.parse(se.result);
                              } catch {
                              }
                              S("".concat(oe).concat(pe.xhrId), ae);
                            };
                          } else
                            S("".concat(oe).concat(pe.xhrId), ae);
                        }
                      }
                    };
                    (0, l.default)(K, "open", (0, x.default)(function(be, Te) {
                      if (!ne) {
                        var pe = Y.get(K);
                        pe.method = be, pe.url = Te;
                      }
                    })), (0, l.default)(K, "send", (0, x.default)(function(be) {
                      if (!ne) {
                        var Te = Y.get(K);
                        if (Te) {
                          var pe = {
                            url: Te.url,
                            method: Te.method && Te.method.toUpperCase(),
                            headers: (0, f.default)(Te.requestHeaders || {}, function(V) {
                              return V.join(", ");
                            }),
                            body: be
                          };
                          $("".concat(oe).concat(Te.xhrId), pe), Te.sent = !0, De();
                        }
                      }
                    })), (0, l.default)(K, "setRequestHeader", (0, x.default)(function(be, Te) {
                      if (!ne) {
                        var pe = Y.get(K);
                        pe && (pe.requestHeaders = pe.requestHeaders || {}, pe.requestHeaders[be] = pe.requestHeaders[be] || [], pe.requestHeaders[be].push(Te));
                      }
                    }));
                    var Me = {
                      readystatechange: (0, x.default)(function() {
                        if (!ne && K.readyState === 4) {
                          var be = Y.get(K);
                          if (!be || _("".concat(oe).concat(be.xhrId)))
                            return;
                          var Te = K.getAllResponseHeaders() || "";
                          be.responseHeaders = Te.split(/[\r\n]+/).reduce(function(V, ae) {
                            var se = V, _e = ae.split(": ");
                            if (_e.length > 0) {
                              var Ee = _e.shift(), Ie = _e.join(": ");
                              V[Ee] ? se[Ee] += ", ".concat(Ie) : se[Ee] = Ie;
                            }
                            return se;
                          }, {});
                          var pe;
                          try {
                            switch (K.responseType) {
                              case "json":
                                pe = w._shouldCloneResponse ? JSON.parse(JSON.stringify(K.response)) : K.response;
                                break;
                              case "arraybuffer":
                              case "blob": {
                                pe = K.response;
                                break;
                              }
                              case "document": {
                                pe = K.responseXML;
                                break;
                              }
                              case "text":
                              case "": {
                                pe = K.responseText;
                                break;
                              }
                              default:
                                pe = "";
                            }
                          } catch {
                            pe = "LogRocket: Error accessing response.";
                          }
                          be.responseBody = pe, be.status = K.status, be.done = !0;
                        }
                      }),
                      abort: (0, x.default)(function() {
                        var be = Y.get(K);
                        be && (be.status = r.XHR_CUSTOM_STATUS_CODES.aborted);
                      }),
                      timeout: (0, x.default)(function() {
                        var be = Y.get(K);
                        be && (be.status = r.XHR_CUSTOM_STATUS_CODES.timeout);
                      }),
                      loadend: (0, x.default)(function() {
                        De();
                      })
                      // // Unused Event Listeners
                      // loadstart: () => {},
                      // progress: () => {},
                      // error: () => {},
                      // load: () => {},
                    };
                    return Object.keys(Me).forEach(function(be) {
                      K.addEventListener(be, Me[be]);
                    }), K;
                  }, XMLHttpRequest.prototype = F.prototype, ["UNSENT", "OPENED", "HEADERS_RECEIVED", "LOADING", "DONE"].forEach(function(me) {
                    XMLHttpRequest[me] = F[me];
                  }), function() {
                    ne = !0, XMLHttpRequest = F;
                  };
                }
              })
            ),
            /***/
            "./packages/@logrocket/now/src/index.js": (
              /*!**********************************************!*\
                !*** ./packages/@logrocket/now/src/index.js ***!
                \**********************************************/
              /***/
              (function(c, d) {
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = void 0;
                var s = Date.now.bind(Date), o = s(), f = typeof performance < "u" && performance.now ? performance.now.bind(performance) : function() {
                  return s() - o;
                };
                d.default = f;
              })
            ),
            /***/
            "./packages/@logrocket/redux/src/createEnhancer.js": (
              /*!*********************************************************!*\
                !*** ./packages/@logrocket/redux/src/createEnhancer.js ***!
                \*********************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = r;
                var f = o(s(
                  /*! @babel/runtime/helpers/defineProperty */
                  "./node_modules/@babel/runtime/helpers/defineProperty.js"
                )), l = o(s(
                  /*! @logrocket/now */
                  "./packages/@logrocket/now/src/index.js"
                ));
                function x(y, m) {
                  var v = Object.keys(y);
                  if (Object.getOwnPropertySymbols) {
                    var N = Object.getOwnPropertySymbols(y);
                    m && (N = N.filter(function(A) {
                      return Object.getOwnPropertyDescriptor(y, A).enumerable;
                    })), v.push.apply(v, N);
                  }
                  return v;
                }
                function g(y) {
                  for (var m = 1; m < arguments.length; m++) {
                    var v = arguments[m] != null ? arguments[m] : {};
                    m % 2 ? x(Object(v), !0).forEach(function(N) {
                      (0, f.default)(y, N, v[N]);
                    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(y, Object.getOwnPropertyDescriptors(v)) : x(Object(v)).forEach(function(N) {
                      Object.defineProperty(y, N, Object.getOwnPropertyDescriptor(v, N));
                    });
                  }
                  return y;
                }
                var p = 0;
                function r(y) {
                  var m = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, v = m.stateSanitizer, N = v === void 0 ? function(S) {
                    return S;
                  } : v, A = m.actionSanitizer, $ = A === void 0 ? function(S) {
                    return S;
                  } : A;
                  return function(S) {
                    return function(_, w, P) {
                      var D = S(_, w, P), C = D.dispatch, j = p++;
                      y.addEvent("lr.redux.InitialState", function() {
                        var Y;
                        try {
                          Y = N(D.getState());
                        } catch (ne) {
                          console.error(ne.toString());
                        }
                        return {
                          state: Y,
                          storeId: j
                        };
                      });
                      var F = function(ne) {
                        var oe = (0, l.default)(), me, Pe;
                        try {
                          Pe = C(ne);
                        } catch (K) {
                          me = K;
                        } finally {
                          var Ae = (0, l.default)() - oe;
                          y.addEvent("lr.redux.ReduxAction", function() {
                            var K = null, re = null;
                            try {
                              K = N(D.getState()), re = $(ne);
                            } catch (q) {
                              console.error(q.toString());
                            }
                            return K && re ? {
                              storeId: j,
                              action: re,
                              duration: Ae,
                              stateDelta: K
                            } : null;
                          });
                        }
                        if (me)
                          throw me;
                        return Pe;
                      };
                      return g(g({}, D), {}, {
                        dispatch: F
                      });
                    };
                  };
                }
              })
            ),
            /***/
            "./packages/@logrocket/redux/src/createMiddleware.js": (
              /*!***********************************************************!*\
                !*** ./packages/@logrocket/redux/src/createMiddleware.js ***!
                \***********************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = x;
                var f = o(s(
                  /*! @logrocket/now */
                  "./packages/@logrocket/now/src/index.js"
                )), l = 0;
                function x(g) {
                  var p = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = p.stateSanitizer, y = r === void 0 ? function(N) {
                    return N;
                  } : r, m = p.actionSanitizer, v = m === void 0 ? function(N) {
                    return N;
                  } : m;
                  return function(N) {
                    var A = l++;
                    return g.addEvent("lr.redux.InitialState", function() {
                      var $;
                      try {
                        $ = y(N.getState());
                      } catch (S) {
                        console.error(S.toString());
                      }
                      return {
                        state: $,
                        storeId: A
                      };
                    }), function($) {
                      return function(S) {
                        var _ = (0, f.default)(), w, P;
                        try {
                          P = $(S);
                        } catch (C) {
                          w = C;
                        } finally {
                          var D = (0, f.default)() - _;
                          g.addEvent("lr.redux.ReduxAction", function() {
                            var C = null, j = null;
                            try {
                              C = y(N.getState()), j = v(S);
                            } catch (F) {
                              console.error(F.toString());
                            }
                            return C && j ? {
                              storeId: A,
                              action: j,
                              duration: D,
                              stateDelta: C
                            } : null;
                          });
                        }
                        if (w)
                          throw w;
                        return P;
                      };
                    };
                  };
                }
              })
            ),
            /***/
            "./packages/@logrocket/redux/src/index.js": (
              /*!************************************************!*\
                !*** ./packages/@logrocket/redux/src/index.js ***!
                \************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), Object.defineProperty(d, "createEnhancer", {
                  enumerable: !0,
                  get: function() {
                    return f.default;
                  }
                }), Object.defineProperty(d, "createMiddleware", {
                  enumerable: !0,
                  get: function() {
                    return l.default;
                  }
                });
                var f = o(s(
                  /*! ./createEnhancer */
                  "./packages/@logrocket/redux/src/createEnhancer.js"
                )), l = o(s(
                  /*! ./createMiddleware */
                  "./packages/@logrocket/redux/src/createMiddleware.js"
                ));
              })
            ),
            /***/
            "./packages/@logrocket/utils/src/TraceKit.js": (
              /*!***************************************************!*\
                !*** ./packages/@logrocket/utils/src/TraceKit.js ***!
                \***************************************************/
              /***/
              (function(c, d, s) {
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = void 0;
                var o = {
                  collectWindowErrors: !0,
                  debug: !1
                }, f = typeof window < "u" ? window : typeof s.g < "u" ? s.g : typeof self < "u" ? self : {}, l = [].slice, x = "?", g = /^(?:Uncaught (?:exception: )?)?((?:Eval|Internal|Range|Reference|Syntax|Type|URI)Error): ?(.*)$/;
                function p() {
                  return typeof document > "u" || typeof document.location > "u" ? "" : document.location.href;
                }
                o.report = (function() {
                  var m = [], v = null, N = null, A = null;
                  function $(oe) {
                    j(), m.push(oe);
                  }
                  function S(oe) {
                    for (var me = m.length - 1; me >= 0; --me)
                      m[me] === oe && m.splice(me, 1);
                  }
                  function _() {
                    F(), m = [];
                  }
                  function w(oe, me) {
                    var Pe = null;
                    if (!(me && !o.collectWindowErrors)) {
                      for (var Ae in m)
                        if (m.hasOwnProperty(Ae))
                          try {
                            m[Ae].apply(null, [oe].concat(l.call(arguments, 2)));
                          } catch (K) {
                            Pe = K;
                          }
                      if (Pe)
                        throw Pe;
                    }
                  }
                  var P, D;
                  function C(oe, me, Pe, Ae, K) {
                    var re = null;
                    if (A)
                      o.computeStackTrace.augmentStackTraceWithInitialElement(A, me, Pe, oe), Y();
                    else if (K)
                      re = o.computeStackTrace(K), w(re, !0);
                    else {
                      var q = {
                        url: me,
                        line: Pe,
                        column: Ae
                      }, Ne = void 0, Oe = oe, De;
                      if ({}.toString.call(oe) === "[object String]") {
                        var De = oe.match(g);
                        De && (Ne = De[1], Oe = De[2]);
                      }
                      q.func = x, re = {
                        name: Ne,
                        message: Oe,
                        url: p(),
                        stack: [q]
                      }, w(re, !0);
                    }
                    return P ? P.apply(this, arguments) : !1;
                  }
                  function j() {
                    D || (P = f.onerror, f.onerror = C, D = !0);
                  }
                  function F() {
                    D && (f.onerror = P, D = !1, P = void 0);
                  }
                  function Y() {
                    var oe = A, me = v;
                    v = null, A = null, N = null, w.apply(null, [oe, !1].concat(me));
                  }
                  function ne(oe, me) {
                    var Pe = l.call(arguments, 1);
                    if (A) {
                      if (N === oe)
                        return;
                      Y();
                    }
                    var Ae = o.computeStackTrace(oe);
                    if (A = Ae, N = oe, v = Pe, setTimeout(function() {
                      N === oe && Y();
                    }, Ae.incomplete ? 2e3 : 0), me !== !1)
                      throw oe;
                  }
                  return ne.subscribe = $, ne.unsubscribe = S, ne.uninstall = _, ne;
                })(), o.computeStackTrace = (function() {
                  function m($) {
                    if (!(typeof $.stack > "u" || !$.stack)) {
                      var S = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|<anonymous>).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, _ = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|resource|\[native).*?)(?::(\d+))?(?::(\d+))?\s*$/i, w = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i, P = $.stack.split(`
`), D = [], C, j;
                      /^(.*) is undefined$/.exec($.message);
                      for (var F = 0, Y = P.length; F < Y; ++F) {
                        if (C = S.exec(P[F])) {
                          var ne = C[2] && C[2].indexOf("native") !== -1;
                          j = {
                            url: ne ? null : C[2],
                            func: C[1] || x,
                            args: ne ? [C[2]] : [],
                            line: C[3] ? +C[3] : null,
                            column: C[4] ? +C[4] : null
                          };
                        } else if (C = w.exec(P[F]))
                          j = {
                            url: C[2],
                            func: C[1] || x,
                            args: [],
                            line: +C[3],
                            column: C[4] ? +C[4] : null
                          };
                        else if (C = _.exec(P[F]))
                          j = {
                            url: C[3],
                            func: C[1] || x,
                            args: C[2] ? C[2].split(",") : [],
                            line: C[4] ? +C[4] : null,
                            column: C[5] ? +C[5] : null
                          };
                        else
                          continue;
                        !j.func && j.line && (j.func = x), D.push(j);
                      }
                      return D.length ? (!D[0].column && typeof $.columnNumber < "u" && (D[0].column = $.columnNumber + 1), {
                        name: $.name,
                        message: $.message,
                        url: p(),
                        stack: D
                      }) : null;
                    }
                  }
                  function v($, S, _, w) {
                    var P = {
                      url: S,
                      line: _
                    };
                    if (P.url && P.line) {
                      if ($.incomplete = !1, P.func || (P.func = x), $.stack.length > 0 && $.stack[0].url === P.url) {
                        if ($.stack[0].line === P.line)
                          return !1;
                        if (!$.stack[0].line && $.stack[0].func === P.func)
                          return $.stack[0].line = P.line, !1;
                      }
                      return $.stack.unshift(P), $.partial = !0, !0;
                    } else
                      $.incomplete = !0;
                    return !1;
                  }
                  function N($, S) {
                    for (var _ = /function\s+([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?\s*\(/i, w = [], P = {}, D = !1, C, j, F = N.caller; F && !D; F = F.caller)
                      if (!(F === A || F === o.report)) {
                        if (j = {
                          url: null,
                          func: x,
                          line: null,
                          column: null
                        }, F.name ? j.func = F.name : (C = _.exec(F.toString())) && (j.func = C[1]), typeof j.func > "u")
                          try {
                            j.func = C.input.substring(0, C.input.indexOf("{"));
                          } catch {
                          }
                        P["" + F] ? D = !0 : P["" + F] = !0, w.push(j);
                      }
                    S && w.splice(0, S);
                    var Y = {
                      name: $.name,
                      message: $.message,
                      url: p(),
                      stack: w
                    };
                    return v(Y, $.sourceURL || $.fileName, $.line || $.lineNumber, $.message || $.description), Y;
                  }
                  function A($, S) {
                    var _ = null;
                    S = S == null ? 0 : +S;
                    try {
                      if (_ = m($), _)
                        return _;
                    } catch (w) {
                      if (o.debug)
                        throw w;
                    }
                    try {
                      if (_ = N($, S + 1), _)
                        return _;
                    } catch (w) {
                      if (o.debug)
                        throw w;
                    }
                    return {
                      name: $.name,
                      message: $.message,
                      url: p()
                    };
                  }
                  return A.augmentStackTraceWithInitialElement = v, A.computeStackTraceFromStackProp = m, A;
                })();
                var r = o;
                d.default = r;
              })
            ),
            /***/
            "./packages/@logrocket/utils/src/constants/nps.js": (
              /*!********************************************************!*\
                !*** ./packages/@logrocket/utils/src/constants/nps.js ***!
                \********************************************************/
              /***/
              (function(c, d) {
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.DELIGHTED_FEEDBACK_PREFIX = d.DELIGHTED_RESPONSES_REGEX = d.WOOTRIC_RESPONSES_REGEX = void 0;
                var s = /^https:\/\/production.wootric.com\/responses/;
                d.WOOTRIC_RESPONSES_REGEX = s;
                var o = /^https:\/\/web.delighted.com\/e\/[a-zA-Z-]*\/c/;
                d.DELIGHTED_RESPONSES_REGEX = o;
                var f = "comment=";
                d.DELIGHTED_FEEDBACK_PREFIX = f;
              })
            ),
            /***/
            "./packages/@logrocket/utils/src/constants/statusCodes.ts": (
              /*!****************************************************************!*\
                !*** ./packages/@logrocket/utils/src/constants/statusCodes.ts ***!
                \****************************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.getStatusText = r, d.XHR_CUSTOM_FAILURE_STATUSES = d.XHR_CUSTOM_STATUS_CODES = d.STATUS_CODES = void 0;
                var f = o(s(
                  /*! @babel/runtime/helpers/defineProperty */
                  "./node_modules/@babel/runtime/helpers/defineProperty.js"
                )), l, x = {
                  0: "",
                  100: "Continue",
                  101: "Switching Protocol",
                  102: "Processing",
                  103: "Early Hints",
                  200: "OK",
                  201: "Created",
                  202: "Accepted",
                  203: "Non-Authoritative Information",
                  204: "No Content",
                  205: "Reset Content",
                  206: "Partial Content",
                  207: "Multi-Status",
                  208: "Already Reported",
                  226: "IM Used",
                  300: "Multiple Choices",
                  301: "Moved Permanently",
                  302: "Found",
                  303: "See Other",
                  304: "Not Modified",
                  305: "Use Proxy",
                  306: "unused",
                  307: "Temporary Redirect",
                  308: "Permanent Redirect",
                  400: "Bad Request",
                  401: "Unauthorized",
                  402: "Payment Required",
                  403: "Forbidden",
                  404: "Not Found",
                  405: "Method Not Allowed",
                  406: "Not Acceptable",
                  407: "Proxy Authentication Required",
                  408: "Request Timeout",
                  409: "Conflict",
                  410: "Gone",
                  411: "Length Required",
                  412: "Precondition Failed",
                  413: "Payload Too Large",
                  414: "URI Too Long",
                  415: "Unsupported Media Type",
                  416: "Range Not Satisfiable",
                  417: "Expectation Failed",
                  418: "I'm a teapot",
                  421: "Misdirected Request",
                  422: "Unprocessable Entity",
                  423: "Locked",
                  424: "Failed Dependency",
                  425: "Too Early",
                  426: "Upgrade Required",
                  428: "Precondition Required",
                  429: "Too Many Requests",
                  431: "Request Header Fields Too Large",
                  451: "Unavailable For Legal Reasons",
                  500: "Internal Server Error",
                  501: "Not Implemented",
                  502: "Bad Gateway",
                  503: "Service Unavailable",
                  504: "Gateway Timeout",
                  505: "HTTP Version Not Supported",
                  506: "Variant Also Negotiates",
                  507: "Insufficient Storage",
                  508: "Loop Detected",
                  510: "Not Extended",
                  511: "Network Authentication Required"
                };
                d.STATUS_CODES = x;
                var g = {
                  error: 0,
                  timeout: 444,
                  aborted: 499,
                  offline: 1001
                };
                d.XHR_CUSTOM_STATUS_CODES = g;
                var p = (l = {}, (0, f.default)(l, g.error, "Error"), (0, f.default)(l, g.timeout, "Timeout"), (0, f.default)(l, g.aborted, "Aborted"), (0, f.default)(l, g.offline, "Offline"), l);
                d.XHR_CUSTOM_FAILURE_STATUSES = p;
                function r(y) {
                  return x[String(y)];
                }
              })
            ),
            /***/
            "./packages/@logrocket/utils/src/createUnsubListener.ts": (
              /*!**************************************************************!*\
                !*** ./packages/@logrocket/utils/src/createUnsubListener.ts ***!
                \**************************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.createUnsubListener = g, d.Handler = void 0;
                var f = o(s(
                  /*! @babel/runtime/helpers/classCallCheck */
                  "./node_modules/@babel/runtime/helpers/classCallCheck.js"
                )), l = o(s(
                  /*! @babel/runtime/helpers/createClass */
                  "./node_modules/@babel/runtime/helpers/createClass.js"
                )), x = /* @__PURE__ */ (function() {
                  function p(r) {
                    (0, f.default)(this, p), this._value = void 0, this._value = r;
                  }
                  return (0, l.default)(p, [{
                    key: "get",
                    value: function() {
                      return this._value;
                    }
                  }, {
                    key: "clear",
                    value: function() {
                      this._value = void 0;
                    }
                  }]), p;
                })();
                d.Handler = x;
                function g(p) {
                  return function() {
                    p.clear();
                  };
                }
              })
            ),
            /***/
            "./packages/@logrocket/utils/src/enhanceFunc.ts": (
              /*!******************************************************!*\
                !*** ./packages/@logrocket/utils/src/enhanceFunc.ts ***!
                \******************************************************/
              /***/
              (function(c, d, s) {
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = l;
                var o = s(
                  /*! ./createUnsubListener */
                  "./packages/@logrocket/utils/src/createUnsubListener.ts"
                ), f = function() {
                };
                function l(x, g, p) {
                  if (typeof x[g] != "function")
                    return f;
                  try {
                    var r = function() {
                      for (var N, A = arguments.length, $ = new Array(A), S = 0; S < A; S++)
                        $[S] = arguments[S];
                      var _ = y.apply(this, $);
                      return (N = m.get()) === null || N === void 0 || N.apply(this, $), _;
                    }, y = x[g], m = new o.Handler(p);
                    return x[g] = r, function() {
                      m.clear(), x[g] === r && (x[g] = y);
                    };
                  } catch {
                    return f;
                  }
                }
              })
            ),
            /***/
            "./packages/@logrocket/utils/src/logError.js": (
              /*!***************************************************!*\
                !*** ./packages/@logrocket/utils/src/logError.js ***!
                \***************************************************/
              /***/
              (function(c, d) {
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = void 0;
                var s = typeof console < "u" && console.error && console.error.bind, o = s ? console.error.bind(console) : function() {
                }, f = o;
                d.default = f;
              })
            ),
            /***/
            "./packages/@logrocket/utils/src/mapValues.ts": (
              /*!****************************************************!*\
                !*** ./packages/@logrocket/utils/src/mapValues.ts ***!
                \****************************************************/
              /***/
              (function(c, d) {
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = s;
                function s(o, f) {
                  if (o == null)
                    return {};
                  var l = {};
                  return Object.keys(o).forEach(function(x) {
                    l[x] = f(o[x]);
                  }), l;
                }
              })
            ),
            /***/
            "./packages/@logrocket/utils/src/protectFunc.ts": (
              /*!******************************************************!*\
                !*** ./packages/@logrocket/utils/src/protectFunc.ts ***!
                \******************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = x;
                var f = o(s(
                  /*! ./sendTelemetryData */
                  "./packages/@logrocket/utils/src/sendTelemetryData.js"
                )), l = o(s(
                  /*! ./logError */
                  "./packages/@logrocket/utils/src/logError.js"
                ));
                function x(g) {
                  var p = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
                  };
                  return function() {
                    var r;
                    try {
                      r = g.apply(void 0, arguments);
                    } catch (m) {
                      if (typeof window < "u" && window._lrdebug)
                        throw m;
                      var y = p(m);
                      (0, l.default)("LogRocket", m), (0, f.default)(m, y);
                    }
                    return r;
                  };
                }
              })
            ),
            /***/
            "./packages/@logrocket/utils/src/scrubException.ts": (
              /*!*********************************************************!*\
                !*** ./packages/@logrocket/utils/src/scrubException.ts ***!
                \*********************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.scrubException = m;
                var f = o(s(
                  /*! @babel/runtime/helpers/typeof */
                  "./node_modules/@babel/runtime/helpers/typeof.js"
                ));
                function l(v, N) {
                  var A = typeof Symbol < "u" && v[Symbol.iterator] || v["@@iterator"];
                  if (!A) {
                    if (Array.isArray(v) || (A = x(v)) || N) {
                      A && (v = A);
                      var $ = 0, S = function() {
                      };
                      return { s: S, n: function() {
                        return $ >= v.length ? { done: !0 } : { done: !1, value: v[$++] };
                      }, e: function(C) {
                        throw C;
                      }, f: S };
                    }
                    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
                  }
                  var _ = !0, w = !1, P;
                  return { s: function() {
                    A = A.call(v);
                  }, n: function() {
                    var C = A.next();
                    return _ = C.done, C;
                  }, e: function(C) {
                    w = !0, P = C;
                  }, f: function() {
                    try {
                      !_ && A.return != null && A.return();
                    } finally {
                      if (w) throw P;
                    }
                  } };
                }
                function x(v, N) {
                  if (v) {
                    if (typeof v == "string") return g(v, N);
                    var A = Object.prototype.toString.call(v).slice(8, -1);
                    if (A === "Object" && v.constructor && (A = v.constructor.name), A === "Map" || A === "Set") return Array.from(v);
                    if (A === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(A)) return g(v, N);
                  }
                }
                function g(v, N) {
                  (N == null || N > v.length) && (N = v.length);
                  for (var A = 0, $ = new Array(N); A < N; A++)
                    $[A] = v[A];
                  return $;
                }
                function p(v) {
                  return /boolean|number|string/.test((0, f.default)(v));
                }
                var r = [
                  // Valid values for 'level' are 'fatal', 'error', 'warning', 'info',
                  // and 'debug'. Defaults to 'error'.
                  "level",
                  "logger"
                ], y = ["tags", "extra"];
                function m(v, N) {
                  if (N) {
                    var A = l(r), $;
                    try {
                      for (A.s(); !($ = A.n()).done; ) {
                        var S = $.value, _ = N[S];
                        p(_) && (v[S] = _.toString());
                      }
                    } catch (me) {
                      A.e(me);
                    } finally {
                      A.f();
                    }
                    var w = l(y), P;
                    try {
                      for (w.s(); !(P = w.n()).done; ) {
                        for (var D = P.value, C = N[D] || {}, j = {}, F = 0, Y = Object.keys(C); F < Y.length; F++) {
                          var ne = Y[F], oe = C[ne];
                          p(oe) && (j[ne.toString()] = oe.toString());
                        }
                        v[D] = j;
                      }
                    } catch (me) {
                      w.e(me);
                    } finally {
                      w.f();
                    }
                  }
                }
              })
            ),
            /***/
            "./packages/@logrocket/utils/src/sendTelemetryData.js": (
              /*!************************************************************!*\
                !*** ./packages/@logrocket/utils/src/sendTelemetryData.js ***!
                \************************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.sendTelemetry = m, d.default = v;
                var f = o(s(
                  /*! @babel/runtime/helpers/defineProperty */
                  "./node_modules/@babel/runtime/helpers/defineProperty.js"
                )), l = o(s(
                  /*! ./logError */
                  "./packages/@logrocket/utils/src/logError.js"
                )), x = o(s(
                  /*! ./TraceKit */
                  "./packages/@logrocket/utils/src/TraceKit.js"
                ));
                function g(N, A) {
                  var $ = Object.keys(N);
                  if (Object.getOwnPropertySymbols) {
                    var S = Object.getOwnPropertySymbols(N);
                    A && (S = S.filter(function(_) {
                      return Object.getOwnPropertyDescriptor(N, _).enumerable;
                    })), $.push.apply($, S);
                  }
                  return $;
                }
                function p(N) {
                  for (var A = 1; A < arguments.length; A++) {
                    var $ = arguments[A] != null ? arguments[A] : {};
                    A % 2 ? g(Object($), !0).forEach(function(S) {
                      (0, f.default)(N, S, $[S]);
                    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(N, Object.getOwnPropertyDescriptors($)) : g(Object($)).forEach(function(S) {
                      Object.defineProperty(N, S, Object.getOwnPropertyDescriptor($, S));
                    });
                  }
                  return N;
                }
                var r = "8304d923ee86bbba88df4d491ccbc1c75ecfbe70";
                function y(N) {
                  try {
                    var A, $, S = N.message, _ = "https://e.logrocket.com/api/3/store/?sentry_version=7&sentry_client=http%2F3.8.0&sentry_key=b64162b4187a4c5caae8a68a7e291793", w = JSON.stringify(p({
                      message: S,
                      logger: "javascript",
                      platform: "javascript",
                      request: {
                        headers: {
                          "User-Agent": typeof navigator < "u" && navigator.userAgent
                        },
                        url: typeof location < "u" && location.href
                      },
                      release: r,
                      environment: ((A = window) === null || A === void 0 || ($ = A.__SDKCONFIG__) === null || $ === void 0 ? void 0 : $.scriptEnv) || "prod"
                    }, N));
                    if (typeof window < "u") {
                      var P = window._lrXMLHttpRequest || XMLHttpRequest, D = new P();
                      D.open("POST", _), D.send(w);
                    } else typeof fetch < "u" && fetch(_, {
                      method: "POST",
                      body: w
                    }).catch(function(C) {
                      (0, l.default)("Failed to send via fetch", C);
                    });
                  } catch (C) {
                    (0, l.default)("Failed to send", C);
                  }
                }
                function m(N, A) {
                  if (typeof window < "u" && window._lrdebug)
                    return void (0, l.default)(N);
                  A && A.extra && A.extra.appID && typeof A.extra.appID.indexOf == "function" && A.extra.appID.indexOf("au2drp/") === 0 && Math.random() >= 0.25 || y(p({
                    message: N
                  }, A));
                }
                function v(N, A) {
                  try {
                    var $ = N.message, S;
                    try {
                      S = JSON.stringify(A).slice(0, 1e3);
                    } catch {
                      try {
                        S = "Could not stringify payload: ".concat(Object.prototype.toString.call(A));
                      } catch {
                      }
                    }
                    var _;
                    try {
                      _ = x.default.computeStackTrace(N).stack.map(function(w) {
                        return {
                          filename: w.url,
                          lineno: w.line,
                          colno: w.column,
                          function: w.func || "?"
                        };
                      });
                    } catch {
                    }
                    y({
                      message: $,
                      extra: {
                        stringPayload: S
                      },
                      exception: {
                        values: [{
                          type: N.type,
                          value: $,
                          stacktrace: {
                            frames: _
                          }
                        }]
                      }
                    });
                  } catch (w) {
                    (0, l.default)("Failed to send", w);
                  }
                }
              })
            ),
            /***/
            "./packages/@logrocket/utils/src/startsWith.js": (
              /*!*****************************************************!*\
                !*** ./packages/@logrocket/utils/src/startsWith.js ***!
                \*****************************************************/
              /***/
              (function(c, d) {
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = s;
                function s(o, f) {
                  var l = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
                  return o && f && o.substring(l, l + f.length) === f;
                }
              })
            ),
            /***/
            "./packages/logrocket/src/LogRocket.js": (
              /*!*********************************************!*\
                !*** ./packages/logrocket/src/LogRocket.js ***!
                \*********************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = d.MAX_QUEUE_SIZE = void 0;
                var f = o(s(
                  /*! @babel/runtime/helpers/classCallCheck */
                  "./node_modules/@babel/runtime/helpers/classCallCheck.js"
                )), l = o(s(
                  /*! @babel/runtime/helpers/createClass */
                  "./node_modules/@babel/runtime/helpers/createClass.js"
                )), x = o(s(
                  /*! @babel/runtime/helpers/defineProperty */
                  "./node_modules/@babel/runtime/helpers/defineProperty.js"
                )), g = o(s(
                  /*! @babel/runtime/helpers/objectWithoutProperties */
                  "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js"
                )), p = o(s(
                  /*! @logrocket/network */
                  "./packages/@logrocket/network/src/index.js"
                )), r = s(
                  /*! @logrocket/exceptions */
                  "./packages/@logrocket/exceptions/src/index.js"
                ), y = o(s(
                  /*! @logrocket/console */
                  "./packages/@logrocket/console/src/index.js"
                )), m = s(
                  /*! @logrocket/redux */
                  "./packages/@logrocket/redux/src/index.js"
                );
                function v(_, w) {
                  var P = Object.keys(_);
                  if (Object.getOwnPropertySymbols) {
                    var D = Object.getOwnPropertySymbols(_);
                    w && (D = D.filter(function(C) {
                      return Object.getOwnPropertyDescriptor(_, C).enumerable;
                    })), P.push.apply(P, D);
                  }
                  return P;
                }
                function N(_) {
                  for (var w = 1; w < arguments.length; w++) {
                    var P = arguments[w] != null ? arguments[w] : {};
                    w % 2 ? v(Object(P), !0).forEach(function(D) {
                      (0, x.default)(_, D, P[D]);
                    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(_, Object.getOwnPropertyDescriptors(P)) : v(Object(P)).forEach(function(D) {
                      Object.defineProperty(_, D, Object.getOwnPropertyDescriptor(P, D));
                    });
                  }
                  return _;
                }
                var A = 1e3;
                d.MAX_QUEUE_SIZE = A;
                var $ = function() {
                  var w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, P = w.ingestServer, D = (0, g.default)(w, ["ingestServer"]);
                  return P ? N({
                    serverURL: "".concat(P, "/i"),
                    statsURL: "".concat(P, "/s")
                  }, D) : D;
                }, S = /* @__PURE__ */ (function() {
                  function _() {
                    var w = this;
                    (0, f.default)(this, _), this._buffer = [], ["log", "info", "warn", "error", "debug"].forEach(function(P) {
                      w[P] = function() {
                        for (var D = arguments.length, C = new Array(D), j = 0; j < D; j++)
                          C[j] = arguments[j];
                        w.addEvent("lr.core.LogEvent", function() {
                          var F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
                          return P === "error" && F.shouldAggregateConsoleErrors && r.Capture.captureMessage(w, C[0], C, {}, !0), {
                            logLevel: P.toUpperCase(),
                            args: C
                          };
                        }, {
                          shouldCaptureStackTrace: !0
                        });
                      };
                    }), this._isInitialized = !1, this._installed = [], window._lr_surl_cb = this.getSessionURL.bind(this);
                  }
                  return (0, l.default)(_, [{
                    key: "addEvent",
                    value: function(P, D) {
                      var C = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, j = Date.now();
                      this._run(function(F) {
                        F.addEvent(P, D, N(N({}, C), {}, {
                          timeOverride: j
                        }));
                      });
                    }
                  }, {
                    key: "onLogger",
                    value: function(P) {
                      for (this._logger = P; this._buffer.length > 0; ) {
                        var D = this._buffer.shift();
                        D(this._logger);
                      }
                    }
                  }, {
                    key: "_run",
                    value: function(P) {
                      if (!this._isDisabled)
                        if (this._logger)
                          P(this._logger);
                        else {
                          if (this._buffer.length >= A) {
                            this._isDisabled = !0, console.warn("LogRocket: script did not load. Check that you have a valid network connection."), this.uninstall();
                            return;
                          }
                          this._buffer.push(P.bind(this));
                        }
                    }
                  }, {
                    key: "init",
                    value: function(P) {
                      var D = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                      if (!this._isInitialized) {
                        var C, j = D.shouldAugmentNPS, F = j === void 0 ? !0 : j, Y = D.shouldParseXHRBlob, ne = Y === void 0 ? !1 : Y, oe = D.shouldDetectExceptions, me = oe === void 0 ? !0 : oe;
                        me && this._installed.push((0, r.registerExceptions)(this)), this._installed.push((0, p.default)(this, {
                          shouldAugmentNPS: !!F,
                          shouldParseXHRBlob: !!ne,
                          isDisabled: (D == null || (C = D.network) === null || C === void 0 ? void 0 : C.isEnabled) === !1
                        })), this._installed.push((0, y.default)(this)), this._isInitialized = !0, this._run(function(Pe) {
                          Pe.init(P, $(D));
                        });
                      }
                    }
                  }, {
                    key: "start",
                    value: function() {
                      this._run(function(P) {
                        P.start();
                      });
                    }
                  }, {
                    key: "uninstall",
                    value: function() {
                      this._installed.forEach(function(P) {
                        return P();
                      }), this._buffer = [], this._run(function(P) {
                        P.uninstall();
                      });
                    }
                  }, {
                    key: "identify",
                    value: function(P, D) {
                      this._run(function(C) {
                        C.identify(P, D);
                      });
                    }
                  }, {
                    key: "startNewSession",
                    value: function() {
                      this._run(function(P) {
                        P.startNewSession();
                      });
                    }
                  }, {
                    key: "track",
                    value: function(P, D) {
                      this._run(function(C) {
                        C.track(P, D);
                      });
                    }
                  }, {
                    key: "getSessionURL",
                    value: function(P) {
                      if (typeof P != "function")
                        throw new Error("LogRocket: must pass callback to getSessionURL()");
                      this._run(function(D) {
                        D.getSessionURL ? D.getSessionURL(P) : P(D.recordingURL);
                      });
                    }
                  }, {
                    key: "trackScrollEvent",
                    value: function(P) {
                      this._logger && this._logger.trackScrollEvent(P);
                    }
                  }, {
                    key: "getVersion",
                    value: function(P) {
                      this._run(function(D) {
                        P(D.version);
                      });
                    }
                  }, {
                    key: "captureMessage",
                    value: function(P) {
                      var D = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                      r.Capture.captureMessage(this, P, [P], D);
                    }
                  }, {
                    key: "captureException",
                    value: function(P) {
                      var D = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                      r.Capture.captureException(this, P, D);
                    }
                  }, {
                    key: "version",
                    get: function() {
                      return this._logger && this._logger.version;
                    }
                  }, {
                    key: "sessionURL",
                    get: function() {
                      return this._logger && this._logger.recordingURL;
                    }
                  }, {
                    key: "recordingURL",
                    get: function() {
                      return this._logger && this._logger.recordingURL;
                    }
                  }, {
                    key: "recordingID",
                    get: function() {
                      return this._logger && this._logger.recordingID;
                    }
                  }, {
                    key: "threadID",
                    get: function() {
                      return this._logger && this._logger.threadID;
                    }
                  }, {
                    key: "tabID",
                    get: function() {
                      return this._logger && this._logger.tabID;
                    }
                  }, {
                    key: "reduxEnhancer",
                    value: function() {
                      var P = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
                      return (0, m.createEnhancer)(this, P);
                    }
                  }, {
                    key: "reduxMiddleware",
                    value: function() {
                      var P = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
                      return (0, m.createMiddleware)(this, P);
                    }
                  }, {
                    key: "isDisabled",
                    get: function() {
                      return !!(this._isDisabled || this._logger && this._logger._isDisabled);
                    }
                  }]), _;
                })();
                d.default = S;
              })
            ),
            /***/
            "./packages/logrocket/src/makeLogRocket.js": (
              /*!*************************************************!*\
                !*** ./packages/logrocket/src/makeLogRocket.js ***!
                \*************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.default = g;
                var f = o(s(
                  /*! ./LogRocket */
                  "./packages/logrocket/src/LogRocket.js"
                )), l = "LogRocket on React Native requires the LogRocket React Native specific SDK. See setup guide here https://docs.logrocket.com/reference/react-native.", x = function() {
                  return {
                    init: function() {
                    },
                    uninstall: function() {
                    },
                    log: function() {
                    },
                    info: function() {
                    },
                    warn: function() {
                    },
                    error: function() {
                    },
                    debug: function() {
                    },
                    addEvent: function() {
                    },
                    identify: function() {
                    },
                    start: function() {
                    },
                    get threadID() {
                      return null;
                    },
                    get recordingID() {
                      return null;
                    },
                    get recordingURL() {
                      return null;
                    },
                    reduxEnhancer: function() {
                      return function(y) {
                        return function() {
                          return y.apply(void 0, arguments);
                        };
                      };
                    },
                    reduxMiddleware: function() {
                      return function() {
                        return function(y) {
                          return function(m) {
                            return y(m);
                          };
                        };
                      };
                    },
                    track: function() {
                    },
                    getSessionURL: function() {
                    },
                    getVersion: function() {
                    },
                    startNewSession: function() {
                    },
                    onLogger: function() {
                    },
                    setClock: function() {
                    },
                    captureMessage: function() {
                    },
                    captureException: function() {
                    }
                  };
                };
                function g() {
                  var p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
                  }, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : x, y = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function() {
                    return new f.default();
                  };
                  if (typeof navigator < "u" && navigator.product === "ReactNative")
                    throw new Error(l);
                  if (typeof window < "u") {
                    if (window._disableLogRocket)
                      return r();
                    if (window.MutationObserver && window.WeakMap) {
                      window._lrMutationObserver = window.MutationObserver;
                      var m = y();
                      return p(m), m;
                    }
                  }
                  return x();
                }
              })
            ),
            /***/
            "./packages/logrocket/src/setup.js": (
              /*!*****************************************!*\
                !*** ./packages/logrocket/src/setup.js ***!
                \*****************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! @babel/runtime/helpers/interopRequireDefault */
                  "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
                );
                Object.defineProperty(d, "__esModule", {
                  value: !0
                }), d.getDomainsAndEnv = p, d.setupBaseSDKCONFIG = r, d.default = y;
                var f = o(s(
                  /*! @babel/runtime/helpers/objectWithoutProperties */
                  "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js"
                )), l = o(s(
                  /*! ./makeLogRocket */
                  "./packages/logrocket/src/makeLogRocket.js"
                )), x = {
                  "cdn.logrocket.com": "https://r.logrocket.io",
                  "cdn.logrocket.io": "https://r.logrocket.io",
                  "cdn.lr-ingest.io": "https://r.lr-ingest.io",
                  "cdn.lr-in.com": "https://r.lr-in.com",
                  "cdn.lr-in-prod.com": "https://r.lr-in-prod.com",
                  "cdn.lr-ingest.com": "https://r.lr-ingest.com",
                  "cdn.ingest-lr.com": "https://r.ingest-lr.com",
                  "cdn.lr-intake.com": "https://r.lr-intake.com",
                  "cdn.intake-lr.com": "https://r.intake-lr.com",
                  "cdn.logr-ingest.com": "https://r.logr-ingest.com",
                  "cdn.lrkt-in.com": "https://r.lrkt-in.com",
                  "cdn.lgrckt-in.com": "https://r.lgrckt-in.com",
                  "cdn-staging.logrocket.io": "https://staging-i.logrocket.io",
                  "cdn-staging.lr-ingest.io": "https://staging-i.lr-ingest.io",
                  "cdn-staging.lr-in.com": "https://staging-i.lr-in.com",
                  "cdn-staging.lr-in-prod.com": "https://staging-i.lr-in-prod.com",
                  "cdn-staging.lr-ingest.com": "https://staging-i.lr-ingest.com",
                  "cdn-staging.ingest-lr.com": "https://staging-i.ingest-lr.com",
                  "cdn-staging.lr-intake.com": "https://staging-i.lr-intake.com",
                  "cdn-staging.intake-lr.com": "https://staging-i.intake-lr.com",
                  "cdn-staging.logr-ingest.com": "https://staging-i.logr-ingest.com",
                  "cdn-staging.lrkt-in.com": "https://staging-i.lrkt-in.com",
                  "cdn-staging.lgrckt-in.com": "https://staging-i.lgrckt-in.com"
                };
                function g(m) {
                  return m.startsWith("cdn-staging") ? "staging" : m.startsWith("localhost") ? "development" : "prod";
                }
                function p(m) {
                  if (m === "script" || m === "shopify-pixel") {
                    try {
                      var v = document.currentScript, N = v.src.match(/^(https?:\/\/([^\\]+))\/.+$/), A = N && N[2];
                      if (A && x[A])
                        return {
                          scriptEnv: g(A),
                          scriptOrigin: N && N[1],
                          scriptIngest: x[A]
                        };
                    } catch {
                    }
                    return {
                      scriptEnv: "prod",
                      scriptOrigin: "https://cdn.logrocket.io"
                    };
                  } else
                    return {
                      scriptEnv: void 0,
                      scriptOrigin: "https://cdn.lgrckt-in.com",
                      scriptIngest: "https://r.lgrckt-in.com"
                    };
                }
                function r(m) {
                  typeof window.__SDKCONFIG__ > "u" && (window.__SDKCONFIG__ = {}), window.__SDKCONFIG__.serverURL = "".concat(m, "/i"), window.__SDKCONFIG__.statsURL = "".concat(m, "/s");
                }
                function y() {
                  var m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, v = m.enterpriseServer, N = m.sdkVersion, A = N === void 0 ? "10.1.0" : N, $ = (0, f.default)(m, ["enterpriseServer", "sdkVersion"]), S = p(A), _ = S.scriptEnv, w = S.scriptOrigin, P = S.scriptIngest, D = $.sdkServer || v, C = $.ingestServer || v || P, j = (0, l.default)(function() {
                    var F = document.createElement("script");
                    C && (r(C), window.__SDKCONFIG__.scriptEnv = _), D ? F.src = "".concat(D, "/logger.min.js") : window.__SDKCONFIG__ && window.__SDKCONFIG__.loggerURL ? F.src = window.__SDKCONFIG__.loggerURL : window._lrAsyncScript ? F.src = window._lrAsyncScript : F.src = "".concat(w, "/logger-1.min.js"), F.async = !0, document.head.appendChild(F), F.onload = function() {
                      typeof window._LRLogger == "function" ? setTimeout(function() {
                        j.onLogger(new window._LRLogger({
                          sdkVersion: A
                        }));
                      }) : (console.warn("LogRocket: script execution has been blocked by a product or service."), j.uninstall());
                    }, F.onerror = function() {
                      console.warn("LogRocket: script could not load. Check that you have a valid network connection."), j.uninstall();
                    };
                  });
                  return j;
                }
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/arrayLikeToArray.js": (
              /*!*****************************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/arrayLikeToArray.js ***!
                \*****************************************************************/
              /***/
              (function(c) {
                function d(s, o) {
                  (o == null || o > s.length) && (o = s.length);
                  for (var f = 0, l = new Array(o); f < o; f++) l[f] = s[f];
                  return l;
                }
                c.exports = d, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/arrayWithoutHoles.js": (
              /*!******************************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/arrayWithoutHoles.js ***!
                \******************************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! ./arrayLikeToArray.js */
                  "./node_modules/@babel/runtime/helpers/arrayLikeToArray.js"
                );
                function f(l) {
                  if (Array.isArray(l)) return o(l);
                }
                c.exports = f, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/classCallCheck.js": (
              /*!***************************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/classCallCheck.js ***!
                \***************************************************************/
              /***/
              (function(c) {
                function d(s, o) {
                  if (!(s instanceof o))
                    throw new TypeError("Cannot call a class as a function");
                }
                c.exports = d, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/createClass.js": (
              /*!************************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/createClass.js ***!
                \************************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! ./toPropertyKey.js */
                  "./node_modules/@babel/runtime/helpers/toPropertyKey.js"
                );
                function f(x, g) {
                  for (var p = 0; p < g.length; p++) {
                    var r = g[p];
                    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(x, o(r.key), r);
                  }
                }
                function l(x, g, p) {
                  return g && f(x.prototype, g), p && f(x, p), Object.defineProperty(x, "prototype", {
                    writable: !1
                  }), x;
                }
                c.exports = l, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/defineProperty.js": (
              /*!***************************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/defineProperty.js ***!
                \***************************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! ./toPropertyKey.js */
                  "./node_modules/@babel/runtime/helpers/toPropertyKey.js"
                );
                function f(l, x, g) {
                  return x = o(x), x in l ? Object.defineProperty(l, x, {
                    value: g,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                  }) : l[x] = g, l;
                }
                c.exports = f, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/interopRequireDefault.js": (
              /*!**********************************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/interopRequireDefault.js ***!
                \**********************************************************************/
              /***/
              (function(c) {
                function d(s) {
                  return s && s.__esModule ? s : {
                    default: s
                  };
                }
                c.exports = d, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/iterableToArray.js": (
              /*!****************************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/iterableToArray.js ***!
                \****************************************************************/
              /***/
              (function(c) {
                function d(s) {
                  if (typeof Symbol < "u" && s[Symbol.iterator] != null || s["@@iterator"] != null) return Array.from(s);
                }
                c.exports = d, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/nonIterableSpread.js": (
              /*!******************************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/nonIterableSpread.js ***!
                \******************************************************************/
              /***/
              (function(c) {
                function d() {
                  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
                }
                c.exports = d, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js": (
              /*!************************************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/objectWithoutProperties.js ***!
                \************************************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! ./objectWithoutPropertiesLoose.js */
                  "./node_modules/@babel/runtime/helpers/objectWithoutPropertiesLoose.js"
                );
                function f(l, x) {
                  if (l == null) return {};
                  var g = o(l, x), p, r;
                  if (Object.getOwnPropertySymbols) {
                    var y = Object.getOwnPropertySymbols(l);
                    for (r = 0; r < y.length; r++)
                      p = y[r], !(x.indexOf(p) >= 0) && Object.prototype.propertyIsEnumerable.call(l, p) && (g[p] = l[p]);
                  }
                  return g;
                }
                c.exports = f, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/objectWithoutPropertiesLoose.js": (
              /*!*****************************************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/objectWithoutPropertiesLoose.js ***!
                \*****************************************************************************/
              /***/
              (function(c) {
                function d(s, o) {
                  if (s == null) return {};
                  var f = {}, l = Object.keys(s), x, g;
                  for (g = 0; g < l.length; g++)
                    x = l[g], !(o.indexOf(x) >= 0) && (f[x] = s[x]);
                  return f;
                }
                c.exports = d, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/toConsumableArray.js": (
              /*!******************************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/toConsumableArray.js ***!
                \******************************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! ./arrayWithoutHoles.js */
                  "./node_modules/@babel/runtime/helpers/arrayWithoutHoles.js"
                ), f = s(
                  /*! ./iterableToArray.js */
                  "./node_modules/@babel/runtime/helpers/iterableToArray.js"
                ), l = s(
                  /*! ./unsupportedIterableToArray.js */
                  "./node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js"
                ), x = s(
                  /*! ./nonIterableSpread.js */
                  "./node_modules/@babel/runtime/helpers/nonIterableSpread.js"
                );
                function g(p) {
                  return o(p) || f(p) || l(p) || x();
                }
                c.exports = g, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/toPrimitive.js": (
              /*!************************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/toPrimitive.js ***!
                \************************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! ./typeof.js */
                  "./node_modules/@babel/runtime/helpers/typeof.js"
                ).default;
                function f(l, x) {
                  if (o(l) !== "object" || l === null) return l;
                  var g = l[Symbol.toPrimitive];
                  if (g !== void 0) {
                    var p = g.call(l, x || "default");
                    if (o(p) !== "object") return p;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (x === "string" ? String : Number)(l);
                }
                c.exports = f, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/toPropertyKey.js": (
              /*!**************************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/toPropertyKey.js ***!
                \**************************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! ./typeof.js */
                  "./node_modules/@babel/runtime/helpers/typeof.js"
                ).default, f = s(
                  /*! ./toPrimitive.js */
                  "./node_modules/@babel/runtime/helpers/toPrimitive.js"
                );
                function l(x) {
                  var g = f(x, "string");
                  return o(g) === "symbol" ? g : String(g);
                }
                c.exports = l, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/typeof.js": (
              /*!*******************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/typeof.js ***!
                \*******************************************************/
              /***/
              (function(c) {
                function d(s) {
                  "@babel/helpers - typeof";
                  return c.exports = d = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(o) {
                    return typeof o;
                  } : function(o) {
                    return o && typeof Symbol == "function" && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
                  }, c.exports.__esModule = !0, c.exports.default = c.exports, d(s);
                }
                c.exports = d, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            ),
            /***/
            "./node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js": (
              /*!***************************************************************************!*\
                !*** ./node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js ***!
                \***************************************************************************/
              /***/
              (function(c, d, s) {
                var o = s(
                  /*! ./arrayLikeToArray.js */
                  "./node_modules/@babel/runtime/helpers/arrayLikeToArray.js"
                );
                function f(l, x) {
                  if (l) {
                    if (typeof l == "string") return o(l, x);
                    var g = Object.prototype.toString.call(l).slice(8, -1);
                    if (g === "Object" && l.constructor && (g = l.constructor.name), g === "Map" || g === "Set") return Array.from(l);
                    if (g === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(g)) return o(l, x);
                  }
                }
                c.exports = f, c.exports.__esModule = !0, c.exports.default = c.exports;
              })
            )
            /******/
          }, b = {};
          function u(c) {
            var d = b[c];
            if (d !== void 0)
              return d.exports;
            var s = b[c] = {
              /******/
              // no module.id needed
              /******/
              // no module.loaded needed
              /******/
              exports: {}
              /******/
            };
            return a[c](s, s.exports, u), s.exports;
          }
          (function() {
            u.g = (function() {
              if (typeof globalThis == "object") return globalThis;
              try {
                return this || new Function("return this")();
              } catch {
                if (typeof window == "object") return window;
              }
            })();
          })();
          var h = {};
          return (function() {
            var c = h;
            /*!**********************************************!*\
              !*** ./packages/logrocket/src/module-npm.js ***!
              \**********************************************/
            var d = u(
              /*! @babel/runtime/helpers/interopRequireDefault */
              "./node_modules/@babel/runtime/helpers/interopRequireDefault.js"
            );
            Object.defineProperty(c, "__esModule", {
              value: !0
            }), c.default = void 0;
            var s = d(u(
              /*! ./setup */
              "./packages/logrocket/src/setup.js"
            )), o = (0, s.default)(), f = o;
            c.default = f;
          })(), h = h.default, h;
        })()
      );
    });
  })(kt)), kt.exports;
}
var No = wo();
const mt = /* @__PURE__ */ yo(No);
class ko {
  constructor() {
    this.recording = !1, this.steps = [], this.startTime = "", this.metadata = null, this.handleClick = (n) => {
      if (!this.recording) return;
      let a = n.target;
      const u = this.findInteractiveElement(a) || a, h = this.getSelectors(u);
      !h || h.length === 0 || (this.steps.push({
        type: "click",
        target: "main",
        selectors: h,
        offsetX: n.offsetX,
        offsetY: n.offsetY
      }), console.log("🖱️ [Recorder] Click:", h[0][0], "Element:", u.tagName));
    }, this.handleInput = (n) => {
      if (!this.recording) return;
      const a = n.target, b = this.getSelectors(a);
      !b || b.length === 0 || (this.steps.push({
        type: "change",
        target: "main",
        selectors: b,
        value: a.value
      }), console.log("⌨️ [Recorder] Input:", b[0][0], a.value));
    }, this.handleChange = (n) => {
      if (!this.recording) return;
      const a = n.target, b = this.getSelectors(a);
      if (!b || b.length === 0) return;
      const u = a.type === "checkbox" ? a.checked.toString() : a.value;
      this.steps.push({
        type: "change",
        target: "main",
        selectors: b,
        value: u
      }), console.log("🔄 [Recorder] Change:", b[0][0], u);
    }, this.handleKeyDown = (n) => {
      if (!this.recording || n.key.length === 1) return;
      const a = n.target, b = this.getSelectors(a);
      !b || b.length === 0 || (this.steps.push({
        type: "keyDown",
        target: "main",
        selectors: b,
        key: n.key
      }), console.log("⌨️ [Recorder] KeyDown:", n.key, b[0][0]));
    }, this.handleScroll = (n) => {
      if (!this.recording) return;
      const a = Date.now();
      this.lastScrollTime && a - this.lastScrollTime < 500 || (this.lastScrollTime = a, this.steps.push({
        type: "scroll",
        target: "main",
        selectors: [["html"]]
      }), console.log("📜 [Recorder] Scroll"));
    }, this.lastScrollTime = null;
  }
  /**
   * Start recording user interactions
   */
  startRecording(n, a) {
    this.recording = !0, this.steps = [], this.startTime = (/* @__PURE__ */ new Date()).toISOString(), this.metadata = {
      bugName: n,
      testerName: a,
      startTime: this.startTime,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }, this.steps.push({
      type: "setViewport",
      width: window.innerWidth,
      height: window.innerHeight,
      deviceScaleFactor: window.devicePixelRatio || 1,
      isMobile: /Mobile|Android|iPhone/i.test(navigator.userAgent),
      hasTouch: "ontouchstart" in window,
      isLandscape: window.innerWidth > window.innerHeight
    }), this.steps.push({
      type: "navigate",
      url: window.location.href,
      assertedEvents: [{
        type: "navigation",
        url: window.location.href,
        title: document.title
      }]
    }), this.attachListeners(), console.log("🎥 [Recorder] Started recording session:", { bugName: n, testerName: a });
  }
  /**
   * Stop recording and generate JSON
   */
  stopRecording() {
    if (!this.recording || !this.metadata)
      return console.warn("⚠️ [Recorder] No active recording to stop"), null;
    this.recording = !1, this.metadata.endTime = (/* @__PURE__ */ new Date()).toISOString(), this.detachListeners();
    const n = {
      title: `${this.metadata.bugName} - ${this.metadata.testerName}`,
      steps: this.steps,
      timeout: 5e3,
      metadata: this.metadata
    };
    return console.log("⏹️ [Recorder] Stopped recording. Total steps:", this.steps.length), this.steps = [], this.metadata = null, n;
  }
  /**
   * Attach event listeners for recording
   */
  attachListeners() {
    document.addEventListener("click", this.handleClick, !0), document.addEventListener("input", this.handleInput, !0), document.addEventListener("change", this.handleChange, !0), document.addEventListener("keydown", this.handleKeyDown, !0), window.addEventListener("scroll", this.handleScroll, !0);
  }
  /**
   * Detach event listeners
   */
  detachListeners() {
    document.removeEventListener("click", this.handleClick, !0), document.removeEventListener("input", this.handleInput, !0), document.removeEventListener("change", this.handleChange, !0), document.removeEventListener("keydown", this.handleKeyDown, !0), window.removeEventListener("scroll", this.handleScroll, !0);
  }
  /**
   * Find the closest interactive element (button, link, input, etc.)
   * Traverses up the DOM tree to find a meaningful element to record
   */
  findInteractiveElement(n) {
    let b = n, u = 0;
    for (; b && u < 5; ) {
      const h = b.tagName.toLowerCase();
      if (h === "button" || h === "a" || h === "input" || h === "select" || h === "textarea" || b.getAttribute("role") === "button" || b.hasAttribute("onclick") || b.hasAttribute("data-testid"))
        return b;
      b = b.parentElement, u++;
    }
    return null;
  }
  /**
   * Generate multiple selector strategies like Chrome DevTools Recorder
   * Returns array of selector arrays for better replay reliability
   */
  getSelectors(n) {
    const a = [], b = n.getAttribute("aria-label");
    b && a.push([`aria/${b}`]);
    const u = n.textContent?.trim();
    u && u.length > 0 && u.length < 50 && a.push([`text/${u}`]), n.id && a.push([`#${n.id}`]), n.getAttribute("data-testid") && a.push([`[data-testid="${n.getAttribute("data-testid")}"]`]);
    const h = this.generateCSSSelector(n);
    h && a.push([h]);
    const c = this.generateXPath(n);
    return c && a.push([c]), h && a.push([`pierce/${h}`]), a.length > 0 ? a : [[n.tagName.toLowerCase()]];
  }
  /**
   * Generate CSS selector for an element
   */
  generateCSSSelector(n) {
    if (n.id)
      return `#${n.id}`;
    if (n.getAttribute("data-testid"))
      return `[data-testid="${n.getAttribute("data-testid")}"]`;
    if (n.getAttribute("name"))
      return `${n.tagName.toLowerCase()}[name="${n.getAttribute("name")}"]`;
    if (n.className && typeof n.className == "string") {
      const b = n.className.trim().split(/\s+/).filter((u) => u.length > 0);
      if (b.length > 0) {
        const u = n.parentElement;
        if (u) {
          const h = Array.from(u.children).filter(
            (c) => c.tagName === n.tagName
          );
          if (h.length > 1) {
            const c = h.indexOf(n) + 1, d = b.slice(0, 2).join(".");
            return `${n.tagName.toLowerCase()}.${d}:nth-of-type(${c})`;
          } else {
            const c = b.slice(0, 2).join(".");
            return `${n.tagName.toLowerCase()}.${c}`;
          }
        } else {
          const h = b.slice(0, 2).join(".");
          return `${n.tagName.toLowerCase()}.${h}`;
        }
      }
    }
    const a = n.parentElement;
    if (a) {
      const b = Array.from(a.children).indexOf(n) + 1;
      return `${n.tagName.toLowerCase()}:nth-child(${b})`;
    }
    return n.tagName.toLowerCase();
  }
  /**
   * Generate XPath for an element
   */
  generateXPath(n) {
    if (n.id)
      return `xpath///*[@id="${n.id}"]`;
    const a = [];
    let b = n;
    for (; b && b.nodeType === Node.ELEMENT_NODE; ) {
      let u = 0, h = b.previousElementSibling;
      for (; h; )
        h.nodeName === b.nodeName && u++, h = h.previousElementSibling;
      const c = b.nodeName.toLowerCase(), d = u > 0 ? `[${u + 1}]` : "";
      a.unshift(c + d), b = b.parentElement;
    }
    return `xpath///${a.join("/")}`;
  }
  /**
   * Check if currently recording
   */
  isRecording() {
    return this.recording;
  }
}
const Jt = new ko(), Xt = "logrocket_tester_names", Yt = "logrocket_session_names", Qt = "logrocket_last_tester", Nt = "logrocket_hand_", it = ({ state: t, actions: n }) => {
  const [a, b] = $e(!1), [u, h] = $e(""), [c, d] = $e(""), [s, o] = $e(""), [f, l] = $e(!1), [x, g] = $e(!1), [p, r] = $e(!1), [y, m] = $e(!1), [v, N] = $e(!1), [A, $] = $e([]), [S, _] = $e([]), [w, P] = $e("");
  nt(() => {
    const q = localStorage.getItem(Xt), Ne = localStorage.getItem(Yt), Oe = localStorage.getItem(Qt);
    q && $(JSON.parse(q)), Ne && _(JSON.parse(Ne)), Oe && d(Oe);
  }, []);
  const D = (q, Ne) => {
    const Oe = Ne === "tester" ? Xt : Yt, De = Ne === "tester" ? $ : _, Me = localStorage.getItem(Oe), be = Me ? JSON.parse(Me) : [];
    if (!be.includes(q)) {
      const Te = [q, ...be].slice(0, 10);
      localStorage.setItem(Oe, JSON.stringify(Te)), De(Te);
    }
    Ne === "tester" && localStorage.setItem(Qt, q);
  }, C = () => {
    a ? Pe() : l(!0);
  }, j = () => {
    l(!1), g(!0);
  }, F = () => {
    l(!1), r(!0);
  }, Y = (q) => {
    const Ne = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      state: {
        players: t.players,
        playerData: t.playerData,
        defaultUnit: t.defaultUnit,
        stackData: t.stackData,
        communityCards: t.communityCards,
        visibleActionLevels: t.visibleActionLevels,
        currentView: t.currentView
      }
    }, Oe = `${Nt}${q}`;
    localStorage.setItem(Oe, JSON.stringify(Ne)), console.log("💾 Saved game state for session:", q);
  }, ne = (q) => {
    const Ne = `${Nt}${q}`, Oe = localStorage.getItem(Ne);
    if (Oe)
      try {
        const Me = JSON.parse(Oe).state;
        return n.setPlayers(Me.players), n.setPlayerData(Me.playerData), n.setDefaultUnit(Me.defaultUnit), n.setStackData(Me.stackData), n.setCommunityCards(Me.communityCards), n.setVisibleActionLevels(Me.visibleActionLevels), n.setCurrentView(Me.currentView), console.log("✅ Loaded game state for session:", q), !0;
      } catch (De) {
        return console.error("❌ Error loading game state:", De), !1;
      }
    return !1;
  }, oe = () => {
    const q = [];
    for (let Ne = 0; Ne < localStorage.length; Ne++) {
      const Oe = localStorage.key(Ne);
      if (Oe && Oe.startsWith(Nt)) {
        const De = Oe.replace(Nt, ""), Me = localStorage.getItem(Oe);
        if (Me)
          try {
            const be = JSON.parse(Me);
            q.push({
              name: De,
              timestamp: be.timestamp
            });
          } catch {
          }
      }
    }
    return q.sort((Ne, Oe) => new Date(Oe.timestamp).getTime() - new Date(Ne.timestamp).getTime());
  }, me = () => {
    if (!c.trim()) {
      alert("Please enter tester name");
      return;
    }
    if (!s.trim()) {
      alert("Please enter session name");
      return;
    }
    N(!0), D(c, "tester"), D(s, "session"), Y(s), Jt.startRecording(s, c);
    try {
      console.log("🚀 [LogRocket] Initializing with app ID: zrgal7/tpro"), mt.init("zrgal7/tpro", {
        console: {
          shouldAggregateConsoleErrors: !0
        },
        network: {
          requestSanitizer: (q) => q
        }
      }), console.log("✅ [LogRocket] Initialized successfully"), console.log("👤 [LogRocket] Identifying user:", c), mt.identify(c, {
        name: c,
        role: "QA Tester",
        sessionName: s,
        email: `${c.toLowerCase().replace(/\s+/g, ".")}@tester.local`
      }), console.log("✅ [LogRocket] User identified"), console.log("📊 [LogRocket] Tracking session start event"), mt.track("QA Session Started", {
        bugName: s,
        testerName: c,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        gameState: {
          players: t.players.filter((q) => q.name).map((q) => ({ name: q.name, position: q.position, stack: q.stack })),
          blinds: { sb: t.stackData.smallBlind, bb: t.stackData.bigBlind, ante: t.stackData.ante },
          currentView: t.currentView
        }
      }), console.log("✅ [LogRocket] Event tracked"), console.log("🔗 [LogRocket] Getting session URL..."), mt.getSessionURL((q) => {
        console.log("✅ [LogRocket] Session URL received:", q), h(q), b(!0), N(!1), g(!1), console.log("✅✅✅ LogRocket session started successfully!"), console.log("Session URL:", q), console.log("Tester:", c), console.log("Bug:", s);
      });
    } catch (q) {
      console.error("❌ [LogRocket] Error during initialization:", q), N(!1), alert(`Error starting LogRocket recording: ${q}`);
    }
  }, Pe = () => {
    mt.track("QA Session Ended", {
      bugName: s,
      testerName: c,
      sessionUrl: u
    });
    const q = Jt.stopRecording();
    q && Ae(q), navigator.clipboard.writeText(u), b(!1), m(!0);
  }, Ae = async (q) => {
    try {
      const Ne = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, -5), Oe = `${s}_${c}_${Ne}.json`, De = {
        title: q.title,
        timeout: q.timeout,
        steps: q.steps,
        // Add Chrome Recorder metadata
        version: 1,
        metadata: q.metadata
      }, Me = JSON.stringify(De, null, 2);
      if ("showSaveFilePicker" in window)
        try {
          const Te = await (await window.showSaveFilePicker({
            suggestedName: Oe,
            types: [{
              description: "Chrome DevTools Recorder JSON",
              accept: { "application/json": [".json"] }
            }]
          })).createWritable();
          await Te.write(Me), await Te.close(), console.log("📥 [Recorder] Downloaded JSON:", Oe), console.log("   Total steps recorded:", q.steps.length), console.log("   🌐 Upload this file to Google Drive manually");
        } catch (be) {
          if (be.name === "AbortError") {
            console.log("⚠️ [Recorder] User cancelled file save");
            return;
          }
          throw be;
        }
      else {
        console.log("⚠️ [Recorder] File System Access API not supported, using fallback download");
        const be = new Blob([Me], { type: "application/json" }), Te = URL.createObjectURL(be), pe = document.createElement("a");
        pe.href = Te, pe.download = Oe, document.body.appendChild(pe), pe.click(), document.body.removeChild(pe), URL.revokeObjectURL(Te), console.log("📥 [Recorder] Downloaded JSON:", Oe), console.log("   Total steps recorded:", q.steps.length), console.log("   🌐 Upload this file to Google Drive manually");
      }
    } catch (Ne) {
      console.error("❌ [Recorder] Error downloading JSON:", Ne), alert("Error downloading session recording. Check console for details.");
    }
  }, K = () => {
    window.open(u, "_blank"), m(!1), o("");
  }, re = () => {
    m(!1), o("");
  };
  return /* @__PURE__ */ i(je, { children: [
    /* @__PURE__ */ e(
      "button",
      {
        onClick: C,
        className: `fixed bottom-4 right-4 z-50 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all ${a ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-gray-500 hover:bg-gray-600"}`,
        title: a ? "Stop Recording" : "Start Recording",
        children: /* @__PURE__ */ e("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" }) })
      }
    ),
    f && /* @__PURE__ */ e("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: /* @__PURE__ */ i("div", { className: "bg-white rounded-xl shadow-2xl p-6 w-96 border-2 border-purple-200", children: [
      /* @__PURE__ */ i("div", { className: "flex justify-between items-center mb-6", children: [
        /* @__PURE__ */ e("h3", { className: "text-lg font-bold text-gray-900", children: "Start Recording" }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => l(!1),
            className: "text-gray-400 hover:text-gray-600",
            children: /* @__PURE__ */ e("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "space-y-4", children: [
        /* @__PURE__ */ i(
          "button",
          {
            onClick: j,
            className: "w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ e("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }),
              "New Session"
            ]
          }
        ),
        /* @__PURE__ */ i(
          "button",
          {
            onClick: F,
            className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ e("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" }) }),
              "Load Previous Session"
            ]
          }
        )
      ] })
    ] }) }),
    x && /* @__PURE__ */ e("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: /* @__PURE__ */ i("div", { className: "bg-white rounded-xl shadow-2xl p-6 w-96 border-2 border-purple-200", children: [
      /* @__PURE__ */ i("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ e("h3", { className: "text-lg font-bold text-gray-900", children: "Start Recording" }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => g(!1),
            className: "text-gray-400 hover:text-gray-600",
            children: /* @__PURE__ */ e("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "mb-4", children: [
        /* @__PURE__ */ e("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Tester Name" }),
        /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            value: c,
            onChange: (q) => d(q.target.value),
            onKeyDown: (q) => {
              q.key === "Enter" && !v && me();
            },
            list: "tester-names",
            placeholder: "Enter your name",
            className: "w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500",
            autoFocus: !0
          }
        ),
        /* @__PURE__ */ e("datalist", { id: "tester-names", children: A.map((q, Ne) => /* @__PURE__ */ e("option", { value: q }, Ne)) })
      ] }),
      /* @__PURE__ */ i("div", { className: "mb-4", children: [
        /* @__PURE__ */ e("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Session/Bug Name" }),
        /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            value: s,
            onChange: (q) => o(q.target.value),
            onKeyDown: (q) => {
              q.key === "Enter" && !v && me();
            },
            list: "session-names",
            placeholder: "e.g., Pot calculation error on flop",
            className: "w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          }
        ),
        /* @__PURE__ */ e("datalist", { id: "session-names", children: S.map((q, Ne) => /* @__PURE__ */ e("option", { value: q }, Ne)) })
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          onClick: me,
          disabled: v,
          className: `w-full ${v ? "bg-green-500 cursor-wait" : "bg-green-600 hover:bg-green-700"} text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2`,
          children: v ? /* @__PURE__ */ i(je, { children: [
            /* @__PURE__ */ i("svg", { className: "animate-spin h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ e("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
              /* @__PURE__ */ e("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
            ] }),
            "Starting..."
          ] }) : /* @__PURE__ */ i(je, { children: [
            /* @__PURE__ */ i("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
              /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" }),
              /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
            ] }),
            "Start Recording"
          ] })
        }
      )
    ] }) }),
    p && /* @__PURE__ */ e("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: /* @__PURE__ */ i("div", { className: "bg-white rounded-xl shadow-2xl p-6 w-[500px] max-h-[600px] border-2 border-blue-200 flex flex-col", children: [
      /* @__PURE__ */ i("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ e("h3", { className: "text-lg font-bold text-gray-900", children: "Load Previous Session" }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => r(!1),
            className: "text-gray-400 hover:text-gray-600",
            children: /* @__PURE__ */ e("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
          }
        )
      ] }),
      /* @__PURE__ */ e("div", { className: "mb-4", children: /* @__PURE__ */ e(
        "input",
        {
          type: "text",
          value: w,
          onChange: (q) => P(q.target.value),
          placeholder: "Search by session name...",
          className: "w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        }
      ) }),
      /* @__PURE__ */ i("div", { className: "flex-1 overflow-y-auto space-y-2", children: [
        oe().filter((q) => q.name.toLowerCase().includes(w.toLowerCase())).map((q, Ne) => /* @__PURE__ */ i(
          "div",
          {
            onClick: () => {
              o(q.name), ne(q.name), r(!1), g(!0);
            },
            className: "p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors",
            children: [
              /* @__PURE__ */ e("div", { className: "font-semibold text-gray-900", children: q.name }),
              /* @__PURE__ */ e("div", { className: "text-xs text-gray-500 mt-1", children: new Date(q.timestamp).toLocaleString() })
            ]
          },
          Ne
        )),
        oe().filter((q) => q.name.toLowerCase().includes(w.toLowerCase())).length === 0 && /* @__PURE__ */ e("div", { className: "text-center text-gray-500 py-8", children: "No saved sessions found" })
      ] })
    ] }) }),
    y && /* @__PURE__ */ e("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: /* @__PURE__ */ i("div", { className: "bg-white rounded-xl shadow-2xl p-6 w-96 border-2 border-green-200", children: [
      /* @__PURE__ */ e("div", { className: "flex items-center justify-center mb-4", children: /* @__PURE__ */ e("div", { className: "bg-green-100 rounded-full p-3", children: /* @__PURE__ */ e("svg", { className: "w-8 h-8 text-green-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }) }),
      /* @__PURE__ */ e("h3", { className: "text-xl font-bold text-gray-900 mb-4 text-center", children: "Recording Stopped" }),
      /* @__PURE__ */ i("div", { className: "bg-gray-50 rounded-lg p-4 mb-6", children: [
        /* @__PURE__ */ i("p", { className: "text-sm text-gray-600 mb-2", children: [
          /* @__PURE__ */ e("span", { className: "font-semibold", children: "Bug:" }),
          " ",
          s
        ] }),
        /* @__PURE__ */ i("p", { className: "text-sm text-gray-600 mb-2", children: [
          /* @__PURE__ */ e("span", { className: "font-semibold", children: "Tester:" }),
          " ",
          c
        ] }),
        /* @__PURE__ */ e("p", { className: "text-xs text-green-600 mt-3", children: "✓ Session URL copied to clipboard" })
      ] }),
      /* @__PURE__ */ i("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ i(
          "button",
          {
            onClick: K,
            className: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ e("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ e("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" }) }),
              "View Recording"
            ]
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: re,
            className: "bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors",
            children: "Stay on Page"
          }
        )
      ] })
    ] }) })
  ] });
}, So = () => /* @__PURE__ */ e("div", { className: "min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 py-10 px-4", children: /* @__PURE__ */ i("div", { className: "max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-8", children: [
  /* @__PURE__ */ e("h1", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Pot Calculation Demo" }),
  /* @__PURE__ */ e("p", { className: "text-gray-700 mb-4", children: "This demo page has been deprecated. The Pot Calculation Display is now integrated directly into the game views." }),
  /* @__PURE__ */ i("div", { className: "bg-blue-50 border-2 border-blue-300 rounded-lg p-4", children: [
    /* @__PURE__ */ e("h2", { className: "font-bold text-blue-900 mb-2", children: "How to use:" }),
    /* @__PURE__ */ i("ol", { className: "list-decimal list-inside space-y-2 text-blue-800", children: [
      /* @__PURE__ */ e("li", { children: "Go to Stack Setup and set up a hand" }),
      /* @__PURE__ */ e("li", { children: "Navigate through the game stages (PreFlop, Flop, Turn, River)" }),
      /* @__PURE__ */ e("li", { children: 'Click "Show Pot Breakdown" to see the pot calculation' }),
      /* @__PURE__ */ e("li", { children: 'At River, click "Select Winners" to generate the next hand' })
    ] })
  ] })
] }) });
function Vo() {
  const [t, n] = dn();
  hn(t, n);
  const a = yn(t, n), b = Hn(t, n);
  Kn(t, n);
  const u = He((d) => {
    const s = t.defaultUnit;
    return s === "K" ? `${(d / 1e3).toFixed(1)}K` : s === "Mil" ? `${(d / 1e6).toFixed(2)}M` : d.toString();
  }, [t.defaultUnit]), h = He(() => {
    confirm("Are you sure you want to clear all data?") && (n.setPlayers(
      Array.from({ length: 9 }, (d, s) => ({
        id: s + 1,
        name: "",
        position: "",
        stack: 0,
        inputOrder: s
      }))
    ), n.setPlayerData({}), n.setStackData({
      bigBlind: 0,
      smallBlind: 0,
      ante: 0,
      anteOrder: "BB First"
    }), n.setCommunityCards({
      flop: { card1: null, card2: null, card3: null },
      turn: { card1: null },
      river: { card1: null }
    }), n.setCurrentView("stack"), console.log("✅ All data cleared"));
  }, [n]), c = He(() => {
    console.log("Export data:", { state: t }), alert("Export functionality coming soon!");
  }, [t]);
  return t.currentView === "pot-demo" ? /* @__PURE__ */ i(je, { children: [
    /* @__PURE__ */ e(So, {}),
    /* @__PURE__ */ e(it, { state: t, actions: n })
  ] }) : t.currentView === "stack" ? /* @__PURE__ */ i(je, { children: [
    /* @__PURE__ */ e(
      Gn,
      {
        state: t,
        actions: n,
        cardManagement: b,
        onClearAll: h,
        onExport: c,
        formatStack: u
      }
    ),
    /* @__PURE__ */ e(it, { state: t, actions: n })
  ] }) : t.currentView === "preflop" || t.currentView === "preflop-more" || t.currentView === "preflop-more2" ? /* @__PURE__ */ i(je, { children: [
    /* @__PURE__ */ e(
      ho,
      {
        state: t,
        actions: n,
        cardManagement: b,
        potCalculation: a,
        onClearAll: h,
        onExport: c,
        formatStack: u
      }
    ),
    /* @__PURE__ */ e(it, { state: t, actions: n })
  ] }) : t.currentView === "flop" || t.currentView === "flop-more" || t.currentView === "flop-more2" ? /* @__PURE__ */ i(je, { children: [
    /* @__PURE__ */ e(
      bo,
      {
        state: t,
        actions: n,
        cardManagement: b,
        potCalculation: a,
        onClearAll: h,
        onExport: c,
        formatStack: u
      }
    ),
    /* @__PURE__ */ e(it, { state: t, actions: n })
  ] }) : t.currentView === "turn" || t.currentView === "turn-more" || t.currentView === "turn-more2" ? /* @__PURE__ */ i(je, { children: [
    /* @__PURE__ */ e(
      xo,
      {
        state: t,
        actions: n,
        cardManagement: b,
        potCalculation: a,
        onClearAll: h,
        onExport: c,
        formatStack: u
      }
    ),
    /* @__PURE__ */ e(it, { state: t, actions: n })
  ] }) : t.currentView === "river" || t.currentView === "river-more" || t.currentView === "river-more2" ? /* @__PURE__ */ i(je, { children: [
    /* @__PURE__ */ e(
      vo,
      {
        state: t,
        actions: n,
        cardManagement: b,
        potCalculation: a,
        onClearAll: h,
        onExport: c,
        formatStack: u
      }
    ),
    /* @__PURE__ */ e(it, { state: t, actions: n })
  ] }) : /* @__PURE__ */ i(je, { children: [
    /* @__PURE__ */ e("div", { className: "p-2 max-w-full mx-auto bg-gray-50 min-h-screen", children: /* @__PURE__ */ i("div", { className: "bg-white rounded-lg shadow-lg p-3", children: [
      /* @__PURE__ */ e("h1", { className: "text-lg font-bold text-gray-800", children: "Game View" }),
      /* @__PURE__ */ i("p", { className: "text-sm text-gray-600", children: [
        "Current view: ",
        t.currentView
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          onClick: () => n.setCurrentView("stack"),
          className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700",
          children: "Back to Stack Setup"
        }
      )
    ] }) }),
    /* @__PURE__ */ e(it, { state: t, actions: n })
  ] });
}
export {
  Ot as ALL_RANKS,
  $t as ALL_SUITS,
  Ct as ActionButtons,
  Pt as AmountInput,
  It as CardSelector,
  dt as CommunityCardSelector,
  bo as FlopView,
  Vo as HHToolApp,
  Ho as HandComparisonModal,
  it as LogRocketControl,
  xt as POT_FORMATTER_VERSION,
  Bt as PotCalculationDisplay,
  ho as PreFlopView,
  vo as RiverView,
  Gn as StackSetupView,
  xo as TurnView,
  Ko as ValidationModal,
  zn as WinnerSelectionModal,
  Rn as areAllSuitsTaken,
  Lo as areAllSuitsTakenFromEngine,
  jo as assignRandomCardsToPlayer,
  En as autoFoldNoActionPlayersInPreflopBase,
  mn as calculateAlreadyContributed,
  fn as calculateCurrentStacksForSection,
  xn as calculateDeadMoney,
  qn as calculateNewStacks,
  st as calculatePotsForBettingRound,
  Io as cardToString,
  Ye as checkBettingRoundComplete,
  on as checkBettingRoundStatus,
  Bo as convertFromActualValue,
  Zt as convertToActualValue,
  vn as createPots,
  Dt as formatChips,
  Tt as formatPotsForDisplay,
  Po as formatStack,
  nn as gatherContributions,
  Fn as generateDeck,
  Jn as generateNextHand,
  pn as getActivePlayers,
  _o as getAppropriateUnit,
  Un as getAvailableCardsForPlayer,
  Ro as getFoldedPlayers,
  To as getPositionIndex,
  ht as getPositionOrder,
  Mo as getPreviousRoundInfo,
  un as getPreviousSectionAction,
  Mn as getSelectedCards,
  Lt as getSelectedCardsFromEngine,
  Tn as hasPlayerFolded,
  Bn as hasValidCards,
  Eo as inferPlayerPositions,
  Rt as isCardAvailable,
  Oo as isCardAvailableFromEngine,
  ut as normalizePosition,
  Uo as parseCardString,
  gn as processStackCascade,
  en as processStackSynchronous,
  to as processWinnersAndGenerateNextHand,
  Ft as ranks,
  In as shuffleDeck,
  Do as sortPlayersByPosition,
  Mt as suits,
  Kn as useActionHandler,
  Hn as useCardManagement,
  dn as useGameState,
  hn as usePokerEngine,
  yn as usePotCalculation,
  Yn as validateAllPlayersPresent,
  Xn as validateButtonRotation,
  Dn as validateCommunityCards,
  Fo as validateCommunityCardsForStage,
  eo as validateNextHand,
  _n as validatePreFlopBase,
  Pn as validateSectionBeforeProcessing,
  Zn as validateStacksNonNegative,
  Qn as validateWinnerSelections
};
//# sourceMappingURL=hhtool-modular.js.map
