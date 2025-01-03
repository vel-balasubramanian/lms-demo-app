import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";




async function getData(): Promise<any[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ]
}

const CoursesPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/")
  }

  const courses = await db.course.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return (
    <div>
      {/* <Link href={"/teacher/create"}> 
        <Button>
          New Course
        </Button>
      </Link> */}

      <DataTable columns={columns} data={courses} />

    </div>
  );
}

export default CoursesPage;