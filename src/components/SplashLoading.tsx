export default function SplashLoading() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#E8E2D9",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          minHeight: "100vh",
          background: "#F5F0E8",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/apple-touch-icon.png"
          alt="Reflecto"
          style={{ width: 72, height: 72, borderRadius: "20px" }}
        />
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "24px",
            color: "#1C1917",
            fontWeight: 400,
          }}
        >
          Reflecto
        </div>
        <div
          style={{
            width: "40px",
            height: "3px",
            background: "#EDE7D9",
            borderRadius: "2px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "40%",
              background: "#C4622D",
              borderRadius: "2px",
              animation: "reflecto-splash-slide 1s ease-in-out infinite",
            }}
          />
        </div>
        <style>{`
          @keyframes reflecto-splash-slide {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(150%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>
    </div>
  );
}
