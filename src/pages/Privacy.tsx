/**
 * Privacy Policy Page
 */

import { Header } from '@/components/layout/Header';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Last updated: December 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              BernardAI ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your information 
              when you use our startup discovery platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mt-4 mb-2">Account Information</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Email address</li>
              <li>Full name</li>
              <li>Organization details (if applicable)</li>
              <li>Password (encrypted)</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">Usage Data</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Features you use and actions you take</li>
              <li>Saved filters and preferences</li>
              <li>Startup lists and notes</li>
              <li>Search queries</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">Technical Data</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide and improve our Service</li>
              <li>Process transactions and manage subscriptions</li>
              <li>Send important notifications and alerts</li>
              <li>Personalize your experience</li>
              <li>Analyze usage patterns to enhance features</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do NOT sell your personal information. We may share data with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Service providers:</strong> Payment processors, cloud hosting, and analytics services necessary to operate our platform</li>
              <li><strong>Team members:</strong> Within your organization, based on your sharing settings</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>Encryption in transit (TLS/SSL) and at rest</li>
              <li>Secure authentication with hashed passwords</li>
              <li>Row-level security in our database</li>
              <li>Regular security audits</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights (GDPR & CCPA)</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate information</li>
              <li><strong>Erasure:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a standard format</li>
              <li><strong>Objection:</strong> Opt out of certain data processing</li>
              <li><strong>Restriction:</strong> Limit how we use your data</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, visit Settings → Security → Delete Account, 
              or contact us at privacy@bernardai.app.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your data while your account is active. Upon account deletion, 
              we permanently delete your personal data within 30 days, except where 
              required by law (e.g., transaction records for tax purposes).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
            <p className="text-muted-foreground mb-4">We use cookies for:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Essential cookies:</strong> Required for authentication and security</li>
              <li><strong>Preference cookies:</strong> Remember your settings</li>
              <li><strong>Analytics cookies:</strong> Understand how you use our Service</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You can manage cookie preferences in your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Third-Party Services</h2>
            <p className="text-muted-foreground">
              We integrate with third-party services for core platform functionality including authentication, payment processing, and data analysis. These services have their own privacy policies which we encourage you to review.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Proprietary Data & Trade Secrets</h2>
            <p className="text-muted-foreground">
              Our startup intelligence data is derived from proprietary sources, methodologies, and analytical processes. The specific data sources, collection methods, and analytical techniques used by BernardAI constitute trade secrets and confidential business information. We do not disclose our data sourcing methodology or specific data providers to protect the integrity and competitive advantage of our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our Service is not intended for users under 18 years of age. 
              We do not knowingly collect data from minors.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. International Transfers</h2>
            <p className="text-muted-foreground">
              Your data may be processed in countries outside your residence. 
              We ensure appropriate safeguards are in place for international transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy periodically. We will notify you of 
              significant changes via email or in-app notification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p className="text-muted-foreground">
              For privacy-related questions or to exercise your rights:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>Email: privacy@bernardai.app</li>
              <li>In-app: Settings → Help → Contact Support</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;

