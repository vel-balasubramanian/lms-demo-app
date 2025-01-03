"use client"

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Chapter } from "@prisma/client";
import { Editor } from "@/components/editor";
import { Preview } from "@/components/preview";


const formSchema = z.object({
  description: z.string().min(1, {
    message: "Description is Required"
  }),
});

interface ChapterDescriptionFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId:string
};


export const  ChapterDescriptionForm = ({
  initialData,
  courseId, 
  chapterId
}: ChapterDescriptionFormProps) => {

  const [isEditing, setIsEditing] = useState(false)

  const toggleEdit = () => setIsEditing((current) => !current)
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || ''
    }
  })

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);

    try {

      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values)
      toast.success("Chapter Updated")
      toggleEdit();
      router.refresh();

    } catch (error) {
      toast.error("something Went Wrong")
    }

  }


  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Chapter Description
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2">
                Edit Description
              </Pencil>
            </>
          )}

        </Button>
      </div>
      {!isEditing ? (
        <div className={cn("text-sm mt-2",!initialData.description&& "text-slate-500 italic" )}>
          {!initialData.description || "No Description"}
          { initialData.description && (
            <Preview value={initialData.description}/>

          )}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="description"
              render={
                ({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Editor {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
            />
            <div className="flex items-center gap-x-2">
              <Button
                disabled={!isValid || isSubmitting}
                type="submit"
              >
                Save
              </Button>

            </div>
          </form>
        </Form>
      )
      }
    </div >
  );
}
