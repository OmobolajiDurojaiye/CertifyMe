import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Linkedin, Github, Globe, ArrowUpRight } from "lucide-react";

const PublicFooter = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-8 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 pr-8">
            <Link to="/" className="flex items-center gap-2 mb-6 no-underline">
              {/* UPDATED LOGO HERE */}
              <img
                src="/images/certbadge.png"
                alt="CertifyMe"
                className="h-8 w-8"
              />
              <span className="font-bold text-2xl text-white tracking-tight">
                CertifyMe
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-8 max-w-sm leading-relaxed">
              The modern standard for issuing verifiable digital credentials.
              Built for speed, security, and scale.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={Twitter} />
              <SocialLink href="#" icon={Linkedin} />
              <SocialLink href="#" icon={Github} />
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 text-white">Product</h4>
            <ul className="space-y-4">
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/search">Public Ledger</FooterLink>
              <FooterLink to="/verify">Verification Portal</FooterLink>
              <FooterLink to="/docs">API Documentation</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 text-white">Company</h4>
            <ul className="space-y-4">
              <FooterLink href="https://www.bolaji.tech/blog" isExternal>
                Blog
              </FooterLink>
              <FooterLink href="https://www.bolaji.tech/" isExternal>
                Founder's Note
              </FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
              <FooterLink to="#">Careers</FooterLink>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 text-white">Legal</h4>
            <ul className="space-y-4">
              <FooterLink to="#">Privacy Policy</FooterLink>
              <FooterLink to="#">Terms of Service</FooterLink>
              {/* <FooterLink to="">Security</FooterLink> */}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} CertifyMe Inc. All rights
            reserved.
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <span>Built by</span>
            <a
              href="https://www.bolaji.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Bolaji <Globe size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Helper Components for Cleaner Code
const FooterLink = ({ to, href, children, isExternal }) => {
  const className =
    "text-gray-400 hover:text-white transition-colors text-[15px] font-medium flex items-center gap-1 group no-underline";

  if (isExternal) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {children}{" "}
          <ArrowUpRight
            size={12}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link to={to} className={className}>
        {children}
      </Link>
    </li>
  );
};

const SocialLink = ({ href, icon: Icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
  >
    <Icon size={18} />
  </a>
);

export default PublicFooter;
