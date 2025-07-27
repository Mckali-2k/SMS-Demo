/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import CourseCard from '../components/CourseCard';
import { Search, Filter, Loader, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  category: string;
  duration: number;
  enrolledStudents: string[];
  maxStudents: number;
  isActive: boolean;
  thumbnail?: string;
}

const CourseCatalog: React.FC = () => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch courses
  const fetchCourses = async (page = 1) => {
    try {
      setLoading(true);
      
      const params: any = {
        page,
        limit: 12
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      
      const response = await api.getPublicCourses(params);
      if (response.success && response.data) {
        setCourses(response.data);
        
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setCurrentPage(response.pagination.page);
        }
        
        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map((course: Course) => course.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user enrollments
  const fetchEnrollments = async () => {
    if (!currentUser) return;
    
    try {
      const response = await api.getMyEnrollments();
      if (response.success && response.data) {
        const courseIds = response.data.map((enrollment: any) => enrollment.courseId);
        setEnrolledCourses(courseIds);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (currentUser) {
      fetchEnrollments();
    }
  }, [currentUser]);

  const handleEnroll = async (courseId: string) => {
    if (!currentUser) {
      toast.error('Please log in to enroll in courses');
      return;
    }

    try {
      setEnrolling(courseId);
      const response = await api.enrollInCourse(courseId);
      if (response.success) {
        toast.success('Successfully enrolled in course!');
        setEnrolledCourses(prev => [...prev, courseId]);
        // Refresh courses to update enrollment count
        fetchCourses(currentPage);
      }
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      toast.error(error.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCourses(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCourses(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Course Catalog</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and enroll in our wide range of courses designed to help you grow in faith and knowledge
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
              
              {(searchTerm || selectedCategory) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory 
                ? "Try adjusting your search criteria or clearing filters"
                : "No courses are currently available"
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {courses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  showEnrollButton={!!currentUser}
                  onEnroll={handleEnroll}
                  isEnrolled={enrolledCourses.includes(course.id)}
                  loading={enrolling === course.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  const isCurrentPage = page === currentPage;
                  
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 border rounded-md ${
                          isCurrentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  
                  // Show ellipsis
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  
                  return null;
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;