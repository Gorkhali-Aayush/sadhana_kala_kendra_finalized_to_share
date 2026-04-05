import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Heart, Share2, PlayCircle, X } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-linear-to-b from-gray-950 to-black text-gray-200 font-sans border-t border-amber-900/30">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <Image 
                src="/1626688345_logo.png" 
                alt="Sadhana Kala Kendra Logo" 
                width={288} 
                height={80} 
                className="object-contain drop-shadow-md h-auto w-auto" 
                priority 
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Nurturing artistic talent through comprehensive, accredited programs in music and performing arts.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Image 
                src="/unesco-logo.png" 
                alt="UNESCO Logo" 
                width={60} 
                height={30} 
                className="object-contain drop-shadow-md h-auto w-auto" 
              />
              <span className="text-xs text-gray-500">UNESCO Recognized</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-amber-500/50">Quick Links</h3>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Home</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">About Us</Link></li>
              <li><Link href="/courses" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Courses</Link></li>
              <li><Link href="/teachers" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Teachers</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Events</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-amber-500/50">Resources</h3>
            <ul className="space-y-2.5">
              <li><Link href="/artists" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Artists</Link></li>
              <li><Link href="/activities" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Activities</Link></li>
              <li><Link href="/gallery" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Gallery</Link></li>
              <li><Link href="/news" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">News</Link></li>
              <li><Link href="/offers" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">Special Offers</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-amber-500/50">Stay Connected</h3>

            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-gray-400">01-4540228</p>
                  <p className="text-gray-400">9851023576</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <a href="mailto:sadhananepal25@gmail.com" className="text-sm text-gray-400 hover:text-amber-400 transition">sadhananepal25@gmail.com</a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-400">Kamaladi, Kathmandu, Nepal</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-linear-to-r from-amber-900/20 to-amber-900/10 border border-amber-900/40 rounded-lg p-6 md:p-8 mb-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Ready to Begin Your Artistic Journey?</h3>
          <p className="text-gray-400 mb-4 max-w-2xl mx-auto">Join Sadhana Kala Kendra and unlock your artistic potential through our comprehensive programs.</p>
          <Link href="/register" className="inline-block bg-amber-500 text-gray-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 transition duration-300 uppercase tracking-wide text-sm">
            Apply Now
          </Link>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          {/* Bottom Info */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>&copy; {currentYear} Sadhana Kala Kendra. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
