import Layout from '@/components/Layout';

const Privacy = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-6">Last updated: April 2026</p>

        <div className="space-y-4 text-foreground">
          <p>
            At R4 Reels, your privacy is one of our top priorities. This Privacy Policy
            explains how we collect, use, share, and protect your information when you
            use our platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account information:</strong> username, email address, profile picture, bio, and password (encrypted).</li>
            <li><strong>Content:</strong> photos, videos, captions, stories, comments, and messages you post or send.</li>
            <li><strong>Usage data:</strong> pages visited, time spent, interactions (likes, follows), and device information.</li>
            <li><strong>Technical data:</strong> IP address, browser type, operating system, and cookies.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide, operate, and improve our services.</li>
            <li>To personalize your feed, suggestions, and notifications.</li>
            <li>To enable communication between users (DMs, comments, etc.).</li>
            <li>To detect and prevent fraud, abuse, and security incidents.</li>
            <li>To show relevant advertisements and measure their performance.</li>
            <li>To comply with legal obligations.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-3">3. Cookies and Advertising</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your experience.
            R4 Reels uses <strong>Google AdSense</strong> to display advertisements.
            Google may use cookies (including the DoubleClick DART cookie) to serve ads
            based on your visits to our site and other sites on the internet. You can
            opt out of personalized advertising by visiting{' '}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Google Ads Settings
            </a>.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">4. Sharing Your Information</h2>
          <p>
            We do not sell your personal data. We may share information with:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Service providers who help us operate the platform (hosting, analytics, advertising).</li>
            <li>Law enforcement when legally required.</li>
            <li>Other users, based on your privacy settings (e.g., public profiles).</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-3">5. Data Security</h2>
          <p>
            We use industry-standard security measures including encryption, secure
            servers, and access controls to protect your information. However, no system
            is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">6. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at
            any time through your account settings. You can also deactivate your account
            entirely. Residents of the EU, UK, and California have additional rights
            under GDPR and CCPA.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">7. Children's Privacy</h2>
          <p>
            R4 Reels is not intended for children under 13. We do not knowingly collect
            data from children under 13. If you believe a child has provided us with
            information, please contact us immediately.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of
            significant changes via the app or email.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">9. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, contact us through the app.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
