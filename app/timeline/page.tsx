import { supabase } from "../../lib/supabase";
import NavBar from "../../components/NavBar";

export default async function TimelineReplay() {
  const { data: events } = await supabase
    .from("timeline_events")
    .select(`
      id,
      title,
      description,
      event_type,
      event_date,
      brands (
        name
      )
    `)
    .order("event_date", { ascending: false });

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-black text-white p-10">
        <div className="max-w-5xl mx-auto">

          <div className="mb-12 flex items-start justify-between">
            <div>
              <h1 className="text-6xl font-bold mb-4">
                Timeline Replay
              </h1>

              <p className="text-gray-400 text-lg">
                Replay competitive advertising activity over time.
              </p>
            </div>

            <a
              href="/"
              className="rounded-2xl bg-white text-black px-6 py-3 font-semibold hover:bg-gray-200 transition"
            >
              Back to War Room
            </a>
          </div>

          <div className="relative border-l border-white/10 ml-4 pl-10 space-y-10">

            {events?.map((event: any, index: number) => (
              <div
                key={event.id}
                className="relative"
              >
                <div className="absolute -left-[52px] top-2 w-5 h-5 rounded-full bg-green-400" />

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">

                  <div className="text-sm text-green-400 mb-2">
                    {event.event_type}
                  </div>

                  <div className="text-2xl font-semibold mb-3">
                    {event.title}
                  </div>

                  <div className="text-gray-400 mb-3">
                    {event.description}
                  </div>

                  <div className="text-gray-500 text-sm">
                    {new Date(event.event_date).toLocaleString()}
                  </div>

                </div>
              </div>
            ))}

            {events?.length === 0 && (
              <p className="text-gray-400">
                No timeline events yet.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}