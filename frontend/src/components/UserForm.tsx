import React, { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, Mail, Phone, Calendar, Image as ImageIcon, 
  MapPin, Briefcase, Plus, X, FileText, Loader2, UploadCloud, CheckCircle2 
} from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Full name must be at least 3 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
    errorMap: () => ({ message: 'Gender is required' }),
  }),
  address: z
    .string()
    .trim()
    .min(10, 'Address must be at least 10 characters'),
  occupation: z
    .string()
    .trim()
    .min(1, 'Occupation is required'),
  skills: z
    .array(z.string().trim().min(1))
    .min(1, 'Please add at least one skill'),
  notes: z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
  profileImage: z
    .string()
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  onSubmitSuccess?: (data: any) => void;
  initialData?: Partial<FormValues>;
  isSubmittingExternal?: boolean;
}

export default function UserForm({ onSubmitSuccess, initialData, isSubmittingExternal = false }: UserFormProps) {
  const [skillInput, setSkillInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.profileImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().substring(0, 10) : '',
      gender: initialData?.gender || 'male',
      address: initialData?.address || '',
      occupation: initialData?.occupation || '',
      skills: initialData?.skills || [],
      notes: initialData?.notes || '',
      profileImage: initialData?.profileImage || '',
    },
  });

  const { append, remove } = useFieldArray({
    control: control as any,
    name: 'skills',
  });


  // Handle adding custom skill tags
  const handleAddSkill = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !watch('skills')?.includes(cleanSkill)) {
      append(cleanSkill);
      setSkillInput('');
    }
  };

  // Handle Enter key inside skill input field
  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(e);
    }
  };

  // Handle asynchronous profile image upload to backend API
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local validation for speed
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, JPEG, and PNG files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // POST multipart file to our backend server static uploads endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setValue('profileImage', data.url);
        setImagePreview(data.url);
        setUploadSuccess(true);
      } else {
        alert(data.message || 'Failed to upload image.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during file upload.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFormSubmit = async (data: FormValues) => {
    if (onSubmitSuccess) {
      await onSubmitSuccess(data);
    }
  };

  const formSkills = watch('skills') || [];

  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)} 
      className="w-full bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-md text-slate-800"
    >
      <div className="space-y-6">
        
        {/* Profile Image Row */}
        <div className="flex flex-col items-center justify-center border-b border-slate-100 pb-6 mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3 self-start">
            Profile Image
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
            {/* Image Preview Container */}
            <div className="relative group w-24 h-24 rounded-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 transition-all hover:border-purple-500">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-purple-600 transition-colors" />
              )}
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setValue('profileImage', '');
                    setImagePreview(null);
                    setUploadSuccess(false);
                  }}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-red-400 text-xs font-semibold"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Drag & Upload Box */}
            <div className="flex-1 w-full">
              <div 
                onClick={triggerFileSelect}
                className="border border-dashed border-slate-200 hover:border-purple-500/80 bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100/50 transition-all text-center group shadow-sm"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden" 
                  accept=".jpg,.jpeg,.png"
                />
                
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    <span className="text-xs text-slate-500 font-medium">Uploading image...</span>
                  </div>
                ) : uploadSuccess ? (
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-semibold">Upload complete</span>
                    <span className="text-[10px] text-slate-400">Click to change file</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-purple-600 transition-colors mb-1" />
                    <span className="text-xs text-slate-700 font-semibold">
                      Click to upload profile photo
                    </span>
                    <span className="text-[10px] text-slate-450 mt-0.5">
                      JPG, JPEG or PNG (Max 5MB)
                    </span>
                  </>
                )}
              </div>
              <input type="hidden" {...register('profileImage')} />
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" /> Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="John Doe"
              {...register('fullName')}
              className={`w-full bg-white border ${errors.fullName ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-200 focus:border-purple-500/80 focus:ring-purple-500/20'} rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 transition-all placeholder:text-slate-400 text-slate-800`}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 font-semibold">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-600" /> Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              className={`w-full bg-white border ${errors.email ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-200 focus:border-purple-500/80 focus:ring-purple-500/20'} rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 transition-all placeholder:text-slate-400 text-slate-800`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-semibold">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-purple-600" /> Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="10-digit number"
              {...register('phoneNumber')}
              className={`w-full bg-white border ${errors.phoneNumber ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-200 focus:border-purple-500/80 focus:ring-purple-500/20'} rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 transition-all placeholder:text-slate-400 text-slate-800`}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-500 font-semibold">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" /> Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('dateOfBirth')}
              className={`w-full bg-white border ${errors.dateOfBirth ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-200 focus:border-purple-500/80 focus:ring-purple-500/20'} rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 transition-all text-slate-800`}
            />
            {errors.dateOfBirth && (
              <p className="text-xs text-red-500 font-semibold">{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" /> Gender <span className="text-red-500">*</span>
            </label>
            <select
              {...register('gender')}
              className={`w-full bg-white border ${errors.gender ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-200 focus:border-purple-500/80 focus:ring-purple-500/20'} rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 transition-all text-slate-800`}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="text-xs text-red-500 font-semibold">{errors.gender.message}</p>
            )}
          </div>

          {/* Occupation */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600" /> Occupation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Software Engineer"
              {...register('occupation')}
              className={`w-full bg-white border ${errors.occupation ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-200 focus:border-purple-500/80 focus:ring-purple-500/20'} rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 transition-all placeholder:text-slate-400 text-slate-800`}
            />
            {errors.occupation && (
              <p className="text-xs text-red-500 font-semibold">{errors.occupation.message}</p>
            )}
          </div>

        </div>

        {/* Full-width Fields */}
        <div className="space-y-6">

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" /> Full Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="123 Main St, City, Country"
              {...register('address')}
              className={`w-full bg-white border ${errors.address ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-200 focus:border-purple-500/80 focus:ring-purple-500/20'} rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 transition-all placeholder:text-slate-400 text-slate-800`}
            />
            {errors.address && (
              <p className="text-xs text-red-500 font-semibold">{errors.address.message}</p>
            )}
          </div>

          {/* Interactive Skills Tags */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" /> Skills <span className="text-red-500">*</span>
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill (e.g. React, Node) and press Enter"
                className={`flex-1 bg-white border ${errors.skills ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-200 focus:border-purple-500/80 focus:ring-purple-500/20'} rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 transition-all placeholder:text-slate-400 text-slate-800`}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-xl px-4 flex items-center justify-center transition-colors shrink-0 cursor-pointer font-bold text-xs"
              >
                Add
              </button>
            </div>

            {/* Display validation error for array length */}
            {errors.skills && (
              <p className="text-xs text-red-500 font-semibold">{errors.skills.message}</p>
            )}

            {/* Skill Tags List */}
            {formSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                {formSkills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold select-none animate-fadeIn"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="hover:text-red-650 transition-colors duration-150 rounded-full focus:outline-none p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" /> Additional Notes
            </label>
            <textarea
              rows={4}
              placeholder="Describe background context, additional skills, references, or instructions..."
              {...register('notes')}
              className={`w-full bg-white border ${errors.notes ? 'border-red-400 focus:ring-red-200/50' : 'border-slate-200 focus:border-purple-500/80 focus:ring-purple-500/20'} rounded-xl px-4 py-3 text-sm outline-none focus:ring-4 transition-all placeholder:text-slate-400 text-slate-800 resize-none`}
            />
            {errors.notes && (
              <p className="text-xs text-red-500 font-semibold">{errors.notes.message}</p>
            )}
          </div>

        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 mt-8 flex flex-col sm:flex-row gap-4 items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting || uploading || isSubmittingExternal}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:from-purple-700 active:to-indigo-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {(isSubmitting || isSubmittingExternal) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {initialData ? 'Update Profile' : 'Save Profile'}
          </button>
        </div>

      </div>
    </form>
  );
}
