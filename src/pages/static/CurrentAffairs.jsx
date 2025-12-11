import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { currentAffairsAPI } from '../../services/api';
import './CurrentAffairs.css';

// Get yesterday's date as default (NewsAPI doesn't have today's news immediately)
const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

const CurrentAffairs = () => {
  const [affairs, setAffairs] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getYesterdayDate());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    initializePage();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadCurrentAffairs(selectedDate);
    }
  }, [selectedDate]);

  const initializePage = async () => {
    try {
      const response = await currentAffairsAPI.getDates();
      const today = new Date().toISOString().split('T')[0];
      const yesterday = getYesterdayDate();
      
      if (response.data.dates && response.data.dates.length > 0) {
        // Filter out today from available dates
        const filteredDates = response.data.dates.filter(date => date !== today);
        setAvailableDates(filteredDates);
        
        // Always default to yesterday (or latest available date that's not today)
        if (filteredDates.includes(yesterday)) {
          setSelectedDate(yesterday);
        } else if (filteredDates.length > 0) {
          setSelectedDate(filteredDates[0]);
        } else {
          setSelectedDate(yesterday);
        }
      } else {
        // No dates in DB, use yesterday
        setAvailableDates([]);
        setSelectedDate(yesterday);
      }
    } catch (error) {
      console.error('Error fetching dates:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      setSelectedDate(getYesterdayDate());
    }
  };

  const loadCurrentAffairs = async (date) => {
    try {
      setLoading(true);
      
      // Use autoFetch - server will fetch if no data exists
      const response = await currentAffairsAPI.getAllWithAutoFetch(date);
      
      if (response.data.success) {
        setAffairs(response.data.affairs || []);
        
        // Refresh available dates if new data was fetched
        if (response.data.autoFetched) {
          const datesResponse = await currentAffairsAPI.getDates();
          if (datesResponse.data.dates) {
            setAvailableDates(datesResponse.data.dates);
          }
        }
      }
    } catch (error) {
      console.error('Error loading current affairs:', error);
      setAffairs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
  };

  const formatShortDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const navigateDate = (direction) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const newDate = new Date(year, month - 1, day);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
      if (newDate < thirtyDaysAgo) {
        return; // Can't go beyond 30 days (NewsAPI limit)
      }
    } else {
      newDate.setDate(newDate.getDate() + 1);
      if (newDate > yesterday) {
        return; // Can't go beyond yesterday
      }
    }
    
    const dateStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const handleDateClick = (date) => {
    if (!loading) {
      setSelectedDate(date);
    }
  };

  const getSourceColor = (source) => {
    const sourceLower = source?.toLowerCase() || '';
    if (sourceLower.includes('times') || sourceLower.includes('toi')) return 'bg-red-500';
    if (sourceLower.includes('mint') || sourceLower.includes('livemint')) return 'bg-green-500';
    if (sourceLower.includes('hindu')) return 'bg-blue-500';
    if (sourceLower.includes('express')) return 'bg-purple-500';
    if (sourceLower.includes('pib')) return 'bg-orange-500';
    if (sourceLower.includes('gnews')) return 'bg-teal-500';
    return 'bg-gray-500';
  };

  const getSourceLabel = (source) => {
    const sourceLower = source?.toLowerCase() || '';
    if (sourceLower.includes('times')) return 'TOI';
    if (sourceLower.includes('mint')) return 'Mint';
    if (sourceLower.includes('hindu')) return 'The Hindu';
    if (sourceLower.includes('express')) return 'IE';
    if (sourceLower.includes('pib')) return 'PIB';
    return source?.substring(0, 12) || 'News';
  };

  const isYesterday = selectedDate === getYesterdayDate();

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Daily Current Affairs 2024 - UPSC, SSC, Banking | ExamFit"
        description="Stay updated with daily current affairs for UPSC, SSC, Banking exams. Get the latest news, events, and important updates for competitive exam preparation."
        keywords="current affairs 2024, daily current affairs, UPSC current affairs, SSC current affairs, banking current affairs, GK updates"
        canonicalUrl="https://examfit.in/current-affairs"
      />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-gray-600 text-sm">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Current Affairs</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Title Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-6 text-white shadow-lg">
          <h1 className="text-4xl font-bold mb-2">📰 Current Affairs</h1>
          <p className="text-blue-100 text-lg">Daily news updates for competitive exam preparation</p>
          <p className="text-blue-200 text-sm mt-2">Updated daily at 6:00 AM IST</p>
        </div>

        {/* Date Navigation */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateDate('prev')}
              disabled={loading}
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Day"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{formatDate(selectedDate)}</h2>
              {isYesterday && <span className="text-sm text-blue-600 font-medium">Latest</span>}
            </div>
            
            <button
              onClick={() => navigateDate('next')}
              disabled={loading || isYesterday}
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next Day"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Quick Date Navigation */}
          {availableDates.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {availableDates.filter(date => date !== new Date().toISOString().split('T')[0]).slice(0, 7).map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateClick(date)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    date === selectedDate
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {formatShortDate(date)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading current affairs...</p>
          </div>
        ) : affairs.length > 0 ? (
          <>
            {/* Count */}
            <p className="text-gray-600 mb-6">
              Showing <span className="font-semibold text-gray-900">{affairs.length}</span> current affairs
            </p>
            
            {/* News Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {affairs.map((affair, index) => (
                <div
                  key={affair._id || index}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all group border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                    {affair.urlToImage ? (
                      <img
                        src={affair.urlToImage}
                        alt={affair.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100" 
                      style={{ display: affair.urlToImage ? 'none' : 'flex' }}
                    >
                      <span className="text-5xl opacity-40">📰</span>
                    </div>
                    
                    {/* Source Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`${getSourceColor(affair.source)} text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm`}>
                        {getSourceLabel(affair.source)}
                      </span>
                    </div>
                    
                    {/* Number Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {affair.title}
                    </h3>
                    {affair.description && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3 leading-relaxed">
                        {affair.description}
                      </p>
                    )}
                    {affair.url && (
                      <a
                        href={affair.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold inline-flex items-center gap-1"
                      >
                        Read More 
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Current Affairs Available</h3>
            <p className="text-gray-500">
              No news available for {formatDate(selectedDate)}. Try selecting a different date.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentAffairs;
