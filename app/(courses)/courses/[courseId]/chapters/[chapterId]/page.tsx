import { getChapter } from "@/actions/get-chapter";
import { Banner } from "@/components/banner";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import VideoPlayer from "./_components/video-player";
import CourseEnrollButton from "./_components/course-enroll-button";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { File } from "lucide-react";
import CourseProgress from "@/components/course-progress";
import CourseProgressButton from "./_components/course-progress-button";


const ChapterIdPage = async ({ params }: { params: Promise<{ courseId: string; chapterId: string }> }) => {

  const { userId } = await auth()
  const { courseId, chapterId } = await params

  if (!userId) {
    return redirect('/')
  }

  const { chapter, course, muxData, attachments, userProgress, nextChapter, purchase } = await getChapter({
    userId,
    chapterId: chapterId,
    courseId: courseId
  })

  if (!chapter || !course) {
    return redirect('/')
  }


  const isLocked = !chapter.isFree && !purchase;
  const completeOnEnd = !!purchase && !userProgress?.isCompleted;

  return (
    <div>
      {
        userProgress?.isCompleted && (
          <Banner
            variant="success"
            label="You Already Completed the Course"
          />
        )
      }
      {
        isLocked && (
          <Banner
            variant="warning"
            label="You need to Purchase this course to watch this chapter"
          />
        )}
      <div className="flex flex-col max-w-4xl mx-auto pb-20">
        <div className="p-4">
          <VideoPlayer
            chapterId={chapterId}
            title={chapter.title}
            courseId={courseId}
            nextChapterId={nextChapter?.id}
            playbackId={muxData?.playbackId!}
            isLocked={isLocked}
            completeOnEnd={completeOnEnd}
          />
        </div>
        <div>
          <div className="p-4 flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">
              {chapter.title}
            </h2>
            {purchase ? (
              <div>
                <CourseProgressButton
                  chapterId = {chapterId}
                  courseId = {courseId}
                  nextChapterId={nextChapter?.id}
                  isCompleted={!!userProgress?.isCompleted}
                />
              </div>
            ) :
              (
                <CourseEnrollButton
                  courseId={courseId}
                  price={course.price!}
                />
              )
            }
          </div>
          <Separator />
          <div>
            <Preview value={chapter.description!} />
          </div>
          {!!attachments.length && (
            <>
              <Separator />
              <div className="p-4">
                {attachments.map((attachment) => (
                  <a href={attachment.url}
                    target="_blank"
                    key={attachment.id}
                    className="flex items-center p-3 w-full bg-sky-200 borer text-sky-700 rounded-md hover:underline"
                  >
                    <File />
                    <p className="line-clamp-1">
                      {attachment.name}
                    </p>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChapterIdPage;