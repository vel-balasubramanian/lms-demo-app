import { Category, Course } from "@prisma/client";

import { getProgress } from "@/actions/get-progress";
import { db } from "@/lib/db";

type CourseWithProgessAndCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null
}

type GetCourses = {
  userId : string;
  title?: string;
  categoryId?: string
}

export const GetCourses = async ({ userId, title, categoryId }:
  GetCourses): Promise<CourseWithProgessAndCategory[]> => {
  try {
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
        title: {
          contains: title,
        },
        categoryId,
      },
      include: {
        category: true,
        chapters: {
          where: {
            isPublished: true
          },
          select: {
            id: true
          }
        },
        purchases: {
          where: {
            userId,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });


    const coursesWithProgress: CourseWithProgessAndCategory[] = await
      Promise.all(
        courses.map(async course => {
          if (course.purchases.length === 0) {
            return {
              ...course,
              progress: null
            }
          }
          const progressPrecentage = await getProgress(userId, course.id);
          return {
            ...course,
            progress: progressPrecentage
          }
        })
      )
return coursesWithProgress

  } catch (error) {
    console.log('[GET_COURSES]', error);
    return []
  }
}