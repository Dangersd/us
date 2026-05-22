import type { ReactNode } from "react";

import type { Metadata, Viewport } from "next";

import { fraunces, geist, inter } from "~app/fonts";
import Providers from "~components/providers/Providers";
import AtmosphereBootScript from "~components/shell/AtmosphereBootScript";
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
        // TopBar держит env(safe-area-inset-top), статус-бар может уйти прозрачным.
        statusBarStyle: "black-translucent",
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
        <head>
            <AtmosphereBootScript />
        </head>
        <body className={cn("min-h-dvh antialiased")}>
            <Providers>{children}</Providers>
        </body>
    </html>
);

export default RootLayout;
