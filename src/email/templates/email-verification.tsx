// @ts-nocheck
import { Button, Hr, Link, Section, Text } from "@react-email/components";
import { emailConfig } from "../config";
import { BaseEmail, emailStyles } from "./base";

export function EmailVerificationEmail({ userName, code, verificationUrl }) {
  return (
    <BaseEmail preview={`Verify your email — code: ${code}`}>
      <Text className={emailStyles.heading.className}>Verify Your Email</Text>
      <Text className={emailStyles.paragraph.className}>Hi {userName},</Text>
      <Text className={emailStyles.paragraph.className}>
        Welcome to Luxero! To complete your registration and start winning incredible prizes, please
        verify your email address using the code below.
      </Text>
      <Section className="my-[32px] text-center">
        <Text
          className="m-0 mb-[8px] text-[36px] font-semibold tracking-[0.2em] text-[#D4AF37]"
          style={{ fontFamily: "ui-monospace, monospace" }}
        >
          {code}
        </Text>
        <Text className={emailStyles.muted.className}>Enter this code to verify your email</Text>
      </Section>
      <Section className="my-[24px] text-center">
        <Button href={verificationUrl} className={emailStyles.button.className}>
          Verify Email Address
        </Button>
      </Section>
      <Text className={emailStyles.muted.className}>
        If the button above doesn&apos;t work, copy and paste this URL into your browser:
        <br />
        <Link href={verificationUrl} className="break-all text-[#D4AF37] no-underline">
          {verificationUrl}
        </Link>
      </Text>
      <Hr className={emailStyles.divider.className} />
      <Section
        className="my-[16px] rounded-[8px] border-l-4 border-[#D4AF37] bg-[#0A0A0B] px-[20px] py-[16px]"
        style={{
          borderLeftWidth: "4px",
          borderLeftStyle: "solid",
          backgroundColor: "rgba(212, 175, 55, 0.1)",
        }}
      >
        <Text className="m-0 text-[14px] leading-[22px] text-[#A1A1AA]">
          <strong className="text-[#D4AF37]">Security Notice:</strong> This verification code
          expires in 24 hours. If you didn&apos;t create an account with Luxero, please ignore this
          email — your email will not be used.
        </Text>
      </Section>
      <Hr className={emailStyles.divider.className} />
      <Text className="mb-[16px] text-[17px] font-semibold text-[#FFFFFF]">What&apos;s Next?</Text>
      <Text className={emailStyles.paragraph.className}>
        <span className="font-semibold text-[#D4AF37]">1. Browse Competitions</span>
        <br />
        Explore luxury prizes from tech to dream experiences.
      </Text>
      <Text className={emailStyles.paragraph.className}>
        <span className="font-semibold text-[#D4AF37]">2. Get Your Tickets</span>
        <br />
        Answer a skill question and secure your entries.
      </Text>
      <Text className={emailStyles.paragraph.className}>
        <span className="font-semibold text-[#D4AF37]">3. Win Big</span>
        <br />
        Live draws, instant notifications, insured delivery.
      </Text>
      <Section className="my-[24px] text-center">
        <Button
          href={`${emailConfig.site.url}/competitions`}
          className={emailStyles.button.className}
        >
          Start Browsing Competitions
        </Button>
      </Section>
      <Text className={emailStyles.paragraph.className}>
        Good luck!
        <br />
        The Luxero Team
      </Text>
    </BaseEmail>
  );
}

export default EmailVerificationEmail;
