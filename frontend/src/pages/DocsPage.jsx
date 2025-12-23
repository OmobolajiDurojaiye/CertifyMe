import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import {
  Book,
  Key,
  Send,
  Code2,
  AlertOctagon,
  Menu,
  X,
  ChevronRight,
  Copy,
  CheckCircle2,
} from "lucide-react";

// --- Styled Code Block Component ---
const CodeSnippet = ({ lang, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#1e1e1e] border border-gray-800 my-6 shadow-2xl">
      <div className="flex justify-between items-center px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400 uppercase">
          {lang}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          {copied ? (
            <CheckCircle2 size={14} className="text-green-500" />
          ) : (
            <Copy size={14} />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed text-gray-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

function DocsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // --- Examples ---
  const curlExample = `curl -X POST 'https://certifyme.pythonanywhere.com/api/v1/certificates' \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: sk_live_xxxxxxxx' \\
  -d '{
    "template_id": 1,
    "recipient_name": "Bolaji Ayodele",
    "recipient_email": "bolaji@example.com",
    "course_title": "React Mastery",
    "issue_date": "2025-01-15",
    "extra_fields": {
      "Grade": "A+"
    }
  }'`;

  const jsExample = `const issueCert = async () => {
  const res = await fetch('https://certifyme.pythonanywhere.com/api/v1/certificates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'sk_live_xxxxxxxx'
    },
    body: JSON.stringify({
      template_id: 1,
      recipient_name: "Bolaji Ayodele",
      course_title: "React Mastery",
      issue_date: "2025-01-15"
    })
  });
  
  const data = await res.json();
  console.log(data);
};`;

  const pythonExample = `import requests

url = "https://certifyme.pythonanywhere.com/api/v1/certificates"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "sk_live_xxxxxxxx"
}
payload = {
    "template_id": 1,
    "recipient_name": "Bolaji Ayodele",
    "recipient_email": "bolaji@example.com",
    "course_title": "Python for Data Science",
    "issue_date": "2025-01-15"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

  const javaExample = `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class IssueCertificate {
    public static void main(String[] args) {
        String json = """
            {
                "template_id": 1,
                "recipient_name": "Bolaji Ayodele",
                "recipient_email": "bolaji@example.com",
                "course_title": "Java Enterprise",
                "issue_date": "2025-01-15"
            }
        """;

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://certifyme.pythonanywhere.com/api/v1/certificates"))
            .header("Content-Type", "application/json")
            .header("X-API-Key", "sk_live_xxxxxxxx")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
            .thenApply(HttpResponse::body)
            .thenAccept(System.out::println)
            .join();
    }
}`;

  const successResponse = `{
  "msg": "Certificate created and dispatched successfully.",
  "certificate_id": 842,
  "verification_id": "a1b2c3d4-e5f6-7890"
}`;

  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen flex flex-col">
      <Toaster position="top-center" />
      <PublicHeader />

      <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex items-start gap-12 relative">
        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-2xl z-50 hover:scale-105 transition-transform"
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </button>

        {/* Sidebar Navigation */}
        <aside
          className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-gray-50/95 backdrop-blur-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-120px)] lg:sticky lg:top-24 lg:border-0 lg:bg-transparent overflow-y-auto p-6 lg:p-0
          ${
            isSidebarOpen
              ? "translate-x-0 shadow-2xl lg:shadow-none"
              : "-translate-x-full"
          }
        `}
        >
          <div className="mb-8">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Documentation
            </h4>
            <nav className="space-y-1">
              <NavItem
                href="#intro"
                icon={Book}
                label="Introduction"
                active
                onClick={closeSidebar}
              />
              <NavItem
                href="#auth"
                icon={Key}
                label="Authentication"
                onClick={closeSidebar}
              />
              <NavItem
                href="#create"
                icon={Send}
                label="Create Certificate"
                onClick={closeSidebar}
              />
              <NavItem
                href="#errors"
                icon={AlertOctagon}
                label="Error Handling"
                onClick={closeSidebar}
              />
            </nav>
          </div>

          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <h5 className="font-bold text-indigo-900 text-sm mb-2">
              Need help?
            </h5>
            <p className="text-xs text-indigo-700 mb-3">
              Join our developer slack or contact support.
            </p>
            <a
              href="/contact"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center no-underline"
            >
              Contact Support <ChevronRight size={12} />
            </a>
          </div>
        </aside>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-20">
          {/* Header */}
          <div className="mb-12 border-b border-gray-100 pb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              API Reference
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              Programmatically generate and send certificates using the
              CertifyMe REST API.
            </p>
          </div>

          {/* Intro */}
          <section id="intro" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              The CertifyMe API is organized around REST. Our API has
              predictable resource-oriented URLs, accepts JSON-encoded request
              bodies, returns JSON-encoded responses, and uses standard HTTP
              response codes.
            </p>
          </section>

          {/* Auth */}
          <section id="auth" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication
            </h2>
            <p className="text-gray-600 mb-6">
              Authenticate requests by including your secret API key in the{" "}
              <code>X-API-Key</code> header.
            </p>
            <CodeSnippet lang="HTTP Header" code="X-API-Key: sk_live_..." />
          </section>

          {/* Create Certificate */}
          <section id="create" className="mb-16 scroll-mt-28">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold font-mono">
                POST
              </span>
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                Create Certificate
              </h2>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Code Examples
            </h3>
            <div className="grid lg:grid-cols-1 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-2">
                  cURL
                </h4>
                <CodeSnippet lang="bash" code={curlExample} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-2">
                  JavaScript (Fetch)
                </h4>
                <CodeSnippet lang="javascript" code={jsExample} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-2">
                  Python (Requests)
                </h4>
                <CodeSnippet lang="python" code={pythonExample} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-2">
                  Java (HttpClient)
                </h4>
                <CodeSnippet lang="java" code={javaExample} />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">
              Success Response
            </h3>
            <CodeSnippet lang="json" code={successResponse} />
          </section>

          {/* Errors */}
          <section id="errors" className="mb-16 scroll-mt-28">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Error Handling
            </h2>
            <div className="grid gap-4">
              <ErrorRow
                code="400"
                title="Bad Request"
                desc="Invalid parameters or missing fields."
              />
              <ErrorRow
                code="401"
                title="Unauthorized"
                desc="Invalid API Key."
              />
              <ErrorRow
                code="403"
                title="Forbidden"
                desc="Quota exceeded or insufficient permissions."
              />
              <ErrorRow
                code="404"
                title="Not Found"
                desc="Template ID does not exist."
              />
            </div>
          </section>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}

// --- Local Helpers ---
const NavItem = ({ href, icon: Icon, label, active, onClick }) => (
  <a
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors no-underline ${
      active
        ? "text-indigo-600 bg-indigo-50"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`}
  >
    <Icon size={18} />
    {label}
  </a>
);

const ErrorRow = ({ code, title, desc }) => (
  <div className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <span className="font-mono font-bold text-red-600 w-16">{code}</span>
    <div className="flex-1">
      <span className="font-bold text-gray-900 mr-2">{title}</span>
      <span className="text-gray-500 text-sm">{desc}</span>
    </div>
  </div>
);

export default DocsPage;
