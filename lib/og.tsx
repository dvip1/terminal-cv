import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/**
 * Shared OG card: a terminal prompt with the page title as the command —
 * on-brand with the site's terminal layer.
 */
export function renderOgImage(title: string, subtitle?: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0a0e12",
          color: "#ccd6e0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            border: "1px solid #232930",
            borderRadius: "12px",
            padding: "48px 56px",
            backgroundColor: "#0e1318",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, color: "#6b7785" }}>
            dvip@arch ~ $
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 28,
              fontSize: 64,
              fontWeight: 700,
              color: "#58b7e8",
              lineHeight: 1.15,
            }}
          >
            {title}
            <div
              style={{
                width: 30,
                height: 64,
                marginLeft: 20,
                backgroundColor: "#58b7e8",
              }}
            />
          </div>
          {subtitle ? (
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 30,
                color: "#8a93a0",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 26,
            color: "#6b7785",
          }}
        >
          dvippatel.in — resilient real-time systems, from RS485 wires to AI pipelines
        </div>
      </div>
    ),
    ogSize
  );
}
