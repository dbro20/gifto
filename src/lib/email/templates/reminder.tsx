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

type GiftIdea = {
  id: string;
  title: string;
  price: string | null;
  url: string | null;
};

type ReminderEmailProps = {
  recipientName: string;
  occasionType: string;
  occasionDate: string;
  daysUntil: number;
  giftIdeas: GiftIdea[];
  viewUrl?: string;
};

export function ReminderEmail({
  recipientName = "John",
  occasionType = "Birthday",
  occasionDate = "January 15, 2025",
  daysUntil = 7,
  giftIdeas = [],
  viewUrl = "https://gifto.app",
}: ReminderEmailProps) {
  const previewText = `${recipientName}'s ${occasionType} is in ${daysUntil} day${daysUntil === 1 ? "" : "s"}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Upcoming Occasion Reminder</Heading>

          <Section style={alertSection}>
            <Text style={alertText}>
              {daysUntil === 1 ? (
                <>
                  <strong>{recipientName}&apos;s {occasionType}</strong> is{" "}
                  <strong>tomorrow</strong>!
                </>
              ) : (
                <>
                  <strong>{recipientName}&apos;s {occasionType}</strong> is in{" "}
                  <strong>{daysUntil} days</strong>!
                </>
              )}
            </Text>
            <Text style={dateText}>Date: {occasionDate}</Text>
          </Section>

          {giftIdeas.length > 0 && (
            <>
              <Hr style={hr} />
              <Section>
                <Heading as="h2" style={subheading}>
                  Gift Ideas for {recipientName}
                </Heading>
                <Text style={paragraph}>
                  Here are some gift ideas you&apos;ve saved:
                </Text>
                {giftIdeas.map((idea) => (
                  <Section key={idea.id} style={giftIdeaRow}>
                    <Text style={giftIdeaTitle}>
                      {idea.url ? (
                        <Link href={idea.url} style={giftIdeaLink}>
                          {idea.title}
                        </Link>
                      ) : (
                        idea.title
                      )}
                      {idea.price && (
                        <span style={giftIdeaPrice}> - ${idea.price}</span>
                      )}
                    </Text>
                  </Section>
                ))}
              </Section>
            </>
          )}

          <Hr style={hr} />

          <Section style={buttonSection}>
            <Button style={button} href={viewUrl}>
              View in Gifto
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You&apos;re receiving this email because you have reminders enabled in
            Gifto. You can update your reminder preferences in your{" "}
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

const heading = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600" as const,
  lineHeight: "1.3",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const subheading = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600" as const,
  lineHeight: "1.3",
  margin: "0 0 16px",
};

const alertSection = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
};

const alertText = {
  color: "#92400e",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "0 0 8px",
};

const dateText = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "24px 0",
};

const giftIdeaRow = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "12px 16px",
  marginBottom: "8px",
};

const giftIdeaTitle = {
  color: "#1a1a1a",
  fontSize: "14px",
  lineHeight: "1.4",
  margin: "0",
};

const giftIdeaLink = {
  color: "#2563eb",
  textDecoration: "underline",
};

const giftIdeaPrice = {
  color: "#6b7280",
  fontWeight: "500" as const,
};

const buttonSection = {
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#2563eb",
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

export default ReminderEmail;
