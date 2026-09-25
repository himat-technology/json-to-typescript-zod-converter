"use client";

import { Globe, Mail, Phone, ExternalLink } from "lucide-react";
import { HIMAT } from "@/lib/himat";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 13.5h2.5l1-4H14V7.5c0-1.03.03-2 2-2h1.5V2.14C17.22 2.05 16.09 2 15.14 2 12.28 2 10.5 3.79 10.5 7.15V9.5H8v4h2.5V22h3.5v-8.5z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.94 6.5A2 2 0 1 1 6.93 2.5a2 2 0 0 1 .01 4zM7 8.75H3.25V21.5H7V8.75zM13.32 8.75h-3.6V21.5h3.58v-6.55c0-1.73.8-2.84 2.32-2.84 1.4 0 2.08.97 2.08 2.84V21.5H21.5v-7.2c0-3.7-1.98-5.42-4.62-5.42-2.13 0-3.08 1.18-3.56 2.01h-.05V8.75z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.75 6a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
    </svg>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer mt-8">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div
                className="brand-mark flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                aria-hidden="true"
              >
                HM
              </div>
              <div>
                <p className="font-bold text-foreground">{HIMAT.name}</p>
                <p className="text-sm text-muted">Free developer tools · Privacy-first</p>
              </div>
            </div>
            <p className="mt-3 max-w-md text-sm text-muted leading-relaxed">
              Convert JSON to TypeScript &amp; Zod entirely in your browser.
              Built by HiMat Technology.
            </p>
            <a
              href={HIMAT.demo}
              className="btn btn-primary mt-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Live Demo
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div>
            <p className="text-sm font-bold text-foreground">Contact</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={HIMAT.website}
                  className="inline-flex items-center gap-2 text-muted hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
                  {HIMAT.websiteLabel}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${HIMAT.email}`}
                  className="inline-flex items-center gap-2 text-muted hover:text-primary"
                >
                  <Mail className="h-4 w-4 text-accent-2" aria-hidden="true" />
                  {HIMAT.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${HIMAT.phoneTel}`}
                  className="inline-flex items-center gap-2 text-muted hover:text-primary"
                >
                  <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                  {HIMAT.phone}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-foreground">Follow us</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={HIMAT.social.facebook}
                className="social-link social-facebook"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="HiMat Technology on Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href={HIMAT.social.linkedin}
                className="social-link social-linkedin"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="HiMat Technology on LinkedIn"
              >
                <LinkedInIcon className="h-4 w-4" />
              </a>
              <a
                href={HIMAT.social.instagram}
                className="social-link social-instagram"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="HiMat Technology on Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={HIMAT.website}
                className="social-link social-web"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit himat.co.in"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${HIMAT.email}`}
                className="social-link social-mail"
                aria-label={`Email ${HIMAT.email}`}
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href={`tel:${HIMAT.phoneTel}`}
                className="social-link social-phone"
                aria-label={`Call ${HIMAT.phone}`}
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-xs text-muted">
              Demo:{" "}
              <a
                href={HIMAT.demo}
                className="font-medium text-primary hover:underline break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                himat.tech/free-tools/…
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-card-border pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {HIMAT.name} · JSON to TypeScript &amp; Zod Converter
          </p>
          <p>Client-side only · MIT License</p>
        </div>
      </div>
    </footer>
  );
}
