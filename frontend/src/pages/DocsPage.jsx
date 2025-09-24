import React, { useState } from "react"; // --- NEW: Import useState ---
import { Link } from "react-router-dom";
import CodeBlock from "../components/CodeBlock";
import "../styles/DocsPage.css";
import { Toaster } from "react-hot-toast";
import PublicHeader from "../components/PublicHeader";

function DocsPage() {
  // --- NEW: State to manage the mobile sidebar's visibility ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // ... (all the const variables like curlExample, jsExample remain the same)
  const curlExample = `curl -X POST 'https://certifyme.pythonanywhere.com/api/v1/certificates' \\
-H 'Content-Type: application/json' \\
-H 'X-API-Key: your_secret_api_key_here' \\
-d '{
    "template_id": 1,
    "recipient_name": "John Doe",
    "recipient_email": "john.doe@example.com",
    "course_title": "Introduction to APIs",
    "issue_date": "2024-10-28",
    "extra_fields": {
        "Final Score": "95%"
    }
}'`;

  const jsExample = `const createCertificate = async () => {
  const apiKey = 'your_secret_api_key_here';
  const apiUrl = 'https://certifyme.pythonanywhere.com/api/v1/certificates';

  const certificateData = {
    template_id: 1,
    recipient_name: "Jane Doe",
    recipient_email: "jane.doe@example.com",
    course_title: "JavaScript for Beginners",
    issue_date: "2024-10-29"
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify(certificateData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'An error occurred');
    }

    const result = await response.json();
    console.log('Success:', result);
    // Success: { msg: '...', certificate_id: ..., verification_id: '...' }

  } catch (error) {
    console.error('Error:', error.message);
  }
};

createCertificate();`;

  const pythonExample = `import requests
import json

def create_certificate():
    api_key = 'your_secret_api_key_here'
    api_url = 'https://certifyme.pythonanywhere.com/api/v1/certificates'

    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': api_key
    }

    payload = {
        "template_id": 2,
        "recipient_name": "Peter Jones",
        "recipient_email": "peter.jones@example.com",
        "course_title": "Advanced Python",
        "issue_date": "2024-11-01",
        "extra_fields": {
            "Instructor": "Dr. Smith"
        }
    }

    try:
        response = requests.post(api_url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()  # Raises an HTTPError for bad responses (4xx or 5xx)
        
        result = response.json()
        print(f"Success: {result}")
        # Success: {'msg': '...', 'certificate_id': ..., 'verification_id': '...'}

    except requests.exceptions.HTTPError as err:
        print(f"HTTP Error: {err.response.status_code} - {err.response.text}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    create_certificate()`;

  return (
    <div className="docs-page-wrapper">
      <Toaster position="top-center" />

      {/* --- NEW: Pass the props to show and handle the mobile menu button --- */}
      <PublicHeader
        theme="light"
        showMenuButton={true}
        onMenuClick={toggleSidebar}
      />

      {/* --- NEW: Add an overlay to dim the background when the sidebar is open --- */}
      {isSidebarOpen && (
        <div className="docs-overlay" onClick={closeSidebar}></div>
      )}

      <div className="docs-container">
        {/* --- NEW: Dynamically add 'mobile-open' class to the sidebar --- */}
        <aside className={`docs-sidebar ${isSidebarOpen ? "mobile-open" : ""}`}>
          <nav>
            {/* --- NEW: Add onClick handler to close sidebar after navigation --- */}
            <ul onClick={closeSidebar}>
              <li>
                <a href="#getting-started">Getting Started</a>
              </li>
              <li>
                <a href="#authentication">Authentication</a>
              </li>
              <li>
                <a href="#endpoint-create-certificate">
                  Endpoint: Create Certificate
                </a>
              </li>
              <li>
                <a href="#code-examples">Code Examples</a>
              </li>
              <li>
                <a href="#responses">Responses</a>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="docs-content">
          {/* ... (rest of the page content remains exactly the same) ... */}
          <section id="getting-started">
            <h1>CertifyMe API Documentation (v1)</h1>
            <p>
              Welcome to the CertifyMe API. Our API provides a simple,
              programmatic way to generate and dispatch digital certificates,
              perfect for integrating with your Learning Management System
              (LMS), online course platform, or internal training tools.
            </p>

            <h2>Quick Start Guide</h2>
            <p>Integrating with CertifyMe is a simple three-step process:</p>
            <ol className="docs-list">
              <li>
                <strong>Get Your API Key:</strong> Log in to your CertifyMe
                account, navigate to <strong>Settings → Developer</strong>, and
                generate your unique API key.
              </li>
              <li>
                <strong>Find Your Template ID:</strong> Go to the{" "}
                <strong>Templates</strong> page in your dashboard. Each template
                card displays its ID, which you can easily copy. You can use
                your own custom templates or the system templates provided.
              </li>
              <li>
                <strong>Make a POST Request:</strong> Send an HTTP POST request
                to our API endpoint with the certificate data and your
                credentials. The certificate will be generated and emailed to
                the recipient automatically.
              </li>
            </ol>
          </section>

          <section id="authentication">
            <h2>Authentication</h2>
            <p>
              The CertifyMe API uses an API key to authenticate requests. You
              must include your key in the <code>X-API-Key</code> header for all
              API calls.
            </p>
            <div className="docs-alert">
              <strong>Keep your API key secure!</strong> Do not share it
              publicly or commit it to version control. Treat it like a
              password.
            </div>
            <CodeBlock language="Header">
              X-API-Key: your_secret_api_key_here
            </CodeBlock>
          </section>

          <section id="endpoint-create-certificate">
            <h2>Endpoint: Create a Certificate</h2>
            <p>
              This is the primary endpoint for generating a new certificate.
            </p>
            <div className="endpoint-details">
              <span className="method-post">POST</span>
              <span className="endpoint-url">/api/v1/certificates</span>
            </div>

            <h3>Request Body</h3>
            <p>
              The request body must be a JSON object containing the following
              fields:
            </p>
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Required</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>template_id</code>
                  </td>
                  <td>Integer</td>
                  <td>The ID of the certificate template to use.</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>
                    <code>recipient_name</code>
                  </td>
                  <td>String</td>
                  <td>
                    The full name of the person receiving the certificate.
                  </td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>
                    <code>recipient_email</code>
                  </td>
                  <td>String</td>
                  <td>
                    The email address where the PDF certificate will be sent.
                  </td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>
                    <code>course_title</code>
                  </td>
                  <td>String</td>
                  <td>The name of the course, event, or achievement.</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>
                    <code>issue_date</code>
                  </td>
                  <td>String</td>
                  <td>
                    The date of issuance in <code>YYYY-MM-DD</code> format.
                  </td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>
                    <code>extra_fields</code>
                  </td>
                  <td>Object</td>
                  <td>
                    (Optional) A JSON object for any custom fields on your
                    certificate. E.g.,{" "}
                    <code>{`{"Grade": "A+", "Instructor": "Dr. Smith"}`}</code>
                  </td>
                  <td>No</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section id="code-examples">
            <h2>Code Examples</h2>
            <h3>cURL</h3>
            <CodeBlock language="bash">{curlExample}</CodeBlock>

            <h3>JavaScript (Fetch API)</h3>
            <CodeBlock language="javascript">{jsExample}</CodeBlock>

            <h3>Python (Requests)</h3>
            <CodeBlock language="python">{pythonExample}</CodeBlock>
          </section>

          <section id="responses">
            <h2>Responses</h2>
            <p>
              The API returns standard HTTP status codes to indicate the success
              or failure of a request.
            </p>

            <h3>Success Response</h3>
            <p>
              On success, the API returns a <code>201 Created</code> status code
              and a JSON object with the new certificate's details.
            </p>
            <CodeBlock language="json">{`{
  "msg": "Certificate created and dispatched successfully.",
  "certificate_id": 251,
  "verification_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
}`}</CodeBlock>

            <h3>Error Responses</h3>
            <p>
              If an error occurs, the API will return an appropriate 4xx or 5xx
              status code with a JSON body explaining the issue.
            </p>
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Status Code</th>
                  <th>Meaning</th>
                  <th>Example Response Body</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>400 Bad Request</code>
                  </td>
                  <td>
                    The request body is missing required fields or contains
                    invalid data.
                  </td>
                  <td>
                    <code>
                      {'{ "msg": "Missing required fields: recipient_name" }'}
                    </code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>401 Unauthorized</code>
                  </td>
                  <td>
                    The <code>X-API-Key</code> is missing, invalid, or
                    incorrect.
                  </td>
                  <td>
                    <code>
                      {'{ "msg": "Authentication failed: Invalid API key." }'}
                    </code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>403 Forbidden</code>
                  </td>
                  <td>
                    The user associated with the API key has run out of
                    certificate quota.
                  </td>
                  <td>
                    <code>
                      {'{ "msg": "Insufficient certificate quota remaining." }'}
                    </code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>404 Not Found</code>
                  </td>
                  <td>
                    The provided <code>template_id</code> does not exist or is
                    not accessible to the user.
                  </td>
                  <td>
                    <code>
                      {'{ "msg": "Template not found or permission denied." }'}
                    </code>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
}

export default DocsPage;
