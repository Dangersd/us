import type { ReactNode } from "react";

import type { Metadata, Viewport } from "next";

import { fraunces, geist, inter } from "~app/fonts";
import Providers from "~components/providers/Providers";
import { cn } from "~libs/utils";
import "~styles/globals.css";

export const metadata: Metadata = {
    title: "us",
    description: "Цифровой дом для двоих",
    manifest: "/manifest.webmanifest",
    icons: {
        icon: "/icon.svg",
        apple: "/apple-touch-icon.png",
    },
    appleWebApp: {
        capable: true,
        title: "us",
        // "default" в 0.2: непрозрачный bar, контент не уходит под notch без safe-area-top.
        // Phase 0.4 переключит на "black-translucent" вместе с TopBar + env(safe-area-inset-top).
        statusBarStyle: "default",
    },
};

export const viewport: Viewport = {
    themeColor: "#0E0B14",
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
    <html
        lang="ru"
        className={cn(
            "dark",
            fraunces.variable,
            inter.variable,
            geist.variable,
        )}
    >
        <body className={cn("min-h-dvh antialiased")}>
            <Providers>{children}</Providers>
        </body>
    </html>
);

export default RootLayout;
