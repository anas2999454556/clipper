import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex-1 overflow-hidden">
      {/* Hero */}
      <section className="relative pt-12 pb-16 px-6 md:px-10 text-center">
        <p className="text-sm text-muted-foreground mb-5">
          Turn long videos into viral clips
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

        {/* Platform logos */}
        <div className="flex items-center justify-center gap-6 mt-6 text-muted-foreground" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
          </svg>
          <svg width="24" height="18" viewBox="0 0 24 18" fill="currentColor">
            <path d="M23.5 2.3a3 3 0 0 0-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.2A3 3 0 0 0 .5 2.3 31.4 31.4 0 0 0 0 9a31.4 31.4 0 0 0 .5 6.7 3 3 0 0 0 2.1 2.1c1.9.2 9.4.2 9.4.2s7.5 0 9.4-.2a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 9a31.4 31.4 0 0 0-.5-6.7ZM9.5 12.7V5.3l6.5 3.7-6.5 3.7Z" />
          </svg>
          <svg width="17" height="19" viewBox="0 0 14 16" fill="currentColor">
            <path d="M10.3.2v9.5c0 2.4-1.9 4.3-4.3 4.3-1.2 0-2.3-.5-3.1-1.3L4 11c.5.5 1.2.8 2 .8 1.8 0 3.2-1.4 3.2-3.2V5.8c.8.6 1.7.9 2.7.9V4c-2.1 0-3-1-3-1V.2h1.4Z" />
          </svg>
        </div>

        {/* Phone mockups */}
        <div className="relative mt-14 mx-auto max-w-4xl" style={{ height: "340px" }} aria-hidden="true">
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
