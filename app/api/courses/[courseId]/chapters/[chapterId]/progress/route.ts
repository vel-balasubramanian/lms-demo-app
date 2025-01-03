import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ courseId: string; chapterId: string }> }) {

  try {
    const { userId } = await auth();
    const { isCompleted } = await req.json()
    const { courseId, chapterId } = await params

    if (!userId) {
      return new NextResponse("UnAuthorized", { status: 401 })
    }

    const userProgress = await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId: chapterId
        }
      },
      update: {
        isCompleted
      },
      create: {
        userId,
        chapterId: chapterId,
        isCompleted
      }
    })

    return NextResponse.json(userProgress)

  } catch (error) {
    console.log("Chapter Progress", error);
    return new NextResponse("Internal Error", { status: 500 })
  }

}