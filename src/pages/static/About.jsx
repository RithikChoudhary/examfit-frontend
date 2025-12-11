import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { value: '10K+', label: 'Questions', icon: '📝' },
    { value: '50+', label: 'Exams', icon: '📚' },
    { value: '100K+', label: 'Students', icon: '👨‍🎓' },
    { value: '95%', label: 'Success Rate', icon: '🏆' },
  ];

  const features = [
    { icon: '🎯', title: 'Targeted Practice', description: 'Questions organized by topic, difficulty, and exam pattern' },
    { icon: '⚡', title: 'Instant Feedback', description: 'Know right or wrong immediately with color-coded answers' },
    { icon: '💡', title: 'Expert Explanations', description: 'Detailed solutions for every question' },
    { icon: '📊', title: 'Progress Tracking', description: 'Monitor your improvement over time' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <SEO 
        title="About ExamFit - Free Online Exam Preparation Platform | Our Mission"
        description="Learn about ExamFit's mission to empower students with free, high-quality exam preparation resources. Discover our story, team, and commitment to your success."
        keywords="about examfit, exam preparation platform, free online learning, education mission, student success"
        canonicalUrl="https://examfit.in/about"
      />
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <nav className="flex items-center justify-center gap-2 text-white/70 text-sm mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">About Us</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About ExamFit</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Empowering students to achieve their dreams through smart practice and expert guidance
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto max-w-6xl px-4 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <span className="text-3xl mb-2 block">{stat.icon}</span>
              <div className="text-3xl font-bold text-blue-700">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              At ExamFit, we believe that every student deserves access to quality education and 
              exam preparation resources. Our platform is designed to make learning effective, 
              engaging, and accessible to all.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              We've combined the best pedagogical practices with modern technology to create 
              a learning experience that adapts to your needs and helps you achieve your goals.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <span className="text-3xl mb-3 block">{feature.icon}</span>
                <h3 className="font-bold text-gray-800 mb-1">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="bg-gradient-to-br from-blue-50 to-orange-50 py-16">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Built with ❤️ for Students</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            ExamFit is created by a team of educators, developers, and exam experts who understand 
            the challenges students face in their preparation journey.
          </p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
            Get in Touch <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;

