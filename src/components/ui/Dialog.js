import React from "react";

export default function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={() => onOpenChange(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          padding: 24,
          borderRadius: 10,
          minWidth: 300,
          maxWidth: 400,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
