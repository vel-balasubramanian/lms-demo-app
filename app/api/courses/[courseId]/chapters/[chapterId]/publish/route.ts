import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
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

    if (!userId || !isTeacher(userId)) {
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

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId
      }
    })



    const muxData = await db.muxData.findUnique({
      where: {
        chapterId: chapterId
      }
    })




    if (!chapter || !muxData || !chapter.title || !chapter.description || !chapter.videoUrl) {

      return new NextResponse("Missing Required Fields", { status: 400 })
    }

    const publishedChapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId
      },
      data: {
        isPublished: true
      }
    })

    console.log('publishedChapter', publishedChapter);


    return NextResponse.json(publishedChapter)

  } catch (error) {
    console.log('[CHAPTER_PUBLISH]', error);
    return new NextResponse("UnAuthorised", { status: 401 })
  }

}