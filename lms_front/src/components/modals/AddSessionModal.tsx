import { X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { SessionFormData, getSessionSchema } from '../../lib/schemas/SessionSchema';
import { useStudents } from '../../features/admin/hooks/useStudents';
import { useTeacher } from '../../features/admin/hooks/useTeacher';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CustomTimePicker from '../ui/CustomTime';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (session: SessionFormData) => void;
}

export default function AddSessionModal({ isOpen, onClose, onAdd }: AddSessionModalProps) {
  const { language, t } = useLanguage();

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<SessionFormData>({
    resolver: zodResolver(getSessionSchema(t)),
    defaultValues: {
      student: '', teacher: '', subject: '', title: '',
      description: '', type: 'full', notification_Time: '10',
      sessionDate: '', duration: '', startTime: '', endTime: '',
      meetingLink: '', notes: ''
    }
  });

  const selectedTeacher = watch('teacher');
  const selectedStudent = watch('student');
  const selectedDurationId = watch('duration');
  const startTimeVal = watch('startTime');

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const { data: studentsData } = useStudents();
  const { data: teachersData } = useTeacher();

  const students = studentsData?.data?.studentsData || [];
  const teachers = teachersData?.teachers || [];

  const studentOptions = students.map(s => ({ value: s.id, label: s.user.name }));
  const teacherOptions = teachers.map(t => ({ value: t.id, label: t.user.name }));

  const durationPackages: Record<string, { name: string; duration: number }> = {
    '1': { name: '30 دقيقة', duration: 30 },
    '2': { name: '45 دقيقة', duration: 45 },
    '3': { name: '60 دقيقة', duration: 60 },
  };

  useEffect(() => {
    if (selectedDurationId && startTimeVal) {
      const durationMins = durationPackages[selectedDurationId]?.duration || 0;
      if (durationMins > 0) {
        const [hours, minutes] = startTimeVal.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const date = new Date();
          date.setHours(hours, minutes + durationMins, 0, 0);
          const endH = String(date.getHours()).padStart(2, '0');
          const endM = String(date.getMinutes()).padStart(2, '0');
          setValue('endTime', `${endH}:${endM}`, { shouldValidate: true });
        }
      }
    }
  }, [selectedDurationId, startTimeVal, setValue]);

  const selectedTeacherData = teachers.find(t => t.id === selectedTeacher);
  const availableSubjects = useMemo(() => {
    return selectedTeacherData ? selectedTeacherData.teacherSubjects.map((ts) => ({
      value: ts.subject.id,
      label: language === 'ar' ? ts.subject.name_ar : ts.subject.name_en
    })) : [];
  }, [selectedTeacherData, language]);

  const selectedStudentData = students.find(s => s.id === selectedStudent);
  const selectedStudentPackage = selectedStudentData ? {
    name: language === 'ar' ? selectedStudentData.plan?.name_ar : selectedStudentData.plan?.name_en || 'No Package',
    sessionsRemaining: selectedStudentData.sessions_remaining || 0,
    totalSessions: selectedStudentData.sessions || 0,
  } : null;



  const onFormSubmit = (data: SessionFormData) => {
    onAdd(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh]  overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-primary border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">{t('addSingleSession_title')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Student and Teacher */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Controller
                  name="student"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      label={t('studentLabel')}
                      value={field.value}
                      options={studentOptions}
                      onChange={field.onChange}
                      placeholder={t('selectStudent')}
                      className="h-[46px]"
                    />
                  )}
                />
                {errors.student && <span className="text-red-500 text-xs mt-1 block text-start">{errors.student.message}</span>}
              </div>

              <div>
                <Controller
                  name="teacher"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      label={t('teacherLabel')}
                      value={field.value}
                      options={teacherOptions}
                      onChange={(val) => {
                        field.onChange(val);
                        setValue('subject', '');
                      }}
                      placeholder={t('selectTeacher')}
                      className="h-[46px]"
                    />
                  )}
                />
                {errors.teacher && <span className="text-red-500 text-xs mt-1 block text-start">{errors.teacher.message}</span>}
              </div>
            </div>

            {/* Package Details */}
            {selectedStudentPackage && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-3 text-start">{t('packageInfo')}</h3>
                <div className="grid grid-cols-3 gap-4 text-start">
                  <div>
                    <p className="text-xs text-blue-600 mb-1">{t('packageName')}</p>
                    <p className="text-sm font-medium text-blue-900">{language === 'ar' ? selectedStudentData?.plan?.name_ar : selectedStudentData?.plan?.name_en}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">{t('sessionsRemaining')}</p>
                    <p className="text-sm font-medium text-blue-900">{selectedStudentPackage.sessionsRemaining}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">{t('totalSessions')}</p>
                    <p className="text-sm font-medium text-blue-900">{selectedStudentPackage.totalSessions}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Subject */}
            <div className="space-y-2">
              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('subjectLabel')}
                    value={field.value}
                    options={availableSubjects}
                    onChange={field.onChange}
                    placeholder={selectedTeacher ? t('selectSubject') : t('teacherQuestion')}
                    className="h-[46px]"
                    disabled={!selectedTeacher}
                  />
                )}
              />
              {errors.subject && <span className="text-red-500 text-xs block text-start">{errors.subject.message}</span>}
            </div>

            {/* Date and Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-start">
                <DatePickerField
                  label={`${t('sessionDate')} `}
                  value={watch('sessionDate')}
                  onChange={(val) => setValue('sessionDate', val, { shouldValidate: true })}
                  error={errors.sessionDate?.message}
                />
              </div>

              <div className="space-y-2 text-start">
                <label className="block text-sm font-medium text-gray-700">
                  {t('sessionTitleLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title')}
                  placeholder={t('sessionTitlePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-start"
                />
                {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
              </div>
            </div>

            {/* Description and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-start">
                <label className="block text-sm font-medium text-gray-700">
                  {t('description')}
                </label>
                <textarea
                  {...register('description')}
                  placeholder={t('descriptionPlaceholder')}
                  rows={2}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-start resize-none ${errors.description ? 'border-red-500' : 'border-gray-200'}`}
                />
                {errors.description && <span className="text-red-500 text-xs mt-1 block text-start">{errors.description.message}</span>}
              </div>

              <div className="space-y-2">
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      label={t('type')}
                      value={field.value}
                      options={[
                        { value: 'full', label: t('full') },
                        { value: 'half', label: t('half') },
                      ]}
                      onChange={field.onChange}
                      className="h-[46px]"
                    />
                  )}
                />
                {errors.type && <span className="text-red-500 text-xs mt-1 block text-start">{errors.type.message}</span>}
              </div>
            </div>

            {/* Notification Time */}
            <div className="space-y-2">
              <Controller
                name="notification_Time"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('notificationTime')}
                    value={field.value}
                    options={[
                      { value: '10', label: language === 'ar' ? '10 دقائق' : '10 min' },
                      { value: '30', label: language === 'ar' ? '30 دقيقة' : '30 min' },
                      { value: '60', label: language === 'ar' ? '60 دقيقة' : '60 min' },
                    ]}
                    onChange={field.onChange}
                    className="h-[46px]"
                  />
                )}
              />
            </div>

            {/* Duration and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Controller
                  name="duration"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      label={t('duration')}
                      value={field.value}
                      options={Object.entries(durationPackages).map(([id, pkg]) => ({
                        value: id,
                        label: pkg.name
                      }))}
                      onChange={field.onChange}
                      placeholder={t('selectDuration')}
                      className="h-[46px]"
                    />
                  )}
                />
                {errors.duration && <span className="text-red-500 text-xs block text-start">{errors.duration.message}</span>}
              </div>

              <div className="space-y-2 text-start">

                {/* <input
                  type="time"
                  {...register('startTime')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-start"
                />
                {errors.startTime && <span className="text-red-500 text-xs">{errors.startTime.message}</span>} */}
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <CustomTimePicker
                      label={t('startTime')}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.startTime?.message}
                    />
                  )}
                />
              </div>

              <div className="space-y-2 text-start">
                <label className="block text-sm font-medium text-gray-700">
                  {t('endTime')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  disabled
                  {...register('endTime')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-start"
                />
                {errors.endTime && <span className="text-red-500 text-xs">{errors.endTime.message}</span>}
              </div>
            </div>

            {/* Meeting Link and Notes */}
            <div className="space-y-4">
              <div className="space-y-2 text-start">
                <label className="block text-sm font-medium text-gray-700">{t('meetingLink')}</label>
                <input
                  type="url"
                  {...register('meetingLink')}
                  placeholder="https://zoom.us/..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-start"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2 text-start">
                <label className="block text-sm font-medium text-gray-700">{t('notes')}</label>
                <textarea
                  {...register('notes')}
                  placeholder={t('notesPlaceholder')}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-start resize-none ${errors.notes ? 'border-red-500' : 'border-gray-200'}`}
                />
                {errors.notes && <span className="text-red-500 text-xs mt-1 block text-start">{errors.notes.message}</span>}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl transition-colors font-medium hover:bg-blue-700">
              {t('add')}
            </button>
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
