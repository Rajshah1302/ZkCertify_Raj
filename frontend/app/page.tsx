import { Hero } from "@/components/hero"
import { Navbar } from "@/components/navbar"
import { Stats } from "@/components/stats"
import { ProjectDetails } from "@/components/project-details"
import { ProfileSection } from "@/components/profile-section"
import { ContactForm } from "@/components/contact-form"
import { Footer } from "@/components/footer"
import {  ProfilePage } from "@/components/profile"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Stats />
      <ProjectDetails />
      <ProfileSection />
      <ContactForm />
      <Footer />
    </main>
  )
}

