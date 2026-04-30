/**
 * Email Configuration for Luxero.win
 *
 * Resend API: https://resend.com/api-keys
 * Configure these environment variables:
 * - RESEND_API_KEY: your-resend-api-key
 */
export const emailConfig = {
    // Resend API Configuration
    resend: {
        apiKey: process.env.RESEND_API_KEY,
    },
    // Default sender
    from: {
        name: "Luxero",
        email: "noreply@luxero.win",
    },
    // Reply-to address
    replyTo: "support@luxero.win",
    // Email addresses for different purposes
    addresses: {
        support: "support@luxero.win",
        noreply: "noreply@luxero.win",
        legal: "legal@luxero.win",
        privacy: "privacy@luxero.win",
    },
    // Site information for emails
    site: {
        name: "Luxero",
        url: process.env.FRONTEND_URL || "http://localhost:5173",
        logo: "https://luxero.win/logo.png",
    },
    // Social links for email footers
    social: {
        twitter: "https://twitter.com/luxerowin",
        instagram: "https://instagram.com/luxerowin",
        facebook: "https://facebook.com/luxerowin",
    },
};
