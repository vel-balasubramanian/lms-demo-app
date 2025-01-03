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
import { Input } from "@/components/ui/input";
import { Course } from "@prisma/client";
import { formatPrice } from "@/lib/format";


const formSchema = z.object({
  price: z.coerce.number(),
});

interface PriceFormProps {
  initialData: Course;
  courseId: string;
};


const PriceForm = ({
  initialData,
  courseId
}: PriceFormProps) => {

  const [isEditing, setIsEditing] = useState(false)

  const toggleEdit = () => setIsEditing((current) => !current)
  const router = useRouter();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: initialData?.price || 0
    }
  })

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);

    try {

      await axios.patch(`/api/courses/${courseId}`, values)
      toast.success("Course Updated")
      toggleEdit();
      router.refresh();

    } catch (error) {
      toast.error("something Went Wrong")
    }

  }


  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course Price
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2">
                Edit Price
              </Pencil>
            </>
          )}

        </Button>
      </div>
      {!isEditing ? (
        <p className={cn("text-sm mt-2", !initialData.price && "text-slate-500 italic")}>
          {initialData.price ? formatPrice(initialData.price) : "No Price"}
        </p>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="price"
              render={
                ({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        disabled={isSubmitting}
                        placeholder="set a price for your course"
                        {...field}
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

export default PriceForm;