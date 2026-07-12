"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (active) {
        setMounted(true);
      }
    }, 0);
    return () => {
      active = false;
    };
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative h-10 w-10">
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    // Show Laptop icon if explicitly set to system
    if (theme === "system") {
      return <Laptop className="h-5 w-5" key="system" />;
    }
    // Show Sun or Moon depending on resolved theme
    if (resolvedTheme === "dark") {
      return <Moon className="h-5 w-5 text-accent" key="dark" />;
    }
    return <Sun className="h-5 w-5 text-accent" key="light" />;
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="relative overflow-hidden h-10 w-10 rounded-full"
      aria-label={`Current theme: ${theme}. Click to change.`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme + (resolvedTheme || "")}
          initial={{ y: 20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-center"
        >
          {getIcon()}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
