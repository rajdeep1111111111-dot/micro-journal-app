function SkeletonBlock({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style = {},
}: {
  width?: string | number;
  height?: number;
  borderRadius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: "var(--skeleton-base, #E8E2D9)",
        backgroundImage:
          "linear-gradient(90deg, var(--skeleton-base, #E8E2D9) 0%, var(--skeleton-shine, #F0EBE3) 50%, var(--skeleton-base, #E8E2D9) 100%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.4s ease infinite",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

const KEYFRAME = `
@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

function SkeletonStyles() {
  return <style>{KEYFRAME}</style>;
}

export function FeedCardSkeleton() {
  return (
    <>
      <SkeletonStyles />
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "20px",
          padding: "16px",
          marginBottom: "12px",
          border: "1px solid var(--cream-dark)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "14px",
          }}
        >
          <SkeletonBlock width={38} height={38} borderRadius={19} />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <SkeletonBlock width="40%" height={12} />
            <SkeletonBlock width="25%" height={10} />
          </div>
          <SkeletonBlock width={16} height={16} borderRadius={4} />
        </div>

        <SkeletonBlock width="70%" height={14} style={{ marginBottom: "10px" }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginBottom: "14px",
          }}
        >
          <SkeletonBlock width="100%" height={11} />
          <SkeletonBlock width="100%" height={11} />
          <SkeletonBlock width="60%" height={11} />
        </div>

        <div style={{ borderTop: "1px solid var(--cream-dark)", paddingTop: "10px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <SkeletonBlock width={40} height={12} borderRadius={6} />
            <SkeletonBlock width={40} height={12} borderRadius={6} />
          </div>
        </div>
      </div>
    </>
  );
}

export function FeedSkeleton() {
  return (
    <div style={{ padding: "0 20px" }}>
      {[1, 2, 3].map((i) => (
        <FeedCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FriendRowSkeleton() {
  return (
    <>
      <SkeletonStyles />
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "14px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "8px",
          border: "1px solid var(--cream-dark)",
        }}
      >
        <SkeletonBlock width={36} height={36} borderRadius={18} />
        <SkeletonBlock width="45%" height={13} borderRadius={6} />
        <div style={{ flex: 1 }} />
        <SkeletonBlock width={56} height={28} borderRadius={8} />
      </div>
    </>
  );
}

export function RequestsTabSkeleton() {
  return (
    <div style={{ padding: "0 28px 24px" }}>
      <SkeletonBlock
        width="30%"
        height={10}
        borderRadius={5}
        style={{ marginBottom: "12px" }}
      />
      {[1, 2].map((i) => (
        <FriendRowSkeleton key={i} />
      ))}
      <SkeletonBlock
        width="40%"
        height={10}
        borderRadius={5}
        style={{ marginTop: "16px", marginBottom: "12px" }}
      />
      {[1, 2, 3].map((i) => (
        <FriendRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <>
      <SkeletonStyles />
      <div style={{ padding: "52px 28px 24px" }}>
        <SkeletonBlock
          width={72}
          height={72}
          borderRadius={36}
          style={{ marginBottom: "12px" }}
        />
        <SkeletonBlock
          width="50%"
          height={18}
          borderRadius={8}
          style={{ marginBottom: "8px" }}
        />
        <SkeletonBlock width="65%" height={12} borderRadius={6} />
      </div>
    </>
  );
}
