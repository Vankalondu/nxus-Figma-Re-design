import React from "react";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-16 h-16 rounded-full bg-border flex items-center justify-center mb-4">
        <span style={{ fontSize: 28, color: "#7baac7" }}>?</span>
      </div>
      <h1 className="font-heading font-semibold text-[16px] text-foreground">Page not found</h1>
      <p className="font-body text-[14px] text-muted-foreground font-medium mt-2 max-w-xs text-center">
        The route you navigated to doesn't exist.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="mt-6 bg-primary border-2 border-primary text-chalk hover:bg-primary/80 rounded-full px-6 py-3 font-body font-bold text-[14px] transition-colors"
      >
        Go back
      </button>
    </div>
  );
}