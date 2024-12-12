"use client";
import { useAccount } from "wagmi";

export default function NavBar() {
  const { isConnected } = useAccount();

  return (
    <div style={{ fontFamily: "'Arial', sans-serif" }}>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 30px",
          backgroundColor: "#fff", // Changed to white
          color: "#000", // Changed text color to black
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <img src="/q.jpeg" alt="Logo" style={{ height: "40px" }} />
          <a
            href="#"
            style={{ color: "#000", textDecoration: "none", fontWeight: "500" }}
          >
            About
          </a>
          <a
            href="#"
            style={{ color: "#000", textDecoration: "none", fontWeight: "500" }}
          >
            Technical
          </a>
          <a
            href="#"
            style={{ color: "#000", textDecoration: "none", fontWeight: "500" }}
          >
            DEQUIP
          </a>
          <a
            href="#"
            style={{ color: "#000", textDecoration: "none", fontWeight: "500" }}
          >
            Eco System
          </a>
          <a
            href="#"
            style={{ color: "#000", textDecoration: "none", fontWeight: "500" }}
          >
            Resources
          </a>
          <a
            href="#"
            style={{ color: "#000", textDecoration: "none", fontWeight: "500" }}
          >
            Careers
          </a>
          <a
            href="#"
            style={{ color: "#000", textDecoration: "none", fontWeight: "500" }}
          >
            Contact
          </a>
        </div>

        <div>
          <w3m-button />
          {isConnected && <w3m-network-button />}
        </div>
      </nav>
    </div>
  );
}
