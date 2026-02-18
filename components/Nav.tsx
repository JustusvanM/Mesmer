"use client";

import Link from "next/link";
import { useState } from "react";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav" id="nav">
      <div className="nav-inner">
        <Link href="/" className="logo">
          <img src="/logo-icon.png" alt="" className="logo-icon" />
          <span className="logo-text">Mesmer</span>
        </Link>
        <button
          className={`nav-toggle ${open ? "active" : ""}`}
          id="navToggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="nav-right">
          <div className={`nav-links ${open ? "open" : ""}`} id="navLinks">
            <a href="/#how-it-works">How it works</a>
            <a href="/#pricing">Pricing</a>
            <a href="/#league-system">System</a>
            <a href="/#faq">FAQ</a>
          </div>
          <Link href="/join" className="btn btn-primary nav-cta">
            Join your league
          </Link>
        </div>
      </div>
    </nav>
  );
}
