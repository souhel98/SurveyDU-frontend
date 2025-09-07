"use client";
import React, { useState, useEffect, useRef, createRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import {
  Search,
  Radio,

  CheckSquare,
  List,
  FileUp,
  ImageIcon,
  BarChart2,
  Type,
  MoreHorizontal,
  HelpCircle,
  Undo2,
  Redo2,
  Scissors,
  AlignLeft,
  Maximize2,
  Trash2,
  Plus,
  Save,
  Calendar,
  GripVertical,
  Pencil,
  Copy,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { SurveyService } from "@/lib/services/survey-service";
import { QuestionTypeService, QuestionType } from "@/lib/services/question-type-service";
import { motion, AnimatePresence } from "framer-motion";
import { ACADEMIC_YEARS_SELECT, TARGET_GENDER_SELECT } from "@/lib/constants";
import { CustomSelect, CustomSelectOption } from "@/components/ui/custom-select";
import { DepartmentService } from "@/lib/services/department-service";
import { Switch } from "@/components/ui/switch";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable, useDraggable } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";

// Import question type components
import MultipleChoice from "@/components/question-types/MultipleChoice";
import SingleAnswer from "@/components/question-types/SingleAnswer";
import OpenText from "@/components/question-types/OpenText";
import Percentage from "@/components/question-types/Percentage";



interface QuestionData {
  id: number;
  typeId: number;
  typeName: string;
  questionText: string;
  isRequired: boolean;
  questionOrder: number;
  options: { id: number; text: string; order: number }[];
}

interface SurveyMetadata {
  title: string;
  description: string;
  pointsReward: number;
  startDate: string;
  endDate: string;
  requiredParticipants: number;
  targetAcademicYear: number;
  targetDepartment: string;
  targetGender: number;
  publishImmediately: boolean;
}

// Sortable item for sidebar question
interface SortableSidebarQuestionProps {
  q: any;
  idx: number;
  activeQuestionId: number | null;
  setActiveQuestionId: (id: number) => void;
  activeDragId: number | null;
  setQuestions: React.Dispatch<React.SetStateAction<QuestionData[]>>;
  QUESTION_TYPE_ICONS: any;
  t: (key: string) => string;
}
function SortableSidebarQuestion({ q, idx, activeQuestionId, setActiveQuestionId, activeDragId, setQuestions, QUESTION_TYPE_ICONS, t }: SortableSidebarQuestionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: q.id || idx });
  const { isOver, setNodeRef: setDropRef } = useDroppable({ id: q.id || idx });
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  return (
    <>
      {activeDragId != null && (
        <div
          ref={setDropRef}
          className={`transition-all duration-200 w-full ${isOver ? 'bg-emerald-100 border-2 border-emerald-400 rounded-lg min-h-8 mb-2' : 'min-h-0 mb-0'}`}
          style={{ zIndex: isOver ? 40 : undefined, height: isOver ? undefined : 0 }}
        />
      )}
      <motion.div
        ref={setNodeRef}
        key={q.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: idx * 0.07 }}
        style={{
          transition,
          zIndex: isDragging ? 50 : undefined,
        }}
        className={`group bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm hover:bg-emerald-50 cursor-pointer transition-colors ${activeQuestionId === q.id ? 'ring-2 ring-emerald-400' : ''} ${isDragging ? 'bg-emerald-100' : ''}`}
        onClick={() => setActiveQuestionId(q.id)}
      >
        <span {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing"><GripVertical className="h-4 w-4 text-gray-300 mr-1" /></span>
        <span className="text-xs font-bold text-emerald-600">{idx + 1}.</span>
        {isEditing ? (
          <input
            ref={inputRef}
            className="truncate text-sm text-gray-700 bg-transparent border-b border-emerald-300 focus:outline-none focus:border-emerald-500 px-1 min-w-0 flex-1"
            value={q.questionText}
            onChange={e => {
              setQuestions(questions => questions.map(qq => qq.id === q.id ? { ...qq, questionText: e.target.value } : qq));
            }}
            onBlur={() => setIsEditing(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === 'Escape') setIsEditing(false);
            }}
            maxLength={64}
            placeholder={t('surveyCreator.addQuestionTitle')}
            aria-label={t('surveyCreator.addQuestionTitle')}
          />
        ) : (
          <>
            <span className="mr-1 flex-shrink-0">{QUESTION_TYPE_ICONS[q.typeName]}</span>
            <span
              className="truncate text-sm text-gray-700 flex-1 min-w-0"
              title={q.questionText && q.questionText.length > 32 ? q.questionText : undefined}
            >
              {q.questionText ? q.questionText : <span className="italic text-gray-400">{t('surveyCreator.untitledQuestion')}</span>}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Rename question"
                title="Rename question"
                className="p-1 rounded opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 hover:bg-emerald-100 text-gray-400 hover:text-emerald-600 transition-all duration-200"
                onClick={e => { e.stopPropagation(); setIsEditing(true); }}
                tabIndex={-1}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Duplicate question"
                title="Duplicate question"
                className="p-1 rounded opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-all duration-200"
                onClick={e => {
                  e.stopPropagation();
                  setQuestions(questions => {
                    const idxQ = questions.findIndex(qq => qq.id === q.id);
                    const newQ = {
                      ...q,
                      id: Date.now(),
                      questionOrder: idxQ + 1,
                      typeId: q.typeId,
                      typeName: q.typeName,
                      options: q.options.map((opt: any, i: number) => ({ 
                        ...opt, 
                        id: Date.now() + i + 1, // Generate unique IDs for options
                        order: i 
                      })),
                    };
                    const newQuestions = [
                      ...questions.slice(0, idxQ + 1),
                      newQ,
                      ...questions.slice(idxQ + 1)
                    ].map((q, i) => ({ ...q, questionOrder: i }));
                    return newQuestions;
                  });
                }}
                tabIndex={-1}
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Delete question"
                title="Delete question"
                className="p-1 rounded opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all duration-200"
                onClick={e => { e.stopPropagation(); setQuestions(questions => questions.filter(qq => qq.id !== q.id)); }}
                tabIndex={-1}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}

// Add a new SortableQuestionCard for the main area
interface SortableQuestionCardProps {
  question: QuestionData;
  index: number;
  activeQuestionId: number | null;
  setActiveQuestionId: (id: number) => void;
  children: React.ReactNode;
  activeDragId: number | null;
  QUESTION_TYPE_ICONS: any;
  QUESTION_TYPE_LABELS: any;
  QUESTION_TYPE_COMPONENTS: any;
}
function SortableQuestionCard({ question, index, activeQuestionId, setActiveQuestionId, children, activeDragId, QUESTION_TYPE_ICONS, QUESTION_TYPE_LABELS, QUESTION_TYPE_COMPONENTS }: SortableQuestionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id || index });
  const { isOver, setNodeRef: setDropRef } = useDroppable({ id: question.id || index });
  return (
    <>
      {activeDragId != null && (
        <div
          ref={setDropRef}
          className={`transition-all duration-200 w-full max-w-[46rem] mx-auto ${isOver ? 'bg-emerald-100 border-2 border-emerald-400 rounded-xl min-h-[72px] mb-4' : 'min-h-0 mb-0'}`}
          style={{ zIndex: isOver ? 40 : undefined, height: isOver ? undefined : 0 }}
        />
      )}
      <motion.div
        ref={setNodeRef}
        key={question.id || `question-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        style={{
          transition,
          zIndex: isDragging ? 50 : undefined,
        }}
        className={`relative group ${isDragging ? 'bg-emerald-50' : ''}`}
      >
        {/* Drag handle icon in card header */}
        <div className="absolute left-4 top-4 z-20 cursor-grab active:cursor-grabbing" {...listeners} {...attributes}>
          <GripVertical className="h-5 w-5 text-gray-300" />
        </div>
        {/* Only apply highlight to the card content */}
        {React.isValidElement(children) && typeof (children as React.ReactElement<{ className?: string }> ).props.className === 'string'
          ? React.cloneElement(children as any, {
              className: `${((children as any).props?.className?.replace(/max-w-(2xl|3xl)/, 'max-w-[46rem]').replace('p-8', 'p-6') || '')} ${activeQuestionId === question.id ? 'ring-4 ring-emerald-400 rounded-xl ring-inset' : ''}`.trim()
            })
          : children}
      </motion.div>
    </>
  );
}

// --- DRAGGABLE SIDEBAR QUESTION TYPE ---
function DraggableQuestionType({ type, icon, label, index, onDragStart, onClick }: { type: any, icon: React.ReactNode, label: string, index: number, onDragStart: (type: any) => void, onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `question-type-${type.typeId || index}`,
    data: { type },
  });
  return (
    <div
      className={`flex items-center w-full px-3 py-2 text-sm text-left rounded-lg transition-colors duration-150 mb-1 border border-transparent hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 active:bg-emerald-100 ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-pointer'}`}
      style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
      onClick={onClick}
    >
      <span
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 mr-3 cursor-grab active:cursor-grabbing"
        onMouseDown={() => onDragStart(type)}
        onTouchStart={() => onDragStart(type)}
        tabIndex={-1}
        aria-label="Drag to add question type"
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </span>
      <span className="mr-2">{icon}</span>
      <span className="font-medium text-gray-700">{label}</span>
    </div>
  );
}

