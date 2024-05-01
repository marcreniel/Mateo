import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

const emails = [
  {
    "data": "This email is from Stash (team@mail.stash.com) and it is about an offer from Stash to its subscribers concerning bonus stocks and a cash incentive."
  },
  {
    "data": "This email is from Freebitco.in and it is about encouraging users to upgrade to a Premium Membership to enjoy elevated benefits and rewards."
  },
  {
    "data": "This email is from Uber Eats <uber@uber.com> and it is about offers from local restaurants."
  },
  {
    "data": "This email is from Poshmark Info <info@poshmark.com> and it is about an urgent opportunity to win monetary prizes."
  },
  {
    "data": "This email is from Uber <uber@uber.com> and it is about promoting the benefits of using their service."
  }
];

export const EmailsSummary = () => (
  <Html>
    <Head />
    <Preview>Your daily summary</Preview>
    <Body style={main}>
      <Container style={{ ...container, textAlign: "center" }}>
        <Heading style={h1}>Your daily summary from today:</Heading>
        {emails.map((email, index) => (
          <React.Fragment key={index}>
            <Hr></Hr>
            <Text style={text}>{email.data}</Text>
          </React.Fragment>
        ))}
        <Container style={{ ...container, textAlign: "center", marginTop: "20px" }}>
          <Link href="placeholder" style={buttonStyle}>
            Chat with your email sidekick
          </Link>
        </Container>
        <Img
          src={`${baseUrl}/static/logo.png`}
          alt="Mateo"
          style={{ margin: "0 auto", display: "block" }}
          width="128"
          height="128"
        />
        <Text style={footer}>
          <Link
            href="https://notion.so"
            target="_blank"
            style={{ ...link, color: "#898989" }}
          >
            Mateo.ai
          </Link>, your email sidekick
        </Text>
      </Container>
    </Body>
  </Html>
);

export default EmailsSummary;

const main = {
  backgroundColor: "#ffffff",
};

const buttonStyle = {
  display: "inline-block",
  backgroundColor: "#000000",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "5px",
  textDecoration: "none",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "16px",
  margin: "0 auto",
  marginTop: "20px",
};

const container = {
  padding: "24px",
  margin: "0 auto",
};

const h1 = {
  color: "#333",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "20px 0",
};

const text = {
  color: "#333",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "16px",
  margin: "10px 0",
};

const link = {
  color: "#2754C5",
  textDecoration: "underline",
};

const footer = {
  color: "#898989",
  fontSize: "12px",
  lineHeight: "22px",
  marginTop: "24px",
};