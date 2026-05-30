"use client";

import type { BrandIntelligenceProfile } from "@/lib/brandProfiles";

type BrandIntelligenceModalProps = {
  profile: BrandIntelligenceProfile | null;
  onClose: () => void;
};

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone?: "cyan" | "fuchsia" | "emerald" | "amber";
  children: React.ReactNode;
}) {
  const color =
    tone === "fuchsia"
      ? "text-fuchsia-300"
      : tone === "emerald"
      ? "text-emerald-300"
      : tone === "amber"
      ? "text-amber-300"
      : "text-cyan-300";

  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
      <div className={`mb-3 text-xs uppercase tracking-[0.2em] ${color}`}>
        {title}
      </div>
      {children}
    </div>
  );
}

function ChipList({
  items,
  empty,
  tone,
}: {
  items: string[];
  empty: string;
  tone?: "cyan" | "fuchsia" | "emerald" | "amber";
}) {
  const border =
    tone === "fuchsia"
      ? "border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100"
      : tone === "emerald"
      ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-100"
      : tone === "amber"
      ? "border-amber-300/20 bg-amber-500/10 text-amber-100"
      : "border-cyan-300/20 bg-cyan-500/10 text-cyan-100";

  const values = items?.length ? items : [empty];

  return (
    <div className="flex flex-wrap gap-2">
      {values.slice(0, 18).map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`rounded-full border px-3 py-1 text-xs ${border}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function ProfileLogo({ profile }: { profile: BrandIntelligenceProfile }) {
  if (profile.logoUrl) {
    return (
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-white p-3 shadow-[0_0_45px_rgba(217,70,239,0.16)]">
        <img
          src={profile.logoUrl}
          alt={`${profile.name} logo`}
          className="h-full w-full object-contain"
          onError={(event) => {
            event.currentTarget.style.display = "none";
            const fallback =
              event.currentTarget.parentElement?.querySelector(".profile-logo-fallback");
            if (fallback) fallback.classList.remove("hidden");
          }}
        />
        <div className="profile-logo-fallback hidden text-3xl font-black text-slate-900">
          {profile.logoEmoji}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.5rem] border border-fuchsia-300/30 bg-fuchsia-500/10 text-4xl shadow-[0_0_45px_rgba(217,70,239,0.18)]">
      {profile.logoEmoji}
    </div>
  );
}

export default function BrandIntelligenceModal({
  profile,
  onClose,
}: BrandIntelligenceModalProps) {
  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 px-4 backdrop-blur-xl">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-fuchsia-300/25 bg-[#020617] p-6 shadow-[0_0_100px_rgba(217,70,239,0.18)]">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-5">
            <ProfileLogo profile={profile} />

            <div>
              <div className="mb-2 inline-flex rounded-full border border-fuchsia-300/25 bg-fuchsia-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-fuchsia-200">
                Brand Intelligence Profile
              </div>

              <h3 className="text-4xl font-black text-white">{profile.name}</h3>

              <div className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
                {profile.slogan}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-500/20"
                  >
                    Open website →
                  </a>
                )}

                <span className="inline-flex rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.18em] text-gray-300">
                  {profile.company}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Signals", profile.signalCount],
            ["Classified", profile.classifiedCount],
            ["Products", profile.products.length],
            ["Campaigns", profile.campaigns.length],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-white/10 bg-black/25 p-5"
            >
              <div className="text-3xl font-black text-fuchsia-100">{value}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-5 rounded-3xl border border-cyan-300/20 bg-cyan-500/10 p-5">
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
            Brand summary
          </div>
          <p className="text-sm leading-7 text-gray-200">{profile.history}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Section title="Company / ownership" tone="cyan">
            <div className="text-xl font-black text-white">{profile.company}</div>
            <p className="mt-3 text-sm leading-7 text-gray-300">
              {profile.ownership}
            </p>
          </Section>

          <Section title="Logo / slogan / site" tone="fuchsia">
            <div className="space-y-3 text-sm leading-7 text-gray-300">
              <div>Slogan: <span className="text-white">{profile.slogan}</span></div>
              <div>
                Website: <span className="break-all text-white">{profile.website || "Website pending"}</span>
              </div>
              <div>Logo: <span className="text-white">{profile.logoUrl ? "Available" : "Fallback marker only"}</span></div>
            </div>
          </Section>

          <Section title="IAB footprint" tone="emerald">
            <ChipList items={profile.iabFootprint} empty="Unclassified / pending IAB mapping" tone="emerald" />
          </Section>

          <Section title="Products" tone="fuchsia">
            <ChipList items={profile.products} empty="No products detected yet" tone="fuchsia" />
          </Section>

          <Section title="Campaigns" tone="amber">
            <ChipList items={profile.campaigns} empty="No campaigns detected yet" tone="amber" />
          </Section>

          <Section title="Audiences" tone="cyan">
            <ChipList items={profile.audiences} empty="No audiences detected yet" tone="cyan" />
          </Section>

          <Section title="Aliases" tone="fuchsia">
            <ChipList items={profile.aliases} empty="No aliases yet" tone="fuchsia" />
          </Section>

          <Section title="Subsidiaries / product families" tone="emerald">
            <ChipList items={profile.subsidiaries} empty="No subsidiaries or product families recorded yet" tone="emerald" />
          </Section>

          <Section title="Sources" tone="cyan">
            <ChipList items={profile.sources} empty="No source labels yet" tone="cyan" />
          </Section>

          <Section title="Categories" tone="emerald">
            <ChipList items={profile.categories} empty="No category labels yet" tone="emerald" />
          </Section>

          <Section title="Risk / observation labels" tone="amber">
            <ChipList items={profile.riskLabels} empty="No risk labels detected" tone="amber" />
          </Section>

          <Section title="Intelligence readiness" tone="fuchsia">
            <div className="space-y-2 text-sm text-gray-300">
              <div>Logo: {profile.logoUrl ? "Ready" : "Pending"}</div>
              <div>Website: {profile.website ? "Ready" : "Pending"}</div>
              <div>IAB: {profile.iabFootprint.length ? "Ready" : "Pending"}</div>
              <div>Ownership: {profile.company !== "Ownership data pending" ? "Ready" : "Pending"}</div>
            </div>
          </Section>

          {profile.signals.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-black/25 p-5 lg:col-span-3">
              <div className="mb-3 text-xs uppercase tracking-[0.2em] text-green-300">
                Latest signals
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {profile.signals.slice(0, 6).map((signal: any, index: number) => (
                  <div key={signal.id || signal.title || index} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-sm font-bold text-white">
                      {signal.title || signal.name || "Monitoring signal"}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {signal.campaignObject || signal.product || signal.campaign || "No campaign/product detail"}
                    </div>
                    <div className="mt-2 text-xs text-green-200">
                      {signal.iabClass || signal.iab_full_path || "Unclassified"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
