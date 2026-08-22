// // src/app/(dashboard)/list/attendance/page.tsx

import AttendanceTable from "@/components/AttendanceTable";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

import prisma from "@/lib/prisma";

export const revalidate =
  0;

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

const AttendanceListPage =
  async () => {
    /* ---------------------------------------------------------------------- */
    /* ACCESS                                                                 */
    /* ---------------------------------------------------------------------- */

    const accessActor =
      await getCurrentAccessActor();

    if (
      !accessActor
    ) {
      throw new Error(
        "UNAUTHENTICATED",
      );
    }

    const canViewAttendance =
      accessActor.can(
        "attendance.view",
      );

    const canRecordAttendance =
      accessActor.can(
        "attendance.record",
      );

    const canModifyAttendance =
      accessActor.can(
        "attendance.modify",
      );

    /*
     * A user should not enter the Attendance workspace
     * unless they can at least view attendance.
     *
     * Mutation permissions alone also imply legitimate
     * workspace access during the RBAC migration.
     */
    if (
      !canViewAttendance &&
      !canRecordAttendance &&
      !canModifyAttendance
    ) {
      throw new Error(
        "UNAUTHORIZED",
      );
    }

    /* ---------------------------------------------------------------------- */
    /* ATTENDANCE AUTHORITY                                                   */
    /* ---------------------------------------------------------------------- */

    const attendancePermissions =
      new Set([
        "attendance.record",
        "attendance.modify",
      ]);

    const grantingAssignments =
      accessActor.activeAssignments.filter(
        (
          assignment,
        ) =>
          assignment.role.permissions.some(
            (
              rolePermission,
            ) =>
              rolePermission
                .permission
                .isActive &&
              attendancePermissions.has(
                rolePermission
                  .permission
                  .key
                  .trim()
                  .toLowerCase(),
              ),
          ),
      );

    /*
     * When every role granting attendance mutation
     * authority is the Teacher system role, preserve
     * the existing supervised-class ownership rule.
     *
     * If Admin, Super Admin, Academic Director or a
     * delegated custom role grants the authority,
     * the workspace receives GLOBAL scope.
     */
    const teacherOnlyAttendance =
      grantingAssignments.length >
        0 &&
      grantingAssignments.every(
        (
          assignment,
        ) =>
          assignment.role.key
            .trim()
            .toLowerCase() ===
          "teacher",
      );

    const attendanceScope:
      | "GLOBAL"
      | "SUPERVISED_CLASSES" =
      teacherOnlyAttendance
        ? "SUPERVISED_CLASSES"
        : "GLOBAL";

    const userId =
      accessActor.actor.id;

    /* ---------------------------------------------------------------------- */
    /* CLASSES                                                                */
    /* ---------------------------------------------------------------------- */

    const classes =
      await prisma.class.findMany({
        where:
          attendanceScope ===
          "SUPERVISED_CLASSES"
            ? {
                supervisorId:
                  userId,
              }
            : undefined,

        select: {
          id:
            true,

          name:
            true,

          supervisorId:
            true,
        },

        orderBy: {
          name:
            "asc",
        },
      });

    /* ---------------------------------------------------------------------- */
    /* STUDENTS                                                               */
    /* ---------------------------------------------------------------------- */

    const classIds =
      classes.map(
        (
          schoolClass,
        ) =>
          schoolClass.id,
      );

    const students =
      await prisma.student.findMany({
        where:
          attendanceScope ===
          "SUPERVISED_CLASSES"
            ? {
                classId: {
                  in:
                    classIds,
                },
              }
            : undefined,

        select: {
          id:
            true,

          name:
            true,

          surname:
            true,

          classId:
            true,
        },

        orderBy: [
          {
            name:
              "asc",
          },

          {
            surname:
              "asc",
          },
        ],
      });

    /* ---------------------------------------------------------------------- */
    /* UI                                                                     */
    /* ---------------------------------------------------------------------- */

    return (
      <div className="m-4 mt-0 rounded-md bg-white p-4">
        <h2 className="text-2xl font-bold">
          Attendance
        </h2>

        <AttendanceTable
          students={
            students
          }
          classes={
            classes
          }
          userId={
            userId
          }
          canRecordAttendance={
            canRecordAttendance
          }
          canModifyAttendance={
            canModifyAttendance
          }
          attendanceScope={
            attendanceScope
          }
        />
      </div>
    );
  };

export default AttendanceListPage;