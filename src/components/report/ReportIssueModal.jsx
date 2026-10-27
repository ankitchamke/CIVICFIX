import React, { useState } from 'react';
import {
  MapPin,
  Camera,
  CheckCircle2,
  Sparkles,
  ThumbsUp,
  X,
  AlertCircle,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { CATEGORIES, NAGPUR_ZONES, SUGGESTED_NAGPUR_LOCATIONS } from '../../data/mockData';
import { compressImage } from '../../utils/storage';
import { findPossibleDuplicates } from '../../utils/duplicateCheck';

export function ReportIssueModal({
  isOpen,
  onClose,
  onSubmitComplaint,
  onUpvoteExisting,
  existingComplaints = [],
}) {
  const [step, setStep] = useState(1); // 1: form, 2: similarity-check, 3: success
  const [category, setCategory] = useState('roads');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [ward, setWard] = useState('zone-dharampeth');
  const [schematicCoords, setSchematicCoords] = useState({ x: 440, y: 250 });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [createdTicketId, setCreatedTicketId] = useState('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  // Inline Validation Errors
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Duplicate Check Results
  const [duplicateMatches, setDuplicateMatches] = useState([]);

  // Quick Demo Presets
  const samplePhotos = [
    { label: 'Pothole (Nagpur)', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80' },
    { label: 'Dark Lamp (Futala)', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80' },
    { label: 'Waste Bin (Gokulpeth)', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80' },
  ];

  // Check if non-Nagpur location was typed
  const isNonNagpurDetected = /mumbai|pune|delhi|bangalore|bengaluru|kolkata|hyderabad|chennai|london|new york|chicago/i.test(location);

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Issue title is required.';
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }

    if (!category) {
      errs.category = 'Please select an issue category.';
    }

    if (!location.trim()) {
      errs.location = 'Location or street address is required.';
    } else if (location.trim().length < 3) {
      errs.location = 'Please provide a clearer street name or landmark.';
    }

    if (!description.trim()) {
      errs.description = 'Description is required to help NMC work teams.';
    } else if (description.trim().length < 10) {
      errs.description = 'Please describe the problem in at least 10 characters.';
    }

    return errs;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSelectSuggestedLocation = (sug) => {
    setLocation(`${sug.label}, Nagpur`);
    setSchematicCoords({ x: sug.x, y: sug.y });
    // Match ward
    if (sug.zone.includes('Dharampeth')) setWard('zone-dharampeth');
    else if (sug.zone.includes('Sitabuldi')) setWard('zone-dhantoli');
    else if (sug.zone.includes('Sadar') || sug.zone.includes('Civil')) setWard('zone-mangalwari');
    else if (sug.zone.includes('Laxmi') || sug.zone.includes('Pratap')) setWard('zone-laxminagar');
    else if (sug.zone.includes('Nehru') || sug.zone.includes('Wardha')) setWard('zone-nehrunagar');
    else if (sug.zone.includes('Hanuman') || sug.zone.includes('Medical')) setWard('zone-hanumannagar');

    setTouched((prev) => ({ ...prev, location: true }));
    setErrors((prev) => ({ ...prev, location: null }));
  };

  const handleSimulateNagpurPin = () => {
    setIsDetectingLocation(true);
    setTimeout(() => {
      setLocation('Munje Square, Sitabuldi Metro Interchange, Nagpur');
      setWard('zone-dhantoli');
      setSchematicCoords({ x: 440, y: 250 });
      setIsDetectingLocation(false);
      setTouched((prev) => ({ ...prev, location: true }));
      setErrors((prev) => ({ ...prev, location: null }));
    }, 400);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingPhoto(true);
        // Size-limit / compress image to prevent filling localStorage
        const compressedDataUrl = await compressImage(file, 600, 600, 0.7);
        setPhotoPreview(compressedDataUrl);
      } catch (err) {
        console.error('Failed to compress image:', err);
      } finally {
        setIsCompressingPhoto(false);
      }
    }
  };

  const handleProceedToSimilarityCheck = (e) => {
    e.preventDefault();
    setTouched({ title: true, category: true, location: true, description: true });
    const errs = validate();
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      return;
    }

    // Run transparent local duplicate heuristic
    const matches = findPossibleDuplicates(
      { title, category, location, description },
      existingComplaints
    );

    if (matches.length > 0) {
      setDuplicateMatches(matches);
      setStep(2);
    } else {
      // No duplicates found, proceed directly to final submit
      executeSubmission();
    }
  };

  const executeSubmission = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newId = `CV-2026-${randomDigits}`;
    const categoryObj = CATEGORIES.find((c) => c.id === category);
    const wardObj = NAGPUR_ZONES.find((z) => z.id === ward);

    // Resolve schematic coordinates if not explicitly set
    let finalX = schematicCoords.x;
    let finalY = schematicCoords.y;

    const locLower = location.toLowerCase();
    if (locLower.includes('futala')) { finalX = 180; finalY = 155; }
    else if (locLower.includes('dharampeth') || locLower.includes('gokulpeth')) { finalX = 275; finalY = 220; }
    else if (locLower.includes('ambazari') || locLower.includes('vnit')) { finalX = 230; finalY = 320; }
    else if (locLower.includes('civil lines')) { finalX = 360; finalY = 170; }
    else if (locLower.includes('sadar')) { finalX = 435; finalY = 130; }
    else if (locLower.includes('variety')) { finalX = 410; finalY = 275; }
    else if (locLower.includes('wardha') || locLower.includes('chhatrapati')) { finalX = 420; finalY = 395; }
    else if (locLower.includes('manish')) { finalX = 480; finalY = 460; }
    else if (locLower.includes('pratap') || locLower.includes('subhash')) { finalX = 280; finalY = 410; }
    else if (locLower.includes('medical')) { finalX = 550; finalY = 310; }
    else if (locLower.includes('hingna')) { finalX = 280; finalY = 410; }
    else {
      // Slight jitter around Central Nagpur so new items don't overlap exactly
      finalX = 430 + Math.floor((Math.random() - 0.5) * 40);
      finalY = 240 + Math.floor((Math.random() - 0.5) * 40);
    }

    const newRecord = {
      id: newId,
      title: title.trim(),
      category: category,
      categoryLabel: categoryObj?.label || 'Other',
      location: location.trim(),
      ward: wardObj?.name || 'Dharampeth Zone (Zone 2), Nagpur',
      schematicX: finalX,
      schematicY: finalY,
      dateReported: new Date().toISOString(),
      status: 'open',
      priority: 'high',
      assignedDept: 'NMC Public Works & Municipal Services',
      description: description.trim(),
      upvotes: 1,
      isNearby: true,
      distanceMeters: 75,
      matchConfidence: 75,
      hasPhoto: Boolean(photoPreview),
      photoUrl: photoPreview,
      timeline: [
        {
          date: new Date().toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          action: 'Grievance Registered',
          note: 'Submitted by Ankit Chamke via CivicFix Nagpur portal. Assigned schematic map node.',
        },
      ],
    };

    onSubmitComplaint(newRecord);
    setCreatedTicketId(newId);
    setStep(3);
  };

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setDescription('');
    setLocation('');
    setCategory('roads');
    setPhotoPreview(null);
    setCreatedTicketId('');
    setErrors({});
    setTouched({});
    setDuplicateMatches([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetForm}
      title={
        step === 3
          ? 'Grievance Registered in Nagpur Registry'
          : step === 2
          ? 'Local Similarity Check — Possible Matches'
          : 'Report a Public Civic Issue in Nagpur'
      }
      subtitle={
        step === 3
          ? 'Municipal tracking reference issued & pinned to the Nagpur Issue Map'
          : step === 2
          ? 'Review similar local reports before submitting to avoid duplicate work orders'
          : 'Nagpur Municipal Corporation (NMC) jurisdiction · Nagpur, Maharashtra'
      }
      maxWidth="max-w-2xl"
    >
      {/* STEP 1: Main Grievance Form */}
      {step === 1 && (
        <form onSubmit={handleProceedToSimilarityCheck} className="space-y-4">
          {/* Category Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Issue Category *
              </label>
              {touched.category && errors.category && (
                <span className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.category}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setTouched((prev) => ({ ...prev, category: true }));
                      setErrors((prev) => ({ ...prev, category: null }));
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/70 ring-1 ring-teal-500 text-teal-950 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold leading-tight">{cat.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{cat.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Field with Inline Validation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                2. Issue Title / Summary *
              </label>
              {touched.title && errors.title && (
                <span className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.title}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. Hazardous 8-inch pothole near Sitabuldi Metro interchange"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (touched.title) setErrors(validate());
              }}
              onBlur={() => handleBlur('title')}
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                touched.title && errors.title
                  ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-slate-300'
              }`}
            />
          </div>

          {/* Description Field with Inline Validation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                3. Detailed Description *
              </label>
              {touched.description && errors.description && (
                <span className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.description}
                </span>
              )}
            </div>
            <textarea
              rows={3}
              placeholder="Describe landmark details, safety risks, and observed time in Nagpur..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (touched.description) setErrors(validate());
              }}
              onBlur={() => handleBlur('description')}
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                touched.description && errors.description
                  ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-slate-300'
              }`}
            />
            <span className="text-[10px] text-slate-400">
              Min 10 characters ({description.trim().length} chars)
            </span>
          </div>

          {/* Location & Nagpur Zone Selection */}
          <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                4. Nagpur Location & Zone *
              </label>
              <button
                type="button"
                onClick={handleSimulateNagpurPin}
                disabled={isDetectingLocation}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                title="Select central Nagpur point"
              >
                <Compass className={`w-3 h-3 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                <span>{isDetectingLocation ? 'Locating...' : 'Select Central Pin (Sitabuldi)'}</span>
              </button>
            </div>

            {/* Suggested Nagpur Locations Chips */}
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                Suggested Nagpur Landmarks:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {SUGGESTED_NAGPUR_LOCATIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestedLocation(sug)}
                    className="text-[10px] bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 px-2 py-0.5 rounded border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    {sug.label}
                  </button>
                ))}
              </div>
            </div>

            {touched.location && errors.location && (
              <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.location}
              </p>
            )}

            {/* Non-Nagpur warning callout without altering user input */}
            {isNonNagpurDetected && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-950">Nagpur Demo Scope Notice:</p>
                  <p className="text-[11px] text-amber-800">
                    CivicFix is currently scoped to Nagpur, Maharashtra, India. Your input will be preserved and mapped to the Nagpur municipal demonstration registry.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="e.g. WHC Road, Dharampeth or Munje Square"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (touched.location) setErrors(validate());
                  }}
                  onBlur={() => handleBlur('location')}
                  className={`w-full px-3 py-2 text-xs bg-white border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    touched.location && errors.location
                      ? 'border-rose-400 focus:ring-rose-400'
                      : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {NAGPUR_ZONES.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Optional Photo Attachment with Size Limitation & Removal */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              5. Photo Evidence (Optional)
            </label>

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-44 flex items-center justify-center bg-slate-900 group">
                <img
                  src={photoPreview}
                  alt="Issue Preview"
                  className="w-full h-44 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer shadow-md"
                  title="Remove selected image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/70 text-white rounded text-[10px] font-mono backdrop-blur-xs flex items-center gap-1">
                  <span>Photo attached (Size-optimized)</span>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-4 text-center transition-colors bg-white">
                <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs text-slate-600 font-medium">
                  Select an image or click a Nagpur sample below
                </p>
                <label className="mt-2.5 inline-block cursor-pointer">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200">
                    {isCompressingPhoto ? 'Optimizing image...' : 'Browse Local File'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isCompressingPhoto}
                  />
                </label>

                {/* Quick Presets for Demo */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Nagpur Presets:</span>
                  {samplePhotos.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoPreview(item.url)}
                      className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 px-2 py-0.5 rounded text-slate-600 border border-slate-200 cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              * Required fields
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md">
                Review & Submit Issue →
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 2: Local Heuristic Duplicate Similarity Check */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Demo Similarity Check — {duplicateMatches.length} Possible Nagpur Match{duplicateMatches.length > 1 ? 'es' : ''} Found
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  Our transparent local heuristic found existing issues matching your category and location terms in Nagpur. 
                  If your issue is already reported, upvoting it increases municipal dispatch urgency without creating duplicate work tickets.
                </p>
                <p className="text-[10px] text-amber-700 mt-1 font-mono">
                  Heuristic note: No external AI or map API is invoked; this is a client-side keyword and category match.
                </p>
              </div>
            </div>
          </div>

          {/* List of Duplicate Matches */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {duplicateMatches.map(({ complaint: item, score, matchReasons }) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-teal-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {item.id}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {score}% Similarity
                  </span>
                </div>

                <h5 className="text-sm font-bold text-slate-900 mb-1">
                  {item.title}
                </h5>
                <p className="text-xs text-slate-500 mb-2">
                  {item.location} • {item.ward}
                </p>

                <div className="flex flex-wrap gap-1 mb-2.5">
                  {matchReasons.map((reason, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      ✓ {reason}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Current endorsements: {item.upvotes}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={ThumbsUp}
                    onClick={() => {
                      onUpvoteExisting(item.id);
                      resetForm();
                    }}
                    className="text-xs text-teal-700 hover:bg-teal-50 hover:border-teal-300"
                  >
                    Upvote This Match Instead
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <strong>Is your issue distinct?</strong> If this is a separate occurrence or different street address, you can continue submitting your new report.
          </div>

          {/* Step 2 Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              ← Back to Edit
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={executeSubmission}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Continue & Submit as New Complaint
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Confirmed Registered Screen */}
      {step === 3 && (
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-900">
              Grievance Successfully Registered
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your grievance has been assigned a tracking reference, pinned to the Nagpur Issue Map, and saved to local storage.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block text-center">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              NMC Tracking Reference
            </span>
            <span className="text-2xl font-mono font-extrabold text-teal-800 tracking-wider">
              {createdTicketId}
            </span>
          </div>

          <div className="text-xs text-slate-500 max-w-sm mx-auto flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Persisted across page refreshes · Plotted on Nagpur Issue Map</span>
          </div>

          <div className="pt-4 flex justify-center">
            <Button variant="primary" size="md" onClick={resetForm}>
              Done & Return to Dashboard
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
