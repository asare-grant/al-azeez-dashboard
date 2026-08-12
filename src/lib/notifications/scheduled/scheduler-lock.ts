import "server-only";

import {
  randomUUID,
} from "node:crypto";

import {
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                               CONSTANTS                                    */
/* -------------------------------------------------------------------------- */

const LOCK_KEY =
  "notification-scheduler";

const DEFAULT_LEASE_MS =
  15 *
  60 *
  1000;

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type NotificationSchedulerLease = {
  key:
    string;

  token:
    string;

  lockedUntil:
    Date;
};

/* -------------------------------------------------------------------------- */
/*                              ACQUIRE LOCK                                  */
/* -------------------------------------------------------------------------- */

export async function acquireNotificationSchedulerLock({
  leaseMs =
    DEFAULT_LEASE_MS,
}: {
  leaseMs?:
    number;
} = {}): Promise<
  NotificationSchedulerLease | null
> {
  const now =
    new Date();

  const lockedUntil =
    new Date(
      now.getTime() +
        leaseMs,
    );

  const token =
    randomUUID();

  /*
   * First try to claim an existing expired lease.
   */
  const reclaimed =
    await prisma.notificationSchedulerLock.updateMany({
      where: {
        key:
          LOCK_KEY,

        lockedUntil: {
          lte:
            now,
        },
      },

      data: {
        token,

        lockedUntil,
      },
    });

  if (
    reclaimed.count ===
    1
  ) {
    return {
      key:
        LOCK_KEY,

      token,

      lockedUntil,
    };
  }

  /*
   * If no lock row exists yet, create it.
   *
   * A concurrent worker may race us here.
   * The unique primary key protects against
   * both acquiring the lock.
   */
  try {
    await prisma.notificationSchedulerLock.create({
      data: {
        key:
          LOCK_KEY,

        token,

        lockedUntil,
      },
    });

    return {
      key:
        LOCK_KEY,

      token,

      lockedUntil,
    };
  } catch (
    error
  ) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code ===
        "P2002"
    ) {
      return null;
    }

    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                              RELEASE LOCK                                  */
/* -------------------------------------------------------------------------- */

export async function releaseNotificationSchedulerLock({
  key,
  token,
}: {
  key:
    string;

  token:
    string;
}) {
  /*
   * token is part of the condition so an old
   * worker can never release a newer worker's
   * lease after its original lease expired.
   */
  await prisma.notificationSchedulerLock.deleteMany({
    where: {
      key,

      token,
    },
  });
}