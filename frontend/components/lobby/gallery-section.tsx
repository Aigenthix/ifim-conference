"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ImageIcon, Download, ExternalLink } from "lucide-react";
import { galleryApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useState } from "react";

type DrivePhoto = {
  id: string;
  filename: string;
  size: number;
  mime_type: string;
  thumbnail_url: string;
  view_url: string;
  download_url: string;
};

export default function GallerySection({ eventId }: { eventId: string }) {
  const token = useAuthStore((s) => s.token) ?? "";
  const [selected, setSelected] = useState<DrivePhoto | null>(null);

  const { data: photos, isLoading } = useQuery({
    queryKey: ["gallery", eventId],
    queryFn: () => galleryApi.listPhotos(eventId, token),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: "180px", borderRadius: "16px", background: "#eee", animation: "shimmer 1.5s infinite" }} />
        ))}
        <style>{`@keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
      </div>
    );
  }

  const photoList = (photos || []) as DrivePhoto[];

  if (photoList.length === 0) {
    return (
      <div style={{ borderRadius: "20px", background: "#fff", border: "1px solid #eee", padding: "60px 24px", textAlign: "center" }}>
        <ImageIcon style={{ width: "48px", height: "48px", color: "#ccc", margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#333", marginBottom: "8px" }}>No Photos Yet</h3>
        <p style={{ color: "#888", fontSize: "14px" }}>Photos will appear here during the event.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ borderRadius: "20px", background: "#fff", border: "1px solid #eee", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #8B0000, #DC143C)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ImageIcon style={{ width: "18px", height: "18px", color: "#fff" }} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>Photo Gallery</h2>
          <span style={{ fontSize: "13px", color: "#888", marginLeft: "auto" }}>{photoList.length} photos</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
          {photoList.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(photo)}
              style={{ position: "relative", borderRadius: "14px", overflow: "hidden", aspectRatio: "4/3", background: "#f0f0f0", cursor: "pointer" }}
            >
              <img
                src={photo.thumbnail_url}
                alt={photo.filename}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                referrerPolicy="no-referrer"
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(transparent 50%, rgba(0,0,0,0.5))",
                display: "flex", alignItems: "flex-end", padding: "12px",
                opacity: 0, transition: "opacity 0.2s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
              >
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photo.filename}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px", cursor: "zoom-out",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "85vh", position: "relative", cursor: "default" }}
          >
            <img
              src={selected.view_url}
              alt={selected.filename}
              style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "12px", objectFit: "contain" }}
              referrerPolicy="no-referrer"
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "16px" }}>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>{selected.filename}</span>
              <a
                href={selected.download_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "10px 20px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #8B0000, #DC143C)",
                  color: "#fff", fontSize: "13px", fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <Download style={{ width: "14px", height: "14px" }} /> Download
              </a>
            </div>
          </motion.div>
          <button
            onClick={() => setSelected(null)}
            style={{
              position: "absolute", top: "20px", right: "20px",
              width: "40px", height: "40px", borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "none",
              color: "#fff", fontSize: "20px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>
      )}
    </>
  );
}
