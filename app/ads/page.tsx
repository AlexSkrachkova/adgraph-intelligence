"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import NavBar from "../../components/NavBar";
import { createWorker } from "tesseract.js";

export default function AdsPage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [brands, setBrands] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [title, setTitle] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      const { data: brandsData } = await supabase
        .from("brands")
        .select("*");

      const { data: campaignsData } = await supabase
        .from("campaigns")
        .select("*");

      setBrands(brandsData || []);
      setCampaigns(campaignsData || []);
    }

    loadData();
  }, []);

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!selectedBrand || !selectedCampaign) {
      setMessage("Select brand and campaign first.");
      return;
    }

    setUploading(true);
    setMessage("");

    const filePath = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("ad-assets")
      .upload(filePath, file);

    if (uploadError) {
      setMessage("Upload failed.");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("ad-assets")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

   let detectedTheme = "General Advertising";
let detectedColors = "Unknown";
let aiDescription = "Advertising creative asset.";
let detectedText = "";

const lowerTitle = title.toLowerCase();

if (
  lowerTitle.includes("nike") ||
  lowerTitle.includes("sport")
) {
  detectedTheme = "Sportswear";
  detectedColors = "Yellow, Black";
  aiDescription =
    "High contrast sportswear creative focused on performance branding.";
}

if (file.type.startsWith("video")) {
  aiDescription += " Video format detected.";
}
if (file.type.startsWith("image")) {
  const worker = await createWorker("eng");
  const result = await worker.recognize(file);

  detectedText = result.data.text.trim();

  await worker.terminate();

  if (detectedText) {
    aiDescription += ` Detected text: ${detectedText}`;
  }
}

await supabase.from("ad_assets").insert([
  {
    brand_id: selectedBrand,
    campaign_id: selectedCampaign,
    title,
    file_url: publicUrl,
    file_type: file.type,

    detected_theme: detectedTheme,
    detected_colors: detectedColors,
    ai_description: aiDescription,
    detected_text: detectedText,
  },
]);

    setMessage("Ad uploaded successfully.");
    setUploading(false);
  }

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-black text-white p-10">
        <div className="max-w-4xl mx-auto">

          <div className="mb-10">
            <h1 className="text-6xl font-bold mb-4">
              Ad Upload Center
            </h1>

            <p className="text-gray-400 text-lg">
              Upload advertising assets into AdGraph intelligence system.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

            <div className="space-y-6">

              <div>
                <label className="block mb-2 text-gray-400">
                  Brand
                </label>

                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full rounded-2xl bg-black border border-white/10 p-4"
                >
                  <option value="">Select Brand</option>

                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-gray-400">
                  Campaign
                </label>

                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full rounded-2xl bg-black border border-white/10 p-4"
                >
                  <option value="">Select Campaign</option>

                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-gray-400">
                  Ad Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nike Summer Video Ad"
                  className="w-full rounded-2xl bg-black border border-white/10 p-4"
                />
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl bg-white text-black px-8 py-4 text-lg font-semibold hover:bg-gray-200 transition"
                >
                  Upload Ad Asset
                </button>
              </div>

              {uploading && (
                <div className="text-yellow-400">
                  Uploading asset...
                </div>
              )}

              {message && (
                <div className="rounded-xl bg-green-500/20 border border-green-500/30 p-4 text-green-300">
                  {message}
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </>
  );
}