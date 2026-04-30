// @ts-nocheck
import { Button, Hr, Link, Section, Text } from "@react-email/components";
import { emailConfig } from "../config";
import { BaseEmail, emailStyles } from "./base";

export function WelcomeEmail({ userName, verificationUrl }) {
  return (
    <BaseEmail preview={`Welcome to Luxero, ${userName}! Start winning luxury prizes today.`}>
      <Text className={emailStyles.heading.className}>Welcome to Luxero!</Text>
      <Text className={emailStyles.paragraph.className}>Hi {userName},</Text>
      <Text className={emailStyles.paragraph.className}>
        Thank you for joining Luxero! You&apos;re now part of a community of winners competing for
        incredible luxury prizes.
      </Text>
      {verificationUrl && (
        <>
          <Text className={emailStyles.paragraph.className}>
            Please verify your email address to complete your registration:
          </Text>
          <Section className="my-[24px] text-center">
            <Button href={verificationUrl} className={emailStyles.button.className}>
              Verify Email Address
            </Button>
          </Section>
          <Text className={emailStyles.muted.className}>
            If the button above doesn&apos;t work, copy and paste this URL into your browser:
            <br />
            <Link href={verificationUrl} className="text-[#D4AF37] no-underline">
              {verificationUrl}
            </Link>
          </Text>
          <Hr className={emailStyles.divider.className} />
        </>
      )}
      <Text className={emailStyles.subheading.className}>What&apos;s Next?</Text>
      <Text className={emailStyles.paragraph.className}>
        <span className="font-semibold text-[#D4AF37]">1. Browse Competitions</span>
        <br />
        Explore our active competitions and find prizes you&apos;d love to win.
      </Text>
      <Text className={emailStyles.paragraph.className}>
        <span className="font-semibold text-[#D4AF37]">2. Purchase Tickets</span>
        <br />
        Select the number of tickets you want and answer a simple skill question.
      </Text>
      <Text className={emailStyles.paragraph.className}>
        <span className="font-semibold text-[#D4AF37]">3. Wait for the Draw</span>
        <br />
        Track your entries in your dashboard and watch our live draws.
      </Text>
      <Section className="my-[24px] text-center">
        <Button
          href={`${emailConfig.site.url}/competitions`}
          className={emailStyles.button.className}
        >
          Start Browsing Competitions
        </Button>
      </Section>
      <Hr className={emailStyles.divider.className} />
      <Text className={emailStyles.muted.className}>
        Questions? Contact our support team at{" "}
        <Link
          href={`mailto:${emailConfig.addresses.support}`}
          className="text-[#D4AF37] no-underline"
        >
          {emailConfig.addresses.support}
        </Link>
      </Text>
      <Text className={emailStyles.paragraph.className}>
        Good luck!
        <br />
        The Luxero Team
      </Text>
    </BaseEmail>
  );
}

export default WelcomeEmail;
