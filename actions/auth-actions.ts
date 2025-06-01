"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"

enum Role {
  Doctor = "Doctor",
  Patient = "Patient"
}

type ActionState = {
  success: boolean
  message: string
  email?: string | null
  redirect?: string
}

// Base interface for associated data
interface BaseAssociatedData {
  id: string // Only required field
  type?: string
  user_id?: string
  first_name?: string
  last_name?: string
  profile_image?: string | null
}

// Doctor specific associated data
interface DoctorAssociatedData extends BaseAssociatedData {
  is_license_verified?: boolean
  bio?: string | null
  education?: any[]
  experience?: any[]
  languages?: string[]
  specialty?: string
}

// Patient specific associated data
interface PatientAssociatedData extends BaseAssociatedData {
  blood_type?: string
  allergies?: string[]
  medical_history?: any[]
  emergency_contact?: {
    name?: string
    phone?: string
    relationship?: string
  }
}

interface User {
  id: string
  address?: string
  created_at?: string
  email: string
  first_name?: string
  last_name?: string
  is_verified?: boolean
  last_login?: string | null
  phone?: string
  profile_picture?: string | null
  role: string
  associated_id?: string
  updated_at?: string
  associated_data?: DoctorAssociatedData | PatientAssociatedData
}

interface LoginResponse {
  message: string
  user: User
  token: string
}

export async function loginUser(prevState: ActionState | null, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string

  try {
    const response = await fetch(`${process.env.API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "An error occurred during login",
      }
    }

    // Store the token in an HTTP-only cookie
    const cookieStore = await cookies()
    
    // Clear any existing cookies
    cookieStore.delete('token')
    cookieStore.delete('user')
    
    // Set new cookies
    cookieStore.set({
      name: 'token',
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    cookieStore.set({
      name: 'userId',
      value: data.user.id,
    })

    cookieStore.set({
      name: 'role',
      value: data.user.role,
    })

    cookieStore.set({
      name: 'associatedId',
      value: data.user.associated_id || '',
    })

    cookieStore.set({
      name: 'cin',
      value: data.user.associated_data.cin || 0,
    })
    

    cookieStore.set({
      name: 'user',
      value: JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        role: data.user.role,
        associated_id: data.user.associated_id,
        profile_picture: data.user.profile_picture || null,
        associated_data: data.user.associated_data || null
      }),
      httpOnly: false, // Make this accessible to client-side scripts
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    // Return success with redirect path
    let redirectPath = "/dashboard"
    switch (data.user.role.toUpperCase()) {
      case "DOCTOR":
        redirectPath = "/doctor/dashboard"
        break
      case "PATIENT":
        redirectPath = "/patient/dashboard"
        break
    }

    return {
      success: true,
      message: "Login successful",
      redirect: redirectPath
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred during login",
    }
  }
}

export async function registerPatient(prevState: ActionState | null, formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const cin = formData.get("cin") as string
  const date_of_birth = formData.get("date_of_birth") as string
  const gender = formData.get("gender") as string
  const role = formData.get("role") as Role

  try {
    // Register the patient
    const response = await fetch(`${process.env.API_URL}/auth/registerPatient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone,
        address,
        cin: parseInt(cin),
        date_of_birth: new Date(date_of_birth),
        gender,
        role: Role.Patient
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "An error occurred during registration",
        email: null
      }
    }

    // Send verification email
    await fetch(`${process.env.API_URL}/auth/sendverification/${email}`, {
      method: 'POST',
    })

    return {
      success: true,
      message: "Registration successful",
      email: email
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred during registration",
      email: null
    }
  }
}

export async function registerDoctor(prevState: ActionState | null, formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const type = formData.get("type") as string
  const specialty = formData.get("specialty") as string
  const role = formData.get("role") as Role

  try {
    // Register the doctor
    const response = await fetch(`${process.env.API_URL}/auth/registerDoctor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone,
        address,
        type,
        specialty,
        role: Role.Doctor
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "An error occurred during registration",
        email: null
      }
    }

    // Send verification email
    await fetch(`${process.env.API_URL}/auth/sendverification/${email}`, {
      method: 'POST',
    })

    return {
      success: true,
      message: "Registration successful",
      email: email
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred during registration",
      email: null
    }
  }
}

export async function forgotPassword(prevState: ActionState | null, formData: FormData) {
  const email = formData.get("email") as string

  try {
    const response = await fetch(`${process.env.API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    return {
      success: data.success,
      message: data.message,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while processing your request",
    }
  }
}

export async function resetPassword(prevState: ActionState | null, formData: FormData) {
  const token = formData.get("token") as string
  const newPassword = formData.get("newPassword") as string

  try {
    const response = await fetch(`${process.env.API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    })

    const data = await response.json()

    if (data.success) {
      redirect("/auth/login?reset=success")
    }

    return {
      success: data.success,
      message: data.message,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while resetting your password",
    }
  }
}

export async function logout() {
  const response = await fetch("/api/auth/logout", {
    method: 'POST',
  })
  

  if (response.ok) {
    redirect("/auth/login")
  }
  return {redirect: "/auth/login"}
}

