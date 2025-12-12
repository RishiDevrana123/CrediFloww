import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaComments,
  FaShieldAlt,
  FaBolt,
  FaCheckCircle,
  FaPhone,
  FaEnvelope,
  FaCalculator,
  FaUserTie,
  FaBars,
  FaTimes,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaHome as FaHomeIcon,
  FaCar,
  FaBriefcase,
  FaGraduationCap,
  FaBuilding,
} from 'react-icons/fa';
import ThemeToggle from '../components/ThemeToggle';
import SignInModal from '../components/SignInModal';
import SignUpModal from '../components/SignUpModal';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const loanProducts = [
    {
      name: 'Personal Loan',
      icon: <FaUserTie className="text-4xl" />,
      description: 'Quick personal loans up to ?25 lakhs',
      rate: '10.99% p.a.',
    },
    {
      name: 'Home Loan',
      icon: <FaHomeIcon className="text-4xl" />,
      description: 'Finance your dream home',
      rate: '8.50% p.a.',
    },
    {
      name: 'Business Loan',
      icon: <FaBriefcase className="text-4xl" />,
      description: 'Grow your business',
      rate: '12.00% p.a.',
    },
    {
      name: 'Car Loan',
      icon: <FaCar className="text-4xl" />,
      description: 'Drive home your dream car',
      rate: '8.75% p.a.',
    },
    {
      name: 'Education Loan',
      icon: <FaGraduationCap className="text-4xl" />,
      description: 'Invest in your future',
      rate: '9.50% p.a.',
    },
    {
      name: 'Loan Against Property',
      icon: <FaBuilding className="text-4xl" />,
      description: 'Unlock property value',
      rate: '9.25% p.a.',
    },
  ];

  const features = [
    {
      icon: <FaBolt className="text-3xl" />,
      title: 'Instant Approval',
      description: 'Get loan approval in minutes with AI-powered processing',
    },
    {
      icon: <FaShieldAlt className="text-3xl" />,
      title: 'Secure & Safe',
      description: 'Bank-grade security with 256-bit encryption',
    },
    {
      icon: <FaCheckCircle className="text-3xl" />,
      title: 'Easy Documentation',
      description: 'Minimal paperwork with digital verification',
    },
    {
      icon: <FaCalculator className="text-3xl" />,
      title: 'EMI Calculator',
      description: 'Calculate your EMIs instantly',
    },
  ];

  const stats = [
    { value: '?1000 Cr+', label: 'Loans Disbursed' },
    { value: '50K+', label: 'Happy Customers' },
    { value: '25+', label: 'Years of Trust' },
    { value: '200+', label: 'Branch Network' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Top Bar */}
      <div className="bg-tata-darkGray dark:bg-gray-950 text-white py-2 px-4">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <a
              href="tel:1800-209-8800"
              className="flex items-center space-x-2 hover:text-tata-gold transition"
            >
              <FaPhone size={12} />
              <span className="hidden sm:inline">1800-209-8800</span>
            </a>
            <a
              href="mailto:[email protected]"
              className="hidden md:flex items-center space-x-2 hover:text-tata-gold transition"
            >
              <FaEnvelope size={12} />
              <span>[email protected]</span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-xs">Customer Login</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-18 sm:h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-tata-blue to-tata-lightBlue rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl sm:text-2xl">C</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-tata-blue dark:text-white">
                  CrediFlow
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  A TATA Enterprise
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="hidden sm:inline text-tata-blue dark:text-tata-gold font-medium">
                    Welcome, {user?.fullName?.split(' ')[0]}
                  </span>
                  <button
                    onClick={signOut}
                    className="px-3 sm:px-4 py-2 text-tata-blue dark:text-tata-gold border border-tata-blue dark:border-tata-gold rounded-lg hover:bg-tata-blue hover:text-white dark:hover:bg-tata-gold dark:hover:text-tata-darkGray transition-all font-medium text-sm sm:text-base"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsSignInModalOpen(true)}
                    className="hidden sm:block px-4 py-2 text-tata-blue dark:text-tata-gold border border-tata-blue dark:border-tata-gold rounded-lg hover:bg-tata-blue hover:text-white dark:hover:bg-tata-gold dark:hover:text-tata-darkGray transition-all font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsSignUpModalOpen(true)}
                    className="px-3 sm:px-4 py-2 text-tata-blue dark:text-tata-gold border border-tata-blue dark:border-tata-gold rounded-lg hover:bg-tata-blue hover:text-white dark:hover:bg-tata-gold dark:hover:text-tata-darkGray transition-all font-medium text-sm sm:text-base"
                  >
                    Sign Up
                  </button>
                </>
              )}
              <button
                onClick={() => navigate('/chat')}
                className="bg-gradient-to-r from-tata-blue to-tata-lightBlue hover:from-tata-lightBlue hover:to-tata-blue text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center space-x-2 text-sm sm:text-base"
              >
                <FaComments />
                <span className="hidden sm:inline">Apply Now</span>
                <span className="sm:hidden">Chat</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-tata-blue via-blue-700 to-tata-lightBlue dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-screen-2xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
                 AI-Powered Loan Processing
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Your Trusted Partner in Financial Solutions
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Experience instant loan approvals with our intelligent chatbot. From
                application to sanction, we make it seamless.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/chat')}
                  className="bg-white text-tata-blue hover:bg-tata-gold hover:text-white font-bold px-8 py-4 rounded-lg shadow-xl transform transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <FaComments />
                  <span>Start Your Application</span>
                </button>
                <button className="border-2 border-white hover:bg-white hover:text-tata-blue font-bold px-8 py-4 rounded-lg transform transition-all duration-300 hover:scale-105">
                  Learn More
                </button>
              </div>
            </div>
            <div className="hidden md:block animate-slide-in-right">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                      <div
                        key={index}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center transform hover:scale-110 transition-all duration-300"
                      >
                        <div className="text-3xl font-bold text-tata-gold mb-2">
                          {stat.value}
                        </div>
                        <div className="text-sm text-blue-100">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Products Section */}
      <section id="products" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Loan Products
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Tailored financial solutions for every need
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loanProducts.map((product, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200 dark:border-gray-600 group animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-tata-blue dark:text-tata-gold mb-4 transform group-hover:scale-110 transition-transform">
                  {product.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Starting from
                  </span>
                  <span className="text-lg font-bold text-tata-blue dark:text-tata-gold">
                    {product.rate}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full mt-4 bg-gradient-to-r from-tata-blue to-tata-lightBlue text-white font-semibold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose CrediFlow?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Banking powered by intelligence
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-tata-blue to-tata-lightBlue dark:from-blue-600 dark:to-blue-800 rounded-full text-white mb-4 shadow-lg group-hover:shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-tata-blue to-tata-lightBlue dark:from-gray-800 dark:to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers who trust CrediFlow for their
            financial needs
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="bg-white text-tata-blue hover:bg-tata-gold hover:text-white font-bold px-12 py-5 rounded-lg shadow-2xl transform transition-all duration-300 hover:scale-110 text-lg flex items-center space-x-3 mx-auto"
          >
            <FaComments className="text-2xl" />
            <span>Start Your Loan Application Now</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-tata-darkGray dark:bg-gray-950 text-white py-12">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-tata-gold">CrediFlow</h3>
              <p className="text-gray-400 text-sm">
                A TATA Enterprise delivering trusted financial solutions since 1995.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#products"
                    className="text-gray-400 hover:text-tata-gold transition"
                  >
                    Products
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-gray-400 hover:text-tata-gold transition"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-400 hover:text-tata-gold transition"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-tata-gold transition"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-tata-gold transition"
                  >
                    EMI Calculator
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-tata-gold transition"
                  >
                    FAQs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-tata-gold transition"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-tata-gold transition"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect With Us</h4>
              <div className="flex space-x-4 mb-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 hover:bg-tata-blue rounded-full flex items-center justify-center transition"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 hover:bg-tata-blue rounded-full flex items-center justify-center transition"
                >
                  <FaTwitter />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 hover:bg-tata-blue rounded-full flex items-center justify-center transition"
                >
                  <FaLinkedinIn />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 hover:bg-tata-blue rounded-full flex items-center justify-center transition"
                >
                  <FaYoutube />
                </a>
              </div>
              <p className="text-sm text-gray-400">1800-209-8800</p>
              <p className="text-sm text-gray-400">[email protected]</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 CrediFlow - A TATA Enterprise. All rights reserved.</p>
            <p className="mt-2">Making financial dreams a reality </p>
          </div>
        </div>
      </footer>

      {/* Auth Modals */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSwitchToSignUp={() => {
          setIsSignInModalOpen(false);
          setIsSignUpModalOpen(true);
        }}
      />
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onSwitchToSignIn={() => {
          setIsSignUpModalOpen(false);
          setIsSignInModalOpen(true);
        }}
      />
    </div>
  );
};

export default Home;
