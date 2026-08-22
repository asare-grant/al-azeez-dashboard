// src/components/Announcements.tsx

import prisma from "@/lib/prisma";

import {
  getAnnouncementVisibilityWhere,
  requireAnnouncementViewer,
} from "@/lib/announcements/visibility";

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

const Announcements =
  async () => {
    let viewer;

    try {
      viewer =
        await requireAnnouncementViewer();
    } catch {
      /*
       * Dashboard widgets should fail closed rather
       * than breaking the whole dashboard.
       */
      return null;
    }

    const visibility =
      getAnnouncementVisibilityWhere({
        userId:
          viewer.userId,

        scope:
          viewer.scope,
      });

    const data =
      await prisma.announcement.findMany({
        take:
          3,

        orderBy: {
          date:
            "desc",
        },

        where:
          visibility,
      });

    return (
      <div className="rounded-md bg-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            Announcements
          </h1>

          <span className="text-xs text-gray-400">
            View All
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {data[0] && (
            <div className="rounded-md bg-[#EDF9FD] p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">
                  {
                    data[0]
                      .title
                  }
                </h2>

                <span className="rounded-md bg-white px-1 py-1 text-xs text-gray-400">
                  {new Intl.DateTimeFormat(
                    "en-GB",
                  ).format(
                    data[0]
                      .date,
                  )}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-400">
                {
                  data[0]
                    .description
                }
              </p>
            </div>
          )}

          {data[1] && (
            <div className="rounded-md bg-[#F1F0FF] p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">
                  {
                    data[1]
                      .title
                  }
                </h2>

                <span className="rounded-md bg-white px-1 py-1 text-xs text-gray-400">
                  {new Intl.DateTimeFormat(
                    "en-GB",
                  ).format(
                    data[1]
                      .date,
                  )}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-400">
                {
                  data[1]
                    .description
                }
              </p>
            </div>
          )}

          {data[2] && (
            <div className="rounded-md bg-[#FEFCE8] p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">
                  {
                    data[2]
                      .title
                  }
                </h2>

                <span className="rounded-md bg-white px-1 py-1 text-xs text-gray-400">
                  {new Intl.DateTimeFormat(
                    "en-GB",
                  ).format(
                    data[2]
                      .date,
                  )}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-400">
                {
                  data[2]
                    .description
                }
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

export default Announcements;