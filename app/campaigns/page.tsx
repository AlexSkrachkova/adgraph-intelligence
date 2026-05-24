import { supabase } from "../../lib/supabase";
import NavBar from "../../components/NavBar";

export default async function CampaignExplorer() {
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(`
      id,
      name,
      objective,
      created_at,
      brands (
        name,
        industry,
        country
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-black text-white p-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex items-start justify-between">
            <div>
              <h1 className="text-6xl font-bold mb-4">
                Campaign Explorer
              </h1>

              <p className="text-gray-400 text-lg">
                Explore imported campaigns and competitive activity.
              </p>
            </div>

            <a
              href="/"
              className="rounded-2xl bg-white text-black px-6 py-3 font-semibold hover:bg-gray-200 transition"
            >
              Back to War Room
            </a>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-bold mb-6">
              Campaigns
            </h2>

            <div className="space-y-4">
              {campaigns?.map((campaign: any) => (
                <div
                  key={campaign.id}
                  className="rounded-2xl border border-white/10 p-6"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="text-2xl font-semibold mb-2">
                        {campaign.name}
                      </div>

                      <div className="text-gray-400">
                        Brand: {campaign.brands?.name || "Unknown"}
                      </div>

                      <div className="text-gray-400">
                        Category: {campaign.brands?.industry || "Unknown"}
                      </div>

                      <div className="text-gray-400">
                        Market: {campaign.brands?.country || "Unknown"}
                      </div>
                    </div>

                    <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-green-400">
                      {campaign.objective || "No objective"}
                    </div>
                  </div>
                </div>
              ))}

              {campaigns?.length === 0 && (
                <p className="text-gray-400">
                  No campaigns imported yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}