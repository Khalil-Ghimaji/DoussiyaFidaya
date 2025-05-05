"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { graphqlClient } from "@/lib/graphql/client"
import { LOGIN_USER, REGISTER_USER, FORGOT_PASSWORD, RESET_PASSWORD } from "@/lib/graphql/mutations/auth"

export async function loginUser(_, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string
  const rememberMe = formData.get("rememberMe") === "on"

  try {
    const { login } = await graphqlClient.request(LOGIN_USER, {
      email,
      password,
      role,
    })

    // Set auth token in cookies
    const cookieOptions = rememberMe
      ? { maxAge: 30 * 24 * 60 * 60 } // 30 days
      : { maxAge: 24 * 60 * 60 } // 1 day

    cookies().set("auth_token", login.token, cookieOptions)

    // Redirect to dashboard based on user role
    switch (login.user.role) {
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

export async function registerUser(_, formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string

  try {
    const { registerUser } = await graphqlClient.request(REGISTER_USER, {
      input: {
        firstName,
        lastName,
        email,
        password,
        role,
      },
    })

    // Set auth token in cookies
    cookies().set("auth_token", registerUser.token, {
      maxAge: 24 * 60 * 60, // 1 day
    })

    // Redirect to verification page
    redirect("/auth/verify-email")
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred during registration",
    }
  }
}

export async function forgotPassword(_, formData: FormData) {
  const email = formData.get("email") as string

  try {
    const { forgotPassword } = await graphqlClient.request(FORGOT_PASSWORD, {
      email,
    })

    return {
      success: forgotPassword.success,
      message: forgotPassword.message,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while processing your request",
    }
  }
}

export async function resetPassword(_, formData: FormData) {
  const token = formData.get("token") as string
  const newPassword = formData.get("newPassword") as string

  try {
    const { resetPassword } = await graphqlClient.request(RESET_PASSWORD, {
      token,
      newPassword,
    })

    if (resetPassword.success) {
      redirect("/auth/login?reset=success")
    }

    return {
      success: resetPassword.success,
      message: resetPassword.message,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while resetting your password",
    }
  }
}

export async function logout() {
  cookies().delete("auth_token")
  redirect("/auth/login")
}