// --- MAIN DROP ZONE BETWEEN QUESTIONS ---
function QuestionDropZone({ index, isOver, setNodeRef, t }: { index: number, isOver: boolean, setNodeRef: (node: HTMLElement | null) => void, t: (key: string) => string }) {
  return (
    <div
      ref={setNodeRef}
      className={`flex justify-center items-center my-2 transition-all duration-200 ${isOver ? 'bg-emerald-100 border-2 border-emerald-400 rounded-xl min-h-[48px]' : 'min-h-[24px]'}`}
      style={{ height: isOver ? 48 : 24, zIndex: isOver ? 40 : undefined }}
    >
      {isOver && <span className="text-emerald-600 font-semibold">{t('surveyCreator.dropToAddQuestionHere')}</span>}
    </div>
  );
}

// --- DropZoneWithHook: wrapper to use useDroppable for each drop zone ---
function DropZoneWithHook({ index, dropZoneIds, draggedType, t }: { index: number, dropZoneIds: string[], draggedType: any, t: (key: string) => string }) {
  const { isOver, setNodeRef } = useDroppable({ id: dropZoneIds[index] });
  // Only show if dragging a type
  if (!draggedType) return null;
  return <QuestionDropZone index={index} isOver={isOver} setNodeRef={setNodeRef} t={t} />;
}

