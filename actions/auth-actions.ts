"use server"

import { redirect } from "next/navigation"

enum Role {
  Doctor = "Doctor",
  Patient = "Patient"
}

type ActionState = {
  success: boolean
  message: string
  email?: string
}

export async function loginUser(prevState: ActionState | null, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string
  const rememberMe = formData.get("rememberMe") === "on"

  try {
    const response = await fetch(`${process.env.API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role, rememberMe }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "An error occurred during login",
      }
    }

    // Redirect to dashboard based on user role
    switch (data.user.role) {
      case "DOCTOR":
        redirect("/doctor/dashboard")
      case "PATIENT":
        redirect("/patient/dashboard")
      case "LABORATORY":
        redirect("/laboratory/dashboard")
      case "PHARMACY":
        redirect("/pharmacy/dashboard")
      case "ASSISTANT":
        redirect("/assistant/dashboard")
      default:
        redirect("/dashboard")
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
}

