export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/student(.*)": ["student"],
  "/teacher(.*)": ["teacher"],
  "/parent(.*)": ["parent"],
  "/list/teachers": ["admin", "teacher"],
  "/list/students": ["admin", "teacher"],
  "/list/parents": ["admin", "teacher"],
  "/list/subjects": ["admin"],
  "/list/classes": ["admin", "teacher"],
  "/list/exams": ["admin", "teacher", "student", "parent"],
  "/list/assignments": ["admin", "teacher", "student", "parent"],
  "/list/results": ["admin", "teacher", "student", "parent"],
  "/list/attendance": ["admin", "teacher"],
  "/list/events": ["admin", "teacher", "student", "parent"],
  "/list/announcements": ["admin", "teacher", "student", "parent"],
  "/list/fee": ["admin"],
  "/list/fee-category": ["admin"],
  "/list/fee-master": ["admin"],
  "/list/fee-report": ["admin"],
  "/list/fee-structure": ["admin"],
  "/list/fee-type": ["admin"],
  "/list/FinanceDashboardPage": ["admin"],
};





// export const routeAccessMap: RouteAccessMap = {
//   // Admin pages
//   "/admin(.*)": ["admin"],

//   // Teacher pages
//   "/teacher(.*)": ["teacher"],

//   // Student pages
//   "/student(.*)": ["student"],

//   // Parent pages
//   "/parent(.*)": ["parent"],

//   // Lists
//   "/list/teachers": ["admin", "teacher"],         // Admin & Teachers
//   "/list/teachers/.*": ["admin", "teacher"],      // Single teacher pages

//   "/list/students": ["admin", "teacher", "parent", "student"], // All roles can view list (but backend filters)
//   "/list/students/.*": ["admin", "teacher", "parent", "student"], // Single student pages

//   "/list/parents": ["admin", "teacher"],

//   "/list/subjects": ["admin"],

//   "/list/classes": ["admin", "teacher"],

//   "/list/exams": ["admin", "teacher", "student", "parent"],
//   "/list/assignments": ["admin", "teacher", "student", "parent"],
//   "/list/results": ["admin", "teacher", "student", "parent"],
//   "/list/attendance": ["admin", "teacher", "student", "parent"],
//   "/list/events": ["admin", "teacher", "student", "parent"],
//   "/list/announcements": ["admin", "teacher", "student", "parent"],
// };
