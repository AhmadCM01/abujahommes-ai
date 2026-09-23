import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/logo/Logo'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CONTACT_EMAIL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Terms of Service: AbujaHommes AI',
  description:
    'Terms of Service for AbujaHommes AI. Property search, price intelligence, and verified listings in the Federal Capital Territory, Abuja, Nigeria.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F5EDD6] text-[#1A1A1A] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[720px] mx-auto space-y-6 text-left">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4">
          <Logo variant="full" />
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/80 hover:bg-white text-xs sm:text-sm font-medium text-[#1A1A1A] border-[#D6C9A8]"
            >
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Content Card */}
        <Card
          elevation="1"
          className="p-6 sm:p-10 md:p-12 bg-white border border-[#D6C9A8] rounded-2xl shadow-sm text-left"
        >
          <article className="text-left">
            {/* Header */}
            <header className="border-b border-[#EDE0C4] pb-6 mb-8">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0F4EC] text-[#2D5A3D] mb-3">
                FCT Real Estate Intelligence
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A] mb-2">
                Terms of Service: AbujaHommes AI
              </h1>
              <p className="text-xs sm:text-sm text-[#5C5C5C]">
                Last updated: 18 September 2026
              </p>
            </header>

            {/* Content Body */}
            <div className="space-y-8 text-sm text-[#3D3D3D] leading-relaxed">
              {/* Section 1 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  1. Operator and Scope (Abuja and FCT Listings Only)
                </h2>
                <p className="mb-3">
                  AbujaHommes AI is built specifically for property in Abuja. Every listing, price estimate, and search filter covers the <strong>Federal Capital Territory (FCT), Nigeria</strong> only.
                </p>
                <p className="mb-3">
                  Our coverage includes all six area councils: AMAC (Maitama, Asokoro, Wuse, Garki, Jabi, Utako, Guzape, Lugbe), Bwari (Kubwa, Bwari town), Gwagwalada, Kuje, Kwali, and Abaji.
                </p>
                <p>
                  We do not accept listings outside the FCT. If you list a property located in another state, we will remove it. By using this website, you agree to these terms.
                </p>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  2. Accounts and Roles (Buyer, Seller, Admin)
                </h2>
                <p className="mb-3">
                  We organize user accounts into three simple roles:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-3">
                  <li>
                    <strong>Buyers and Seekers:</strong> People looking to rent or buy homes, land, or commercial space in Abuja. You can search, review price estimates, save listings, and message sellers directly.
                  </li>
                  <li>
                    <strong>Sellers, Agents, and Landlords:</strong> Verified individuals or agencies listing properties in the FCT. You must have legitimate legal authority to market any property you post. That means you are the owner, or you hold a direct, verifiable mandate from the owner.
                  </li>
                  <li>
                    <strong>Administrators:</strong> Our team members who moderate listings, review fraud reports, and keep the platform running smoothly.
                  </li>
                </ul>
                <p>
                  Keep your login details confidential. You are responsible for all actions taken under your account.
                </p>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  3. Listings, Photos, and Prohibited Fraud
                </h2>
                <p className="mb-3">
                  Property scams ruin deals and waste time. We operate a zero-tolerance policy against deceptive listings on AbujaHommes AI.
                </p>
                <p className="mb-3">
                  <strong>Accurate details:</strong> Every listing must state the true location, correct district, realistic asking price, actual size, and accurate title type.
                </p>
                <p className="mb-3">
                  <strong>Photo rules:</strong> Upload only clear, recent photos of the actual property. Do not use internet mockups, stock pictures, or photos taken from other agents without permission.
                </p>
                <p className="mb-3 font-semibold text-[#1A1A1A]">
                  Strictly prohibited actions:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-3">
                  <li>
                    <strong>Fake title claims:</strong> Uploading falsified Certificate of Occupancy (C of O), Right of Occupancy (R of O), forged allocation letters, or fake gazette claims.
                  </li>
                  <li>
                    <strong>Inspection fee scams:</strong> Demanding upfront &quot;commitment fees,&quot; &quot;inspection deposits,&quot; or &quot;fuel money&quot; before a buyer physically inspects the property.
                  </li>
                  <li>
                    <strong>Bait and switch pricing:</strong> Posting a cheap price in Maitama or Jabi to get calls, then claiming the house is gone and pushing another property.
                  </li>
                  <li>
                    <strong>Ghost listings:</strong> Advertising properties you do not have a mandate for, or leaving sold properties online to fish for buyers.
                  </li>
                </ul>
                <p>
                  If we detect fraud, we will delete the listing immediately, ban your account permanently, and share your records with Nigerian law enforcement.
                </p>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  4. AI Estimates and Fraud Scores (Not an AGIS Search or Valuation)
                </h2>
                <p className="mb-3">
                  AbujaHommes AI uses machine learning trained on local Abuja market data. We generate fair price ranges, price per square meter benchmarks, and automated fraud risk scores.
                </p>
                <div className="bg-[#FDF8EC] border-l-4 border-[#C9962A] p-4 rounded-r-lg my-4 text-xs sm:text-sm text-[#5C5C5C] space-y-2">
                  <p className="font-semibold text-[#1A1A1A]">
                    Clear legal notice for all buyers and investors:
                  </p>
                  <p>
                    Our price predictions and fraud scores are automated statistical estimates for reference only. They are <strong>not</strong>:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>A certified valuation by a licensed estate surveyor and valuer (NIESV).</li>
                    <li>A formal structural or boundary survey.</li>
                    <li>A legal search or cadastral verification at the Abuja Geographic Information Systems (AGIS) or the Federal Capital Development Authority (FCDA).</li>
                  </ul>
                  <p>
                    AbujaHommes AI does not conduct AGIS searches on your behalf. We do not guarantee land titles or ownership history. Before you pay any money or sign contracts, you must physically inspect the property. You must also instruct a lawyer to conduct a formal search at AGIS.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  5. Chat and Enquiries
                </h2>
                <p className="mb-3">
                  Our in-app chat connects buyers and sellers directly so you can ask questions, schedule viewings, and discuss terms.
                </p>
                <p className="mb-3">
                  Keep all conversations polite, honest, and focused on the transaction. You must not use the chat to send spam, broadcast messages, extortion threats, or phishing links.
                </p>
                <p>
                  For your own safety, never send money, bank card details, or sensitive financial tokens over the chat.
                </p>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  6. Suspension and Termination
                </h2>
                <p className="mb-3">
                  We reserve the right to suspend or close your account, or remove your listings, with or without prior notice, if:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 mb-3">
                  <li>You break any part of these terms or our privacy policy.</li>
                  <li>You upload misleading photos, fake prices, or forged title documents.</li>
                  <li>You ask buyers for upfront inspection fees or booking deposits before viewing.</li>
                  <li>Your account triggers serious automated fraud warnings that you cannot explain.</li>
                  <li>We receive a lawful directive from Nigerian regulatory bodies or the police.</li>
                </ul>
                <p>
                  You can also delete your account at any time by contacting our support team.
                </p>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  7. Limitation of Liability (Plain Language)
                </h2>
                <p className="mb-3">
                  Here is the plain truth: AbujaHommes AI is an online discovery and pricing platform.
                </p>
                <p className="mb-3">
                  We do not own, manage, inspect, or lease any of the properties listed. We are not an estate agency, and we are not a party to any contract, lease, deed of assignment, or financial exchange between buyers and sellers.
                </p>
                <p className="mb-3">
                  We are not responsible for lost deposits, title defects, boundary disputes, physical property defects, or travel costs. You use this platform and its AI estimates at your own discretion.
                </p>
                <p>
                  The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis, without any warranties of any kind.
                </p>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  8. Governing Law: Federal Capital Territory, Nigeria
                </h2>
                <p className="mb-3">
                  These terms are governed by the laws of the <strong>Federal Republic of Nigeria</strong>, as applicable in the <strong>Federal Capital Territory, Abuja</strong>.
                </p>
                <p>
                  If any dispute arises that cannot be settled amicably, it must be resolved exclusively in the competent courts located within the Federal Capital Territory, Abuja, Nigeria.
                </p>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  9. Contact
                </h2>
                <p className="mb-3">
                  If you have questions about these terms, want to report a fake listing, or need help with your account:
                </p>
                <div className="bg-[#F0F4EC] border border-[#D4E0C8] rounded-xl p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D] mb-1">
                    Compliance and Support Desk
                  </p>
                  <p className="text-base font-semibold text-[#1A1A1A] mb-1">
                    AbujaHommes AI
                  </p>
                  <p className="text-sm text-[#5C5C5C] mb-2">
                    Operating in the Federal Capital Territory, Abuja, Nigeria
                  </p>
                  <p className="text-sm">
                    Email:{' '}
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="font-semibold text-[#2D5A3D] underline hover:text-[#1E3D29] transition-colors"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </p>
                </div>
              </section>
            </div>

            {/* Related Navigation Footer */}
            <footer className="mt-12 pt-6 border-t border-[#EDE0C4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5C5C5C]">
              <div className="flex items-center gap-4">
                <Link
                  href="/privacy"
                  className="font-medium text-[#2D5A3D] underline hover:text-[#1E3D29] transition-colors"
                >
                  Privacy Policy
                </Link>
                <span>·</span>
                <Link
                  href="/"
                  className="font-medium text-[#2D5A3D] underline hover:text-[#1E3D29] transition-colors"
                >
                  Return Home
                </Link>
              </div>
              <p>© 2026 AbujaHommes AI. All rights reserved.</p>
            </footer>
          </article>
        </Card>
      </div>
    </div>
  )
}