export default function SurveyCreator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { currentLocale } = useLocale();
  const editSurveyId = searchParams.get('edit');
  
  const [activeTab, setActiveTab] = useState("designer");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [lastSelectedType, setLastSelectedType] = useState<QuestionType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(false);
  const [metadata, setMetadata] = useState<{
    title: string;
    description: string;
    pointsReward: number;
    startDate: string;
    endDate: string;
    requiredParticipants: number;
    targetAcademicYears: string[];
    targetDepartmentIds: string[];
    targetGender: string;
    publishImmediately: boolean;
  }>({
    title: "",
    description: "",
    pointsReward: 100,
    startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    endDate: format(new Date().setMonth(new Date().getMonth() + 1), "yyyy-MM-dd'T'HH:mm:ss"),
    requiredParticipants: 50,
    targetAcademicYears: ["all"],
    targetDepartmentIds: ["all"],
    targetGender: "all",
    publishImmediately: false
  });
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [loadingQuestionTypes, setLoadingQuestionTypes] = useState(true);
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [showTypePickerAt, setShowTypePickerAt] = useState<number | null>(null);
  // Create refs for each question
  const questionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [draggedType, setDraggedType] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [showAIGenerationDialog, setShowAIGenerationDialog] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [aiGenerationConfig, setAIGenerationConfig] = useState({
    additionalDetails: "",
    defaultOptions: 4,
    questionTypes: [] as Array<{ typeId: number; count: number }>
  });
  const [jsonEditValue, setJsonEditValue] = useState<string>("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonDirty, setJsonDirty] = useState<boolean>(false);

  useEffect(() => {
    if (activeQuestionId && questionRefs.current[activeQuestionId]) {
      questionRefs.current[activeQuestionId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Optionally, remove highlight after a short delay
      const timeout = setTimeout(() => setActiveQuestionId(null), 1200);
      return () => clearTimeout(timeout);
    }
  }, [activeQuestionId]);

  // Auto-update the JSON textarea with the latest survey state while dialog is open and not dirty
  useEffect(() => {
    if (showJsonDialog && !jsonDirty) {
      setJsonEditValue(JSON.stringify(formatSurveyData(), null, 2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showJsonDialog, metadata, questions]);

  // Debug: Log metadata changes
  useEffect(() => {
    console.log('Metadata updated:', metadata);
  }, [metadata]);

  // Add a mapping for question type display names and icons
  const QUESTION_TYPE_LABELS: Record<string, string> = {
    multiple_choice: t('surveyCreator.questionTypes.multipleChoice'),
    single_answer: t('surveyCreator.questionTypes.singleAnswer'),
    open_text: t('surveyCreator.questionTypes.openText'),
    percentage: t('surveyCreator.questionTypes.percentage'),
  };
  const QUESTION_TYPE_ICONS: Record<string, React.ReactNode> = {
    multiple_choice: <CheckSquare className="h-5 w-5 text-emerald-500 mr-2" />,
    single_answer: <Radio className="h-5 w-5 text-blue-500 mr-2" />,
    open_text: <Type className="h-5 w-5 text-gray-500 mr-2" />,
    percentage: <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-2">
      <span className="text-xs font-medium text-white">5</span>
    </div>,
  };

  // Map typeName to component
  const QUESTION_TYPE_COMPONENTS: Record<string, React.ComponentType<any>> = {
    multiple_choice: MultipleChoice,
    single_answer: SingleAnswer,
    open_text: OpenText,
    percentage: Percentage,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingQuestionTypes(true);
        const [departmentsData, questionTypesData] = await Promise.all([
          DepartmentService.getDepartments(),
          QuestionTypeService.getQuestionTypes()
        ]);
        
        if (Array.isArray(departmentsData)) {
          setDepartments(departmentsData);
        } else if (departmentsData && typeof departmentsData === 'object' && departmentsData !== null) {
          const deptData = departmentsData as any;
          if (deptData.data && Array.isArray(deptData.data)) {
            setDepartments(deptData.data);
          }
        }
        
        setQuestionTypes(questionTypesData);
      } catch (error: any) {
        toast({
          title: t('common.error', currentLocale),
          description: error.message || t('errors.failedToFetchData', currentLocale),
          variant: "destructive"
        });
      } finally {
        setLoadingQuestionTypes(false);
      }
    };

    fetchData();
  }, [toast]);

  // Load survey data for editing
  useEffect(() => {
    const loadSurveyForEdit = async () => {
      if (!editSurveyId) return;
      
      try {
        console.log('Loading survey for edit, ID:', editSurveyId);
        setIsLoadingSurvey(true);
        setIsEditMode(true);
        
        const surveyData = await SurveyService.getTeacherSurveyById(parseInt(editSurveyId));
        console.log('Survey data received:', surveyData);
        console.log('Survey questions:', surveyData.questions);
        
        // Update metadata
        setMetadata({
          title: surveyData.title || "",
          description: surveyData.description || "",
          pointsReward: surveyData.pointsReward || 100,
          startDate: surveyData.startDate ? format(new Date(surveyData.startDate), "yyyy-MM-dd'T'HH:mm:ss") : format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
          endDate: surveyData.endDate ? format(new Date(surveyData.endDate), "yyyy-MM-dd'T'HH:mm:ss") : format(new Date().setMonth(new Date().getMonth() + 1), "yyyy-MM-dd'T'HH:mm:ss"),
          requiredParticipants: surveyData.requiredParticipants || 50,
          targetAcademicYears: surveyData.targetAcademicYears ? surveyData.targetAcademicYears.map(String) : ["all"],
          targetDepartmentIds: surveyData.targetDepartmentIds ? surveyData.targetDepartmentIds.map(String) : ["all"],
          targetGender: surveyData.targetGender ? String(surveyData.targetGender) : "all",
          publishImmediately: surveyData.publishImmediately || false
        });
        
        // Update questions
        if (surveyData.questions && Array.isArray(surveyData.questions)) {
          const getTypeId = (qt: any) => {
            if (typeof qt.typeId === 'number' && qt.typeId > 0) return qt.typeId;
            if (typeof qt.questionType === 'string') {
              switch (qt.questionType) {
                case 'multiple_choice': return 1;
                case 'single_answer': return 2;
                case 'open_text': return 3;
                case 'percentage': return 4;
                default: return 1;
              }
            }
            return 1;
          };
          const formattedQuestions = surveyData.questions.map((q: any, index: number) => ({
            id: q.id || index + 1,
            typeId: getTypeId(q),
            typeName: q.questionType || 'multiple_choice',
            questionText: q.questionText || "",
            isRequired: q.isRequired || false,
            questionOrder: q.questionOrder || index,
            options: q.options ? q.options.map((opt: any, optIndex: number) => ({
              id: opt.id || optIndex + 1,
              text: opt.optionText || "",
              order: opt.optionOrder || optIndex
            })) : []
          }));
          setQuestions(formattedQuestions);
        } else {
          console.log('No questions found or questions is not an array:', surveyData.questions);
        }
        
      } catch (error: any) {
        toast({
          title: t('common.error', currentLocale),
          description: error.message || t('errors.failedToLoadSurveyForEditing', currentLocale),
          variant: "destructive"
        });
      } finally {
        setIsLoadingSurvey(false);
      }
    };

    loadSurveyForEdit();
  }, [editSurveyId, toast]);

  const handleAddQuestion = (typeId: number, insertAt?: number) => {
    const type = questionTypes.find(qt => qt.typeId === typeId);
    if (!type) return;
    setQuestions(prev => {
      let defaultOptions: any[] = [];
      if (type.typeName === 'multiple_choice') {
        defaultOptions = [
          { id: Date.now() + 1, text: '', checked: false },
          { id: Date.now() + 2, text: '', checked: false },
        ];
      } else if (type.typeName === 'single_answer') {
        defaultOptions = [
          { id: Date.now() + 1, text: '', value: 'option1' },
          { id: Date.now() + 2, text: '', value: 'option2' },
        ];
      }
      const newQ = {
        id: Date.now(),
        typeId: type.typeId,
        typeName: type.typeName,
        questionText: "",
        isRequired: true,
        questionOrder: 0,
        options: defaultOptions,
      };
      let newArr;
      if (typeof insertAt === 'number') {
        newArr = [
          ...prev.slice(0, insertAt),
          newQ,
          ...prev.slice(insertAt)
        ];
      } else {
        newArr = [...prev, newQ];
      }
      return newArr.map((q, i) => ({ ...q, questionOrder: i }));
    });
  };

  const updateQuestionText = (questionId: number, text: string) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, questionText: text } : q
    ));
  };

  const updateQuestionOptions = (questionId: number, options: any[]) => {
    setQuestions(questions.map((q: any) =>
      q.id === questionId ? { ...q, options: options.map((opt: any, i: number) => ({ ...opt, order: i })) } : q
    ));
  };

  const removeQuestion = (indexToRemove: number) => {
    setQuestions(questions.filter((_, index) => index !== indexToRemove));
  };

  const handleMetadataChange = (key: string, value: any) => {
    setMetadata(prev => ({ ...prev, [key]: value }));
  };

  const formatSurveyData = () => {
    return {
      title: metadata.title,
      description: metadata.description,
      targetAcademicYears:
        (Array.isArray(metadata.targetAcademicYears) && metadata.targetAcademicYears.includes("all"))
          ? ACADEMIC_YEARS_SELECT.filter((y: any) => typeof y.value === 'number').map((y: any) => y.value)
          : metadata.targetAcademicYears.filter((y: any) => typeof y === 'number' || (!isNaN(Number(y)) && y !== 'all')).map(Number),
      targetDepartmentIds:
        metadata.targetDepartmentIds[0] === "all"
          ? departments.map((d: any) => d.id)
          : metadata.targetDepartmentIds.map(Number),
      targetGender: metadata.targetGender,
      requiredParticipants: Number(metadata.requiredParticipants),
      pointsReward: Number(metadata.pointsReward),
      startDate: metadata.startDate,
      endDate: metadata.endDate,
      publishImmediately: metadata.publishImmediately,
      questions: questions.map((q: any, idx: number) => ({
        questionText: q.questionText,
        typeId: q.typeId,
        isRequired: q.isRequired,
        questionOrder: idx,
        options: (q.options || []).filter((opt: any) => opt.text && opt.text.trim() !== '').map((opt: any, oidx: number) => ({
          optionText: opt.text,
          optionOrder: oidx
        }))
      })),
    };
  };

  const handleSave = async () => {
    try {
      if (!metadata.title.trim()) {
        toast({
          title: t('surveyCreator.surveyTitleRequired', currentLocale),
          variant: "destructive",
        });
        return;
      }
      if (!metadata.description.trim()) {
        toast({
          title: t('surveyCreator.surveyDescriptionRequired', currentLocale),
          variant: "destructive",
        });
        return;
      }
      if (questions.length === 0) {
        toast({
          title: t('surveyCreator.pleaseAddAtLeastOneQuestion', currentLocale),
          variant: "destructive",
        });
        return;
      }
      const emptyQuestions = questions.filter(q => !q.questionText.trim());
      if (emptyQuestions.length > 0) {
        toast({
          title: t('surveyCreator.pleaseFillInAllQuestionTitle', currentLocale),
          variant: "destructive",
        });
        return;
      }
      // Validate options for questions that require options (e.g., multiple_choice, single_answer)
      const questionsMissingOptions = questions.filter(q =>
        (q.typeName === 'multiple_choice' || q.typeName === 'single_answer') && (!q.options || q.options.length === 0)
      );
      if (questionsMissingOptions.length > 0) {
        toast({
          title: t('surveyCreator.allMultipleChoiceQuestionsMustHaveOptions', currentLocale),
          variant: "destructive",
        });
        return;
      }

      // Validate that all options have text/title
      const questionsWithEmptyOptions = questions.filter(q => {
        if (q.typeName === 'multiple_choice' || q.typeName === 'single_answer') {
          return q.options && q.options.some((opt: any) => !opt.text || opt.text.trim() === '');
        }
        return false;
      });
      
      if (questionsWithEmptyOptions.length > 0) {
        toast({
          title: t('surveyCreator.questionChoicesCannotBeEmpty', currentLocale),
          description: t('surveyCreator.fillInAllOptionTitles', currentLocale),
          variant: "destructive",
        });
        return;
      }
      // Validate at least one academic year selected
      if (!metadata.targetAcademicYears || metadata.targetAcademicYears.length === 0 || metadata.targetAcademicYears[0] === "") {
        toast({
          title: t('surveyCreator.pleaseSelectAtLeastOneAcademicYear', currentLocale),
          variant: "destructive",
        });
        return;
      }
      // Validate at least one department selected
      if (!metadata.targetDepartmentIds || metadata.targetDepartmentIds.length === 0 || metadata.targetDepartmentIds[0] === "") {
        toast({
          title: t('surveyCreator.pleaseSelectAtLeastOneDepartment', currentLocale),
          variant: "destructive",
        });
        return;
      }
      setIsSaving(true);
      const surveyData = formatSurveyData();
      console.log('Submitting survey request body:', surveyData);
      console.log('publishImmediately value:', surveyData.publishImmediately);
      console.log('metadata.publishImmediately:', metadata.publishImmediately);
      try {
        let response;
        if (isEditMode && editSurveyId) {
          // Update existing survey
          response = await SurveyService.updateAdminSurveyWithQuestions(parseInt(editSurveyId), surveyData);
        } else {
          // Create new survey
          response = await SurveyService.adminCreateSurveyWithQuestions(surveyData);
        }
        
        setIsSaving(false);
        if (response.success) {
          let message = isEditMode 
            ? t('success.surveyUpdated', currentLocale)
            : t('success.surveyCreated', currentLocale);
          
          if (response.data && response.data.surveyId) {
            message = isEditMode
              ? `${t('success.surveyUpdated', currentLocale)} Survey ID: ${response.data.surveyId}`
              : `${t('success.surveyCreated', currentLocale)} Survey ID: ${response.data.surveyId}`;
          }
          
          toast({
            title: message,
          });
          
          // Redirect to dashboard after successful save
          setTimeout(() => {
            router.push('/dashboard/admin/all-surveys/');
          }, 1500);
        } else {
          toast({
            title: response.message || (isEditMode ? t('errors.failedToUpdateSurvey', currentLocale) : t('errors.failedToCreateSurvey', currentLocale)),
            variant: "destructive",
          });
        }
      } catch (error: any) {
        setIsSaving(false);
        toast({
          title: error.message || (isEditMode ? t('errors.failedToUpdateSurvey', currentLocale) : t('errors.failedToCreateSurvey', currentLocale)),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setIsSaving(false);
      toast({
        title: error.message || t('errors.failedToCreateSurvey', currentLocale),
        variant: "destructive",
      });
    }
  };

  // Fix gender select and comparisons
  const handleGenderChange = (value: string) => {
    setMetadata(prev => ({ ...prev, targetGender: value }));
  };

  // Fix add question button handler
  const handleAddQuestionClick = (typeId: number) => () => handleAddQuestion(typeId);

  // AI Question Generation Handler
  const handleGenerateQuestionsWithAI = async () => {
    if (!metadata.title.trim() || !metadata.description.trim()) {
      toast({
        title: t('surveyCreator.surveyTitleAndDescriptionRequired', currentLocale),
        description: t('surveyCreator.fillInSurveyTitleAndDescription', currentLocale),
        variant: "destructive"
      });
      return;
    }

    if (aiGenerationConfig.questionTypes.length === 0) {
      toast({
        title: t('surveyCreator.noQuestionTypesSelected', currentLocale),
        description: t('surveyCreator.selectAtLeastOneQuestionType', currentLocale),
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGeneratingQuestions(true);
      
      const requestData = {
        surveyTitle: metadata.title,
        surveyDescription: metadata.description,
        questionTypes: aiGenerationConfig.questionTypes,
        additionalDetails: aiGenerationConfig.additionalDetails || undefined,
        defaultOptions: aiGenerationConfig.defaultOptions
      };

      const response = await SurveyService.generateQuestionsWithAI(requestData);
      
      if (response.success && response.data) {
        // Convert AI-generated questions to our format
        const generatedQuestions = response.data.map((q: any, index: number) => ({
          id: Date.now() + index,
          typeId: q.typeId,
          typeName: questionTypes.find(qt => qt.typeId === q.typeId)?.typeName || 'multiple_choice',
          questionText: q.questionText,
          isRequired: q.isRequired,
          questionOrder: index,
          options: q.options ? q.options.map((opt: any, optIndex: number) => ({
            id: Date.now() + index * 1000 + optIndex, // Generate unique IDs for options
            text: opt.optionText,
            order: opt.optionOrder
          })) : []
        }));

        // Add generated questions to existing questions
        setQuestions(prev => [...prev, ...generatedQuestions]);
        
        toast({
          title: t('surveyCreator.questionsGeneratedSuccessfully', currentLocale),
          description: `${generatedQuestions.length} ${t('surveyCreator.questionsHaveBeenAdded', currentLocale)}`,
        });
        
        setShowAIGenerationDialog(false);
      } else {
        throw new Error(response.message || t('surveyCreator.failedToGenerateQuestions', currentLocale));
      }
    } catch (error: any) {
      toast({
        title: t('surveyCreator.errorGeneratingQuestions', currentLocale),
        description: error.message || t('surveyCreator.failedToGenerateQuestions', currentLocale),
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Initialize AI generation config when question types are loaded
  useEffect(() => {
    if (questionTypes.length > 0 && aiGenerationConfig.questionTypes.length === 0) {
      setAIGenerationConfig(prev => ({
        ...prev,
        questionTypes: questionTypes.map(qt => ({ typeId: qt.typeId, count: 1 }))
      }));
    }
  }, [questionTypes]);

  // DnD-kit setup
  const sensors = useSensors(useSensor(PointerSensor));

  // DnD-kit setup for sidebar drag
  const sidebarSensors = useSensors(useSensor(PointerSensor));

  // Drop zone logic for main area
  const dropZoneIds = Array.from({ length: questions.length + 1 }, (_, i) => `dropzone-${i}`);

  // Sidebar Drag-and-Drop and Question Reorder Handler
  function handleUnifiedDragEnd(event: any) {
    setDraggedType(null);
    setActiveDragId(null);
    const { over, active } = event;
    if (!over || !active) return;
    // Sidebar drag: add question type
    if (active.data?.current?.type) {
      // Only add if dropped on a valid dropzone
      if (over.id && typeof over.id === 'string' && over.id.startsWith('dropzone-')) {
        const insertAt = parseInt(String(over.id).replace('dropzone-', ''), 10);
        const type = active.data.current.type;
        if (type) {
          handleAddQuestion(type.typeId, insertAt);
        }
      }
      // If dropped anywhere else (including sidebar), do nothing
      return;
    }
    // Main area drag: reorder questions
    if (typeof active.id === 'number' && typeof over.id === 'number' && active.id !== over.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setQuestions(arrayMove(questions, oldIndex, newIndex).map((q, i) => ({ ...q, questionOrder: i })));
      }
    }
  }

  // Show loading state when loading survey for edit
  if (isLoadingSurvey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('surveyCreator.loadingSurveyForEdit')}</p>
        </div>
      </div>
    );
  }

  // Add this mapping at the top of the component (after hooks):
  const yearKeyMap: Record<string, string> = {
    "1": "first",
    "2": "second",
    "3": "third",
    "4": "fourth",
    "5": "fifth"
  };

  return (
    <TooltipProvider>
      <DndContext
        sensors={sidebarSensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => {
          setDraggedType(active.data?.current?.type || null);
          if (typeof active.id === 'number') setActiveDragId(active.id as number);
        }}
        onDragEnd={handleUnifiedDragEnd}
        onDragCancel={() => {
          // Just reset drag state, do NOT add a question
          setDraggedType(null);
          setActiveDragId(null);
        }}
      >
      <div className="flex relative overflow-hidden">
        {/* Left Sidebar - Question Types - Fixed */}
        <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto fixed left-0 top-16 pt-8 bottom-0 shadow-sm z-20">
          <div className="space-y-1 px-2 py-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pl-2">{t('surveyCreator.questionTypesLabel')}</h3>
            {questionTypes.map((type, index) => (
              <DraggableQuestionType
                key={type.typeId || `type-${index}`}
                type={type}
                icon={QUESTION_TYPE_ICONS[type.typeName] || <HelpCircle className="h-5 w-5 text-gray-400" />}
                label={QUESTION_TYPE_LABELS[type.typeName] || type.typeName}
                index={index}
                onDragStart={setDraggedType}
                onClick={() => handleAddQuestion(type.typeId)}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={null}>
            {draggedType ? (
              <div className="flex items-center w-56 px-3 py-2 text-sm rounded-lg bg-white border border-emerald-200 shadow-lg">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 mr-3">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </span>
                <span className="mr-2">{QUESTION_TYPE_ICONS[draggedType.typeName] || <HelpCircle className="h-5 w-5 text-gray-400" />}</span>
                <span className="font-medium text-gray-700">{QUESTION_TYPE_LABELS[draggedType.typeName] || draggedType.typeName}</span>
              </div>
            ) : null}
          </DragOverlay>
          {/* Questions List Card in Sidebar */}
          {questions.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={({ active }) => {
                setActiveDragId(active.id as number);
              }}
              onDragEnd={({ active, over }) => {
                setActiveDragId(null);
                if (active.id !== over?.id) {
                  const oldIndex = questions.findIndex(q => q.id === active.id);
                  const newIndex = questions.findIndex(q => q.id === over?.id);
                  setQuestions(arrayMove(questions, oldIndex, newIndex).map((q, i) => ({ ...q, questionOrder: i })));
                }
              }}
              onDragCancel={() => setActiveDragId(null)}
            >
              <SortableContext items={questions.map((q, idx) => q.id || `question-${idx}`)} strategy={verticalListSortingStrategy}>
                <div className="px-2 pb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 pl-2">{t('surveyCreator.questions')}</h4>
                  <div className="space-y-2">
                    {questions.map((q, idx) => (
                      <SortableSidebarQuestion
                        key={q.id || `question-${idx}`}
                        q={q}
                        idx={idx}
                        activeQuestionId={activeQuestionId}
                        setActiveQuestionId={setActiveQuestionId}
                        activeDragId={activeDragId}
                        setQuestions={setQuestions}
                        QUESTION_TYPE_ICONS={QUESTION_TYPE_ICONS}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              </SortableContext>
              <DragOverlay dropAnimation={null}>
                {activeDragId != null ? (
                  (() => {
                    const q = questions.find(q => q.id === activeDragId);
                    if (!q) return null;
                    return (
                      <SortableSidebarQuestion
                        key={`drag-overlay-${q.id || 'unknown'}`}
                        q={q}
                        idx={q.questionOrder}
                        activeQuestionId={activeQuestionId}
                        setActiveQuestionId={setActiveQuestionId}
                        activeDragId={activeDragId}
                        setQuestions={setQuestions}
                        QUESTION_TYPE_ICONS={QUESTION_TYPE_ICONS}
                        t={t}
                      />
                    );
                  })()
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        {/* Main Content Area - Scrollable with fixed margins */}
        <div className="flex-1 flex flex-col ml-72 mr-96">
          <SortableContext items={questions.map((q, idx) => q.id || `question-${idx}`)} strategy={verticalListSortingStrategy}>
            <div className="p-4 space-y-4 pb-20">
              <AnimatePresence>
                {/* Drop zone at the top */}
                <DropZoneWithHook index={0} dropZoneIds={dropZoneIds} draggedType={draggedType} t={t} />
                {/* Questions List - Animated */}
                {questions.map((question, index) => (
                  <React.Fragment key={question.id != null ? String(question.id) : `question-fallback-${index}-${Math.random()}` }>
                    <SortableQuestionCard
                      question={question}
                      index={index}
                      activeQuestionId={activeQuestionId}
                      setActiveQuestionId={setActiveQuestionId}
                      activeDragId={activeDragId}
                      QUESTION_TYPE_ICONS={QUESTION_TYPE_ICONS}
                      QUESTION_TYPE_LABELS={QUESTION_TYPE_LABELS}
                      QUESTION_TYPE_COMPONENTS={QUESTION_TYPE_COMPONENTS}
                    >
                      <div ref={el => { questionRefs.current[question.id] = el; }} className={`w-full max-w-[46rem] mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200 transition-all duration-300 ${activeQuestionId === question.id ? 'ring-4 ring-emerald-400 rounded-xl ring-inset' : ''}` }>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center h-full">
                          <span className="flex items-center justify-center w-10 h-10 bg-emerald-500 text-white text-lg font-bold rounded-full shadow-lg border-4 border-white">{index + 1}</span>
                        </div>
                        <div className="flex items-center mb-4 justify-between">
                          <div className="flex items-center">
                            {QUESTION_TYPE_ICONS[question.typeName]}
                            <span className="font-semibold text-lg text-gray-800">
                              {QUESTION_TYPE_LABELS[question.typeName] || question.typeName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{t('common.required')}</span>
                            <Switch
                              checked={question.isRequired}
                              onCheckedChange={(checked: boolean) => setQuestions(questions.map(q => q.id === question.id ? { ...q, isRequired: checked } : q))}
                              aria-label={t('common.required')}
                              className={`data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 focus-visible:ring-emerald-400 ${currentLocale === 'ar' ? 'rtl-switch' : ''}`}
                            />
                          </div>
                        </div>
                        <Input
                          type="text"
                          placeholder={t('surveyCreator.addQuestionTitle')}
                          aria-label={t('surveyCreator.addQuestionTitle')}
                          className="text-xl font-semibold mb-6 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 transition-all"
                          value={question.questionText}
                          onChange={(e) => updateQuestionText(question.id, e.target.value)}
                        />
                        {(() => {
                          const Comp = QUESTION_TYPE_COMPONENTS[question.typeName];
                          if (question.typeName === 'multiple_choice') {
                            return Comp ? <Comp options={question.options} onOptionsChange={(opts: any) => updateQuestionOptions(question.id, opts)} /> : null;
                          }
                          if (question.typeName === 'single_answer') {
                            return Comp ? <Comp options={question.options} onOptionsChange={(opts: any) => updateQuestionOptions(question.id, opts)} /> : null;
                          }
                          return Comp ? <Comp /> : null;
                        })()}
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-10 items-center">
                        <button
                          aria-label={t('surveyCreator.deleteQuestion')}
                          title={t('surveyCreator.deleteQuestion')}
                          onClick={() => removeQuestion(index)}
                          className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-red-200 text-red-500 shadow transition-all duration-200 hover:bg-red-50 hover:text-red-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                          aria-label={t('surveyCreator.duplicateQuestion')}
                          title={t('surveyCreator.duplicateQuestion')}
                          onClick={() => {
                            const q = questions[index];
                            const newQ = {
                              ...q,
                              id: Date.now(),
                              questionOrder: index + 1,
                              typeId: q.typeId,
                              typeName: q.typeName,
                              options: q.options.map((opt: any, i: number) => ({ 
                                ...opt, 
                                id: Date.now() + i + 1, // Generate unique IDs for options
                                order: i 
                              })),
                            };
                            const newQuestions = [
                              ...questions.slice(0, index + 1),
                              newQ,
                              ...questions.slice(index + 1)
                            ].map((q, i) => ({ ...q, questionOrder: i }));
                            setQuestions(newQuestions);
                          }}
                          className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-blue-200 text-blue-500 shadow transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="3" y="3" width="13" height="13" rx="2"/></svg>
                        </button>
                      </div>
                    </SortableQuestionCard>
                    {/* Drop zone between questions */}
                    <DropZoneWithHook index={index + 1} dropZoneIds={dropZoneIds} draggedType={draggedType} t={t} />
                    {/* Plus button between cards */}
                    {index < questions.length - 1 && (
                      <div className="flex justify-center my-2">
                        <Popover open={showTypePickerAt === index + 1} onOpenChange={open => setShowTypePickerAt(open ? index + 1 : null)}>
                          <PopoverTrigger asChild>
                            <Button size="icon" variant="outline" className="rounded-full border-2 border-emerald-200 text-emerald-500 hover:bg-emerald-50 transition-all" onClick={() => setShowTypePickerAt(index + 1)}>
                              <Plus className="h-5 w-5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="center" className="w-64 p-2">
                            <div className="flex flex-col gap-1">
                              {loadingQuestionTypes ? (
                                <div className="flex items-center justify-center py-4">
                                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                                  <span className="ml-2 text-sm text-gray-500">{t('surveyCreator.loadingQuestionTypes')}</span>
                                </div>
                              ) : (
                                questionTypes.map((type, typeIndex) => (
                                  <button
                                    key={type.typeId || `type-${typeIndex}`}
                                    className="flex items-center w-full px-3 py-2 text-sm rounded-lg hover:bg-emerald-50 transition-colors"
                                    onClick={() => {
                                      handleAddQuestion(type.typeId, index + 1);
                                      setShowTypePickerAt(null);
                                    }}
                                  >
                                    <span className="mr-2">{QUESTION_TYPE_ICONS[type.typeName]}</span>
                                    <span>{QUESTION_TYPE_LABELS[type.typeName] || type.typeName}</span>
                                  </button>
                                ))
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </React.Fragment>
                ))}
                {/* Empty State - Animated */}
                {questions.length === 0 && (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col items-center justify-center text-center p-12 min-h-[400px]"
                  >
                    <div className="max-w-md">
                      <div className="mb-8 mt-4">
                        <img
                          src="/img/fail.png"
                          alt="Empty form illustration"
                          className="mx-auto w-48 h-48 opacity-60"
                        />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {t('surveyCreator.surveyIsEmpty')}
                      </h2>
                      <div className="flex gap-4">
                        <Popover open={showTypePicker} onOpenChange={setShowTypePicker}>
                          <PopoverTrigger asChild>
                            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setShowTypePicker(true)}>
                              <Plus className="h-5 w-5 mr-2" />
                              {t('surveyCreator.addYourFirstQuestion')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="center" className="w-64 p-2">
                            <div className="flex flex-col gap-1">
                              {loadingQuestionTypes ? (
                                <div className="flex items-center justify-center py-4">
                                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                                  <span className="ml-2 text-sm text-gray-500">{t('surveyCreator.loadingQuestionTypes')}</span>
                                </div>
                              ) : (
                                questionTypes.map((type, typeIndex) => (
                                  <button
                                    key={type.typeId || `type-${typeIndex}`}
                                    className="flex items-center w-full px-3 py-2 text-sm rounded-lg hover:bg-emerald-50 transition-colors"
                                    onClick={() => {
                                      handleAddQuestion(type.typeId);
                                      setShowTypePicker(false);
                                    }}
                                  >
                                    <span className="mr-2">{QUESTION_TYPE_ICONS[type.typeName]}</span>
                                    <span>{QUESTION_TYPE_LABELS[type.typeName] || type.typeName}</span>
                                  </button>
                                ))
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                        
                        {/* AI Generation Button for Empty State */}
                        {(!metadata.title.trim() || !metadata.description.trim()) ? (
                          <div className="relative group">
                            <Button 
                              size="lg" 
                              className="bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                              onClick={() => {
                                // Focus on the survey title field
                                const titleInput = document.getElementById('title') as HTMLInputElement;
                                if (titleInput) {
                                  titleInput.focus();
                                  titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                              }}
                              disabled={false}
                              title={t('surveyCreator.surveyTitleAndDescriptionRequired')}
                            >
                              <BarChart2 className="h-5 w-5 mr-2" />
                              {t('surveyCreator.generateWithAI')}
                            </Button>
                            {/* Custom Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                              <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 w-80">
                                <div className="space-y-2">
                                  <p className="font-medium text-gray-900">{t('surveyCreator.surveyTitleAndDescriptionRequired')}</p>
                                  <div className="text-sm space-y-1">
                                    {!metadata.title.trim() && (
                                      <p className="flex items-center gap-1 text-red-600">
                                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                        {t('surveyCreator.addSurveyTitle')}
                                      </p>
                                    )}
                                    {!metadata.description.trim() && (
                                      <p className="flex items-center gap-1 text-red-600">
                                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                        {t('surveyCreator.addSurveyDescription')}
                                      </p>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {t('surveyCreator.fillInSurveyDetailsFirst')}
                                  </p>
                                </div>
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            size="lg" 
                            className="bg-purple-500 hover:bg-purple-600 text-white"
                            onClick={() => setShowAIGenerationDialog(true)}
                            disabled={false}
                          >
                            <BarChart2 className="h-5 w-5 mr-2" />
                            {t('surveyCreator.generateWithAI')}
                          </Button>
                        )}
                      </div>
                      
                      {/* Hint text below empty state buttons */}
                      <div className="text-center mt-6">
                        {(!metadata.title.trim() || !metadata.description.trim()) ? (
                          <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="text-yellow-600">💡</span>
                              <span className="font-medium text-yellow-800">{t('surveyCreator.getStartedWithAI.title')}</span>
                            </div>
                            <p className="text-yellow-700 mb-2">
                              {t('surveyCreator.getStartedWithAI.description')}
                            </p>
                            <p className="text-xs text-yellow-600">
                              {t('surveyCreator.getStartedWithAI.aiWillCreateRelevantQuestions')}
                            </p>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-md mx-auto">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="text-purple-600">🚀</span>
                              <span className="font-medium text-purple-800">{t('surveyCreator.readyForAIGeneration.title')}</span>
                            </div>
                            <p className="text-purple-700 mb-2">
                              {t('surveyCreator.readyForAIGeneration.description')}
                            </p>
                            <p className="text-xs text-purple-600">
                              {t('surveyCreator.readyForAIGeneration.chooseQuestionTypesAndCounts')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Add Question Button - Animated */}
              {questions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center gap-4 mt-4"
                >
                  <Popover open={showTypePicker} onOpenChange={setShowTypePicker}>
                    <PopoverTrigger asChild>
                      <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setShowTypePicker(true)}>
                        <Plus className="h-5 w-5 mr-2" />
                        {t('surveyCreator.addQuestion')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="center" className="w-64 p-2">
                      <div className="flex flex-col gap-1">
                        {loadingQuestionTypes ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                            <span className="ml-2 text-sm text-gray-500">{t('surveyCreator.loadingQuestionTypes')}</span>
                          </div>
                        ) : (
                                                          questionTypes.map((type, typeIndex) => (
                                  <button
                                    key={type.typeId || `type-${typeIndex}`}
                                    className="flex items-center w-full px-3 py-2 text-sm rounded-lg hover:bg-emerald-50 transition-colors"
                                    onClick={() => {
                                      handleAddQuestion(type.typeId);
                                      setShowTypePicker(false);
                                    }}
                                  >
                              <span className="mr-2">{QUESTION_TYPE_ICONS[type.typeName]}</span>
                              <span>{QUESTION_TYPE_LABELS[type.typeName] || type.typeName}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {/* AI Generation Button */}
                  {(!metadata.title.trim() || !metadata.description.trim()) ? (
                    <div className="relative group">
                      <Button 
                        size="lg" 
                        className="bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                        onClick={() => {
                          // Focus on the survey title field
                          const titleInput = document.getElementById('title') as HTMLInputElement;
                          if (titleInput) {
                            titleInput.focus();
                            titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        disabled={false}
                        title={t('surveyCreator.surveyTitleAndDescriptionRequired')}
                      >
                        <BarChart2 className="h-5 w-5 mr-2" />
                        {t('surveyCreator.generateWithAI')}
                      </Button>
                      {/* Custom Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 w-80">
                          <div className="space-y-2">
                            <p className="font-medium text-gray-900">{t('surveyCreator.surveyTitleAndDescriptionRequired')}</p>
                            <div className="text-sm space-y-1">
                              {!metadata.title.trim() && (
                                <p className="flex items-center gap-1 text-red-600">
                                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                  {t('surveyCreator.addSurveyTitle')}
                                </p>
                              )}
                              {!metadata.description.trim() && (
                                <p className="flex items-center gap-1 text-red-600">
                                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                  {t('surveyCreator.addSurveyDescription')}
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {t('surveyCreator.fillInSurveyDetailsFirst')}
                            </p>
                          </div>
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      size="lg" 
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                      onClick={() => setShowAIGenerationDialog(true)}
                      disabled={false}
                    >
                      <BarChart2 className="h-5 w-5 mr-2" />
                      {t('surveyCreator.generateWithAI')}
                    </Button>
                  )}
                  

                </motion.div>
              )}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeDragId != null ? (
              (() => {
                const q = questions.find(q => q.id === activeDragId);
                if (!q) return null;
                return (
                                        <SortableSidebarQuestion
                        key={`main-drag-overlay-${q.id || 'unknown'}`}
                        q={q}
                        idx={q.questionOrder}
                        activeQuestionId={activeQuestionId}
                        setActiveQuestionId={setActiveQuestionId}
                        activeDragId={activeDragId}
                        setQuestions={setQuestions}
                        QUESTION_TYPE_ICONS={QUESTION_TYPE_ICONS}
                        t={t}
                      />
                );
              })()
            ) : null}
          </DragOverlay>
        </div> {/* Close main flex container */}
        {/* Right Sidebar - Settings - Fixed */}
        <div className="w-96 bg-white border-l border-gray-200 fixed right-0 top-16 pt-4 bottom-0">
          {/* Survey Details (moved here) */}
          <div className="h-full flex flex-col">
            <div className="p-4 pl-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-lg">{t('surveyCreator.surveyDetails')}</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      {t('surveyCreator.surveyTitle')}
                      <span className="text-red-500">*</span>
                      {!metadata.title.trim() && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                          {t('surveyCreator.requiredForAI')}
                        </span>
                      )}
                    </label>
                    <Input
                      id="title"
                      placeholder={t('surveyCreator.enterSurveyTitle')}
                      value={metadata.title}
                      onChange={(e) => handleMetadataChange("title", e.target.value)}
                      className={!metadata.title.trim() ? "border-red-300 focus:border-red-500" : ""}
                    />
                    {!metadata.title.trim() && (
                      <p className="text-xs text-red-500">
                        {t('surveyCreator.surveyTitleRequiredForAI')}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      {t('surveyCreator.surveyDescription')}
                      <span className="text-red-500">*</span>
                      {!metadata.description.trim() && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                          {t('surveyCreator.requiredForAI')}
                        </span>
                      )}
                    </label>
                    <Textarea
                      id="description"
                      placeholder={t('surveyCreator.enterSurveyDescription')}
                      value={metadata.description}
                      onChange={(e) => handleMetadataChange("description", e.target.value)}
                      className={`min-h-[100px] resize-none break-words ${
                        !metadata.description.trim() ? "border-red-300 focus:border-red-500" : ""
                      }`}
                    />
                    {!metadata.description.trim() && (
                      <p className="text-xs text-red-500">
                        {t('surveyCreator.surveyDescriptionRequiredForAI')}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="pointsReward" className="text-sm font-medium text-gray-700">
                      {t('surveyCreator.pointsReward')}
                    </label>
                    <Input
                      id="pointsReward"
                      type="number"
                      placeholder={t('surveyCreator.enterPoints')}
                      value={metadata.pointsReward}
                      onChange={(e) => handleMetadataChange("pointsReward", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="requiredParticipants" className="text-sm font-medium text-gray-700">
                      {t('surveyCreator.requiredParticipants')}
                    </label>
                    <Input
                      id="requiredParticipants"
                      type="number"
                      placeholder={t('surveyCreator.enterNumber')}
                      value={metadata.requiredParticipants}
                      onChange={(e) => handleMetadataChange("requiredParticipants", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                      {t('surveyCreator.startDate')}
                    </label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={metadata.startDate.slice(0, 16)}
                      onChange={(e) => handleMetadataChange("startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                      {t('surveyCreator.endDate')}
                    </label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={metadata.endDate.slice(0, 16)}
                      onChange={(e) => handleMetadataChange("endDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="targetAcademicYear" className="text-sm font-medium text-gray-700">
                      {t('surveyCreator.targetAcademicYear')}
                    </label>
                    <CustomSelect
                      value={metadata.targetAcademicYears.join(",")}
                      onChange={(value) => {
                        if (value === "all") {
                          setMetadata((prev) => ({ ...prev, targetAcademicYears: ["all"] }));
                        } else {
                          const selected = value.split(",").filter(Boolean);
                          setMetadata((prev) => ({ ...prev, targetAcademicYears: selected }));
                        }
                      }}
                      placeholder={t('surveyCreator.selectAcademicYears')}
                      multiple
                    >
                      {ACADEMIC_YEARS_SELECT.map((year, yearIndex) => (
                        <CustomSelectOption key={year.value || `year-${yearIndex}`} value={year.value.toString()}>
                          {year.value === 'all'
                            ? t('common.all', currentLocale)
                            : yearKeyMap[year.value.toString()]
                              ? t(`common.academicYears.${yearKeyMap[year.value.toString()]}`, currentLocale)
                              : year.label}
                        </CustomSelectOption>
                      ))}
                    </CustomSelect>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="targetDepartment" className="text-sm font-medium text-gray-700">
                      {t('surveyCreator.targetDepartment')}
                    </label>
                    <CustomSelect
                      value={metadata.targetDepartmentIds.join(",")}
                      onChange={(value) => {
                        if (value === "all") {
                          setMetadata((prev) => ({ ...prev, targetDepartmentIds: ["all"] }));
                        } else {
                          const selected = value.split(",").filter(Boolean);
                          setMetadata((prev) => ({ ...prev, targetDepartmentIds: selected }));
                        }
                      }}
                      placeholder={t('surveyCreator.selectDepartments')}
                      multiple
                    >
                      <CustomSelectOption key="all" value="all">{t('common.all', currentLocale)}</CustomSelectOption>
                      {departments.map((dept, deptIndex) => (
                        <CustomSelectOption key={dept.id || `dept-${deptIndex}`} value={dept.id.toString()}>
                          {dept.name}
                        </CustomSelectOption>
                      ))}
                    </CustomSelect>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="targetGender" className="text-sm font-medium text-gray-700">
                      {t('surveyCreator.targetGender')}
                    </label>
                    <CustomSelect
                      value={metadata.targetGender}
                      onChange={(value) => setMetadata((prev) => ({ ...prev, targetGender: value }))}
                      placeholder={t('surveyCreator.selectGender')}
                    >
                      <CustomSelectOption key="all" value="all">{t('common.all', currentLocale)}</CustomSelectOption>
                      <CustomSelectOption key="male" value="male">{t('common.male', currentLocale)}</CustomSelectOption>
                      <CustomSelectOption key="female" value="female">{t('common.female', currentLocale)}</CustomSelectOption>
                    </CustomSelect>
                  </div>
                  <div className="space-y-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {t('surveyCreator.publishImmediately')}
                    </label>
                    <Switch
                      checked={Boolean(metadata.publishImmediately)}
                      onCheckedChange={(checked) => {
                        console.log('Switch changed to:', checked);
                        console.log('Type of checked:', typeof checked);
                        console.log('Previous metadata:', metadata);
                        const booleanValue = Boolean(checked);
                        console.log('Boolean value:', booleanValue);
                        const newMetadata = { ...metadata, publishImmediately: booleanValue };
                        console.log('New metadata:', newMetadata);
                        setMetadata(newMetadata);
                        
                        // Force a re-render by updating the state again
                        setTimeout(() => {
                          console.log('Metadata after timeout:', metadata);
                          console.log('Current publishImmediately value:', metadata.publishImmediately);
                        }, 100);
                        
                        // Also log the state update
                        console.log('State update triggered with:', booleanValue);
                        
                        // Verify the state was updated correctly
                        console.log('State verification completed');
                        
                        // Log the final state
                        console.log('Final state:', metadata);
                        
                        // Force a final re-render
                        setMetadata(prev => ({ ...prev, publishImmediately: booleanValue }));
                        
                        // Log the final state update
                        console.log('Final state update completed with:', booleanValue);
                        
                        // Verify the final state
                        console.log('Final state verification completed');
                      }}
                      disabled={isEditMode}
                      className={`data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 focus-visible:ring-emerald-400 ${currentLocale === 'ar' ? 'rtl-switch' : ''}`}
                    />
                  </div>
                  {/* <div className="text-xs text-gray-500 text-center">
                    Current value: {Boolean(metadata.publishImmediately) ? 'true' : 'false'}
                  </div> */}
                  {/* <div className="text-xs text-center">
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Manual toggle clicked');
                        setMetadata(prev => ({ ...prev, publishImmediately: !prev.publishImmediately }));
                      }}
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      Test Toggle
                    </button>
                  </div> */}
                  {isEditMode && (
                    <p className="text-xs text-gray-500 text-center">
                      {t('surveyCreator.publishImmediatelyDisabledInEditMode')}
                    </p>
                  )}
                </div>
              </div>
              {/* Save Button (moved here) */}
              <div className="p-6 border-t border-gray-200 mt-auto flex gap-2">
                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  size="lg"
                  onClick={handleSave}
                  disabled={!metadata.title || !metadata.description || isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      {isEditMode ? t('surveyCreator.updating') : t('surveyCreator.saving')}
                    </span>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      {isEditMode ? t('surveyCreator.updateSurvey') : t('surveyCreator.saveSurvey')}
                    </>
                  )}
                </Button>
                <Button
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
                  size="lg"
                  variant="outline"
                  onClick={() => setShowJsonDialog(true)}
                >
                  {t('surveyCreator.showJSON')}
                </Button>
                <Dialog open={showJsonDialog} onOpenChange={(open) => {
                  setShowJsonDialog(open);
                  if (open) {
                    setJsonEditValue(JSON.stringify(formatSurveyData(), null, 2));
                    setJsonError(null);
                    setJsonDirty(false);
                  }
                }}>
                  <DialogContent className="max-w-2xl" dir="ltr">
                    <DialogHeader>
                      <DialogTitle>{t('surveyCreator.editSurveyJSON')}</DialogTitle>
                      <DialogDescription>
                        {t('surveyCreator.jsonDescription')}
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      className="bg-gray-100 rounded p-4 text-xs max-h-[60vh] overflow-auto font-mono"
                      value={jsonEditValue}
                      onChange={e => {
                        setJsonEditValue(e.target.value);
                        setJsonError(null);
                        setJsonDirty(true);
                      }}
                      rows={20}
                      spellCheck={false}
                      dir="ltr"
                    />
                    {jsonError && (
                      <div className="text-red-600 text-xs mt-2" dir="ltr">{jsonError}</div>
                    )}
                    <DialogFooter>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setJsonEditValue(JSON.stringify(formatSurveyData(), null, 2));
                          setJsonError(null);
                          setJsonDirty(false);
                        }}
                        disabled={!jsonDirty}
                      >
                        {t('common.refresh')}
                      </Button>
                      <Button
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        variant="default"
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(jsonEditValue);
                            setMetadata(prev => ({
                              ...prev,
                              title: parsed.title || "",
                              description: parsed.description || "",
                              pointsReward: parsed.pointsReward ?? 100,
                              startDate: parsed.startDate || prev.startDate,
                              endDate: parsed.endDate || prev.endDate,
                              requiredParticipants: parsed.requiredParticipants ?? 50,
                              targetAcademicYears: Array.isArray(parsed.targetAcademicYears) ? parsed.targetAcademicYears.map(String) : ["all"],
                              targetDepartmentIds: Array.isArray(parsed.targetDepartmentIds) ? parsed.targetDepartmentIds.map(String) : ["all"],
                              targetGender: parsed.targetGender || "all",
                            }));
                            setQuestions(Array.isArray(parsed.questions) ? parsed.questions.map((q: any, idx: number) => ({
                              id: Date.now() + idx,
                              typeId: q.typeId,
                              typeName: questionTypes.find(qt => qt.typeId === q.typeId)?.typeName,
                              questionText: q.questionText,
                              isRequired: q.isRequired,
                              questionOrder: q.questionOrder ?? idx,
                              options: Array.isArray(q.options) ? q.options.map((opt: any, oidx: number) => ({
                                id: oidx + 1,
                                text: opt.optionText,
                                order: opt.optionOrder ?? oidx
                              })) : []
                            })) : []);
                            setShowJsonDialog(false);
                            setJsonError(null);
                            setJsonDirty(false);
                            toast({ title: t('surveyCreator.surveyUpdatedFromJSON', currentLocale) });
                          } catch (err: any) {
                            setJsonError(err.message);
                            toast({ title: t('surveyCreator.invalidJSON', currentLocale), description: err.message, variant: "destructive" });
                          }
                        }}
                      >
                        {t('common.save')}
                      </Button>
                      <DialogClose asChild>
                        <Button variant="outline">{t('common.cancel')}</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            {/* Survey Summary */}
            <div className="p-2 text-center">
              <h3 className="text-lg font-medium mb-2">
                {t('surveyCreator.surveySummary')}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {t('surveyCreator.totalQuestions')}: {questions.length}
              </p>
            </div>
          </div>
        </div>
      </div> {/* Close main flex container */}

      {/* AI Generation Dialog */}
      <Dialog open={showAIGenerationDialog} onOpenChange={setShowAIGenerationDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-purple-500" />
              {t('surveyCreator.aiGenerationConfig.title')}
            </DialogTitle>
            <DialogDescription>
              {t('surveyCreator.aiGenerationConfig.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Survey Info Display */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{t('surveyCreator.aiGenerationConfig.surveyInformation')}</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">{t('surveyCreator.surveyTitle')}:</span> {metadata.title || "Not set"}
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('surveyCreator.surveyDescription')}:</span> {metadata.description || "Not set"}
                </div>
              </div>
            </div>

            {/* Question Types Configuration */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">{t('surveyCreator.aiGenerationConfig.questionTypesAndCounts')}</h4>
              <div className="space-y-3">
                {questionTypes.map((type, typeIndex) => {
                  const config = aiGenerationConfig.questionTypes.find(qt => qt.typeId === type.typeId);
                  const count = config?.count || 0;
                  
                  return (
                    <div key={type.typeId || `type-${typeIndex}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {QUESTION_TYPE_ICONS[type.typeName]}
                        <span className="font-medium text-gray-700">
                          {QUESTION_TYPE_LABELS[type.typeName] || type.typeName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (count > 0) {
                              setAIGenerationConfig(prev => ({
                                ...prev,
                                questionTypes: prev.questionTypes.map(qt => 
                                  qt.typeId === type.typeId ? { ...qt, count: qt.count - 1 } : qt
                                ).filter(qt => qt.count > 0)
                              }));
                            }
                          }}
                          disabled={count === 0}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">{count}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAIGenerationConfig(prev => ({
                              ...prev,
                              questionTypes: [
                                ...prev.questionTypes.filter(qt => qt.typeId !== type.typeId),
                                { typeId: type.typeId, count: count + 1 }
                              ]
                            }));
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              <label htmlFor="additionalDetails" className="text-sm font-medium text-gray-700">
                {t('surveyCreator.aiGenerationConfig.additionalDetails')}
              </label>
              <Textarea
                id="additionalDetails"
                placeholder={t('surveyCreator.aiGenerationConfig.additionalDetailsPlaceholder')}
                value={aiGenerationConfig.additionalDetails}
                onChange={(e) => setAIGenerationConfig(prev => ({ ...prev, additionalDetails: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Default Options */}
            <div className="space-y-2">
              <label htmlFor="defaultOptions" className="text-sm font-medium text-gray-700">
                {t('surveyCreator.aiGenerationConfig.defaultOptionsCount')}
              </label>
              <Input
                id="defaultOptions"
                type="number"
                min="2"
                max="10"
                value={aiGenerationConfig.defaultOptions}
                onChange={(e) => setAIGenerationConfig(prev => ({ ...prev, defaultOptions: parseInt(e.target.value) || 4 }))}
                className="w-32"
              />
              <p className="text-xs text-gray-500">
                {t('surveyCreator.aiGenerationConfig.defaultOptionsDescription')}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DialogClose>
            <Button
              onClick={handleGenerateQuestionsWithAI}
              disabled={isGeneratingQuestions || aiGenerationConfig.questionTypes.length === 0}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isGeneratingQuestions ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('surveyCreator.aiGenerationConfig.generating')}
                </>
              ) : (
                <>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  {t('surveyCreator.aiGenerationConfig.generateQuestions')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </DndContext>
    </TooltipProvider>
  );
}
