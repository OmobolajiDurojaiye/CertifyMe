// frontend/src/data/helpArticles.jsx

import React from "react";
import {
  Speedometer2,
  PersonVcard,
  LayoutTextWindowReverse,
  Collection,
  JournalCheck,
  CreditCard,
  Search,
  CodeSlash,
} from "react-bootstrap-icons";

export const helpArticles = [
  {
    slug: "getting-started",
    title: "Getting Started",
    icon: <Speedometer2 size={30} />,
    theme: "primary",
    description: "Start off on the right foot! The core workflow from A to Z.",
    content: (
      <>
        <h2>The Core CertifyMe Workflow</h2>
        <p>
          CertifyMe is built around a simple and powerful four-step process:
        </p>
        <ol>
          <li>
            <strong>Create a Template:</strong> Design a reusable certificate
            layout. You can use our form-based editor or upload your own visual
            design.
          </li>
          <li>
            <strong>Create a Group:</strong> Organize certificates by batch,
            cohort, or event (e.g., “October 2024 Python Cohort"). Groups are
            essential for bulk actions.
          </li>
          <li>
            <strong>Add Recipients:</strong> Create certificates individually,
            or upload a <code>CSV/Excel</code> file for bulk issuance.
          </li>
          <li>
            <strong>Deliver & Verify:</strong> Download certificates as PDFs,
            send them via email, or share unique verification links.
          </li>
        </ol>
      </>
    ),
  },
  {
    slug: "account-management",
    title: "Account Management",
    icon: <PersonVcard size={30} />,
    theme: "success",
    description: "Signing up, logging in, and managing your account type.",
    content: (
      <>
        <h2>Signing Up & Logging In</h2>
        <ul>
          <li>
            <strong>Sign Up:</strong> Choose either an{" "}
            <strong>Individual</strong> or <strong>Company</strong> account.
          </li>
          <li>
            <strong>Log In:</strong> Use your registered email and password to
            access your dashboard.
          </li>
        </ul>
        <h2>Resetting Your Password</h2>
        <p>If you forget your password:</p>
        <ol>
          <li>
            Click <strong>Forgot Password?</strong> on the login page.
          </li>
          <li>Enter your registered email address.</li>
          <li>You'll receive a secure reset link (valid for 15 minutes).</li>
        </ol>
      </>
    ),
  },
  {
    slug: "managing-templates",
    title: "Managing Templates",
    icon: <LayoutTextWindowReverse size={30} />,
    theme: "info",
    description: "Design beautiful, reusable templates for your certificates.",
    content: (
      <>
        <h2>Creating a Form-Based Template</h2>
        <p>
          This is the easiest way to design professional certificates quickly.
        </p>
        <ol>
          <li>
            Go to <strong>Templates → Create Form-Based Template</strong>.
          </li>
          <li>Fill in the fields like Template Name, Title, and Colors.</li>
          <li>Watch the Live Preview update in real time.</li>
          <li>
            Click <strong>Create Template</strong> when done.
          </li>
        </ol>

        <h2>Creating a Visual (Custom) Template</h2>
        <p>
          Use this when you already have a designed certificate image (JPG or
          PNG).
        </p>
        <ol>
          <li>
            Click <strong>Upload Your Own Template</strong> on the Templates
            page.
          </li>
          <li>
            <strong>Add Placeholders:</strong> Drag placeholders like{" "}
            <code>{`{{recipient_name}}`}</code> onto the design canvas.
          </li>
          <li>
            <strong>Style & Position:</strong> Adjust font size, alignment,
            color, and rotation.
          </li>
          <li>
            Click <strong>Save Template</strong>.
          </li>
        </ol>
      </>
    ),
  },
  {
    slug: "managing-groups",
    title: "Managing Groups",
    icon: <Collection size={30} />,
    theme: "warning",
    description: "Organize certificates by project, event, or cohort.",
    content: (
      <>
        <h2>What Are Groups?</h2>
        <p>
          Groups help you organize certificates and are required for bulk
          actions. Examples include "2024 Web Dev Cohort" or "Annual Sales
          Conference".
        </p>
        <h2>Creating and Using Groups</h2>
        <ol>
          <li>
            Go to the <strong>Groups</strong> page.
          </li>
          <li>
            Click <strong>Create New Group</strong> and give it a name.
          </li>
          <li>
            Inside a group, you can download all certificates as a single{" "}
            <code>ZIP</code> file or send all unsent emails.
          </li>
        </ol>
      </>
    ),
  },
  {
    slug: "issuing-certificates",
    title: "Issuing Certificates",
    icon: <JournalCheck size={30} />,
    theme: "danger",
    description: "Learn how to create single or bulk certificates with ease.",
    content: (
      <>
        <h2>Creating a Single Certificate</h2>
        <ol>
          <li>
            Go to <strong>My Certificates → New</strong>.
          </li>
          <li>Choose a template and fill in the recipient's details.</li>
          <li>
            Click <strong>Publish</strong>. If an email is provided, it's
            automatically sent.
          </li>
        </ol>

        <h2>Creating Certificates in Bulk (CSV/Excel Upload)</h2>
        <ol>
          <li>
            Go to <strong>My Certificates → Bulk Create</strong>.
          </li>
          <li>Select a template and assign a group.</li>
          <li>
            Upload your file (<code>.csv</code>, <code>.xlsx</code>,{" "}
            <code>.xls</code>).
          </li>
          <li>
            Required columns are: <code>recipient_name</code>,{" "}
            <code>course_title</code>, <code>issue_date</code>.
          </li>
          <li>
            Click <strong>Create Certificates</strong>. The system processes all
            valid rows and reports any errors.
          </li>
        </ol>
      </>
    ),
  },
  {
    slug: "billing-and-plans",
    title: "Billing & Plans",
    icon: <CreditCard size={30} />,
    theme: "secondary",
    description: "Understand our credit system and how to upgrade your plan.",
    content: (
      <>
        <h2>How Our Credit-Based Model Works</h2>
        <p>
          CertifyMe uses a credit-based model. Each issued certificate consumes
          one credit from your account quota.
        </p>
        <h2>Upgrading Your Plan</h2>
        <ol>
          <li>
            Go to <strong>Settings → Billing</strong>.
          </li>
          <li>
            Choose a plan: <strong>Starter</strong>, <strong>Growth</strong>,{" "}
            <strong>Pro</strong>, or <strong>Enterprise</strong>.
          </li>
          <li>
            Click <strong>Upgrade</strong> to pay securely via Paystack.
          </li>
          <li>Your quota updates instantly upon successful payment.</li>
        </ol>
      </>
    ),
  },
  {
    slug: "public-verification",
    title: "Public Verification",
    icon: <Search size={30} />,
    theme: "dark",
    description: "How certificate verification works on the Open Ledger.",
    content: (
      <>
        <h2>How Verification Works</h2>
        <p>
          Every certificate has a unique <strong>Verification ID</strong> and a
          scannable <strong>QR code</strong> for instant verification.
        </p>
        <h2>The Open Ledger (Advanced Search)</h2>
        <p>
          Accessible via the <strong>Search</strong> link on our homepage, the
          Open Ledger allows anyone to look up a certificate's details, ensuring
          transparency and trust.
        </p>
      </>
    ),
  },
  {
    slug: "developer-api",
    title: "Developer API",
    icon: <CodeSlash size={30} />,
    theme: "purple",
    description:
      "Integrate CertifyMe into your own systems. (Pro & Enterprise)",
    content: (
      <>
        <h2>Generating Your API Key</h2>
        <ol>
          <li>
            Go to <strong>Settings → Developer</strong>.
          </li>
          <li>
            Click <strong>Generate API Key</strong>.
          </li>
          <li>
            <strong>Important:</strong> Copy and store your key securely. It is
            only shown once.
          </li>
          <li>
            Use this key in the <code>X-API-Key</code> header of your REST API
            requests.
          </li>
        </ol>
        <p>
          For detailed implementation, refer to the official{" "}
          <strong>CertifyMe API Documentation</strong>.
        </p>
      </>
    ),
  },
];
