import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const Syllabus = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const syllabusData = [
    {
      exam: 'UPSC Civil Services',
      icon: '🏛️',
      stages: [
        { name: 'Prelims', papers: ['General Studies I', 'CSAT'] },
        { name: 'Mains', papers: ['Essay', 'GS I', 'GS II', 'GS III', 'GS IV', 'Optional I & II'] },
        { name: 'Interview', papers: ['Personality Test'] },
      ]
    },
    {
      exam: 'SSC CGL',
      icon: '📋',
      stages: [
        { name: 'Tier I', papers: ['Quantitative Aptitude', 'English', 'Reasoning', 'GK'] },
        { name: 'Tier II', papers: ['Quantitative Aptitude', 'English & Comprehension'] },
        { name: 'Tier III', papers: ['Descriptive Paper'] },
      ]
    },
    {
      exam: 'Banking (IBPS PO)',
      icon: '🏦',
      stages: [
        { name: 'Prelims', papers: ['Reasoning', 'Quantitative Aptitude', 'English'] },
        { name: 'Mains', papers: ['Reasoning & CA', 'GA/GK', 'English', 'Data Analysis'] },
        { name: 'Interview', papers: ['Personal Interview'] },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <SEO 
        title="Exam Syllabus 2024 - UPSC, SSC, Banking Pattern & Topics | ExamFit"
        description="Get complete syllabus and exam pattern for UPSC, SSC CGL, Banking (IBPS PO/Clerk). Download detailed topic-wise syllabus PDF for all competitive exams."
        keywords="exam syllabus 2024, UPSC syllabus, SSC CGL syllabus, banking exam syllabus, IBPS PO syllabus, exam pattern, topic wise syllabus"
        canonicalUrl="https://examfit.in/syllabus"
      />
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <nav className="flex items-center gap-2 text-white/70 text-sm mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">Syllabus</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-4xl">📋</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Exam Syllabus</h1>
              <p className="text-white/80 mt-1">Complete exam patterns & syllabus breakdown</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="space-y-8">
          {syllabusData.map((exam, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Exam Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                    {exam.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{exam.exam}</h2>
                    <p className="text-white/70 text-sm">{exam.stages.length} Stages</p>
                  </div>
                </div>
              </div>

              {/* Stages */}
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {exam.stages.map((stage, stageIdx) => (
                    <div key={stageIdx} className="bg-gray-50 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center font-bold text-sm">
                          {stageIdx + 1}
                        </div>
                        <h3 className="font-bold text-gray-800">{stage.name}</h3>
                      </div>
                      <ul className="space-y-2">
                        {stage.papers.map((paper, paperIdx) => (
                          <li key={paperIdx} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            {paper}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Button */}
              <div className="px-6 pb-6">
                <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2">
                  <span>📥</span>
                  Download Complete Syllabus PDF
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
          <span className="text-4xl mb-4 block">💡</span>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Need More Details?</h3>
          <p className="text-gray-600 mb-4">
            Looking for detailed topic-wise syllabus or previous year patterns? 
            Contact us and we'll help you out!
          </p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition-all">
            Contact Us <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Syllabus;

