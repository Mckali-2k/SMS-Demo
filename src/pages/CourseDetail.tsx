/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  BookOpen, 
  CheckCircle, 
  User, 
  Calendar,
  Target,
  FileText,
  Loader
} from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string;
  syllabus: string;
  instructorName: string;
  category: string;
  duration: number;
  enrolledStudents: string[];
  maxStudents: number;
  isActive: boolean;
  thumbnail?: string;
  createdAt: string;
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      if (currentUser) {
        checkEnrollmentStatus();
      }
    }
  }, [courseId, currentUser]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.getPublicCourseById(courseId!);
      if (response.success && response.data) {
        setCourse(response.data);
      } else {
        toast.error('Course not found');
        navigate('/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course details');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const response = await api.getMyEnrollments();
      if (response.success && response.data) {
        const isEnrolledInCourse = response.data.some((enrollment: any) => 
          enrollment.courseId === courseId
        );
        setIsEnrolled(isEnrolledInCourse);
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error);
    }
  };

  const handleEnroll = async () => {
    if (!currentUser) {
      toast.error('Please log in to enroll in courses');
      navigate('/login');
      return;
    }

    if (!course) return;

    try {
      setEnrolling(true);
      const response = await api.enrollInCourse(course.id);
      if (response.success) {
        toast.success('Successfully enrolled in course!');
        setIsEnrolled(true);
        // Update course data to reflect new enrollment
        setCourse(prev => prev ? {
          ...prev,
          enrolledStudents: [...prev.enrolledStudents, currentUser.uid]
        } : null);
      }
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      toast.error(error.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleGoToCourse = () => {
    if (currentUser && isEnrolled) {
      navigate(`/dashboard/courses/${courseId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/courses')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Course Catalog
          </button>
        </div>
      </div>
    );
  }

  const isFull = course.enrolledStudents.length >= course.maxStudents;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Course Catalog
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Course Header */}
          <div className="relative">
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {course.thumbnail ? (
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen className="w-24 h-24 text-white opacity-80" />
              )}
            </div>
            
            {/* Course Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                {course.category}
              </span>
            </div>

            {/* Active Badge */}
            {course.isActive && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Active
                </div>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h1>

                <div className="flex items-center text-gray-600 mb-6">
                  <User className="w-5 h-5 mr-2" />
                  <span>Instructor: {course.instructorName}</span>
                </div>

                <div className="prose max-w-none mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">About This Course</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {course.syllabus && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Course Syllabus
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {course.syllabus}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Course Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Clock className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium">Duration</span>
                      </div>
                      <span className="text-gray-700">{course.duration} weeks</span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Users className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium">Enrollment</span>
                      </div>
                      <span className="text-gray-700">
                        {course.enrolledStudents.length} / {course.maxStudents} students
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium">Created</span>
                      </div>
                      <span className="text-gray-700">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium">Category</span>
                      </div>
                      <span className="text-gray-700">{course.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Course Enrollment
                  </h3>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Enrolled Students</span>
                      <span>{course.enrolledStudents.length} / {course.maxStudents}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(course.enrolledStudents.length / course.maxStudents) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  {currentUser ? (
                    isEnrolled ? (
                      <div className="space-y-3">
                        <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-md">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="font-medium">You're enrolled!</span>
                        </div>
                        <button
                          onClick={handleGoToCourse}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                        >
                          Go to Course
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        disabled={!course.isActive || isFull || enrolling}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {enrolling ? (
                          <div className="flex items-center justify-center">
                            <Loader className="w-4 h-4 animate-spin mr-2" />
                            Enrolling...
                          </div>
                        ) : !course.isActive ? (
                          'Course Inactive'
                        ) : isFull ? (
                          'Course Full'
                        ) : (
                          'Enroll Now'
                        )}
                      </button>
                    )
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        Please log in to enroll in this course
                      </p>
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                      >
                        Log In to Enroll
                      </button>
                    </div>
                  )}

                  {!course.isActive && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-yellow-800 text-sm">
                        This course is currently inactive and not accepting new enrollments.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;