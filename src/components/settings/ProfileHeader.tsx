type Props = {
  username: string;
  email: string;
  message?: string;
  isError?: boolean;
};

export default function ProfileHeader({
  username,
  email,
  message,
  isError,
}: Props) {
  return (
    <div style={{ padding: "52px 28px 24px" }}>
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-serif)",
          fontSize: "26px",
          color: "white",
          marginBottom: "12px",
        }}
      >
        {username?.[0]?.toUpperCase() ?? "R"}
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "22px",
          color: "var(--ink)",
        }}
      >
        {username || "User"}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "var(--ink-muted)",
          marginTop: "2px",
        }}
      >
        {email}
      </div>
      {message && (
        <p
          style={{
            marginTop: "8px",
            fontSize: "13px",
            color: isError ? "#DC2626" : "var(--green)",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
