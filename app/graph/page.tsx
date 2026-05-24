"use client";

import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { supabase } from "../../lib/supabase";
import NavBar from "../../components/NavBar";

export default function GalaxyGraph() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    async function loadGraph() {
      const { data: brands } = await supabase
        .from("brands")
        .select("*");

      const { data: campaigns } = await supabase
        .from("campaigns")
        .select(`
          id,
          name,
          brand_id
        `);

      const graphNodes: Node[] = [];
      const graphEdges: Edge[] = [];

      brands?.forEach((brand: any, index: number) => {
        graphNodes.push({
          id: `brand-${brand.id}`,
          position: { x: 100, y: index * 140 },
          data: { label: `Brand: ${brand.name}` },
          type: "default",
        });
      });

      campaigns?.forEach((campaign: any, index: number) => {
        graphNodes.push({
          id: `campaign-${campaign.id}`,
          position: { x: 500, y: index * 140 },
          data: { label: `Campaign: ${campaign.name}` },
          type: "default",
        });

        graphEdges.push({
          id: `edge-${campaign.id}`,
          source: `brand-${campaign.brand_id}`,
          target: `campaign-${campaign.id}`,
          label: "launched",
        });
      });

      setNodes(graphNodes);
      setEdges(graphEdges);
    }

    loadGraph();
  }, []);

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-black text-white p-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-6xl font-bold mb-4">
              Galaxy Graph
            </h1>

            <p className="text-gray-400 text-lg">
              Visual relationship map of brands and campaigns.
            </p>
          </div>

          <a
            href="/"
            className="rounded-2xl bg-white text-black px-6 py-3 font-semibold hover:bg-gray-200 transition"
          >
            Back to War Room
          </a>
        </div>

        <div className="h-[700px] rounded-3xl border border-white/10 overflow-hidden bg-black">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            style={{ background: "#050505" }}
          >
            <Background color="#333" gap={20} />
            <Controls />
          </ReactFlow>
        </div>
      </main>
    </>
  );
}