"use client"

import { useState, useEffect } from "react"
import { FIND_DOCTOR_PATIENTS } from "@/lib/graphql/queries/doctor-patients"
import { graphqlClient } from "@/lib/graphql/client"

export interface Patient {
    id: string
    name: string
    doctors: {
        id: string
        name: string
    }[]
}

export function useDoctorPatients() {
    const session  = {accessToken : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA3ZWRlMmNhLWJiMTEtNGNhNC1iYTdkLWJiNGZkNzJlMDA1NyIsImFkZHJlc3MiOiJ0YWJvdW5hIiwiY3JlYXRlZF9hdCI6IjIwMjUtMDYtMDFUMTc6MTA6MjAuMTU0WiIsImVtYWlsIjoic2FoYml5YXNzaW5lQGV4YW1wbGUuY29tIiwiZmlyc3RfbmFtZSI6IkhJUkEiLCJsYXN0X25hbWUiOiJLT0xVIiwiaXNfdmVyaWZpZWQiOnRydWUsImxhc3RfbG9naW4iOm51bGwsInBob25lIjoiKzIxNjk4MTExIiwicHJvZmlsZV9waWN0dXJlIjpudWxsLCJyb2xlIjoiRE9DVE9SIiwiYXNzb2NpYXRlZF9pZCI6IjczMmRjMWRjLWFjN2QtNDAyNi1iNGQwLTFkYTg3NGVkZDFlMiIsInVwZGF0ZWRfYXQiOiIyMDI1LTA2LTAxVDE3OjEwOjIwLjE1NFoiLCJhc3NvY2lhdGVkX2RhdGEiOnsiaWQiOiI3MzJkYzFkYy1hYzdkLTQwMjYtYjRkMC0xZGE4NzRlZGQxZTIiLCJ0eXBlIjoiU1VSR0VPTiIsImlzX2xpY2Vuc2VfdmVyaWZpZWQiOmZhbHNlLCJiaW8iOm51bGwsImVkdWNhdGlvbiI6W10sImV4cGVyaWVuY2UiOltdLCJmaXJzdF9uYW1lIjoiSElSQSIsImxhbmd1YWdlcyI6W10sImxhc3RfbmFtZSI6IktPTFUiLCJwcm9maWxlX2ltYWdlIjpudWxsLCJzcGVjaWFsdHkiOiJQRURJQVRSSUNJQU4iLCJ1c2VyX2lkIjoiMDdlZGUyY2EtYmIxMS00Y2E0LWJhN2QtYmI0ZmQ3MmUwMDU3In0sImlhdCI6MTc0ODgxNjgxMCwiZXhwIjoxNzQ4ODI3NjEwfQ.iDR0asR7let7ztk69sncX5PW8SAZ3JJ55S7raWLUwM4"}
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPatients = async () => {
            if (!session?.user?.id) return

            try {
                setLoading(true)
                const data = await graphqlClient.request(FIND_DOCTOR_PATIENTS, {
                    equals: session.user.id,
                })

                // Transform the data into a more usable format
                const formattedPatients = data.findManyConsultations.patients.map((patient: any) => ({
                    id: patient.id,
                    name: `${patient.users.first_name} ${patient.users.last_name}`,
                    doctors: patient.consultations
                        .flatMap((consultation: any) => consultation.doctors)
                        .filter((doctor: any) => doctor.id !== session.user.id) // Filter out the current doctor
                        .map((doctor: any) => ({
                            id: doctor.id,
                            name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
                        }))
                        // Remove duplicates
                        .filter((doctor: any, index: number, self: any[]) => index === self.findIndex((d) => d.id === doctor.id)),
                }))

                setPatients(formattedPatients)
                setError(null)
            } catch (err) {
                console.error("Failed to fetch patients:", err)
                setError("Impossible de charger les patients")
            } finally {
                setLoading(false)
            }
        }

        fetchPatients()
    }, [session?.user?.id])

    return { patients, loading, error }
}
