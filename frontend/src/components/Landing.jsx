import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "How do vendors place orders?",
      a: "Vendors browse bundles or products, add quantities to cart and place orders for pickup or shared delivery.",
    },
    {
      q: "How are suppliers verified?",
      a: "Suppliers upload KYC documents for admin review. Verified suppliers get a badge and higher visibility.",
    },
    {
      q: "Can I manage orders as a supplier?",
      a: "Yes — suppliers can accept/reject orders, update dispatch status, and communicate with vendors.",
    },
  ];

  const sampleBundles = [
    {
      name: "Chaat Stall Starter",
      includes: "Potatoes, onions, sev, spices, chutneys",
      price: "₹700",
    },
    {
      name: "Dosa Cart Pack",
      includes: "Rice, urad dal, oil, sambar masala",
      price: "₹900",
    },
  ];

  useEffect(() => {
    const els = document.querySelectorAll("[data-animate]");
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el, i) => {
      if (el.classList.contains("card-entrance")) {
        el.classList.add(`delay-${(i % 3) + 1}`);
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white text-gray-800 overflow-hidden">
      {/* HERO SECTION */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1604454795373-3c46c9f70620?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/50 to-white/80"></div>

        <div className="container relative z-10 mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div
              data-animate
              className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-green-900 shadow-sm fade-up"
            >
              🌿 Trusted by local suppliers & vendors
            </div>

            <h1
              data-animate
              className="mt-6 text-5xl font-extrabold leading-tight text-gray-900 fade-up"
            >
              Empowering street-food vendors with a{" "}
              <span className="text-green-700">trust-based B2B platform</span>
            </h1>
            <p
              data-animate
              className="mt-4 text-lg text-gray-700 max-w-xl fade-up"
            >
              Vendors find verified raw-material bundles nearby. Suppliers build
              trust with reviews and KYC. Admins manage everything with ease.
            </p>

            <div className="flex gap-3 mt-8 fade-up">
              <button
                onClick={() => navigate("/login")}
                className="bg-green-600 hover:bg-green-700 transition-transform transform hover:scale-105 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
              >
                Get Started
              </button>
              <a
                href="#features"
                className="px-6 py-3 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-all flex items-center gap-2"
              >
                See Features →
              </a>
            </div>
          </div>

          {/* Floating hero image */}
          <div className="rounded-xl overflow-hidden shadow-lg bg-white/80 backdrop-blur-sm animate-float">
            <img
              src="https://github.com/user-attachments/assets/ed180ac3-709c-42e2-a2ff-23e0dc23b928"
              alt="Vendor Mitra banner"
              className="w-full object-cover h-64"
            />
            <div className="p-5">
              <h4 className="font-semibold text-gray-800">
                Local bundles, delivered reliably
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Find curated bundles near you with supplier ratings and verified
                KYC badges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VISION SECTION */}
      <section className="bg-green-50 py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-green-800 mb-3">Our Vision</h2>
          <p className="max-w-2xl mx-auto text-gray-700">
            VendorMitra bridges the gap between local street vendors and trusted
            suppliers, fostering transparent trade and empowering small
            businesses across India.
          </p>
          <p className="mt-3 text-green-700 font-medium">
            🌟 230+ vendors and 60+ suppliers onboard
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Core Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              title: "Vendor Dashboard",
              desc: "Browse bundles, place orders, and view supplier ratings.",
            },
            {
              title: "Supplier Dashboard",
              desc: "List products, manage orders, and earn a verified badge.",
            },
            {
              title: "Admin Panel",
              desc: "Approve suppliers, manage bundles and disputes.",
            },
          ].map((f, i) => (
            <div
              key={i}
              data-animate
              className="bg-white p-6 rounded-xl shadow-sm text-center card-entrance border-t-4 border-green-400 transition-transform transform hover:scale-105 hover:shadow-md"
            >
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-green-100 rounded-full mb-3 transition-transform hover:rotate-6">
                {/* Minimal inline icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="#15803d"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-800">{f.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SAMPLE BUNDLES */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Sample Raw Material Bundles
          </h2>
          <div className="flex gap-4 overflow-x-auto py-4 justify-center">
            {sampleBundles.map((b, i) => (
              <div
                key={i}
                data-animate
                className="min-w-[260px] bg-white rounded-xl shadow-sm p-5 card-entrance border border-gray-100 hover:shadow-md transition transform hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{b.name}</h3>
                  <div className="text-sm font-semibold text-green-700">
                    {b.price}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{b.includes}</p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => navigate("/login")}
                    className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                  >
                    Order
                  </button>
                  <button className="text-sm px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST & SAFETY */}
      <section className="bg-green-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Trust & Safety
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                title: "Reviews & Ratings",
                desc: "Vendors build supplier reputation with ratings.",
              },
              {
                title: "KYC Verification",
                desc: "Suppliers verify via admin-approved documents.",
              },
              {
                title: "Verified Badge",
                desc: "Trusted suppliers earn visibility and credibility.",
              },
            ].map((t, i) => (
              <div
                key={i}
                data-animate
                className="bg-white p-6 rounded-xl shadow-sm card-entrance text-center border-t-4 border-green-400 hover:shadow-md transition-transform transform hover:scale-105"
              >
                <div className="mx-auto w-12 h-12 flex items-center justify-center bg-green-100 rounded-full mb-3 hover:rotate-6 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="#15803d"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold mt-3 text-gray-800">{t.title}</h4>
                <p className="text-sm text-gray-600 mt-2">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {faqs.map((f, idx) => (
              <div
                key={idx}
                className="bg-green-50 rounded-lg shadow-sm hover:shadow-md transition-transform transform hover:scale-102"
              >
                <button
                  onClick={() =>
                    setOpenFaq(openFaq === idx ? null : idx)
                  }
                  className="w-full text-left px-5 py-3 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2 font-medium text-gray-800">
                    {/* Inline FAQ icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                      stroke="#15803d"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m2-9h-6m0 0H7m5-5v2m0 16v2"
                      />
                    </svg>
                    {f.q}
                  </span>
                  <span className="text-gray-500">
                    {openFaq === idx ? "-" : "+"}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-sm text-gray-600">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-700 text-white py-6 text-center">
        <p>© 2025 VyapaarSetu | Made with ❤️ </p>
        <p className="text-green-200 text-sm mt-1">
          Empowering India’s street entrepreneurs
        </p>
      </footer>

      {/* Floating animation */}
      <style>
        {`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        `}
      </style>
    </div>
  );
}
