import React from "react";

export default function Button({ children, variant = "default", onClick }) {
  const styles = {
    default: {
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
    },
    outline: {
      backgroundColor: "#fff",
      color: "#007bff",
      border: "1px solid #007bff",
    },
  };

  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px",
        borderRadius: "6px",
        fontSize: "14px",
        cursor: "pointer",
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}
