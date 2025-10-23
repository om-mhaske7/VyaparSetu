import React, { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 leading-tight">Empowering local street-food vendors with a simple, trust-based B2B marketplace</h1>
            <p className="text-lg text-gray-600 max-w-2xl mt-4">
              Vendors find verified raw-material bundles nearby. Suppliers build trust with reviews and KYC. Admins manage the marketplace to keep it safe and scalable.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => navigate('/login')}
                className="bg-green-600 text-white px-5 py-3 rounded-lg font-semibold"
              >Get Started</button>
              <a href="#features" className="px-5 py-3 rounded-lg border border-green-200 text-green-700">See features</a>
            </div>
          </div>

          <div>
            <img
              src="https://github.com/user-attachments/assets/ed180ac3-709c-42e2-a2ff-23e0dc23b928"
              alt="VendorMitra banner"
              className="rounded-xl shadow-md w-full object-cover h-64"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Core Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-semibold">Vendor Dashboard</h3>
            <p className="text-sm text-gray-600 mt-2">Browse bundles, add to cart, place quantity-based orders and view supplier ratings.</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-semibold">Supplier Dashboard</h3>
            <p className="text-sm text-gray-600 mt-2">List products, manage orders, dispatch updates and earn a verified badge via KYC.</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-semibold">Admin Panel</h3>
            <p className="text-sm text-gray-600 mt-2">Approve suppliers, manage bundles and handle disputes.</p>
          </div>
        </div>
      </section>

      {/* Sample bundles */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sample Raw Material Bundles</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Bundle Name</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Includes</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Est. Price</th>
              </tr>
            </thead>
            <tbody>
              {sampleBundles.map((b, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{b.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.includes}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{b.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Trust mechanism */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Trust & Safety</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h4 className="font-semibold">Reviews & Ratings</h4>
            <p className="text-sm text-gray-600 mt-2">Vendors leave ratings and comments to build supplier reputation.</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h4 className="font-semibold">KYC Verification</h4>
            <p className="text-sm text-gray-600 mt-2">Suppliers upload documents for admin verification and a trusted badge.</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h4 className="font-semibold">Verified Badge</h4>
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
                <div className="px-4 pb-4 text-sm text-gray-600">{f.a}</div>
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
