import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const client = new Mux({
  tokenId: process.env['MUX_TOKEN_ID'],
  tokenSecret: process.env['MUX_TOKEN_SECRET'],
});

export async function DELETE(req: Request, {
  params
}: {
  params: Promise<{
    courseId: string; chapterId: string
  }>
}) {
  try {
    const { userId } = await auth();
    const { courseId, chapterId } = (await params)

    if (!userId) {
      return new NextResponse("Unauthorised", { status: 401 })
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId
      }
    })

    if (!ownCourse) {
      return new NextResponse("Unauthorised", { status: 401 })
    }

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId
      }
    })

    if (!chapter) {
      return new NextResponse("Unauthorised", { status: 401 })
    }

    if (chapter.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId: chapterId
        }
      })

      if (existingMuxData) {
        //  Delete Mux Data in MUX 
        // Delte Mux data in DB 
        await db.muxData.delete({
          where: {
            id: existingMuxData.id
          }
        })
      }
    }

    const deletedChapter = await db.chapter.delete({
      where: {
        id: chapterId
      }
    })

    const publisedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId: courseId,
        isPublished: true
      }
    })

    if (!publisedChaptersInCourse.length) {
      await db.course.update({
        where: {
          id: courseId
        },
        data: {
          isPublished: false
        }
      })
    }
    return NextResponse.json(deletedChapter)

  } catch (error) {
    console.log('[CHAPTER_ID_DELETE]', error);
    return new NextResponse("Internal Error", { status: 500 })
  }

}

export async function PATCH(req: Request, {
  params
}: {
  params: Promise<{
    courseId: string; chapterId: string
  }>
}) {
  try {
    const { userId } = await auth();
    const { isPublished, ...values } = await req.json();

    const { courseId, chapterId } = (await params)

    if (!userId) {
      return new NextResponse("Unauthorised", { status: 401 })
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId
      }
    })

    if (!ownCourse) {
      return new NextResponse("Unauthorised", { status: 401 })
    }

    const chapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId
      },
      data: {
        ...values,
      }
    })


    if (values.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId: chapterId
        }
      });

      if (existingMuxData) {
        await client.video.assets.delete(existingMuxData.assetId)
        await db.muxData.delete({
          where: {
            id: existingMuxData.id
          }
        })
      }

      const asset = await client.video.assets.create({
        input: values.videoUrl,
        playback_policy: ['public'],
        test: false,
      })
      await db.muxData.create({
        data: {
          chapterId: chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id
        }
      })
    }

    return NextResponse.json(chapter)
  } catch (error) {
    console.log('[Courses Chapter ID]', error);
    return new NextResponse("Internal Error", { status: 500 })
  }
}