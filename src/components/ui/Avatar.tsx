import Image from "next/image";

type Props = {
  username: string;
  avatarUrl?: string | null;
  size?: number;
  bgColor?: string;
};

export default function Avatar({
  username,
  avatarUrl,
  size = 40,
  bgColor = "var(--ink)",
}: Props) {
  const letter = username?.[0]?.toUpperCase() ?? "R";
  const fontSize = Math.round(size * 0.38);

  if (avatarUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          background: bgColor,
        }}
      >
        <Image
          src={avatarUrl}
          alt={`${username}'s avatar`}
          width={size}
          height={size}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-serif)",
        fontSize: `${fontSize}px`,
        color: "var(--cream)",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {letter}
    </div>
  );
}
