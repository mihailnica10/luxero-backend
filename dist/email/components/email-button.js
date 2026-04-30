import { jsx as _jsx } from "hono/jsx/jsx-runtime";
// @ts-nocheck
import { Button } from "@react-email/components";
import { emailDesignSystem } from "../design-system";
export function EmailButton({ href, children, variant = "primary", className = "" }) {
    const buttonConfig = emailDesignSystem.buttons[variant];
    return (_jsx(Button, { href: href, className: `inline-block text-center no-underline ${className}`, style: {
            backgroundColor: buttonConfig.backgroundColor,
            color: buttonConfig.color,
            padding: `${buttonConfig.paddingVertical} ${buttonConfig.paddingHorizontal}`,
            fontSize: buttonConfig.fontSize,
            fontWeight: buttonConfig.fontWeight,
            borderRadius: buttonConfig.borderRadius,
            border: `1px solid ${buttonConfig.borderColor}`,
            textDecoration: "none",
            display: "inline-block",
            ...("shadow" in buttonConfig ? { boxShadow: buttonConfig.shadow } : {}),
        }, children: children }));
}
export default EmailButton;
