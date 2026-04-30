// @ts-nocheck
import { Hr, Link, Text } from "@react-email/components";
import { emailConfig } from "../config";

export function EmailFooter({ showSocial = true, showLinks = true }) {
  return (
    <>
      <Hr
        className="mx-0 my-[24px] w-full border border-solid"
        style={{ borderColor: "#27272A" }}
      />
      <Text className="m-[8px] text-center text-[12px] leading-[20px] text-[#A1A1AA]">
        This email was sent by Luxero.win
        <br />
        Premium Prize Competitions
      </Text>
      {showSocial && (
        <Text className="m-[16px] text-center text-[12px] text-[#A1A1AA]">
          <Link href={emailConfig.social.twitter} className="text-[#D4AF37] no-underline">
            Twitter
          </Link>{" "}
          |{" "}
          <Link href={emailConfig.social.instagram} className="text-[#D4AF37] no-underline">
            Instagram
          </Link>{" "}
          |{" "}
          <Link href={emailConfig.social.facebook} className="text-[#D4AF37] no-underline">
            Facebook
          </Link>
        </Text>
      )}
      {showLinks && (
        <Text className="m-[8px] text-center text-[12px] text-[#A1A1AA]">
          <Link href={`${emailConfig.site.url}/privacy`} className="text-[#A1A1AA] underline">
            Privacy Policy
          </Link>{" "}
          |{" "}
          <Link href={`${emailConfig.site.url}/terms`} className="text-[#A1A1AA] underline">
            Terms of Service
          </Link>{" "}
          |{" "}
          <Link href={`${emailConfig.site.url}/contact`} className="text-[#A1A1AA] underline">
            Contact Us
          </Link>
        </Text>
      )}
      <Text className="m-[24px] text-center text-[11px] text-[#A1A1AA]">
        &copy; {new Date().getFullYear()} Luxero. All rights reserved.
      </Text>
    </>
  );
}

export default EmailFooter;
