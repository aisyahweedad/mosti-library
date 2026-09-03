import { NextResponse } from "next/server";

import { sessionFromRequest } from "@/lib/auth";

const MOCK_USERS = [
  {
    id: "usr-01",
    name: "Nurul Aina binti Ahmad",
    email: "nurulaina@mastic.gov.my",
    institution: "MASTIC",
    role: "Pentadbir Sistem",
    active: true,
    joined: "2022-03-14",
  },
  {
    id: "usr-02",
    name: "Ahmad Firdaus bin Zainal",
    email: "ahmadfirdaus@utm.my",
    institution: "UTM",
    role: "Penyumbang Tesis",
    active: true,
    joined: "2023-01-22",
  },
  {
    id: "usr-03",
    name: "Sarah Lim Mei Ling",
    email: "sarahlim@um.edu.my",
    institution: "UM",
    role: "Penyumbang Tesis",
    active: true,
    joined: "2023-06-05",
  },
  {
    id: "usr-04",
    name: "Mohd Shafiq bin Roslan",
    email: "shafiq.roslan@ukm.edu.my",
    institution: "UKM",
    role: "Penyumbang Tesis",
    active: false,
    joined: "2024-02-18",
  },
  {
    id: "usr-05",
    name: "Dr. Kavitha a/p Renganathan",
    email: "kavitha@uum.edu.my",
    institution: "UUM",
    role: "Pemeriksa Metadata",
    active: true,
    joined: "2024-08-30",
  },
];

export async function GET(request: Request) {
  if (!(await sessionFromRequest(request.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ users: MOCK_USERS });
}
