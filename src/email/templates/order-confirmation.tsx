// @ts-nocheck
import { Button, Hr, Link, Section, Text } from "@react-email/components";
import { emailConfig } from "../config";
import { BaseEmail, emailStyles } from "./base";

export function OrderConfirmationEmail({
  userName,
  orderId,
  orderDate,
  items,
  subtotal,
  discount,
  total,
}) {
  return (
    <BaseEmail preview={`Your Luxero order #${orderId} is confirmed!`}>
      <Text className={emailStyles.heading.className}>Order Confirmed!</Text>
      <Text className={emailStyles.paragraph.className}>Hi {userName},</Text>
      <Text className={emailStyles.paragraph.className}>
        Thank you for your order! Your tickets have been secured and you&apos;re now entered into
        the competition. Good luck!
      </Text>
      <Section
        className="mb-[16px] rounded-[12px] border border-[#27272A] bg-[#0A0A0B] p-[20px]"
        style={{ borderWidth: "1px", borderStyle: "solid" }}
      >
        <Text className="m-0 mb-[4px] text-[11px] uppercase tracking-wide font-semibold text-[#A1A1AA]">
          Order Number
        </Text>
        <Text className="m-0 mb-[16px] text-[15px] font-semibold text-[#FFFFFF]">#{orderId}</Text>
        <Text className="m-0 mb-[4px] text-[11px] uppercase tracking-wide font-semibold text-[#A1A1AA]">
          Order Date
        </Text>
        <Text className="m-0 text-[15px] font-semibold text-[#FFFFFF]">{orderDate}</Text>
      </Section>
      <Hr className={emailStyles.divider.className} />
      <Text className="mb-[16px] text-[17px] font-semibold text-[#FFFFFF]">Order Details</Text>
      {items.map((item, index) => (
        <Section
          key={index}
          className="mb-[12px] rounded-[12px] border border-[#27272A] bg-[#0A0A0B] p-[16px]"
          style={{ borderWidth: "1px", borderStyle: "solid" }}
        >
          <Text className="m-0 mb-[8px] text-[15px] font-semibold text-[#FFFFFF]">
            {item.competitionTitle}
          </Text>
          <Text className="m-0 mb-[8px] text-[14px] text-[#A1A1AA]">
            {item.quantity} ticket{item.quantity > 1 ? "s" : ""} @ £{item.unitPrice.toFixed(2)} each
          </Text>
          <Text className="m-0 mb-[8px] text-[14px] font-semibold text-[#D4AF37]">
            Ticket Numbers: {item.ticketNumbers.join(", ")}
          </Text>
          <Text className="m-0 text-right text-[15px] font-semibold text-[#FFFFFF]">
            £{item.totalPrice.toFixed(2)}
          </Text>
        </Section>
      ))}
      <Hr className={emailStyles.divider.className} />
      <Section className="mt-[16px]">
        <Text className="flex justify-between text-[14px] text-[#FFFFFF]">
          <span>Subtotal:</span>
          <span>£{subtotal.toFixed(2)}</span>
        </Text>
        {discount && discount > 0 && (
          <Text className="flex justify-between text-[14px] text-[#22C55E]">
            <span>Discount:</span>
            <span>-£{discount.toFixed(2)}</span>
          </Text>
        )}
        <Text
          className="mt-[12px] flex justify-between border-t border-[#27272A] pt-[12px] text-[17px] font-semibold text-[#D4AF37]"
          style={{ borderTopWidth: "1px", borderTopStyle: "solid" }}
        >
          <span>Total:</span>
          <span>£{total.toFixed(2)}</span>
        </Text>
      </Section>
      <Hr className={emailStyles.divider.className} />
      <Text className={emailStyles.paragraph.className}>
        You can view your tickets and track draw dates in your dashboard.
      </Text>
      <Section className="my-[24px] text-center">
        <Button
          href={`${emailConfig.site.url}/dashboard/tickets`}
          className={emailStyles.button.className}
        >
          View My Tickets
        </Button>
      </Section>
      <Hr className={emailStyles.divider.className} />
      <Text className={emailStyles.muted.className}>
        Questions about your order? Contact us at{" "}
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

export default OrderConfirmationEmail;
