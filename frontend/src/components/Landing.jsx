import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'How do vendors place orders?',
      a: 'Vendors browse bundles or products, add quantities to cart and place orders for pickup or shared delivery.'
    },
    {
      q: 'How are suppliers verified?',
      a: 'Suppliers upload KYC documents for admin review. Verified suppliers get a badge and higher visibility.'
    },
    {
      q: 'Can I manage orders as a supplier?',
      a: 'Yes — suppliers can accept/reject orders, update dispatch status, and communicate with vendors.'
    }
  ];

  const sampleBundles = [
    { name: 'Chaat Stall Starter', includes: 'Potatoes, onions, sev, spices, chutneys', price: '₹700' },
    { name: 'Dosa Cart Pack', includes: 'Rice, urad dal, oil, sambar masala', price: '₹900' }
  ];

  useEffect(() => {
    const els = document.querySelectorAll('[data-animate]');
    if (!els || els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // if we want one-time animations, unobserve after it appears
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el, i) => {
      // add small stagger via delay classes when appropriate
      if (el.classList && el.classList.contains('card-entrance')) {
        el.classList.add(`delay-${(i % 3) + 1}`);
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero */}
      <section className="container mx-auto px-4 py-12 relative overflow-visible">
        {/* decorative blob */}
        <div aria-hidden className="hero-blob rounded-full bg-gradient-to-tr from-green-300 to-emerald-400"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative z-20">
            <div data-animate className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-green-800 shadow-sm fade-up">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-none"><path d="M12 2v6l4-4" stroke="#065f46" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Trusted by suppliers & vendors
            </div>

            <h1 data-animate className="mt-6 text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight fade-up">Empowering local street-food vendors with a simple, trust-based B2B marketplace</h1>
            <p className="text-lg text-gray-600 max-w-2xl mt-4">Vendors find verified raw-material bundles nearby. Suppliers build trust with reviews and KYC. Admins manage the marketplace to keep it safe and scalable.</p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => navigate('/login')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold btn-tilt shadow-md"
              >Get Started</button>
              <a href="#features" className="px-5 py-3 rounded-lg border border-green-200 text-green-700 flex items-center gap-2">See features
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-80"><path d="M5 12h14M13 5l7 7-7 7" stroke="#166534" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>
          </div>

          <div className="hero-card">
            <div data-animate className="rounded-xl shadow-xl overflow-hidden bg-white card-entrance">
              <img
                src="https://github.com/user-attachments/assets/ed180ac3-709c-42e2-a2ff-23e0dc23b928"
                alt="VendorMitra banner"
                className="w-full object-cover h-64"
              />
              <div className="p-4 bg-gradient-to-t from-white/90 to-transparent">
                <h4 className="font-semibold text-gray-800">Local bundles, delivered reliably</h4>
                <p className="text-sm text-gray-600 mt-1">Find curated bundles near you with supplier ratings and verified KYC badges.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Core Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div data-animate className="bg-white p-5 rounded-xl shadow-sm card-entrance flex gap-3 items-start">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M3 12h18" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 3v18" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <h3 className="font-semibold">Vendor Dashboard</h3>
              <p className="text-sm text-gray-600 mt-2">Browse bundles, add to cart, place quantity-based orders and view supplier ratings.</p>
            </div>
          </div>

          <div data-animate className="bg-white p-5 rounded-xl shadow-sm card-entrance flex gap-3 items-start">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z" stroke="#b45309" strokeWidth="0.8" fill="rgba(244,163,0,0.08)"/></svg>
            </div>
            <div>
              <h3 className="font-semibold">Supplier Dashboard</h3>
              <p className="text-sm text-gray-600 mt-2">List products, manage orders, dispatch updates and earn a verified badge via KYC.</p>
            </div>
          </div>

          <div data-animate className="bg-white p-5 rounded-xl shadow-sm card-entrance flex gap-3 items-start">
            <div className="p-3 rounded-lg bg-sky-50 text-sky-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" stroke="#0369a1" strokeWidth="1.2"/></svg>
            </div>
            <div>
              <h3 className="font-semibold">Admin Panel</h3>
              <p className="text-sm text-gray-600 mt-2">Approve suppliers, manage bundles and handle disputes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample bundles */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sample Raw Material Bundles</h2>
        <div className="flex gap-4 overflow-x-auto py-2" aria-label="sample-bundles">
          {sampleBundles.map((b, i) => (
            <div data-animate key={i} className="min-w-[260px] bg-white rounded-xl shadow-sm p-4 card-entrance">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{b.name}</h3>
                <div className="text-sm font-semibold text-green-700">{b.price}</div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{b.includes}</p>
              <div className="mt-4 flex items-center gap-2">
                <button onClick={() => navigate('/login')} className="text-sm bg-green-600 text-white px-3 py-1 rounded-md">Order</button>
                <button className="text-sm px-2 py-1 rounded-md border border-gray-200 text-gray-700">View</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust mechanism */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Trust & Safety</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div data-animate className="bg-white p-6 rounded-xl shadow-sm card-entrance text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z" stroke="#16a34a" strokeWidth="1.2"/></svg>
            </div>
            <h4 className="font-semibold mt-3">Reviews & Ratings</h4>
            <p className="text-sm text-gray-600 mt-2">Vendors leave ratings and comments to build supplier reputation.</p>
          </div>

          <div data-animate className="bg-white p-6 rounded-xl shadow-sm card-entrance text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2v6l4-4" stroke="#4338ca" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h4 className="font-semibold mt-3">KYC Verification</h4>
            <p className="text-sm text-gray-600 mt-2">Suppliers upload documents for admin verification and a trusted badge.</p>
          </div>

          <div data-animate className="bg-white p-6 rounded-xl shadow-sm card-entrance text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" stroke="#0369a1" strokeWidth="1.2"/></svg>
            </div>
            <h4 className="font-semibold mt-3">Verified Badge</h4>
            <p className="text-sm text-gray-600 mt-2">Verified suppliers get higher visibility and trust signals to vendors.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((f, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left px-4 py-3 flex items-center justify-between"
              >
                <span className="font-medium text-gray-800">{f.q}</span>
                <span className="text-gray-500">{openFaq === idx ? '-' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-sm text-gray-600 accordion-answer">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-white border-t py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          Made with ❤️ to empower India’s street entrepreneurs.
        </div>
      </footer>
    </div>
  );
}
