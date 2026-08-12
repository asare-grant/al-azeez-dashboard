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
  teacherID: z.string().min(1, { message: "Teacher ID is required!" }),
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
  studentID: z.string().min(1, { message: "Student ID is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().optional(),
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

export const examSchema = z
  .object({
    id: z.coerce.number().optional(),

    title: z.string().min(1, {
      message: "Exam title is required!",
    }),

    startTime: z.coerce.date({
      message: "Start time is required!",
    }),

    endTime: z.coerce.date({
      message: "End time is required!",
    }),

    lessonId: z.coerce.number({
      message: "Lesson is required!",
    }),

    academicYear: z.string().trim().min(1, {
      message: "Academic year is required!",
    }),

    termId: z.coerce
      .number({
        message: "School term is required!",
      })
      .int()
      .positive({
        message: "Select a valid school term.",
      }),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
  });

export type ExamSchema = z.infer<typeof examSchema>;

export const resultSchema = z
  .object({
    id: z.coerce.number().int().positive().optional(),

    studentId: z.string().trim().min(1, {
      message: "Student is required.",
    }),

    type: z.enum(["ASSIGNMENT", "EXAM"]),

    score: z.coerce
      .number({
        message: "Enter a valid score.",
      })
      .min(0, {
        message: "Score cannot be negative.",
      }),

    totalMarks: z.coerce
      .number({
        message: "Enter valid total marks.",
      })
      .positive({
        message: "Total marks must be greater than zero.",
      }),

    assignmentId: z.coerce.number().int().positive().optional().nullable(),

    examId: z.coerce.number().int().positive().optional().nullable(),
  })
  .superRefine((data, context) => {
    if (data.score > data.totalMarks) {
      context.addIssue({
        code: "custom",

        path: ["score"],

        message: "Score cannot be greater than total marks.",
      });
    }

    if (data.type === "ASSIGNMENT" && !data.assignmentId) {
      context.addIssue({
        code: "custom",

        path: ["assignmentId"],

        message: "Select an assignment.",
      });
    }

    if (data.type === "EXAM" && !data.examId) {
      context.addIssue({
        code: "custom",

        path: ["examId"],

        message: "Select an examination.",
      });
    }
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

export const assignmentSchema = z
  .object({
    id: z.coerce.number().optional(),

    title: z.string().min(1, {
      message: "Assignment title is required!",
    }),

    startDate: z.coerce.date({
      message: "Start date is required and must be valid!",
    }),

    dueDate: z.coerce.date({
      message: "Due date is required and must be valid!",
    }),

    lessonId: z.coerce.number({
      message: "Lesson selection is required!",
    }),

    academicYear: z.string().trim().min(1, {
      message: "Academic year is required!",
    }),

    termId: z.coerce
      .number({
        message: "School term is required!",
      })
      .int()
      .positive({
        message: "Select a valid school term.",
      }),
  })
  .refine((data) => data.dueDate >= data.startDate, {
    message: "Due date cannot be before the start date.",
    path: ["dueDate"],
  });

export type AssignmentSchema = z.infer<typeof assignmentSchema>;


export const eventSchema = z
  .object({
    id: z.coerce.number().int().positive().optional(),

    title: z
      .string()
      .trim()
      .min(2, "Event title is required.")
      .max(150, "Event title is too long."),

    description: z
      .string()
      .trim()
      .min(5, "Enter a meaningful event description.")
      .max(2000, "Event description is too long."),

    date: z.coerce.date({
      message: "Select a valid event date.",
    }),

    startTime: z.coerce.date({
      message: "Select a valid start date and time.",
    }),

    endTime: z.coerce.date({
      message: "Select a valid end date and time.",
    }),

    classId: z
      .union([
        z.coerce.number().int().positive(),

        z.literal(""),

        z.null(),

        z.undefined(),
      ])
      .transform((value) =>
        value === "" || value === null || value === undefined ? null : value,
      ),
  })
  .superRefine((value, context) => {
    if (value.endTime <= value.startTime) {
      context.addIssue({
        code: "custom",

        path: ["endTime"],

        message: "The event must end after it starts.",
      });
    }
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
  classId: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((v) => (v ? Number(v) : null)),
  gradeId: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((v) => (v ? Number(v) : null)),
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

export const attendanceSchema = z.object({
  id: z.coerce.number().optional(),
  date: z.coerce.date({ message: "Date is required" }),
  present: z.boolean(),
  day: z.coerce.number({ message: "Day is required" }),
  studentId: z.string().min(1, "Student is required"),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;

export const bulkAttendanceSchema = z.object({
  date: z.coerce.date(),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
  records: z.array(
    z.object({
      studentId: z.string(),
      present: z.boolean(),
    }),
  ),
});

export type BulkAttendanceSchema = z.infer<typeof bulkAttendanceSchema>;

export const termSchema = z.object({
  id: z.coerce.number().optional(), // 👈 important
  name: z.enum(["FIRST", "SECOND", "THIRD"]),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
});

export type TermSchema = z.infer<typeof termSchema>;
