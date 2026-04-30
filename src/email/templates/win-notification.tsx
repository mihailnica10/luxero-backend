// @ts-nocheck
import { Button, Hr, Link, Section, Text } from "@react-email/components";
import { emailConfig } from "../config";
import { BaseEmail, emailStyles } from "./base";

export function WinNotificationEmail({
  userName,
  competitionName,
  prizeTitle,
  prizeValue,
  claimUrl,
}) {
  return (
    <BaseEmail preview={`Congratulations! You've won ${prizeTitle}!`}>
      <Text className="mb-[16px] text-center text-[24px] font-bold text-[#FFFFFF]">
        You&apos;re a Winner!
      </Text>
      <Text className={emailStyles.paragraph.className}>Hi {userName},</Text>
      <Text className={emailStyles.paragraph.className}>
        We&apos;re thrilled to inform you that you&apos;ve won in the{" "}
        <strong>{competitionName}</strong> competition!
      </Text>
      <Section
        className="my-[24px] rounded-[12px] border-2 border-[#D4AF37] bg-[#0A0A0B] p-[24px] text-center"
        style={{ borderWidth: "2px", borderStyle: "solid" }}
      >
        <Text className="m-0 mb-[8px] text-[11px] uppercase tracking-widest text-[#A1A1AA]">
          Your Prize
        </Text>
        <Text className="m-0 mb-[8px] text-[20px] font-semibold text-[#D4AF37]">{prizeTitle}</Text>
        <Text className="m-0 text-[17px] text-[#FFFFFF]">{prizeValue}</Text>
      </Section>
      <Section className="my-[32px] text-center">
        <Button
          href={claimUrl}
          className="bg-[#D4AF37] rounded-[6px] px-[32px] py-[16px] text-[17px] font-semibold text-[#0A0A0B] no-underline inline-block text-center"
        >
          Claim Your Prize
        </Button>
      </Section>
      <Section
        className="my-[24px] rounded-[12px] border border-[#27272A] bg-[#0A0A0B] p-[20px]"
        style={{ borderWidth: "1px", borderStyle: "solid" }}
      >
        <Text className="mb-[12px] text-[15px] font-semibold text-[#FFFFFF]">Next Steps</Text>
        <Text className="m-0 mb-[8px] text-[14px] leading-[22px] text-[#FFFFFF]">
          <span className="font-semibold text-[#D4AF37]">1.</span> Click the button above to claim
          your prize
        </Text>
        <Text className="m-0 mb-[8px] text-[14px] leading-[22px] text-[#FFFFFF]">
          <span className="font-semibold text-[#D4AF37]">2.</span> Verify your shipping address (if
          applicable)
        </Text>
        <Text className="m-0 text-[14px] leading-[22px] text-[#FFFFFF]">
          <span className="font-semibold text-[#D4AF37]">3.</span> We&apos;ll arrange delivery
          within 3-5 business days
        </Text>
      </Section>
      <Text className={emailStyles.paragraph.className}>
        Congratulations once again! This is a life-changing moment — we can&apos;t wait to see you
        enjoy your prize!
      </Text>
      <Hr className={emailStyles.divider.className} />
      <Text className={emailStyles.muted.className}>
        Have questions about your prize? Contact us at{" "}
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

export default WinNotificationEmail;
