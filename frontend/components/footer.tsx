import React from 'react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

export function Footer() {
    return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding Section */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-2xl font-bold mb-4">ZKCertify</h3>
            <p className="text-gray-400 mb-4">
              Secure and private verification of academic credentials using zero-knowledge proofs.
            </p>
          </div>

          {/* Quick Links */}
          <div className="mb-8 md:mb-0">
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/verify" className="text-gray-400 hover:text-white transition-colors">Verify Credentials</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4 mb-4">
              <a href="https://github.com" className="text-gray-400 hover:text-white transition-colors">
                <FaGithub size={24} />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter size={24} />
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin size={24} />
              </a>
            </div>
            <p className="text-gray-400">
              Email: contact@zkcertify.com
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ZKCertify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

