import { useState } from "react"
import ProfileImage from "./ProfileImage"
import ProfileForm from "./ProfileForm"

const ProfileForm = () => {
  const [formData, setFormData] = useState({
    yourName: "Jeet Jani",
    userName: "Janijeet17",
    email: "janijeet50@gmail.com",
    password: "**********",
    dateOfBirth: "2002-09-17",
    presentAddress: "Mehsana, Gujarat",
    permanentAddress: "Mehsana, Gujarat",
    city: "Mehsana",
    pinCode: "384002",
    country: "IND",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Handle image upload logic here
      console.log("Image file:", file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <div className="container-fluid p-4">
      <h4 className="mb-4">Setting</h4>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {/* Tabs */}
          <ul className="nav nav-tabs border-bottom mb-4">
            <li className="nav-item">
              <a
                className="nav-link active px-0 me-3 border-0"
                href="#"
                style={{
                  borderBottom: "2px solid #198754",
                  color: "#198754",
                }}
              >
                Edit Profile
              </a>
            </li>
          </ul>

          {/* Profile Image */}
          <div className="text-center mb-4">
            <ProfileImage
              imageUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Setting%20(Dashboard)-JwivTNtBXmePugbliZbwuRsqwUr6ss.png"
              onImageChange={handleImageChange}
            />
          </div>

          {/* Profile Form */}
          <ProfileForm formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}

export default ProfileForm

