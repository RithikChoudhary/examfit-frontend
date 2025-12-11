import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const Blog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const blogPosts = [
    {
      title: 'Top 10 Study Tips for Competitive Exams',
      excerpt: 'Master the art of effective studying with these proven strategies used by toppers...',
      category: 'Study Tips',
      date: 'Dec 3, 2024',
      readTime: '5 min',
      icon: '💡'
    },
    {
      title: 'How to Create an Effective Study Schedule',
      excerpt: 'Learn how to plan your preparation efficiently and maximize your study hours...',
      category: 'Planning',
      date: 'Dec 2, 2024',
      readTime: '4 min',
      icon: '📅'
    },
    {
      title: 'Memory Techniques for Better Retention',
      excerpt: 'Discover powerful memory techniques to remember complex concepts easily...',
      category: 'Learning',
      date: 'Dec 1, 2024',
      readTime: '6 min',
      icon: '🧠'
    },
    {
      title: 'Managing Exam Stress & Anxiety',
      excerpt: 'Practical tips to stay calm and focused during your exam preparation...',
      category: 'Wellness',
      date: 'Nov 30, 2024',
      readTime: '5 min',
      icon: '🧘'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <SEO 
        title="ExamFit Blog - Study Tips, Exam Strategies & Success Stories"
        description="Read expert tips, study strategies, exam preparation guides, and success stories from toppers. Get the best advice for UPSC, SSC, Banking exams."
        keywords="exam tips blog, study strategies, UPSC preparation tips, SSC exam strategies, competitive exam blog, topper tips"
        canonicalUrl="https://examfit.in/blog"
      />
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <nav className="flex items-center gap-2 text-white/70 text-sm mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">Blog</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-4xl">✍️</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Blog</h1>
              <p className="text-white/80 mt-1">Tips, strategies & exam preparation guides</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {blogPosts.map((post, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center">
                <span className="text-6xl group-hover:scale-110 transition-transform">{post.icon}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{post.category}</span>
                  <span className="text-gray-400 text-sm">{post.date}</span>
                  <span className="text-gray-400 text-sm">• {post.readTime} read</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">{post.title}</h3>
                <p className="text-gray-600 text-sm">{post.excerpt}</p>
                <button className="mt-4 text-orange-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read More <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 max-w-lg mx-auto">
            <span className="text-4xl mb-4 block">📝</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">More Content Coming Soon!</h3>
            <p className="text-gray-600">We're adding more articles regularly. Stay tuned!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;

