import { BsPencilFill } from "react-icons/bs";

const ProfileImage = ({ imageUrl, onImageChange }) => {
  return (
    <div className="position-relative d-inline-block mb-4">
      <img
        src={
          imageUrl ||
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Setting%20(Dashboard)-aFUjAYGO1eNlwR7CBjIuQQSqbjtMUe.png"
        }
        alt="Profile"
        className="rounded-circle img-fluid"
        style={{ width: "120px", height: "120px", objectFit: "cover" }}
      />
      <button
        className="btn btn-success btn-sm position-absolute bottom-0 end-0 rounded-circle p-2"
        type="button"
        onClick={() => document.getElementById("profileImageInput").click()}
      >
        <BsPencilFill size={14} />
      </button>
      <input
        type="file"
        id="profileImageInput"
        className="d-none"
        accept="image/*"
        onChange={onImageChange}
      />
    </div>
  );
};

export default ProfileImage;
