import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/logo/Logo'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CONTACT_EMAIL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Privacy Policy: AbujaHommes AI',
  description:
    'Privacy Policy and Nigeria Data Protection Regulation (NDPR) disclosures for AbujaHommes AI users in the Federal Capital Territory, Abuja, Nigeria.',
}

export default function PrivacyPolicyPage() {
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
                Data Protection and Privacy
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A] mb-2">
                Privacy Policy: AbujaHommes AI
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
                  1. Data We Collect
                </h2>
                <p className="mb-3">
                  We collect only the information we need to connect buyers with genuine sellers across Abuja. We group our data into four categories:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-3">
                  <li>
                    <strong>Profile information:</strong> Your name, email address, phone or WhatsApp number, account role (buyer or seller), and optional profile picture.
                  </li>
                  <li>
                    <strong>Listing information:</strong> For sellers, we collect property locations in the FCT, asking prices, property specifications, title descriptions, and uploaded photographs.
                  </li>
                  <li>
                    <strong>Messages:</strong> In-app chat messages, viewing requests, and inquiries sent between buyers and sellers to help both sides track their deals.
                  </li>
                  <li>
                    <strong>Device and session logs:</strong> IP addresses, browser types, and login timestamps used to prevent unauthorized logins and maintain platform security.
                  </li>
                </ul>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  2. Google Sign-In
                </h2>
                <p className="mb-3">
                  You can sign in to AbujaHommes AI using your Google account.
                </p>
                <p className="mb-3">
                  When you do, Google shares your verified email address, full name, and avatar picture with us.
                </p>
                <p>
                  We never see, handle, or store your Google password. We use this data only to confirm your identity, set up your profile, and keep your session secure.
                </p>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  3. Photos Stored with Our Hosting Provider
                </h2>
                <p className="mb-3">
                  Property photos uploaded by sellers are saved on secure cloud storage infrastructure provided by our hosting partner.
                </p>
                <p className="mb-3">
                  These photos appear publicly on active listings so prospective buyers across Abuja can inspect the property visually before scheduling a visit.
                </p>
                <p>
                  Sellers: Please upload only photos of the real estate itself. Do not upload photos showing national ID cards, bank statements, family members, or private documents.
                </p>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  4. Cookies and Session Management
                </h2>
                <p className="mb-3">
                  AbujaHommes AI uses basic first-party cookies and local storage tokens. These are strictly necessary to run the platform:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 mb-3">
                  <li>Session tokens to keep you logged in as you browse listings.</li>
                  <li>Filter preferences to remember the Abuja districts you selected.</li>
                  <li>Security tokens to prevent request forgery and protect API endpoints.</li>
                </ul>
                <p>
                  We do not use third-party advertising cookies, commercial trackers, or cross-site tracking scripts.
                </p>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  5. NDPR-Style Rights: Access and Deletion Requests
                </h2>
                <p className="mb-3">
                  Under the Nigeria Data Protection Act (NDPA) and NDPR standards, you have legal rights regarding your personal data:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-3">
                  <li>
                    <strong>Right of Access:</strong> You can ask us for a copy of the personal information we hold about you.
                  </li>
                  <li>
                    <strong>Right to Correction:</strong> You can update inaccurate profile or listing details directly in your account dashboard, or ask us to correct it.
                  </li>
                  <li>
                    <strong>Right to Deletion:</strong> You can request that we delete your account and personal records. We will delete your data promptly, unless we are legally required to keep specific transaction or fraud investigation logs.
                  </li>
                  <li>
                    <strong>Right to Restrict Processing:</strong> You can ask us to pause or limit how we handle your personal data.
                  </li>
                </ul>
                <p>
                  To exercise any of these rights, email our privacy desk at the address below.
                </p>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  6. We Do Not Sell Personal Contacts to Telemarketers
                </h2>
                <div className="bg-[#F0F4EC] border-l-4 border-[#2D5A3D] p-4 rounded-r-lg my-4 text-xs sm:text-sm text-[#3D3D3D] space-y-2">
                  <p className="font-semibold text-[#1E3D29]">
                    Our Zero-Spam Policy:
                  </p>
                  <p>
                    We do <strong>not</strong> sell, rent, lease, or trade your phone number, WhatsApp contact, or email address to marketing agencies, telemarketers, or bulk lead brokers.
                  </p>
                </div>
                <p>
                  Your contact details are shared only when you deliberately submit an inquiry or message a seller about a specific listing, or if required by an official Nigerian court order.
                </p>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  7. Retention (Account Life and Reasonable Logs)
                </h2>
                <p className="mb-3">
                  We keep personal data based on clear guidelines:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-3">
                  <li>
                    <strong>Active accounts:</strong> We retain your profile information, listings, and messages while your account remains active.
                  </li>
                  <li>
                    <strong>Security and fraud logs:</strong> When you delete an account or take down a listing, we may keep basic inquiry logs, dispute notes, and fraud records for 12 to 24 months. We do this to catch repeat scammers, defend against financial claims, and comply with statutory audits.
                  </li>
                </ul>
                <p>
                  Once the retention period expires, we permanently purge or anonymize your data.
                </p>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3D29] mb-3">
                  8. Contact for Privacy Requests
                </h2>
                <p className="mb-3">
                  To request data access, update your information, or delete your account:
                </p>
                <div className="bg-[#F0F4EC] border border-[#D4E0C8] rounded-xl p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D] mb-1">
                    Privacy and Data Protection Desk
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
                  href="/terms"
                  className="font-medium text-[#2D5A3D] underline hover:text-[#1E3D29] transition-colors"
                >
                  Terms of Service
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
