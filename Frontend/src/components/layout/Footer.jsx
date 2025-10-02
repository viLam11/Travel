// src/components/layout/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <p className="text-sm mb-2">328 Nguyễn Trãi, Thanh Xuân, Hà Nội</p>
            <p className="text-sm mb-2">viatours</p>
            <p className="text-sm">+84 123 456 789</p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-orange-500 transition-colors">About us</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Team Member</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Career</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Testimonials</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Help Desks</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Help center</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Newsletter</h3>
            <p className="text-sm mb-4">Subscribe our newsletter to get our latest updates & news</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-orange-500 text-sm"
              />
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© 2025 Viatours. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;