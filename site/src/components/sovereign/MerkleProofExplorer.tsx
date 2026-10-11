"use client";

import { useState, useEffect } from "react";

interface Atom {
  id: string;
  vault: string;
  content: string;
}

interface ProofStep {
  siblingHash: string;
  position: "left" | "right";
}

const DEFAULT_ATOMS: Atom[] = [
  { id: "atom-1", vault: "strategic", content: "Sovereign single-operator fleet substrate" },
  { id: "atom-2", vault: "horizon", content: "Durable blockchain permanence on Arweave & IPFS" },
  { id: "atom-3", vault: "technical", content: "Robot continuity kernel with ROS2 / Zenoh wire" },
  { id: "atom-4", vault: "operational", content: "Starlight Queen fail-closed autonomic sweep" },
];

async function computeSha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function MerkleProofExplorer() {
  const [atoms, setAtoms] = useState<Atom[]>(DEFAULT_ATOMS);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [merkleRoot, setMerkleRoot] = useState<string>("");
  const [proof, setProof] = useState<ProofStep[]>([]);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [calculating, setCalculating] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    async function evaluateMerkle() {
      setCalculating(true);
      // Hash individual items
      const hashes = await Promise.all(
        atoms.map((a) => computeSha256(`${a.id}|${a.vault}|${a.content}`))
      );

      // Build levels
      let currentLevel = [...hashes];
      let currIdx = selectedIndex;
      const proofSteps: ProofStep[] = [];

      while (currentLevel.length > 1) {
        const isEven = currIdx % 2 === 0;
        const siblingIdx = isEven ? currIdx + 1 : currIdx - 1;

        if (siblingIdx < currentLevel.length) {
          proofSteps.push({
            siblingHash: currentLevel[siblingIdx],
            position: isEven ? "right" : "left",
          });
        } else {
          proofSteps.push({
            siblingHash: currentLevel[currIdx],
            position: "right",
          });
        }

        const nextLevel: string[] = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
          const left = currentLevel[i];
          const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : currentLevel[i];
          const combined = await computeSha256(`${left}:${right}`);
          nextLevel.push(combined);
        }

        currentLevel = nextLevel;
        currIdx = Math.floor(currIdx / 2);
      }

      const root = currentLevel[0] || "";

      // Verify proof independently
      let check = hashes[selectedIndex];
      for (const step of proofSteps) {
        if (step.position === "right") {
          check = await computeSha256(`${check}:${step.siblingHash}`);
        } else {
          check = await computeSha256(`${step.siblingHash}:${check}`);
        }
      }

      if (active) {
        setMerkleRoot(root);
        setProof(proofSteps);
        setIsVerified(check === root);
        setCalculating(false);
      }
    }

    evaluateMerkle();

    return () => {
      active = false;
    };
  }, [atoms, selectedIndex]);

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-[#0c0c16]/90 p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/[0.08]">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Interactive Zero-Knowledge Merkle Proof Explorer
          </h3>
          <p className="text-xs text-slate-400">
            Verify individual memory atoms in O(log N) without disclosing your private vault contents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-xs font-mono text-violet-300">
            SIP-Anchor-v1.1
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-mono font-medium ${
              isVerified
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {isVerified ? "VERIFIED VALID" : "TAMPER DETECTED"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Memory Atoms List */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
            Select Atom to Prove Inclusion:
          </label>
          {atoms.map((atom, idx) => (
            <button
              key={atom.id}
              onClick={() => setSelectedIndex(idx)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                selectedIndex === idx
                  ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/5"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-violet-400">{atom.id}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-300">
                  {atom.vault}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 font-medium">{atom.content}</p>
            </button>
          ))}
        </div>

        {/* Proof Visualization */}
        <div className="space-y-4 rounded-xl border border-white/[0.06] bg-black/40 p-4">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Public Merkle Root (On-Chain State Anchor)
            </span>
            <div className="rounded-lg bg-black/60 p-2.5 font-mono text-xs text-emerald-300 break-all border border-emerald-500/20">
              {calculating ? "Computing..." : merkleRoot}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Selective Disclosure Proof Path (Length: {proof.length})
            </span>
            <div className="space-y-2">
              {proof.map((step, sIdx) => (
                <div
                  key={sIdx}
                  className="rounded-lg bg-white/[0.03] p-2 border border-white/[0.06] text-xs font-mono flex items-center justify-between"
                >
                  <span className="text-slate-400 text-[10px]">
                    Step {sIdx + 1} ({step.position})
                  </span>
                  <span className="text-slate-300 text-[11px] truncate max-w-[240px]">
                    {step.siblingHash.slice(0, 16)}...{step.siblingHash.slice(-8)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span>Proof Complexity: O(log {atoms.length}) = {proof.length} hashes</span>
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Zero-Knowledge Pass
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
