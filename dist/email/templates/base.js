import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
// @ts-nocheck
import { Body, Container, Font, Head, Html, Link, Preview, Section, Tailwind, Text, } from "@react-email/components";
import { emailConfig } from "../config";
export function BaseEmail({ preview, children }) {
    return (_jsx(Tailwind, { config: {
            theme: {
                extend: {
                    colors: {
                        gold: "#D4AF37",
                        background: "#0A0A0B",
                        card: "#1A1A1D",
                        foreground: "#FFFFFF",
                        muted: "#A1A1AA",
                        border: "#27272A",
                        danger: "#EF4444",
                    },
                    fontFamily: { sans: ["Plus Jakarta Sans", "Arial", "sans-serif"] },
                },
            },
        }, children: _jsxs(Html, { children: [_jsxs(Head, { children: [_jsx(Font, { fontFamily: "Plus Jakarta Sans", fallbackFontFamily: "Arial", webFont: {
                                url: "https://fonts.gstatic.com/s/plusjakartasans/v8/IJ9aO5Lnw3FPMv7nI5H1U.woff2",
                                format: "woff2",
                            }, fontWeight: 400, fontStyle: "normal" }), _jsx(Font, { fontFamily: "Plus Jakarta Sans", fallbackFontFamily: "Arial", webFont: {
                                url: "https://fonts.gstatic.com/s/plusjakartasans/v8/IJ9aO5Lnw3FPMv7nI5H1U.woff2",
                                format: "woff2",
                            }, fontWeight: 600, fontStyle: "normal" })] }), _jsx(Preview, { children: preview }), _jsx(Body, { className: "mx-auto my-auto px-[8px]", style: { backgroundColor: "#0A0A0B", fontFamily: "Plus Jakarta Sans, Arial, sans-serif" }, children: _jsxs(Container, { className: "mx-auto my-[40px] max-w-[600px]", children: [_jsx(Section, { className: "p-[32px] text-center", children: _jsx(Link, { href: emailConfig.site.url, children: _jsx(Text, { className: "m-0 text-[32px] font-bold text-[#D4AF37] no-underline", children: "Luxero" }) }) }), _jsx(Section, { className: "mx-[24px] my-0 rounded-[12px] border border-solid bg-[#1A1A1D] p-[32px]", style: {
                                    borderColor: "#27272A",
                                    borderRadius: "12px",
                                    backgroundColor: "#1A1A1D",
                                    padding: "32px",
                                }, children: children }), _jsxs(Section, { className: "p-[32px] text-center", children: [_jsxs(Text, { className: "m-[8px] text-center text-[12px] leading-[20px] text-[#A1A1AA]", children: ["This email was sent by Luxero.win", _jsx("br", {}), "Premium Prize Competitions"] }), _jsxs(Text, { className: "m-[16px] text-center text-[12px] text-[#A1A1AA]", children: [_jsx(Link, { href: emailConfig.social.twitter, className: "text-[#D4AF37] no-underline", children: "Twitter" }), " ", "|", " ", _jsx(Link, { href: emailConfig.social.instagram, className: "text-[#D4AF37] no-underline", children: "Instagram" }), " ", "|", " ", _jsx(Link, { href: emailConfig.social.facebook, className: "text-[#D4AF37] no-underline", children: "Facebook" })] }), _jsxs(Text, { className: "m-[8px] text-center text-[12px] text-[#A1A1AA]", children: [_jsx(Link, { href: `${emailConfig.site.url}/privacy`, className: "text-[#A1A1AA] underline", children: "Privacy Policy" }), " ", "|", " ", _jsx(Link, { href: `${emailConfig.site.url}/terms`, className: "text-[#A1A1AA] underline", children: "Terms of Service" }), " ", "|", " ", _jsx(Link, { href: `${emailConfig.site.url}/contact`, className: "text-[#A1AA] underline", children: "Contact Us" })] }), _jsxs(Text, { className: "m-[24px] text-center text-[11px] text-[#A1A1AA]", children: ["\u00A9 ", new Date().getFullYear(), " Luxero. All rights reserved."] })] })] }) })] }) }));
}
export const emailStyles = {
    heading: { className: "text-[24px] font-semibold text-center text-[#FFFFFF] mb-[16px]" },
    subheading: { className: "text-[20px] font-semibold text-[#FFFFFF] mb-[16px]" },
    paragraph: { className: "text-[15px] leading-[24px] text-[#FFFFFF] mb-[16px]" },
    button: {
        className: "bg-[#D4AF37] rounded-[6px] text-[#0A0A0B] font-semibold px-[24px] py-[12px] no-underline inline-block text-center",
    },
    divider: { className: "mx-0 my-[24px] w-full border border-solid" },
    muted: { className: "text-[12px] leading-[20px] text-[#A1A1AA]" },
};
