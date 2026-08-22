import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { exportCsv } from "@/lib/admin";

/** CSV export of the merged bank, for editing in a spreadsheet and re-importing. */
export async function GET() {
  const user = await currentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  }
  const csv = await exportCsv();
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mysatscore-questions.csv"`,
    },
  });
}
