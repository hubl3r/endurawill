// components/CreateLegacyLetterModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, ChevronRight, ChevronLeft, Mail, Video, Mic, FileText, Calendar, Heart, Clock, Trophy, Baby, GraduationCap, Ring, Upload, Check } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface Beneficiary {
  id: string;
  fullName: string;
  relationship: string;
}

interface CreateLegacyLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateLegacyLetterModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateLegacyLetterModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    letterType: 'personal', // personal, shared_story, instructions
    contentType: 'written', // written, video, audio, document
    content: '',
    instructions: '',
    recipients: [] as string[],
    deliveryTiming: 'on_death', // on_death, specific_date, recurring, milestone, conditional
    deliveryDate: '',
    milestone: '',
    conditionalAge: '',
    recurringFrequency: '',
    recurringUntil: '',
    notifyBeforeDelivery: false,
    notifyDaysBefore: 7,
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    mimeType: '',
    notes: '',
  });

  // TipTap editor for letter content
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Begin your letter here...',
      }),
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content: editor.getHTML() }));
    },
  });

  // TipTap editor for instructions
  const instructionsEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Add any special instructions, passwords, or important information...',
      }),
    ],
    content: formData.instructions,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, instructions: editor.getHTML() }));
    },
  });

  useEffect(() => {
    if (isOpen) {
      loadBeneficiaries();
    }
  }, [isOpen]);

  const loadBeneficiaries = async () => {
    try {
      const response = await fetch('/api/beneficiaries');
      const data = await response.json();
      if (data.success) {
        setBeneficiaries(data.beneficiaries);
      }
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
    }
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validation
    if (!formData.title) {
      setError('Please enter a title');
      return;
    }
    if (formData.recipients.length === 0) {
      setError('Please select at least one recipient');
      return;
    }
    if (formData.contentType === 'written' && !formData.content) {
      setError('Please write your letter content');
      return;
    }
    if (formData.contentType !== 'written' && !formData.fileUrl) {
      setError('Please upload a file');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/legacy-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        resetForm();
      } else {
        setError(data.error || 'Failed to create letter');
      }
    } catch (error) {
      setError('Failed to create letter');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      letterType: 'personal',
      contentType: 'written',
      content: '',
      instructions: '',
      recipients: [],
      deliveryTiming: 'on_death',
      deliveryDate: '',
      milestone: '',
      conditionalAge: '',
      recurringFrequency: '',
      recurringUntil: '',
      notifyBeforeDelivery: false,
      notifyDaysBefore: 7,
      fileUrl: '',
      fileName: '',
      fileSize: 0,
      mimeType: '',
      notes: '',
    });
    editor?.commands.setContent('');
    instructionsEditor?.commands.setContent('');
    setStep(1);
    setError('');
  };

  const handleClose = () => {
    if (confirm('Are you sure? Your progress will be lost.')) {
      resetForm();
      onClose();
    }
  };

  const nextStep = () => {
    setError('');
    if (step === 1 && formData.recipients.length === 0) {
      setError('Please select at least one recipient');
      return;
    }
    if (step === 2 && !formData.contentType) {
      setError('Please select a content type');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const toggleRecipient = (beneficiaryId: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(beneficiaryId)
        ? prev.recipients.filter(id => id !== beneficiaryId)
        : [...prev.recipients, beneficiaryId],
    }));
  };

  if (!isOpen) return null;

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Legacy Letter</h2>
              <p className="text-sm text-gray-600 mt-1">Step {step} of {totalSteps}</p>
            </div>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
              <X className="h-6 w-6" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2 mb-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Recipients */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Who is this letter for?</h3>
                <p className="text-sm text-gray-600 mb-4">Select one or more beneficiaries to receive this letter</p>
              </div>

              {beneficiaries.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">You haven't added any beneficiaries yet.</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add Beneficiary
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {beneficiaries.map((beneficiary) => (
                    <button
                      key={beneficiary.id}
                      onClick={() => toggleRecipient(beneficiary.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.recipients.includes(beneficiary.id)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{beneficiary.fullName}</p>
                          <p className="text-sm text-gray-600 capitalize">{beneficiary.relationship}</p>
                        </div>
                        {formData.recipients.includes(beneficiary.id) && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Content Type */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How would you like to create this letter?</h3>
                <p className="text-sm text-gray-600 mb-4">Choose the format that feels right for your message</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, contentType: 'written' }))}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    formData.contentType === 'written'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Mail className={`h-8 w-8 mb-3 ${formData.contentType === 'written' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h4 className="font-semibold text-gray-900 mb-1">Written Letter</h4>
                  <p className="text-sm text-gray-600">Type your message with our editor</p>
                </button>

                <button
                  onClick={() => setFormData(prev => ({ ...prev, contentType: 'video' }))}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    formData.contentType === 'video'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Video className={`h-8 w-8 mb-3 ${formData.contentType === 'video' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h4 className="font-semibold text-gray-900 mb-1">Video Message</h4>
                  <p className="text-sm text-gray-600">Upload a video file</p>
                </button>

                <button
                  onClick={() => setFormData(prev => ({ ...prev, contentType: 'audio' }))}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    formData.contentType === 'audio'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Mic className={`h-8 w-8 mb-3 ${formData.contentType === 'audio' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h4 className="font-semibold text-gray-900 mb-1">Audio Recording</h4>
                  <p className="text-sm text-gray-600">Upload an audio file</p>
                </button>

                <button
                  onClick={() => setFormData(prev => ({ ...prev, contentType: 'document' }))}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    formData.contentType === 'document'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className={`h-8 w-8 mb-3 ${formData.contentType === 'document' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h4 className="font-semibold text-gray-900 mb-1">Document</h4>
                  <p className="text-sm text-gray-600">Upload a PDF or Word document</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Content */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Letter Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., For Your 18th Birthday, My Final Words, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Letter Type</label>
                <select
                  value={formData.letterType}
                  onChange={(e) => setFormData(prev => ({ ...prev, letterType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                >
                  <option value="personal">Personal Letter</option>
                  <option value="shared_story">Shared Story/Memory</option>
                  <option value="instructions">Instructions</option>
                </select>
              </div>

              {formData.contentType === 'written' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Letter <span className="text-red-600">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      {/* Toolbar */}
                      <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-1">
                        <button
                          onClick={() => editor?.chain().focus().toggleBold().run()}
                          className={`px-3 py-1 rounded ${editor?.isActive('bold') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
                          type="button"
                        >
                          <strong>B</strong>
                        </button>
                        <button
                          onClick={() => editor?.chain().focus().toggleItalic().run()}
                          className={`px-3 py-1 rounded ${editor?.isActive('italic') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
                          type="button"
                        >
                          <em>I</em>
                        </button>
                        <button
                          onClick={() => editor?.chain().focus().toggleBulletList().run()}
                          className={`px-3 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
                          type="button"
                        >
                          • List
                        </button>
                      </div>
                      {/* Editor */}
                      <EditorContent
                        editor={editor}
                        className="prose max-w-none p-4 min-h-[300px] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <EditorContent
                        editor={instructionsEditor}
                        className="prose max-w-none p-4 min-h-[150px] focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Passwords, access codes, funeral wishes, etc.</p>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File <span className="text-red-600">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drag and drop your file here, or click to browse</p>
                    <input
                      type="file"
                      accept={
                        formData.contentType === 'video' ? 'video/*' :
                        formData.contentType === 'audio' ? 'audio/*' :
                        '.pdf,.doc,.docx'
                      }
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      Choose File
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      {formData.contentType === 'video' && 'MP4, MOV, AVI (Max 100MB)'}
                      {formData.contentType === 'audio' && 'MP3, WAV, M4A (Max 50MB)'}
                      {formData.contentType === 'document' && 'PDF, DOC, DOCX (Max 10MB)'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Delivery Options */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">When should this letter be delivered?</h3>
                <p className="text-sm text-gray-600 mb-4">Choose the perfect moment for your message to arrive</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, deliveryTiming: 'on_death' }))}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    formData.deliveryTiming === 'on_death'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Heart className={`h-6 w-6 ${formData.deliveryTiming === 'on_death' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-semibold text-gray-900">Upon My Passing</p>
                      <p className="text-sm text-gray-600">Traditional estate planning letter</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setFormData(prev => ({ ...prev, deliveryTiming: 'specific_date' }))}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    formData.deliveryTiming === 'specific_date'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`h-6 w-6 ${formData.deliveryTiming === 'specific_date' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-semibold text-gray-900">Specific Date</p>
                      <p className="text-sm text-gray-600">Schedule for a future date</p>
                    </div>
                  </div>
                </button>

                {formData.deliveryTiming === 'specific_date' && (
                  <div className="ml-12">
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}

                <button
                  onClick={() => setFormData(prev => ({ ...prev, deliveryTiming: 'milestone' }))}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    formData.deliveryTiming === 'milestone'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Trophy className={`h-6 w-6 ${formData.deliveryTiming === 'milestone' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-semibold text-gray-900">Life Milestone</p>
                      <p className="text-sm text-gray-600">Wedding, graduation, first child, etc.</p>
                    </div>
                  </div>
                </button>

                {formData.deliveryTiming === 'milestone' && (
                  <div className="ml-12">
                    <select
                      value={formData.milestone}
                      onChange={(e) => setFormData(prev => ({ ...prev, milestone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">Select milestone...</option>
                      <option value="18th_birthday">18th Birthday</option>
                      <option value="21st_birthday">21st Birthday</option>
                      <option value="wedding">Wedding Day</option>
                      <option value="graduation">Graduation</option>
                      <option value="first_child">Birth of First Child</option>
                      <option value="custom">Custom Milestone</option>
                    </select>
                  </div>
                )}

                <button
                  onClick={() => setFormData(prev => ({ ...prev, deliveryTiming: 'conditional' }))}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    formData.deliveryTiming === 'conditional'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className={`h-6 w-6 ${formData.deliveryTiming === 'conditional' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-semibold text-gray-900">When They Turn...</p>
                      <p className="text-sm text-gray-600">Age-based delivery</p>
                    </div>
                  </div>
                </button>

                {formData.deliveryTiming === 'conditional' && (
                  <div className="ml-12">
                    <input
                      type="number"
                      value={formData.conditionalAge}
                      onChange={(e) => setFormData(prev => ({ ...prev, conditionalAge: e.target.value }))}
                      placeholder="Age (e.g., 18, 21, 25)"
                      className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}

                <button
                  onClick={() => setFormData(prev => ({ ...prev, deliveryTiming: 'recurring' }))}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    formData.deliveryTiming === 'recurring'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`h-6 w-6 ${formData.deliveryTiming === 'recurring' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-semibold text-gray-900">Recurring</p>
                      <p className="text-sm text-gray-600">Annual birthday, anniversary, etc.</p>
                    </div>
                  </div>
                </button>

                {formData.deliveryTiming === 'recurring' && (
                  <div className="ml-12 space-y-2">
                    <select
                      value={formData.recurringFrequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurringFrequency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">Select frequency...</option>
                      <option value="yearly">Yearly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <input
                      type="date"
                      value={formData.recurringUntil}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurringUntil: e.target.value }))}
                      placeholder="Repeat until..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.notifyBeforeDelivery}
                    onChange={(e) => setFormData(prev => ({ ...prev, notifyBeforeDelivery: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                  />
                  <span className="text-sm text-gray-700">Notify me before delivery</span>
                </label>
                {formData.notifyBeforeDelivery && (
                  <div className="ml-6 mt-2">
                    <input
                      type="number"
                      value={formData.notifyDaysBefore}
                      onChange={(e) => setFormData(prev => ({ ...prev, notifyDaysBefore: parseInt(e.target.value) }))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-600">days before</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Letter</h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-semibold text-gray-900">{formData.title}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Recipients</p>
                  <p className="font-semibold text-gray-900">
                    {formData.recipients.length} recipient{formData.recipients.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{formData.contentType}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Delivery</p>
                  <p className="font-semibold text-gray-900">
                    {formData.deliveryTiming === 'on_death' && 'Upon passing'}
                    {formData.deliveryTiming === 'specific_date' && `On ${formData.deliveryDate}`}
                    {formData.deliveryTiming === 'milestone' && `At ${formData.milestone}`}
                    {formData.deliveryTiming === 'conditional' && `When recipient turns ${formData.conditionalAge}`}
                    {formData.deliveryTiming === 'recurring' && `${formData.recurringFrequency} until ${formData.recurringUntil}`}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Ready to create this letter?</strong> You can always edit it later.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
          <button
            onClick={step === 1 ? handleClose : prevStep}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
          >
            {step === 1 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                Back
              </>
            )}
          </button>

          {step < totalSteps ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Letter'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
