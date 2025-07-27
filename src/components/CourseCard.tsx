import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, BookOpen, CheckCircle } from 'lucide-react';

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

interface CourseCardProps {
  course: Course;
  showEnrollButton?: boolean;
  onEnroll?: (courseId: string) => void;
  isEnrolled?: boolean;
  loading?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  showEnrollButton = false, 
  onEnroll,
  isEnrolled = false,
  loading = false
}) => {
  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEnroll && !loading) {
      onEnroll(course.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/courses/${course.id}`}>
        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="w-16 h-16 text-white opacity-80" />
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-600 font-medium">{course.category}</span>
            {course.isActive && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-3">
            {course.description}
          </p>
          
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span className="mr-4">By {course.instructorName}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{course.duration} weeks</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{course.enrolledStudents.length}/{course.maxStudents}</span>
            </div>
          </div>
        </div>
      </Link>
      
      {showEnrollButton && (
        <div className="px-6 pb-6">
          {isEnrolled ? (
            <button 
              disabled
              className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed"
            >
              Already Enrolled
            </button>
          ) : (
            <button 
              onClick={handleEnroll}
              disabled={course.enrolledStudents.length >= course.maxStudents || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors"
            >
              {loading ? 'Enrolling...' : 
               course.enrolledStudents.length >= course.maxStudents ? 'Course Full' : 'Enroll Now'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseCard;