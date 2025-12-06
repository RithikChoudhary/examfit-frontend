import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const StudyMaterial = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const materials = [
    {
      category: 'UPSC',
      items: [
        { title: 'Indian Polity Notes', pages: '250+', icon: '📕' },
        { title: 'Geography Comprehensive', pages: '180+', icon: '🌍' },
        { title: 'History Quick Revision', pages: '200+', icon: '📜' },
        { title: 'Economy Fundamentals', pages: '150+', icon: '💰' },
      ]
    },
    {
      category: 'SSC',
      items: [
        { title: 'Quantitative Aptitude', pages: '300+', icon: '🔢' },
        { title: 'English Grammar', pages: '150+', icon: '📝' },
        { title: 'Reasoning Ability', pages: '200+', icon: '🧠' },
        { title: 'General Awareness', pages: '180+', icon: '📚' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <SEO 
        title="Free Study Material PDF - UPSC, SSC, Banking Notes | ExamFit"
        description="Download free study material, notes, and PDF guides for UPSC, SSC, Banking exams. Comprehensive study resources prepared by experts."
        keywords="free study material, UPSC notes PDF, SSC study material, banking exam notes, free PDF download, exam preparation notes"
        canonicalUrl="https://examfit.com/study-material"
      />
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <nav className="flex items-center gap-2 text-white/70 text-sm mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">Study Material</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-4xl">📕</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Study Material</h1>
              <p className="text-white/80 mt-1">Comprehensive notes & guides for your preparation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚧</span>
            <div>
              <h3 className="font-bold text-gray-800">Coming Soon!</h3>
              <p className="text-gray-600">We're preparing high-quality study materials. Stay tuned!</p>
            </div>
          </div>
        </div>

        {materials.map((section, idx) => (
          <div key={idx} className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white">📚</span>
              </div>
              {section.category} Study Material
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-orange-100 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.pages} pages</p>
                  <button className="mt-3 text-blue-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Download <span>↓</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyMaterial;

