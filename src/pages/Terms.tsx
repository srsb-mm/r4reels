import Layout from '@/components/Layout';

const Terms = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-6">Last updated: April 2026</p>

        <div className="space-y-4 text-foreground">
          <p>
            Welcome to R4 Reels. By accessing or using our platform, you agree to be
            bound by these Terms of Service. Please read them carefully.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">1. Eligibility</h2>
          <p>
            You must be at least 13 years old to use R4 Reels. By creating an account,
            you confirm that you meet this requirement and that the information you
            provide is accurate.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">2. Your Account</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are responsible for keeping your password secure.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>You must notify us immediately of any unauthorized use of your account.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-3">3. Content You Post</h2>
          <p>
            You retain ownership of the content you post on R4 Reels. By posting, you
            grant us a non-exclusive, worldwide, royalty-free license to host, display,
            distribute, and promote your content within the platform.
          </p>
          <p>You agree NOT to post content that:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Is illegal, hateful, harassing, threatening, or discriminatory.</li>
            <li>Contains nudity, sexual content involving minors, or graphic violence.</li>
            <li>Infringes on intellectual property rights of others.</li>
            <li>Promotes self-harm, dangerous activities, or illegal goods.</li>
            <li>Contains spam, scams, or misleading information.</li>
            <li>Impersonates another person or entity.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-3">4. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use bots, scrapers, or automated tools to access the platform.</li>
            <li>Attempt to hack, disrupt, or overload our services.</li>
            <li>Harvest data about other users without consent.</li>
            <li>Use the platform for commercial purposes without authorization.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-3">5. Advertising</h2>
          <p>
            R4 Reels is supported by advertising. By using the platform, you agree to
            see ads displayed in your feed, stories, and reels. We work with Google
            AdSense and other partners to deliver relevant advertisements.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">6. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at any time if you
            violate these Terms or engage in behavior that harms our community or
            services. You may also delete your account at any time.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">7. Disclaimers</h2>
          <p>
            R4 Reels is provided "as is" without warranties of any kind. We do not
            guarantee that the platform will be uninterrupted, secure, or error-free.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, R4 Reels shall not be liable for any
            indirect, incidental, or consequential damages arising from your use of the
            platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">9. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of R4 Reels after
            changes means you accept the updated Terms.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">10. Governing Law</h2>
          <p>
            These Terms are governed by applicable laws. Any disputes shall be resolved
            in the appropriate jurisdiction.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">11. Contact</h2>
          <p>
            If you have questions about these Terms, please contact us through the app.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
