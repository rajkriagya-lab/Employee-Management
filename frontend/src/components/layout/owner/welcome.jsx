import React from 'react'
import { CalendarDays} from "lucide-react"

function welcome ({owner}) {
    const today = 
    new Date().toLocaleDateString(
        "en-US",
        {
            weekdat: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }
    );
  return (
    <section className='mb-7 flex-col gap-5 sm:flex-row sm:items-end sm:justify-center'>
        <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-text">
                <CalendarDays size={16} />

                {today}
            </div>

            <h1 className="text-2x1 font-bold sm:text-3x1">
                Good Morning, {""}

                {owner?.name || "Owner"} 👋
            </h1>

            <p className="mt-2 text-sm text-text">
                Here's what happening with your Employee today,
            </p>
        </div>
    </section>
  )
}

export default welcome
