/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { X, Plus, Loader, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface CreateCourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated?: () => void;
}

const CreateCourseForm: React.FC<CreateCourseFormProps> = ({
  isOpen,
  onClose,
  onCourseCreated
}) => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    syllabus: '',
    category: '',
    duration: 8,
    maxStudents: 50,
    thumbnail: ''
  });

  const categories = [
    'Biblical Studies',
    'Theology',
    'Church History',
    'Christian Education',
    'Ministry',
    'Music',
    'Youth Ministry',
    'Leadership',
    'Evangelism',
    'Pastoral Care',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'maxStudents' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await api.createCourse(formData);
      
      if (response.success) {
        toast.success('Course created successfully!');
        onCourseCreated?.();
        onClose();
        // Reset form
        setFormData({
          title: '',
          description: '',
          syllabus: '',
          category: '',
          duration: 8,
          maxStudents: 50,
          thumbnail: ''
        });
      }
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast.error(error.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Only show for teachers and admins
  if (!userProfile || (userProfile.role !== 'teacher' && userProfile.role !== 'admin')) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Create New Course</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Enter course title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Course Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              disabled={loading}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Describe what students will learn in this course"
            />
          </div>

          {/* Category and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (weeks)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                max="52"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Max Students */}
          <div>
            <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Students
            </label>
            <input
              type="number"
              id="maxStudents"
              name="maxStudents"
              value={formData.maxStudents}
              onChange={handleInputChange}
              min="1"
              max="200"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          {/* Syllabus */}
          <div>
            <label htmlFor="syllabus" className="block text-sm font-medium text-gray-700 mb-2">
              Course Syllabus
            </label>
            <textarea
              id="syllabus"
              name="syllabus"
              value={formData.syllabus}
              onChange={handleInputChange}
              disabled={loading}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Detailed course syllabus, learning objectives, and requirements"
            />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image URL (optional)
            </label>
            <input
              type="url"
              id="thumbnail"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseForm;