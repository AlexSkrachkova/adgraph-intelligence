import { supabase } from "../../../lib/supabase";
import NavBar from "../../../components/NavBar";

export default async function AdLibrary() {
  const { data: ads } = await supabase
    .from("ad_assets")
    .select(`
  id,
  title,
  file_url,
  file_type,
  detected_theme,
  detected_colors,
  ai_description,
  created_at,
  brands (
    name,
    industry,
    country
  ),
  campaigns (
    name,
    objective
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
                Ad Library
              </h1>

              <p className="text-gray-400 text-lg">
                Review uploaded advertising assets and metadata.
              </p>
            </div>

            <a
              href="/ads"
              className="rounded-2xl bg-white text-black px-6 py-3 font-semibold hover:bg-gray-200 transition"
            >
              Upload Ad
            </a>
          </div>

          {ads?.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-400">
              No ad assets uploaded yet.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {ads?.map((ad: any) => (
              <div
                key={ad.id}
                className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden"
              >
                <div className="bg-black border-b border-white/10">
                  {ad.file_type?.startsWith("image") ? (
                    <img
                      src={ad.file_url}
                      alt={ad.title || "Ad asset"}
                      className="w-full h-64 object-cover"
                    />
                  ) : ad.file_type?.startsWith("video") ? (
                    <video
                      src={ad.file_url}
                      controls
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      Unsupported asset type
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="text-2xl font-semibold mb-2">
                    {ad.title || "Untitled Ad"}
                  </div>

                  <div className="text-gray-400 mb-1">
                    Brand: {ad.brands?.name || "Unknown"}
                  </div>

                  <div className="text-gray-400 mb-1">
                    Campaign: {ad.campaigns?.name || "Unknown"}
                  </div>

                  <div className="text-gray-400 mb-1">
                    Objective: {ad.campaigns?.objective || "Unknown"}
                    <div className="mt-5 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4">
  <div className="text-sm text-purple-300 mb-2">
    AI Metadata
  </div>

  <div className="text-gray-300">
    Theme: {ad.detected_theme || "Not analyzed"}
  </div>

  <div className="text-gray-300">
    Colors: {ad.detected_colors || "Not analyzed"}
  </div>

  <div className="text-gray-400 mt-2">
    {ad.ai_description || "No AI description yet."}
  </div>
</div>
                  </div>

                  <div className="text-gray-500 text-sm mt-4">
                    Uploaded: {new Date(ad.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}