import { z } from "zod";

export const subjectSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
  supervisorId: z.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
  studentType: z.enum(["new", "old"], {
    message: "Student type is required!",
  }),
  boardingType: z.enum(["boarder", "day"], {
    message: "Boarding type is required!",
  }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const parentSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(1, "Username is required"),
  name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  password: z.string().optional(), // needed for create/update Clerk users
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  studentIds: z.array(z.string()).optional(), // new field
});

export type ParentSchema = z.infer<typeof parentSchema>;


export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;


export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  studentId: z.string().min(1, { message: "Student is required!" }),
  // classId: z.coerce.number().min(1, { message: "Class is required!" }), // NEW
  type: z.enum(["EXAM", "ASSIGNMENT"] as const, {
    message: "Type is required!",
  }),
  score: z.coerce
    .number()
    .min(0, { message: "Score cannot be less than 0" })
    .max(100, { message: "Score must be 0–100" }),
  examId: z.union([z.coerce.number(), z.null()]).optional(),
  assignmentId: z.union([z.coerce.number(), z.null()]).optional(),
});

export type ResultSchema = z.infer<typeof resultSchema>;


export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Lesson name is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], {
    message: "Day is required!",
  }),
  startTime: z.string().min(1, { message: "Start time is required!" }),
  endTime: z.string().min(1, { message: "End time is required!" }),
  subjectId: z.coerce.number().min(1, { message: "Subject is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  teacherId: z.string().min(1, { message: "Teacher is required!" }),
});

export type LessonSchema = z.infer<typeof lessonSchema>;


export const assignmentSchema = z.object({
  id: z.coerce.number().optional(), // ✅ coerce to number for edit mode
  title: z.string().min(1, { message: "Assignment title is required!" }),
  startDate: z.coerce.date({
    message: "Start date is required and must be a valid date!",
  }),
  dueDate: z.coerce.date({
    message: "Due date is required and must be a valid date!",
  }),
  lessonId: z.coerce.number({
    message: "Lesson selection is required!",
  }),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;


export const eventSchema = z.object({
  id: z.optional(z.number()),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.coerce.date({ message: "Date is required!" }),  // NEW
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  classId: z.string().optional(),
});

export type EventSchema = z.infer<typeof eventSchema>;


export const announcementSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(2, { message: "Title is required" }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters long" }),
  date: z.coerce.date({ message: "Please provide a valid date" }),
  classId: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : Number(val))),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

// FEE MANAGEMENT SYSTEM

export const feeCategorySchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Category name is required"),
});

export type FeeCategorySchema = z.infer<typeof feeCategorySchema>;

export const feeTypeSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Fee Type name is required"),
  categoryId: z.coerce.number().min(1, "Category is required"),
});

export type FeeTypeSchema = z.infer<typeof feeTypeSchema>;

export const feeStructureSchema = z.object({
  id: z.coerce.number().optional(),
  amount: z.coerce.number().min(0, "Amount is required"),
   studentType: z.enum(["new", "old"], {
    message: "Student type is required!",
  }),
  boardingType: z.enum(["boarder", "day"], {
    message: "Boarding type is required!",
  }),
  classId: z.union([z.string(), z.number()]).optional().nullable().transform((v) => (v ? Number(v) : null)),
  gradeId: z.union([z.string(), z.number()]).optional().nullable().transform((v) => (v ? Number(v) : null)),
  typeId: z.coerce.number().min(1, "Fee Type is required"),
});

export type FeeStructureSchema = z.infer<typeof feeStructureSchema>;

export const feeMasterSchema = z.object({
  id: z.coerce.number().optional(),
  studentId: z.string().min(1, "Student is required"),
  term: z.string().min(1, "Term is required"),
  academicYear: z.string().min(1, "Academic Year is required"),
  totalAmount: z.coerce.number().min(0, "Total is required"),
  status: z.enum(["PAID", "PARTIAL", "PENDING"]).optional(),
});

export type FeeMasterSchema = z.infer<typeof feeMasterSchema>;

export const feeSchema = z.object({
  id: z.coerce.number().optional(),
  masterId: z.coerce.number().min(1),
  structureId: z.coerce.number().min(1),
  amount: z.coerce.number().min(0),
});

export type FeeSchema = z.infer<typeof feeSchema>;

export const feePaymentSchema = z.object({
  id: z.coerce.number().optional(),
  masterId: z.coerce.number().min(1, "Invoice is required"),
  amount: z.coerce.number().min(1, "Payment amount required"),
  method: z.enum(["CASH", "MOBILE_MONEY", "BANK", "CHEQUE"]),
  date: z.coerce.date().optional(),
});

export type FeePaymentSchema = z.infer<typeof feePaymentSchema>;
