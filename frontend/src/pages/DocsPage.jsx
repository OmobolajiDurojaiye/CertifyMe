import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
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
  Terminal,
  Globe,
  Zap
} from "lucide-react";

// --- Styled Code Block Component ---
const CodeSnippet = ({ lang, code, title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden bg-[#0F172A] border border-gray-800 my-8 shadow-2xl ring-1 ring-white/10 group">
        <div className="flex justify-between items-center px-4 py-3 bg-[#1E293B]/50 border-b border-gray-800 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                {title && <span className="text-xs font-medium text-gray-400 ml-2">{title}</span>}
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-medium text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded">
                    {lang}
                </span>
                <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
                    title="Copy to clipboard"
                >
                    {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
            </div>
        </div>
        <div className="p-5 overflow-x-auto custom-scrollbar">
            <pre className="text-sm font-mono leading-relaxed text-blue-100/90 font-ligatures">
                <code>{code}</code>
            </pre>
        </div>
    </div>
  );
};

const NavItem = ({ href, icon: Icon, label, active, onClick }) => (
    <a
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 no-underline ${
        active
          ? "text-white bg-indigo-600 shadow-lg shadow-indigo-600/20 translate-x-1"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      <Icon size={18} className={active ? "text-white" : "text-gray-400 group-hover:text-indigo-600 transition-colors"} />
      {label}
    </a>
  );

function DocsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Scroll spy for active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["intro", "auth", "create", "errors"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const successResponse = `{
  "msg": "Certificate created and dispatched successfully.",
  "certificate_id": 842,
  "verification_id": "a1b2c3d4-e5f6-7890",
  "status": "sent",
  "url": "https://certify.me/verify/a1b2c3d4"
}`;

  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen flex flex-col">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <PublicHeader />

      <div className="flex-grow w-full relative">
        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-2xl z-50 hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-300"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-100 
            transform transition-transform duration-300 ease-in-out
            lg:translate-x-0 lg:fixed lg:top-[73px] lg:bottom-0 lg:left-0 lg:z-30
            pb-20 lg:pb-0 overflow-y-auto custom-scrollbar
            ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"}
          `}
        >
            <div className="p-6 md:p-8 space-y-8 min-h-full flex flex-col justify-between">
                <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
                        <Book size={14} /> Documentation
                    </h4>
                    <nav className="space-y-1">
                        <NavItem
                            href="#intro"
                            icon={Globe}
                            label="Introduction"
                            active={activeSection === "intro"}
                            onClick={() => { closeSidebar(); setActiveSection("intro"); }}
                        />
                        <NavItem
                            href="#auth"
                            icon={Key}
                            label="Authentication"
                            active={activeSection === "auth"}
                            onClick={() => { closeSidebar(); setActiveSection("auth"); }}
                        />
                        <NavItem
                            href="#create"
                            icon={Terminal}
                            label="Create Certificate"
                            active={activeSection === "create"}
                            onClick={() => { closeSidebar(); setActiveSection("create"); }}
                        />
                        <NavItem
                            href="#errors"
                            icon={AlertOctagon}
                            label="Error Handling"
                            active={activeSection === "errors"}
                            onClick={() => { closeSidebar(); setActiveSection("errors"); }}
                        />
                    </nav>
                </div>

                <div className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <Zap className="mb-4 text-indigo-200" size={24} />
                    <h5 className="font-bold text-lg mb-2 text-white">
                        Need specific help?
                    </h5>
                    <p className="text-sm text-indigo-100 mb-4 leading-relaxed opacity-90">
                        Our engineering team is available on Slack to help with integrations.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center justify-center w-full text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg transition-colors border border-white/20 text-white no-underline"
                    >
                        Contact Support <ChevronRight size={14} className="ml-1" />
                    </Link>
                </div>
            </div>
        </aside>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 py-12 px-6 lg:px-16 xl:px-24 lg:ml-80">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 font-semibold text-xs uppercase tracking-wide">
                        <Code2 size={14} /> API Version 1.0
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
                    API Reference
                    </h1>
                    <p className="text-xl text-gray-500 leading-relaxed font-light">
                    Seamlessly integrate certificate generation into your existing workflows. 
                    Our implementation-first API follows RESTful conventions and speaks JSON.
                    </p>
                </div>

                {/* Intro */}
                <section id="intro" className="mb-20 scroll-mt-32">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        Introduction
                        <div className="h-px flex-1 bg-gray-100 ml-4"></div>
                    </h2>
                    <div className="prose prose-lg text-gray-600">
                        <p>
                            The CertifyMe API is organized around REST. Our API has
                            predictable resource-oriented URLs, accepts <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">application/json</code> request
                            bodies, returns JSON-encoded responses, and uses standard HTTP
                            response codes to indicate API errors.
                        </p>
                        <p className="mt-4">
                            Base URL: <code className="text-sm bg-gray-100 px-2 py-1 rounded select-all">https://certifyme.pythonanywhere.com/api/v1</code>
                        </p>
                    </div>
                </section>

                {/* Auth */}
                <section id="auth" className="mb-20 scroll-mt-32">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        Authentication
                        <div className="h-px flex-1 bg-gray-100 ml-4"></div>
                    </h2>
                    <p className="text-gray-600 mb-6 text-lg">
                        Authenticate your API requests by including your secret key in the{" "}
                        <code className="text-indigo-600 font-mono font-bold">X-API-Key</code> header of every request. You can manage your API keys in the Dashboard.
                    </p>
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertOctagon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Your API keys carry many privileges, so be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.
                                </p>
                            </div>
                        </div>
                    </div>

                    <CodeSnippet lang="HTTP Header" title="Authentication Header" code="X-API-Key: sk_live_51M..." />
                </section>

                {/* Create Certificate */}
                <section id="create" className="mb-20 scroll-mt-32">
                    <div className="flex items-center flex-wrap gap-4 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 m-0">
                            Create Certificate
                        </h2>
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold font-mono border border-emerald-200">
                            POST /certificates
                        </span>
                    </div>
                
                    <p className="text-gray-600 mb-8 text-lg">
                        Generate a new certificate from a pre-defined template. The certificate will be emailed to the recipient immediately upon creation.
                    </p>

                    <div className="space-y-12">
                        {/* cURL */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">cURL Request</h3>
                            </div>
                            <CodeSnippet lang="bash" title="Terminal" code={curlExample} />
                        </div>

                        {/* JS */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">JavaScript Request</h3>
                            </div>
                            <CodeSnippet lang="javascript" title="Node.js / React" code={jsExample} />
                        </div>
                        
                        {/* Python */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Python Request</h3>
                            </div>
                            <CodeSnippet lang="python" title="Python 3" code={pythonExample} />
                        </div>
                    </div>

                    <div className="mt-12">
                         <h3 className="text-lg font-bold text-gray-900 mb-4">Success Response</h3>
                         <p className="text-gray-500 mb-4">Returns a 201 Created response containing the certificate details.</p>
                         <CodeSnippet lang="json" title="JSON Response" code={successResponse} />
                    </div>
                </section>

                {/* Errors */}
                <section id="errors" className="mb-20 scroll-mt-32">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        Error Handling
                        <div className="h-px flex-1 bg-gray-100 ml-4"></div>
                    </h2>
                    <div className="grid gap-4">
                        <ErrorRow
                        code="400"
                        title="Bad Request"
                        desc="The request was unacceptable, often due to missing a required parameter."
                        />
                        <ErrorRow
                        code="401"
                        title="Unauthorized"
                        desc="No valid API key provided."
                        />
                        <ErrorRow
                        code="402"
                        title="Request Failed"
                        desc="The parameters were valid but the request failed."
                        />
                        <ErrorRow
                        code="403"
                        title="Forbidden"
                        desc="The API key doesn't have permissions to perform the request."
                        />
                        <ErrorRow
                        code="404"
                        title="Not Found"
                        desc="The requested resource (e.g. template) doesn't exist."
                        />
                    </div>
                </section>
            </div>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}

// --- Local Helpers ---
const ErrorRow = ({ code, title, desc }) => (
  <div className="group flex flex-col sm:flex-row sm:items-center p-5 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
    <div className="flex items-center mb-2 sm:mb-0">
        <span className="font-mono font-bold text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100 w-12 text-center mr-4">{code}</span>
        <span className="font-bold text-gray-900 mr-4 min-w-[120px]">{title}</span>
    </div>
    <span className="text-gray-500 text-sm">{desc}</span>
  </div>
);

export default DocsPage;
