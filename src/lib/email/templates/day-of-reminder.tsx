import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type DayOfReminderEmailProps = {
  recipientName: string;
  occasionType: string;
  viewUrl?: string;
};

export function DayOfReminderEmail({
  recipientName = "John",
  occasionType = "Birthday",
  viewUrl = "https://gifto.app",
}: DayOfReminderEmailProps) {
  const previewText = `Today is ${recipientName}'s ${occasionType}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={celebrationSection}>
            <Text style={celebrationEmoji}>🎉</Text>
          </Section>

          <Heading style={heading}>
            Today is {recipientName}&apos;s {occasionType}!
          </Heading>

          <Section style={messageSection}>
            <Text style={paragraph}>
              Just a friendly reminder that today is a special day for{" "}
              <strong>{recipientName}</strong>!
            </Text>
            <Text style={paragraph}>
              Take a moment to reach out and wish them well. Whether it&apos;s a
              quick call, a heartfelt message, or spending some quality time
              together, your thoughtfulness will mean the world to them.
            </Text>
          </Section>

          <Section style={tipSection}>
            <Text style={tipText}>
              <strong>Quick ideas:</strong>
            </Text>
            <Text style={tipItem}>Send a thoughtful text or call</Text>
            <Text style={tipItem}>Share a favorite memory</Text>
            <Text style={tipItem}>Plan something special together</Text>
          </Section>

          <Hr style={hr} />

          <Section style={buttonSection}>
            <Button style={button} href={viewUrl}>
              Open Gifto
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You&apos;re receiving this email because you have day-of reminders
            enabled in Gifto. You can update your reminder preferences in your{" "}
            <Link href={`${viewUrl}/settings`} style={footerLink}>
              settings
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  marginBottom: "64px",
  borderRadius: "8px",
  maxWidth: "600px",
};

const celebrationSection = {
  textAlign: "center" as const,
  marginBottom: "16px",
};

const celebrationEmoji = {
  fontSize: "48px",
  margin: "0",
};

const heading = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600" as const,
  lineHeight: "1.3",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const messageSection = {
  backgroundColor: "#ecfdf5",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
};

const paragraph = {
  color: "#065f46",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const tipSection = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px 20px",
  marginBottom: "24px",
};

const tipText = {
  color: "#1a1a1a",
  fontSize: "14px",
  lineHeight: "1.4",
  margin: "0 0 8px",
};

const tipItem = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.4",
  margin: "0 0 4px",
  paddingLeft: "12px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "24px 0",
};

const buttonSection = {
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#10b981",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600" as const,
  lineHeight: "1",
  padding: "12px 24px",
  textDecoration: "none",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "1.6",
  textAlign: "center" as const,
};

const footerLink = {
  color: "#2563eb",
  textDecoration: "underline",
};

export default DayOfReminderEmail;
