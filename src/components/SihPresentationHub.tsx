import React from 'react';
import {
  BookOpen,
  Award,
  Layers,
  Database,
  Server,
  Code2,
  Terminal,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  IndianRupee,
  X,
} from 'lucide-react';

interface SihPresentationHubProps {
  onClose: () => void;
}

export const SihPresentationHub: React.FC<SihPresentationHubProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-700 text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                SIH Problem Statement ID: 26047
              </span>
              <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded">
                Mentor Guide & Pitch Deck
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 font-sans tracking-tight">
              Strengthening Market Linkages & Price Discovery for Farmers
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Complete project architecture, transparent algorithms, and presentation checklist for your 2-week internal hackathon.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-slate-800 text-xs sm:text-sm">
          {/* 1. Core Problem & 2-Week MVP Scope */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2 font-sans tracking-tight">
              <Award className="w-5 h-5 text-emerald-700" />
              <span>1. The Core Hackathon Flow (Zero Over-Engineering)</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Smallholder farmers and FPOs lose 20-30% of potential earnings due to asymmetric price information and opaque transport costs. KisanSetu eliminates the middleman layer with a 5-step price discovery pipeline:
            </p>

            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-emerald-950">
                <div className="bg-white px-3 py-2 rounded-xl border border-emerald-300 shadow-xs">
                  1. Farmer Enters Produce<br />
                  <span className="text-[11px] font-normal text-slate-600">Onion / 500kg / Grade A / Durgapur</span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-700 hidden sm:block" />
                <div className="bg-white px-3 py-2 rounded-xl border border-emerald-300 shadow-xs">
                  2. System Matches Buyers<br />
                  <span className="text-[11px] font-normal text-slate-600">Filters 20+ platform-listed mandis & buyers</span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-700 hidden sm:block" />
                <div className="bg-white px-3 py-2 rounded-xl border border-emerald-300 shadow-xs">
                  3. Freight & Net Return<br />
                  <span className="text-[11px] font-normal text-slate-600">Gross Rev - Road Freight = Net Return</span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-700 hidden sm:block" />
                <div className="bg-white px-3 py-2 rounded-xl border border-emerald-300 shadow-xs">
                  4. Transparent Ranking<br />
                  <span className="text-[11px] font-normal text-slate-600">Top recommendation with reasons</span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-700 hidden sm:block" />
                <div className="bg-white px-3 py-2 rounded-xl border border-emerald-300 shadow-xs">
                  5. Digital Offer<br />
                  <span className="text-[11px] font-normal text-slate-600">Direct offer with 1-click accept</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Transparent Scoring Algorithm */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2 font-sans tracking-tight">
              <Code2 className="w-5 h-5 text-emerald-700" />
              <span>2. Transparent Recommendation Algorithm</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Formulas Applied:</div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li>• <strong>Gross Revenue</strong> = <code>Quantity (kg) × Buyer Rate (₹/kg)</code></li>
                  <li>• <strong>Distance (km)</strong> = <code>Haversine(Farmer LatLng, Buyer LatLng)</code></li>
                  <li>• <strong>Estimated Freight</strong> = <code>Base Fixed (₹400-₹1600) + Distance × Rate/km</code></li>
                  <li>• <strong>Estimated Net Return</strong> = <code>Gross Revenue - Freight Cost</code></li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Multi-Factor Scoring Weights:</div>
                <div className="space-y-1 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>1. Buyer Offered Price:</span>
                    <strong className="text-emerald-700">40%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>2. Procurement Demand (High/Med/Low):</span>
                    <strong className="text-emerald-700">20%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>3. Proximity Distance (Transit time & loss):</span>
                    <strong className="text-emerald-700">20%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>4. Final Estimated Net Return:</span>
                    <strong className="text-emerald-700">20%</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Database Schema */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2 font-sans tracking-tight">
              <Database className="w-5 h-5 text-emerald-700" />
              <span>3. Relational Database Schema (PostgreSQL / Supabase Ready)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl space-y-1">
                <div className="text-emerald-400 font-bold font-sans text-xs">TABLE: farmers</div>
                <div>id (UUID PRIMARY KEY)</div>
                <div>name (VARCHAR)</div>
                <div>mobile (VARCHAR UNIQUE)</div>
                <div>location (VARCHAR)</div>
                <div>lat, lng (FLOAT)</div>
                <div>farm_size_acres (FLOAT)</div>
                <div>fpo_name (VARCHAR)</div>
              </div>

              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl space-y-1">
                <div className="text-emerald-400 font-bold font-sans text-xs">TABLE: buyers</div>
                <div>id (UUID PRIMARY KEY)</div>
                <div>name (VARCHAR)</div>
                <div>business_type (VARCHAR)</div>
                <div>location, state (VARCHAR)</div>
                <div>lat, lng (FLOAT)</div>
                <div>contact_phone (VARCHAR)</div>
                <div>rating (FLOAT), verified (BOOL)</div>
                <div>payment_terms (VARCHAR)</div>
              </div>

              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl space-y-1">
                <div className="text-emerald-400 font-bold font-sans text-xs">TABLE: farmer_listings & offers</div>
                <div>id (UUID PRIMARY KEY)</div>
                <div>farmer_id, buyer_id (FK)</div>
                <div>crop_name, quantity_kg</div>
                <div>quality_grade (ENUM)</div>
                <div>offered_price_per_kg (DECIMAL)</div>
                <div>transport_cost, net_return</div>
                <div>status (PENDING/ACCEPTED/REJECTED)</div>
              </div>
            </div>
          </section>

          {/* 4. REST API Documentation */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2 font-sans tracking-tight">
              <Server className="w-5 h-5 text-emerald-700" />
              <span>4. Clean REST API Endpoints</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5">Endpoint</th>
                    <th className="p-2.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  <tr>
                    <td className="p-2.5 font-bold text-blue-600">POST</td>
                    <td className="p-2.5">/api/auth/login, /register</td>
                    <td className="p-2.5 font-sans">Farmer and Buyer profile registration</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-700">GET</td>
                    <td className="p-2.5">/api/buyers?crop=Onion</td>
                    <td className="p-2.5 font-sans">Fetch buyers purchasing specific crop</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-blue-600">POST</td>
                    <td className="p-2.5">/api/listings</td>
                    <td className="p-2.5 font-sans">Create crop lot & return instant recommendations</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-700">GET</td>
                    <td className="p-2.5">/api/recommendations/:id</td>
                    <td className="p-2.5 font-sans">Ranked buyer matches with net return breakdown</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-blue-600">POST</td>
                    <td className="p-2.5">/api/offers</td>
                    <td className="p-2.5 font-sans">Submit digital purchase offer from buyer or farmer</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-amber-600">PUT</td>
                    <td className="p-2.5">/api/offers/:id</td>
                    <td className="p-2.5 font-sans">Update status to ACCEPTED or REJECTED</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-purple-600">POST</td>
                    <td className="p-2.5">/api/ai/advisor</td>
                    <td className="p-2.5 font-sans">KisanMitra AI Assistant answering market questions</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. Local Run Instructions */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2 font-sans tracking-tight">
              <Terminal className="w-5 h-5 text-emerald-700" />
              <span>5. How to Run Locally for Your Team</span>
            </h3>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs space-y-2">
              <div className="text-slate-400"># 1. Clone repo & install dependencies</div>
              <div>git clone https://github.com/your-team/kisansetu.git</div>
              <div>npm install</div>
              <div className="text-slate-400 pt-2"># 2. Start Full-Stack Dev Server (Express API + Vite React on port 3000)</div>
              <div>npm run dev</div>
              <div className="text-slate-400 pt-2"># 3. Open browser at http://localhost:3000</div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer"
          >
            Back to Application Demo
          </button>
        </div>
      </div>
    </div>
  );
};
