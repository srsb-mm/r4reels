import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-6">About R4 Reels</h1>
        <div className="prose prose-lg dark:prose-invert space-y-4 text-foreground">
          <p>
            Welcome to <strong>R4 Reels</strong>, a vibrant social media platform built
            for creators, storytellers, and everyday people who want to share moments
            that matter. Our mission is simple: give everyone a beautiful, easy-to-use
            space to express themselves through photos, short videos (reels), and
            ephemeral stories.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">Our Story</h2>
          <p>
            R4 Reels was founded with the belief that social media should be more about
            real connection and creative expression than vanity metrics. We built this
            platform from the ground up using modern web technologies to deliver a fast,
            reliable, and visually engaging experience on any device.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">What We Offer</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Posts:</strong> Share photos with captions, locations, and reach your audience instantly.</li>
            <li><strong>Reels:</strong> Discover short-form vertical content from creators around the world.</li>
            <li><strong>Stories:</strong> Share moments that disappear in 24 hours — perfect for the everyday.</li>
            <li><strong>Direct Messages:</strong> Have private, real-time conversations with friends.</li>
            <li><strong>Explore:</strong> Find new creators and trending content tailored to your interests.</li>
            <li><strong>Notifications:</strong> Stay in the loop with likes, comments, follows, and messages.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-3">Our Values</h2>
          <p>
            We are committed to building a safe, inclusive, and respectful community.
            We invest heavily in privacy, content moderation, and giving users control
            over their data and experience. We believe creators deserve a platform that
            respects their work and audiences deserve content they can trust.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">Contact Us</h2>
          <p>
            Have questions, feedback, or partnership ideas? We'd love to hear from you.
            Reach out via our <Link to="/" className="text-primary underline">homepage</Link> or
            check our <Link to="/privacy" className="text-primary underline">Privacy Policy</Link> and{' '}
            <Link to="/terms" className="text-primary underline">Terms of Service</Link> for more info.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;
