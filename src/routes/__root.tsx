import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Shell } from "@/components/shell";
import { NotFound } from "@/components/states";
import { getSite } from "@/lib/marketplace/fns";
import { defaultSite, type SiteConfig } from "@/lib/site";
import { homeDescription, homeTitle } from "@/lib/seo";
import appCss from "../styles.css?url";

let browserSite: SiteConfig | null = null;

export const Route = createRootRouteWithContext<{ site: SiteConfig }>()({
  beforeLoad: async () => {
    if (typeof window !== "undefined" && browserSite) return { site: browserSite };
    try {
      const site = await getSite();
      if (typeof window !== "undefined") browserSite = site;
      return { site };
    } catch {
      return { site: defaultSite };
    }
  },
  head: ({ matches }) => {
    const site = (matches[0]?.context as { site?: SiteConfig } | undefined)?.site ?? defaultSite;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: homeTitle(site) },
        { name: "description", content: site.metaDescription || homeDescription(site) },
        { name: "theme-color", content: "#0f3d34" },
        ...(site.googleVerification
          ? [{ name: "google-site-verification", content: site.googleVerification }]
          : []),
      ],
      links: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600&display=swap",
        },
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      ],
    };
  },
  component: Root,
  notFoundComponent: NotFound,
});

function Root() {
  return (
    <html lang="en" dir="ltr" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Shell>
            <Outlet />
          </Shell>
          <Toaster position="top-center" />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
