import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex-1 overflow-hidden">
      {/* Hero */}
      <section className="relative pt-12 pb-16 px-6 md:px-10 text-center">
        <p className="text-sm text-muted-foreground mb-5">
          Trusted by 2 million+ content creators
        </p>

        <h1 className="text-display max-w-3xl mx-auto mb-5">
          Clip the best moments from any video
        </h1>

        <p className="text-muted-foreground text-base max-w-md mx-auto mb-8 leading-relaxed">
          Upload a long video and Clipper finds the most engaging segments, ready
          to post as TikToks, Reels, or Shorts.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/upload"
            className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 font-semibold text-sm"
            style={{ background: "#ffffff", color: "#000000" }}
          >
            Upload Video
          </Link>
        </div>

        {/* Phone mockups */}
        <div className="relative mt-14 mx-auto max-w-4xl" style={{ height: "340px" }}>
          {/* Left phone */}
          <div className="absolute left-[8%] md:left-[12%] bottom-0 hidden sm:block" style={{ transform: "rotate(-8deg)" }}>
            <PhoneFrame label="Comedy highlight" />
          </div>

          {/* Center phone */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 z-10">
            <PhoneFrame label="Day in my life" large />
          </div>

          {/* Right phone */}
          <div className="absolute right-[8%] md:right-[12%] bottom-0 hidden sm:block" style={{ transform: "rotate(8deg)" }}>
            <PhoneFrame label="Key reveal" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-16 px-6 md:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-headline mb-12">How it works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            <Step
              number="01"
              title="Upload your video"
              description="Drop any long-form video, up to 60 minutes. MP4, WebM, or MOV."
            />
            <Step
              number="02"
              title="AI finds the best moments"
              description="Scene detection finds the most engaging segments automatically."
            />
            <Step
              number="03"
              title="Export and post"
              description="Trim, adjust, and export vertical clips ready for any platform."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 md:px-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>Clipper</span>
          <span>&copy; 2026</span>
        </div>
      </footer>
    </main>
  );
}

function PhoneFrame({ label, large }: { label: string; large?: boolean }) {
  const w = large ? 180 : 150;
  const h = large ? 340 : 280;

  return (
    <div
      style={{
        width: `${w}px`,
        height: `${h}px`,
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.15)",
        background: "#0a0a0a",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Screen */}
      <div
        style={{
          position: "absolute",
          inset: "3px",
          borderRadius: "21px",
          background: "#111",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Notch */}
        <div
          style={{
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "14px",
              borderRadius: "0 0 10px 10px",
              background: "#0a0a0a",
            }}
          />
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              height: large ? "220px" : "170px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #1a1a1a, #141414)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <polygon points="8,5 19,12 8,19" />
              </svg>
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "11px",
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              {label}
            </p>
          </div>
        </div>

        {/* Bottom dots */}
        <div
          style={{
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            paddingBottom: "8px",
          }}
        >
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <span className="text-accent text-sm font-semibold mb-3 block">
        {number}
      </span>
      <h3 className="text-title mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
