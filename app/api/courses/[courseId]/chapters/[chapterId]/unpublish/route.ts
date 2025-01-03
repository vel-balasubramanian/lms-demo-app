import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, {
  params
}: {
  params: Promise<{ courseId: string; chapterId: string }>
}) {
  try {

    const { userId } = await auth();
    const { courseId, chapterId } = (await params)

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    console.log('userId', userId);


    const ownCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId
      }
    })
    console.log('ownCourse', ownCourse);

    if (!ownCourse) {
      return new NextResponse("UnAuthorized", { status: 401 })
    }


    const unPublishedChapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId
      },
      data: {
        isPublished: false
      }
    })

    console.log('publishedChapter', unPublishedChapter);

    const publishedChapterInCourse = await db.chapter.findMany({
      where: {
        courseId: courseId,
        isPublished: true,
      }
    })
    if (!publishedChapterInCourse.length) {
      await db.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false
        }
      })
    }
    return NextResponse.json(unPublishedChapter)
  } catch (error) {
    console.log('[CHAPTER_UNPUBLISH]', error);
    return new NextResponse("UnAuthorised", { status: 401 })
  }

}