
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CVAnalysisFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const CVAnalysisForm: React.FC<CVAnalysisFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    jobDescription: '',
    cv: null as File | null
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required';
    } else if (formData.jobDescription.length < 10) {
      newErrors.jobDescription = 'Job description must be at least 10 characters';
    }

    if (!formData.cv) {
      newErrors.cv = 'CV file is required';
    } else if (formData.cv.type !== 'application/pdf') {
      newErrors.cv = 'Only PDF files are allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('Name', formData.name);
      formDataToSend.append('Email', formData.email);
      formDataToSend.append('Job Description', formData.jobDescription);
      if (formData.cv) {
        formDataToSend.append('CV', formData.cv);
      }

      console.log('Submitting form data to n8n webhook...');
      console.log('Form data:', {
        name: formData.name,
        email: formData.email,
        jobDescription: formData.jobDescription,
        cvFileName: formData.cv?.name
      });
      
      const response = await fetch(
        'https://toolsagentn8n.app.n8n.cloud/webhook/ded4e41a-9689-4e1e-b131-df47959f761d',
        {
          method: 'POST',
          body: formDataToSend,
        }
      );

      if (response.ok) {
        console.log('Form submitted successfully to n8n');
        
        // Simulate processing time for workflow completion
        setTimeout(() => {
          setAnalysisComplete(true);
          setShowCelebration(true);
          toast({
            title: "Analysis Complete!",
            description: "Thanks for filling out the form! Your analysis is complete, and feedback will be sent to your email shortly.",
          });
        }, 3000);
        
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit your form. Please check all fields and try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setFormData(prev => ({ ...prev, cv: file }));
        setErrors(prev => ({ ...prev, cv: '' }));
      } else {
        setErrors(prev => ({ ...prev, cv: 'Only PDF files are allowed' }));
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', jobDescription: '', cv: null });
    setErrors({});
    setIsSubmitting(false);
    setAnalysisComplete(false);
    setShowCelebration(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={!isSubmitting ? onClose : undefined}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-gray-600/20 p-6 max-h-[90vh] overflow-y-auto transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {!isSubmitting && !analysisComplete && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
        )}

        {analysisComplete && showCelebration ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300"
            >
              Congratulations!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300"
            >
              Thanks for filling out the form! Your analysis is complete, and feedback will be sent to your email shortly.
            </motion.p>
            <Button
              onClick={resetForm}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Submit Another CV
            </Button>
          </motion.div>
        ) : isSubmitting ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Loader2 className="h-12 w-12 text-blue-600" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              Analyzing Your CV...
            </h3>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
              Our AI is processing your information. This may take a few moments.
            </p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 25, ease: "linear" }}
              className="mt-4 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
            />
          </motion.div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                Start Your CV Analysis
              </h2>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Fill in your details and upload your CV to get personalized feedback
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="jobDescription" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Job Description *
                </Label>
                <Textarea
                  id="jobDescription"
                  value={formData.jobDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                  className={`mt-1 min-h-[100px] ${errors.jobDescription ? 'border-red-500' : ''}`}
                  placeholder="Describe the job you're applying for, including key requirements and responsibilities..."
                />
                {errors.jobDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobDescription}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cv" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  CV Upload (PDF only) *
                </Label>
                <div className="mt-1">
                  <label
                    htmlFor="cv"
                    className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      errors.cv ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        {formData.cv ? formData.cv.name : 'Click to upload your CV'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">PDF files only</p>
                    </div>
                  </label>
                  <input
                    id="cv"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {errors.cv && (
                  <p className="mt-1 text-sm text-red-600">{errors.cv}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Start Analysis'
                )}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CVAnalysisForm;
