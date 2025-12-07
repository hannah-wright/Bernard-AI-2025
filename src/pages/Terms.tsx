/**
 * Terms of Service Page
 */

import { Header } from '@/components/layout/Header';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Last updated: December 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using BernardAI ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              BernardAI provides a startup discovery and intelligence platform for venture capital professionals. 
              Our Service includes startup data, AI-powered analytics, deal tracking tools, and team collaboration features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Subscription and Payments</h2>
            <p className="text-muted-foreground mb-4">
              Some features require a paid subscription. By subscribing, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Pay all applicable fees as described in your plan</li>
              <li>Automatic renewal unless cancelled before the renewal date</li>
              <li>No refunds for partial billing periods</li>
              <li>Credit-based usage as defined by your plan</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Scrape, copy, or redistribute our data without permission</li>
              <li>Use automated tools to access the Service excessively</li>
              <li>Attempt to reverse engineer or compromise our systems</li>
              <li>Share account credentials with unauthorized parties</li>
              <li>Use the Service for any illegal purpose</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property & Proprietary Data</h2>
            <p className="text-muted-foreground mb-4">
              All content, data, methodologies, algorithms, and technology provided through the Service is owned by BernardAI or its licensors and constitutes proprietary trade secrets.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Proprietary Data:</strong> Our startup intelligence data is compiled from proprietary sources, methodologies, and analytical processes that constitute trade secrets of BernardAI. The specific sources, methods of collection, aggregation techniques, and analytical processes used to generate our data are confidential and proprietary.
            </p>
            <p className="text-muted-foreground mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Reverse engineer, decompile, or attempt to discover our data sources or methodologies</li>
              <li>Systematically download, store, or redistribute our data</li>
              <li>Use data mining, robots, or similar data gathering tools on our Service</li>
              <li>Create derivative databases or datasets from our content</li>
              <li>Commercially exploit any data obtained through our Service without express written permission</li>
              <li>Share, resell, or sublicense access to our data or insights</li>
            </ul>
            <p className="text-muted-foreground">
              All trademarks, service marks, and logos displayed are the property of BernardAI or their respective owners.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Accuracy & Methodology</h2>
            <p className="text-muted-foreground mb-4">
              While we strive to provide accurate information through our proprietary data collection and analysis methodologies, we make no guarantees about the accuracy, completeness, or timeliness of startup data. Revenue estimates, team information, and other metrics may be derived from our proprietary analytical models and should be treated as estimates unless otherwise indicated.
            </p>
            <p className="text-muted-foreground">
              Users should verify information independently before making investment decisions. Data confidence levels and source verification indicators are provided for informational purposes only and do not constitute guarantees of accuracy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              BernardAI is provided "as is" without warranties of any kind. We are not liable for any 
              indirect, incidental, or consequential damages arising from your use of the Service, 
              including investment decisions made based on our data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your account at any time for violations of these terms. 
              Upon termination, your right to use the Service will cease immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms at any time. Continued use of the Service after changes 
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, contact us at legal@bernardai.app
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;

