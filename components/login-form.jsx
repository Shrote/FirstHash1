"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, firestore } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react" // Import Eye icons

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false) // New state for password visibility
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const userName = localStorage.getItem("userName")
    if (userName) {
      router.push("/dashboard")
    }
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      const userDocRef = doc(firestore, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const userType = userData.userType

        if (userType === "Admin") {
          localStorage.setItem("userName", email)
          showToast({
            title: "Login Successful!",
            description: "Redirecting to dashboard...",
            status: "success",
          })
          router.push("/dashboard")
        } else {
          setError("You do not have admin access.")
          showToast({
            title: "Access Denied",
            description: "You do not have admin access.",
            status: "error",
          })
        }
      } else {
        setError("User not found in Firestore.")
        showToast({
          title: "Error",
          description: "User not found in Firestore.",
          status: "error",
        })
      }
    } catch (err) {
      console.error("Error signing in:", err)
      let errorMessage = "Invalid email or password. Please try again."
      if (err.code === "auth/invalid-email") {
        errorMessage = "The email address is badly formatted."
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "No user found with this email address."
      }

      setError(errorMessage)
      showToast({
        title: "Error",
        description: errorMessage,
        status: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <form onSubmit={handleLogin} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your email below to login to your account</p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
              <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
            </Button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </div>
    </form>
  )
}
