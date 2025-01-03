import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, {
  params
}: {
  params: Promise<{ courseId: string; }>
}) {

  try {
    
    const { userId } = await auth();
    const { courseId } = (await params)
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    console.log('userId', userId);
    

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        userId
      },
      include:{
        chapters:{
          include:{
            muxData:true
          }
        }
      }
    })
    
    if (!course) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const hadPulishedChapter = course.chapters.some((chapter)=> chapter.isPublished)

  

    if (!course.title || !course.description || !course.imageUrl || !course.categoryId || !hadPulishedChapter) {
      
      return new NextResponse("Missing Required Fields", { status: 401 })
    }

    const publishedCourse = await db.course.update({
      where: {
        id:courseId, 
        userId:userId
      },
      data: {
        isPublished: true
      }
    })

    return NextResponse.json(publishedCourse)

  } catch (error) {
    console.log('[Course_PUBLISH]', error);
    return new NextResponse("UnAuthorised", { status: 401 })
  }

}