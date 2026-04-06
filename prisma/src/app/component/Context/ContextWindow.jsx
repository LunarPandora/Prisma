"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

export default function ContextWindow({ position, children, onClose }) {
  const menuRef = useRef(null);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  let originX = "left";
  let originY = "top";

  useEffect(() => {
    const handleClick = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [onClose]);

  useEffect(() => {
    if (!menuRef.current || !position) return;

    const rect = menuRef.current.getBoundingClientRect();
    const padding = 5;

    let left = position.x;
    let top = position.y;

    // 👉 Flip horizontally if overflow right
    if (left + rect.width > window.innerWidth) {
      left = position.x - rect.width;
    }

    // 👉 Clamp to left edge
    if (left < padding) {
      left = padding;
    }

    // 👉 Flip vertically if overflow bottom
    if (top + rect.height > window.innerHeight) {
      top = position.y - rect.height;
    }

    // 👉 Clamp to top edge
    if (top < padding) {
      top = padding;
    }

    if (left < position.x) originX = "right";
    if (top < position.y) originY = "bottom";

    setCoords({ left, top });
  }, [position]);

  if (!position) return null;

  return createPortal(
    <motion.div
      ref={menuRef}
      key="contextMenu"
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed min-w-40 bg-white flex flex-col border-2 border-gray-200 drop-shadow-md rounded-md"
      style={{
        top: coords.top,
        left: coords.left,
        transformOrigin: `${originY} ${originX}`,
      }}
    >
      {children}
    </motion.div>,
    document.body
  );
}