// src/components/layout/Footer.tsx
import React, { useState } from 'react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const Footer: React.FC = () => {
  const [email, setEmail] = useState<string>('');

  const footerSections: FooterSection[] = [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Team Reviews', href: '#' },
        { label: 'Contact Us', href: '#' },
        { label: 'Travel Guides', href: '#' },
        { label: 'Data Policy', href: '#' },
        { label: 'Cookie Policy', href: '#' },
        { label: 'Legal', href: '#' },
        { label: 'Sitemap', href: '#' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Get in Touch', href: '#' },
        { label: 'Help center', href: '#' },
        { label: 'Live chat', href: '#' },
        { label: 'How it works', href: '#' }
      ]
    }
  ];

  const handleSubscribe = (e: React.FormEvent): void => {
    e.preventDefault();
    console.log('Subscribe email:', email);
    setEmail('');
    // TODO: Implement newsletter subscription
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>328 Queensberry Street, North Melbourne VIC 3051,</p>
              <p>Australia.</p>
              <p className="pt-2">ngotours.com</p>
            </div>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2">
              {footerSections[0].links.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              {footerSections[1].links.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Newsletter</h3>
            <p className="text-sm text-gray-600 mb-4">
              Subscribe to the free newsletter and stay up to date
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Send
              </button>
            </form>

            {/* Mobile Apps */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Mobile Apps</h4>
              <div className="space-y-2">
                <a href="#" className="text-sm text-gray-600 hover:text-orange-500 transition-colors block">
                  iOS App
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-orange-500 transition-colors block">
                  Android App
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;