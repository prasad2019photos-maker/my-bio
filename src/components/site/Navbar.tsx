import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ArrowUpRight, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVICE_WEBSITE_URL } from "@/lib/config";

const NAV = [
  { label: "WORK", href: "#work" },
  { label: "ABOUT", href: "#about" },
  { label: "CONTACT", href: "#contact" },
];

const MENU_LINKS: Array<{ label: string; href?: string; children?: { label: string; href: string }[] }> = [
  { label: "WORK", href: "#work" },
  { label: "ABOUT", href: "#about" },
  { label: "CONTACT", href: "#contact" },
];

export function Navbar({ email, homeHref = "/" }: { email: string; homeHref?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // mobile full screen
  const [desktopOpen, setDesktopOpen] = useState(false); // desktop dropdown
  const [theme, setTheme] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close desktop menu on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = menuRef.current;
      const btn = buttonRef.current;
      if (!desktopOpen) return;
      if (el && !el.contains(e.target as Node) && btn && !btn.contains(e.target as Node)) {
        setDesktopOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [desktopOpen]);

  // Theme init — always start in light theme on load
  useEffect(() => {
    // Ignore stored preference and OS setting on initial load so the site always loads light.
    setTheme("light");
    // Ensure dark class is not present initially.
    document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  const isHome = homeHref === "/";
  const href = (hash: string) => (isHome ? hash : `/${hash}`);
  const themeButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-background text-muted-foreground transition-colors hover:bg-foreground hover:text-background";

  const navigateTo = (hash: string) => {
    const targetHash = isHome ? hash : `/${hash}`;
    if (isHome) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.location.href = targetHash;
    }
    // close menus
    setOpen(false);
    setDesktopOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border transition-colors duration-300",
          scrolled ? "bg-background/85 backdrop-blur-md" : "bg-transparent",
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-5 md:px-10"
        >
          <Link to="/" className="text-sm font-bold tracking-[0.28em] uppercase" onClick={() => setOpen(false)}>
            PRSAD
          </Link>

          {/* Desktop/right controls: CTA, Theme Toggle, 3-bar Menu */}
          <div className="hidden items-center gap-4 md:flex">
            <a
              href={SERVICE_WEBSITE_URL}
              className="eyebrow inline-flex min-h-[36px] items-center gap-1.5 border border-foreground bg-foreground px-4 py-2 text-background transition-colors duration-300 hover:bg-transparent hover:text-foreground"
            >
              LET&apos;S TALK <ArrowUpRight className="h-3 w-3" strokeWidth={2.2} />
            </a>

            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className={themeButtonClass}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* 3-bar menu button (desktop) */}
            <div className="relative">
              <button
                ref={buttonRef}
                type="button"
                aria-expanded={desktopOpen}
                aria-label={desktopOpen ? "Close menu" : "Open menu"}
                onClick={() => setDesktopOpen((v) => !v)}
                className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-background p-1"
              >
                <span
                  className={cn(
                    "block h-[2px] w-5 bg-current transition-transform duration-300",
                    desktopOpen ? "translate-y-0 rotate-45" : "-translate-y-1.5"
                  )}
                />
                <span
                  className={cn(
                    "block h-[2px] w-5 bg-current absolute transition-opacity duration-200",
                    desktopOpen ? "opacity-0" : "opacity-100"
                  )}
                />
                <span
                  className={cn(
                    "block h-[2px] w-5 bg-current transition-transform duration-300",
                    desktopOpen ? "translate-y-0 -rotate-45" : "translate-y-1.5"
                  )}
                />
              </button>

              {desktopOpen && (
                <div
                  ref={menuRef}
                className="absolute right-0 mt-2 w-56 origin-top-right rounded-sm border border-border bg-background p-3 shadow-lg animate-fade-in-down"
                >
                  <ul className="flex flex-col">
                  {MENU_LINKS.map((item) => {
                    if (item.children && item.children.length > 0) {
                      return (
                        <li key={item.label} className="pt-2 border-t border-border">
                          <div className="text-xs font-semibold text-muted-foreground mb-2">{item.label}</div>
                          <ul className="ml-1">
                            {item.children.map((c) => (
                              <li key={c.label}>
                                <button
                                  onClick={() => navigateTo(c.href)}
                                  className="w-full text-left py-1 text-sm tracking-wide hover:text-foreground"
                                >
                                  {c.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </li>
                      );
                    }
                    return (
                      <li key={item.label}>
                        <button
                          onClick={() => navigateTo(item.href ?? "#")}
                          className="w-full text-left py-2 text-sm tracking-wide hover:text-foreground"
                        >
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className={cn(themeButtonClass, "h-10 w-10")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="-mr-2 flex h-11 w-11 items-center justify-center"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile full-screen menu */}
      {open && (
        <div className="fixed inset-0 z-40 flex flex-col justify-between bg-background px-5 pt-24 pb-10 md:hidden">
          <ul className="flex flex-col">
            {MENU_LINKS.map((item, i) => {
              if (item.children && item.children.length > 0) {
                return (
                  <li key={item.label} className="border-b border-border">
                    <div className="py-5 display-lg text-[13vw] leading-none font-semibold text-muted-foreground">
                      {item.label}
                    </div>
                    <ul>
                      {item.children.map((c, idx) => (
                        <li key={c.label} className="border-t border-border">
                          <button
                            onClick={() => navigateTo(c.href)}
                            className="display-lg block py-5 pl-4 text-[11vw] leading-none"
                            style={{ transitionDelay: `${(i + idx) * 40}ms` }}
                          >
                            {c.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }
              return (
                <li key={item.label} className="border-b border-border">
                  <button
                    onClick={() => navigateTo(item.href ?? "#")}
                    className="display-lg block py-5 text-[13vw] leading-none"
                    style={{ transitionDelay: `${i * 40}ms` }}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <a
            href={SERVICE_WEBSITE_URL}
            onClick={() => setOpen(false)}
            className="eyebrow inline-flex min-h-[52px] items-center justify-center gap-2 border border-foreground bg-foreground text-background"
          >
            LET&apos;S TALK <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </>
  );
}
