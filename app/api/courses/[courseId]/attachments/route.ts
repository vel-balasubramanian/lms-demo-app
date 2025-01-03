import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(
  req: Request,
  { params }: {
    params: Promise<{
      courseId: string
    }>
  }) {
  try {
    const { userId } = await auth()
    const { url } = await req.json();
    const {courseId} = await params

    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId: userId
      }
    })

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const attachment = await db.attachment.create({
      data: {
        url,
        name: url.split("/").pop(),
        courseId: courseId
      }
    })

    return NextResponse.json(attachment)

  }
  catch (error) {
    console.log("Unable to Add Attachment", error);
    return new NextResponse("Internal Error ", { status: 500 })
  }
}
