import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, 
  { params }: { params: Promise<{ courseId: string, attachmentId: string }> }) {
  try {

    const { userId } = await auth()
    const {courseId, attachmentId} = await params


    if (!userId || !isTeacher(userId)) {
      return new NextResponse("UnAuthorised", { status: 401 })
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId: userId
      }
    })

    if (!courseOwner) {
      return new NextResponse("UnAuthorized", { status: 401 })
    }

    console.log('Here');
    
    const attachment = await db.attachment.delete({
      where: {
        courseId: courseId,
        id: attachmentId
      }
    })

    return NextResponse.json(attachment)

  } catch (error) {
    console.log("ATTACHMENT ID", error);
    return new NextResponse("Internal Error", { status: 500 })
  }

}